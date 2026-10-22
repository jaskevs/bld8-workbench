// Loaded only by the isolated browser-test server process.
// Production application code has no test authentication or provider bypass.
if (process.env.WORKBENCH_HTTP_FIXTURE !== '1') throw new Error('The HTTP fixture is test-only.');
const formattedAnswer = "# Focus checklist\n\nA formatted **HTTP test fixture**, with *readable emphasis* and `dialog.showModal()` inline.\n\n1. Move focus into the dialog.\n2. Keep the keyboard path inside it.\n3. Return focus to its opening control.\n\n## Example\n\n```tsx\nconst label = '<strong>Focus stays visible</strong>';\nconst openingControl = document.querySelector<HTMLButtonElement>('[data-open-dialog]');\nconst description = 'A deliberately long code line stays inside the code surface rather than widening the application on a narrow screen.';\nopeningControl?.focus();\n```\n\n| Control | On open | Keyboard | On close |\n| --- | --- | --- | --- |\n| Dialog | Move focus inside | Tab stays inside | Restore focus |\n| Drawer | Keep context visible | Escape closes | Restore focus |\n\n> Verify behaviour with a keyboard before shipping.\n\n- [x] Return focus\n- [ ] Review with assistive technology\n\n[Reference](https://example.com/dialogs)\n\n[Unsafe script link](javascript:alert(1))\n\n[Unsafe data link](data:text/html,unsafe)\n\n![Illustrative diagram](https://example.com/tracking-pixel.gif)\n\n<script>globalThis.__responseExecuted = true</script>\n\n<iframe src=\"https://example.com/unsafe-embed\"></iframe>\n\nEnd of the formatted fixture.\n\nReview note[^review].\n\n[^review]: A keyboard review is still required.\n";
const original = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (url.startsWith('http://127.0.0.1:3136/')) return original(input, init);
  const groq = process.env.WORKBENCH_PROVIDER === 'groq';
  const endpoint = groq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/responses';
  if (url !== endpoint) throw new Error('External HTTP is disabled in browser-service tests.');
  const body = JSON.parse(String(init?.body));
  if (body.tools?.length) throw new Error('Test requests must not use tools.');
  if (groq) {
    if (body.model !== 'openai/gpt-oss-120b' || (body.max_completion_tokens ?? body.max_tokens) !== 1024 || body.reasoning_format !== 'hidden' || body.service_tier !== 'on_demand') throw new Error('Unexpected Groq request contract.');
    const prompt = JSON.stringify(body.messages);
    if (prompt.includes('fixture-quota')) return Response.json({ error: { message: 'private-provider-fixture-body', type: 'tokens', code: 'rate_limit_exceeded' } }, { status: 429 });
    return Response.json({ id: 'chatcmpl_fixture_' + crypto.randomUUID(), object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: body.model,
      choices: [{ index: 0, message: { role: 'assistant', content: prompt.includes('fixture-format') ? formattedAnswer : 'Restore focus to the opening control. This response is a Groq HTTP test fixture.', reasoning: 'private-fixture-reasoning-never-save' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 } });
  }
  if (body.max_output_tokens !== 1024 || body.store !== false || body.service_tier !== 'default') throw new Error('Unexpected OpenAI request contract.');
  const prompt = JSON.stringify(body.input);
  if (prompt.includes('fixture-failure')) return Response.json({ error: { message: 'test-only-provider-secret', type: 'server_error' } }, { status: 500 });
  const output = { id: 'msg_fixture', type: 'message', role: 'assistant', status: 'completed',
    content: [{ type: 'output_text', text: 'Restore focus to the opening control. This response is an HTTP test fixture.', annotations: [] }] };
  return Response.json({ id: 'resp_fixture_' + crypto.randomUUID(), object: 'response', created_at: Math.floor(Date.now() / 1000),
    model: 'gpt-6-luna', status: 'completed', output: [output],
    ...(prompt.includes('fixture-unknown') ? {} : { usage: { input_tokens: 100, output_tokens: 20, total_tokens: 120,
      input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } } }) });
};
