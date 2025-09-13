import OpenAI from 'openai';

export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tool schema for the model (Responses API tool calling)
const toolDefs = [
  {
    type: 'function',
    name: 'setSiteData',
    description: 'Replace the entire site data object (all sections, theme, etc.).',
    parameters: {
      type: 'object',
      additionalProperties: true
    }
  },
  {
    type: 'function',
    name: 'updateBrief',
    description: 'Update the creative brief the user provided.',
    parameters: {
      type: 'object',
      properties: { brief: { type: 'string' } }
    }
  },
  {
    type: 'function',
    name: 'applyTheme',
    description: 'Merge a theme patch into the current theme.',
    parameters: {
      type: 'object',
      properties: {
        vibe: { type: 'string' },
        palette: {
          type: 'object',
          properties: {
            brand: { type: 'string' },
            accent: { type: 'string' },
            background: { type: 'string' },
            foreground: { type: 'string' }
          },
          additionalProperties: true
        },
        typography: {
          type: 'object',
          properties: { body: { type: 'string' }, headings: { type: 'string' } },
          additionalProperties: true
        },
        density: { type: 'string', enum: ['compact','cozy','comfortable'] }
      },
      additionalProperties: true
    }
  },
  {
    type: 'function',
    name: 'addSection',
    description: 'Add a section by key with payload.',
    parameters: {
      type: 'object',
      properties: { section: { type: 'string' }, payload: { type: 'object' } },
      required: ['section'],
      additionalProperties: true
    }
  },
  {
    type: 'function',
    name: 'removeSection',
    description: 'Remove a section by key.',
    parameters: {
      type: 'object',
      properties: { section: { type: 'string' } },
      required: ['section']
    }
  },
  {
    type: 'function',
    name: 'patchSection',
    description: 'Patch a section by key.',
    parameters: {
      type: 'object',
      properties: { section: { type: 'string' }, patch: { type: 'object' } },
      required: ['section','patch'],
      additionalProperties: true
    }
  }
] as const;

/**
 * Request body:
 * {
 *   messages: { role: 'user'|'assistant'|'system', content: string }[],
 *   site?: any,   // optional current site data (for context)
 *   brief?: string
 * }
 * Response:
 * {
 *   ok: boolean,
 *   reply: string,
 *   events: { name: string, args: any }[]
 * }
 */
export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ ok: false, error: 'Missing OPENAI_API_KEY' }, { status: 401 });
    }
    const { messages = [], site, brief } = await req.json().catch(() => ({ messages: [] }));

    const model = process.env.OPENAI_MODEL || 'gpt-5';
    const sys =
      'You are Sidesmith, a chat-based website builder. ' +
      'Think step-by-step, then EITHER call tools to change the site OR write a short reply. ' +
      'Prefer tool calls for actionable changes (theme, sections, copy). Keep text replies brief.';

    const rsp = await client.responses.create({
      model,
      input: [
        { role: 'system', content: sys },
        ...(site ? [{ role: 'system', content: 'Current site JSON: ' + JSON.stringify(site).slice(0, 6000) }] : []),
        ...(brief ? [{ role: 'system', content: 'Current brief: ' + brief }] : []),
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      tools: toolDefs as any,
      temperature: 0.3
    });

    // Extract text reply (if any)
    const reply = (rsp as any).output_text?.trim?.() || '';

    // Extract tool calls
    const events: Array<{ name: string; args: any }> = [];
    const out = (rsp as any).output || [];
    for (const item of out) {
      if (item.type === 'tool_call' && item.name) {
        events.push({ name: item.name, args: item.arguments ?? {} });
      }
      // Some SDKs embed tool calls inside message content array
      if (item.content && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c.type === 'tool_call' && c.name) {
            events.push({ name: c.name, args: c.arguments ?? {} });
          }
        }
      }
    }

    return Response.json({ ok: true, reply, events }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, note: 'POST { messages, site?, brief? } to receive reply + tool events.' });
}
