CREATE TABLE IF NOT EXISTS wb_schema_version (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE wb_conversations (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL CHECK (owner_id ~ '^github:[0-9]+$'),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, owner_id)
);
CREATE INDEX wb_conversations_owner_updated ON wb_conversations (owner_id, updated_at DESC);
CREATE TABLE wb_runs (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL CHECK (owner_id ~ '^github:[0-9]+$'),
  conversation_id uuid,
  request_id uuid NOT NULL,
  request_hash text NOT NULL,
  prompt text NOT NULL,
  answer text,
  status text NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'interrupted')),
  provider text NOT NULL,
  model text NOT NULL,
  response_model text,
  provider_response_id text,
  input_tokens integer CHECK (input_tokens >= 0),
  output_tokens integer CHECK (output_tokens >= 0),
  estimated_cost_microusd bigint CHECK (estimated_cost_microusd >= 0),
  reserved_microusd bigint NOT NULL CHECK (reserved_microusd > 0),
  accounted_microusd bigint NOT NULL CHECK (accounted_microusd >= 0),
  budget_day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  duration_ms integer CHECK (duration_ms >= 0),
  error_code text,
  finish_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE (owner_id, request_id),
  FOREIGN KEY (conversation_id, owner_id) REFERENCES wb_conversations (id, owner_id)
);
CREATE INDEX wb_runs_owner_created ON wb_runs (owner_id, created_at DESC);
CREATE INDEX wb_runs_running ON wb_runs (created_at) WHERE status = 'running';
CREATE TABLE wb_budget_days (
  day date PRIMARY KEY,
  accounted_microusd bigint NOT NULL DEFAULT 0 CHECK (accounted_microusd >= 0)
);
CREATE TABLE wb_user_budget_days (
  day date NOT NULL,
  owner_id text NOT NULL,
  accounted_microusd bigint NOT NULL DEFAULT 0 CHECK (accounted_microusd >= 0),
  PRIMARY KEY (day, owner_id)
);
INSERT INTO wb_schema_version (version) VALUES (1);
