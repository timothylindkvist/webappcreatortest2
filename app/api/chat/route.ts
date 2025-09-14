import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-5';

const CONTRACT = String.raw`
You are Sidesmith, a helpful website builder assistant.
ALWAYS respond with ONE JSON object only, no markdown code fences, matching:
{
  "reply": string,
  "events": [
    { "name": "setSiteData", "args": object } |
    { "name": "updateBrief", "args": { "brief": string } } |
    { "name": "applyTheme", "args": object } |
    { "name": "addSection", "args": { "section": string, "payload": object } } |
    { "name": "removeSection", "args": { "section": string } } |
    { "name": "patchSection", "args": { "section": string, "patch": object } }
  ]
}
Return nothing else.

Color & style edits:
- When the user asks to change the color of PARTICULAR elements (e.g., "make those boxes pink", "make the Pricing cards black with white text"), use a single `patchSection` event that targets that section and writes to a `styles` object.
- Supported style keys:
  • features.styles: { boxBg?, boxText?, boxBorder?, titleColor?, descColor? }
  • pricing.styles: { cardBg?, cardText?, cardBorder?, titleColor? }
- DO NOT change the global theme for targeted requests; only patch the section's `styles`.
- Colors may be any valid CSS color (e.g., "#ff69b4", "hotpink", "rgb(255,0,0)"), and you may combine background + text + border if needed.


function safeExtractJSON(text: string) {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const payload = text.slice(start, end + 1);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ ok: false, error: 'Missing OPENAI_API_KEY' }, { status: 401 });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const brief = body?.brief || '';
    const site = body?.site || null;

    const sys = `${CONTRACT}\nContext for the site (may be empty):\nBRIEF: ${brief}\nSITE: ${JSON.stringify(site ?? {})}`;

    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: sys },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ]
    });

    const text = resp.choices?.[0]?.message?.content?.trim() || '';
    const parsed = safeExtractJSON(text) || { reply: text, events: [] };

    return Response.json({ ok: true, ...parsed }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('chat route error', err);
    return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
