import OpenAI from 'openai';
export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tool definitions the model can call
const tools: any = [
  {
    type: 'function',
    name: 'setSiteData',
    description: 'Replace the entire site JSON (all sections, theme, content).',
    parameters: { type: 'object', additionalProperties: true }
  },
  {
    type: 'function',
    name: 'updateBrief',
    description: 'Update the creative brief text.',
    parameters: { type: 'object', properties: { brief: { type: 'string' } } }
  },
  {
    type: 'function',
    name: 'applyTheme',
    description: 'Merge a theme patch (palette, typography, density).',
    parameters: { type: 'object', additionalProperties: true }
  },
  {
    type: 'function',
    name: 'addSection',
    description: 'Add a section by key and payload.',
    parameters: { type: 'object', properties: { section: { type: 'string' }, payload: { type: 'object' } }, required: ['section'] }
  },
  {
    type: 'function',
    name: 'removeSection',
    description: 'Remove a section by key.',
    parameters: { type: 'object', properties: { section: { type: 'string' } }, required: ['section'] }
  },
  {
    type: 'function',
    name: 'patchSection',
    description: 'Patch a section by key with a partial update.',
    parameters: { type: 'object', properties: { section: { type: 'string' }, patch: { type: 'object' } }, required: ['section','patch'] }
  }
];

function extractToolEvents(resp: any) {
  const events: Array<{ name: string; args: any }> = [];
  const out = resp?.output ?? [];
  for (const item of out) {
    if (item?.type === 'tool_call' && item?.name) {
      events.push({ name: item.name, args: item.arguments ?? {} });
    }
    const content = item?.content;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c?.type === 'tool_call' && c?.name) {
          events.push({ name: c.name, args: c.arguments ?? {} });
        }
      }
    }
  }
  return events;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ ok: false, error: 'Missing OPENAI_API_KEY' }, { status: 401 });
    }
    const { messages = [], site, brief } = await req.json().catch(() => ({ messages: [] }));

    const model = process.env.OPENAI_MODEL || 'gpt-5';
    const system =
      'You are Sidesmith, a chat-based website builder. Prefer calling tools to actually make changes to the site. '+
      'When the user asks for visual/styling/content changes, call the appropriate tool with concise, valid JSON.';

    const input: any[] = [{ role: 'system', content: system }];
    if (site) input.push({ role: 'system', content: 'Current site JSON: ' + JSON.stringify(site).slice(0, 6000) });
    if (brief) input.push({ role: 'system', content: 'Current brief: ' + brief });
    for (const m of messages) input.push({ role: m.role, content: m.content });

    const resp = await client.responses.create({
      model,
      input,
      tools,
      tool_choice: 'auto'
    });

    const reply = (resp as any).output_text?.trim?.() || '';
    const events = extractToolEvents(resp);

    return Response.json({ ok: true, reply, events }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, note: 'POST { messages, site?, brief? }' });
}
