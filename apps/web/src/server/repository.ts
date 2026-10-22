import { createHash, randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { ServiceError, type Conversation, type LiveRun, type LiveStatus, type Submission } from '../domain/live';
import { transaction } from './database';
import { MODELS, type ModelProfile, type ServiceConfig } from './config-core';

interface RunRow {
  id: string; owner_id: string; conversation_id: string | null; request_hash: string;
  prompt: string; answer: string | null; status: LiveStatus; provider: string; model: string;
  response_model: string | null; provider_response_id: string | null; input_tokens: number | null;
  output_tokens: number | null; estimated_cost_microusd: string | null; accounted_microusd: string;
  duration_ms: number | null; error_code: string | null; finish_reason: string | null;
  budget_day: string; created_at: Date;
}
interface ConversationRow { id: string; title: string; updated_at: Date }
export interface Completion {
  answer: string | null; status: 'completed' | 'failed'; responseModel: string | null;
  providerResponseId: string | null; inputTokens: number | null; outputTokens: number | null;
  estimatedCostMicrousd: number | null; durationMs: number; errorCode: string | null; finishReason: string | null;
}
function mapRun(row: RunRow): LiveRun {
  return { id: row.id, conversationId: row.conversation_id, prompt: row.prompt, answer: row.answer,
    status: row.status, provider: row.provider, model: row.model, responseModel: row.response_model,
    providerResponseId: row.provider_response_id, inputTokens: row.input_tokens, outputTokens: row.output_tokens,
    estimatedCostMicrousd: row.estimated_cost_microusd === null ? null : Number(row.estimated_cost_microusd),
    accountedMicrousd: Number(row.accounted_microusd), durationMs: row.duration_ms,
    errorCode: row.error_code, finishReason: row.finish_reason, createdAt: row.created_at.toISOString() };
}
function mapConversation(row: ConversationRow): Conversation { return { id: row.id, title: row.title, updatedAt: row.updated_at.toISOString() }; }
function requireOwner(owner: string) { if (!/^github:\d+$/.test(owner)) throw new ServiceError('sign_in_required', 401); }
// One database-scoped lock serialises short ledger mutations across application instances.
const LEDGER_LOCK = 'SELECT pg_advisory_xact_lock(4828, 1)';
export class WorkbenchRepository {
  constructor(private pool: Pool) {}
  async list(owner: string): Promise<Conversation[]> {
    requireOwner(owner);
    const result = await this.pool.query<ConversationRow>('SELECT id,title,updated_at FROM wb_conversations WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 100', [owner]);
    return result.rows.map(mapConversation);
  }
  async read(owner: string, id: string) {
    requireOwner(owner);
    const found = await this.pool.query<ConversationRow>('SELECT id,title,updated_at FROM wb_conversations WHERE owner_id=$1 AND id=$2', [owner, id]);
    if (!found.rowCount) throw new ServiceError('not_found', 404);
    await this.pool.query("UPDATE wb_runs SET status='interrupted',error_code='provider_timeout',finished_at=now() WHERE owner_id=$1 AND conversation_id=$2 AND status='running' AND created_at<now()-interval '2 minutes'", [owner, id]);
    const runs = await this.pool.query<RunRow>('SELECT * FROM wb_runs WHERE owner_id=$1 AND conversation_id=$2 ORDER BY created_at', [owner, id]);
    return { ...mapConversation(found.rows[0]), runs: runs.rows.map(mapRun) };
  }
  async rename(owner: string, id: string, title: string) {
    requireOwner(owner);
    if (!title.trim() || title.length > 80 || title.includes('\0')) throw new ServiceError('invalid_input');
    const result = await this.pool.query<ConversationRow>('UPDATE wb_conversations SET title=$3,updated_at=now() WHERE owner_id=$1 AND id=$2 RETURNING id,title,updated_at', [owner, id, title.trim()]);
    if (!result.rowCount) throw new ServiceError('not_found', 404);
    return mapConversation(result.rows[0]);
  }
  async remove(owner: string, id: string) {
    requireOwner(owner);
    await transaction(this.pool, async client => {
      await client.query(LEDGER_LOCK);
      await client.query("UPDATE wb_runs SET status='interrupted',error_code='provider_timeout',finished_at=now() WHERE owner_id=$1 AND conversation_id=$2 AND status='running' AND created_at<now()-interval '2 minutes'", [owner, id]);
      const found = await client.query('SELECT id FROM wb_conversations WHERE owner_id=$1 AND id=$2 FOR UPDATE', [owner, id]);
      if (!found.rowCount) throw new ServiceError('not_found', 404);
      const active = await client.query("SELECT id FROM wb_runs WHERE owner_id=$1 AND conversation_id=$2 AND status='running'", [owner, id]);
      if (active.rowCount) throw new ServiceError('run_in_progress', 409);
      // Keep only the accounting/idempotency tombstone; deleting content must not refund spend.
      await client.query('UPDATE wb_runs SET conversation_id=NULL,prompt=\'\',answer=NULL,provider_response_id=NULL WHERE owner_id=$1 AND conversation_id=$2', [owner, id]);
      await client.query('DELETE FROM wb_conversations WHERE owner_id=$1 AND id=$2', [owner, id]);
    });
  }
  async reserve(owner: string, submission: Submission, reserved: number, limits: Pick<ServiceConfig, 'dailyUserMicrousd' | 'dailyAppMicrousd'>, profile: ModelProfile = MODELS.openai) {
    requireOwner(owner);
    if (!Number.isSafeInteger(reserved) || reserved <= 0 || reserved > 50_000) throw new ServiceError('not_configured', 503);
    const hash = createHash('sha256').update(JSON.stringify([submission.title, submission.prompt, profile.provider, profile.model])).digest('hex');
    return transaction(this.pool, async client => {
      await client.query(LEDGER_LOCK);
      await client.query("UPDATE wb_runs SET status='interrupted',error_code='provider_timeout',finished_at=now() WHERE status='running' AND created_at < now()-interval '2 minutes'");
      const prior = await client.query<RunRow>('SELECT * FROM wb_runs WHERE owner_id=$1 AND request_id=$2', [owner, submission.requestId]);
      if (prior.rowCount) {
        if (prior.rows[0].request_hash !== hash) throw new ServiceError('request_conflict', 409);
        if (!prior.rows[0].conversation_id) throw new ServiceError('not_found', 404);
        return { run: mapRun(prior.rows[0]), isNew: false };
      }
      const active = await client.query<{ own: string; total: string }>("SELECT count(*) FILTER (WHERE owner_id=$1)::text AS own,count(*)::text AS total FROM wb_runs WHERE status='running'", [owner]);
      if (Number(active.rows[0].own) >= 1 || Number(active.rows[0].total) >= 4) throw new ServiceError('run_in_progress', 409);
      const recent = await client.query<{ count: string }>("SELECT count(*)::text AS count FROM wb_runs WHERE owner_id=$1 AND created_at > now()-interval '1 minute'", [owner]);
      if (Number(recent.rows[0].count) >= 6) throw new ServiceError('rate_limited', 429);
      const day = (await client.query<{ day: string }>("SELECT to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD') AS day")).rows[0].day;
      await client.query('INSERT INTO wb_budget_days(day) VALUES($1) ON CONFLICT DO NOTHING', [day]);
      await client.query('INSERT INTO wb_user_budget_days(day,owner_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [day, owner]);
      const total = await client.query<{ accounted_microusd: string }>('SELECT accounted_microusd FROM wb_budget_days WHERE day=$1 FOR UPDATE', [day]);
      const own = await client.query<{ accounted_microusd: string }>('SELECT accounted_microusd FROM wb_user_budget_days WHERE day=$1 AND owner_id=$2 FOR UPDATE', [day, owner]);
      if (Number(total.rows[0].accounted_microusd) + reserved > limits.dailyAppMicrousd || Number(own.rows[0].accounted_microusd) + reserved > limits.dailyUserMicrousd) throw new ServiceError('budget_exceeded', 429);
      await client.query('UPDATE wb_budget_days SET accounted_microusd=accounted_microusd+$2 WHERE day=$1', [day, reserved]);
      await client.query('UPDATE wb_user_budget_days SET accounted_microusd=accounted_microusd+$3 WHERE day=$1 AND owner_id=$2', [day, owner, reserved]);
      const conversationId = randomUUID();
      await client.query('INSERT INTO wb_conversations(id,owner_id,title) VALUES($1,$2,$3)', [conversationId, owner, submission.title]);
      const result = await client.query<RunRow>(`INSERT INTO wb_runs(id,owner_id,conversation_id,request_id,request_hash,prompt,status,provider,model,reserved_microusd,accounted_microusd,budget_day)
        VALUES($1,$2,$3,$4,$5,$6,'running',$7,$8,$9,$9,$10) RETURNING *`, [randomUUID(), owner, conversationId, submission.requestId, hash, submission.prompt, profile.providerLabel, profile.model, reserved, day]);
      return { run: mapRun(result.rows[0]), isNew: true };
    });
  }
  async finish(owner: string, runId: string, completion: Completion): Promise<LiveRun> {
    requireOwner(owner);
    return transaction(this.pool, async client => {
      await client.query(LEDGER_LOCK);
      const found = await client.query<RunRow>('SELECT * FROM wb_runs WHERE id=$1 AND owner_id=$2 FOR UPDATE', [runId, owner]);
      if (!found.rowCount) throw new ServiceError('not_found', 404);
      const row = found.rows[0];
      if (row.status !== 'running') return mapRun(row);
      // Unknown usage retains the cap. Reconciliation is idempotent and uses the original UTC day.
      const accounted = completion.estimatedCostMicrousd ?? Number(row.accounted_microusd);
      const delta = accounted - Number(row.accounted_microusd);
      await client.query('UPDATE wb_budget_days SET accounted_microusd=accounted_microusd+$2 WHERE day=$1', [row.budget_day, delta]);
      await client.query('UPDATE wb_user_budget_days SET accounted_microusd=accounted_microusd+$3 WHERE day=$1 AND owner_id=$2', [row.budget_day, owner, delta]);
      const updated = await client.query<RunRow>(`UPDATE wb_runs SET answer=$3,status=$4,response_model=$5,provider_response_id=$6,input_tokens=$7,output_tokens=$8,
        estimated_cost_microusd=$9,accounted_microusd=$10,duration_ms=$11,error_code=$12,finish_reason=$13,finished_at=now() WHERE id=$1 AND owner_id=$2 RETURNING *`,
        [runId, owner, completion.answer, completion.status, completion.responseModel, completion.providerResponseId, completion.inputTokens,
          completion.outputTokens, completion.estimatedCostMicrousd, accounted, completion.durationMs, completion.errorCode, completion.finishReason]);
      return mapRun(updated.rows[0]);
    });
  }
  async ownAllowance(owner: string) {
    requireOwner(owner);
    const result = await this.pool.query<{ accounted_microusd: string }>("SELECT accounted_microusd FROM wb_user_budget_days WHERE owner_id=$1 AND day=(now() AT TIME ZONE 'UTC')::date", [owner]);
    return result.rowCount ? Number(result.rows[0].accounted_microusd) : 0;
  }
}
