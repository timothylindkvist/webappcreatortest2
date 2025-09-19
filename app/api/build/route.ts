import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-5-mini';

const SCHEMA = String.raw`
Return ONE JSON object only (no markdown, no prose, no code fences). It MUST match this TypeScript shape:
type Theme = {
  vibe?: string;
  palette: { brand: string; accent: string; background: string; foreground: string };
  typography?: { body?: string; headings?: string };
  density?: 'compact' | 'cozy' | 'comfortable';
};
type SiteData = {
  theme: Theme;
  brand: { name: string; tagline: string; industry?: string };
  hero: { title: string; subtitle: string; cta?: { label: string; href?: string } };
  about?: { heading?: string; body?: string };
  features?: { title?: string; items?: { title: string; body: string }[] };
  services?: { title?: string; items?: { title: string; body: string }[] };
  pricing?: { plans: { name: string; price: string; features: string[] }[] };
  testimonials?: { title?: string; items?: { quote: string; author?: string }[] };
  gallery?: { title?: string; images: { src: string; caption?: string; alt?: string }[] };
  contact?: { email?: string; phone?: string; address?: string, cta?: string };
};
`;

function extractJSON(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ ok: false, error: 'Missing OPENAI_API_KEY' }, { status: 401 });
    }
    const { brief = '' } = await req.json();

    const sys = `${SCHEMA}
You generate an initial website JSON from a plain-English site brief. Be faithful to the domain (industry, audience, tone). Prefer concise copy and plausible defaults. Output strictly valid JSON.`;
    const user = `Site brief:
${brief}

Return the full SiteData JSON only.`;

    const resp = await client.chat.completions.create({
      temperature: 0.2,
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    });

    const text = resp.choices?.[0]?.message?.content?.trim() || '';
    const data = extractJSON(text);
    if (!data) {
      return Response.json({ ok: false, error: 'Model did not return JSON', raw: text }, { status: 502 });
    }

    // Lightweight sanity check: ensure key nouns from the brief appear in the result
    const low = (s: string) => (s || '').toLowerCase();
    const briefTokens = Array.from(new Set(low(brief).split(/[^a-z0-9]+/).filter(t => t.length > 3)));
    const hay = JSON.stringify(data).toLowerCase();
    const hits = briefTokens.filter(t => hay.includes(t));
    if (briefTokens.length > 0 && hits.length === 0) {
      // Regenerate with a stricter instruction
      const resp2 = await client.chat.completions.create({
        model: MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.1,
        messages: [
          { role: 'system', content: sys + "\nYou must explicitly reflect the subject of the brief in brand, hero, and copy." },
          { role: 'user', content: user + "\n\nYou did not reflect the brief topic previously. Regenerate faithfully." }
        ]
      });
      const text2 = resp2.choices?.[0]?.message?.content?.trim() || '';
      const data2 = extractJSON(text2);
      if (data2) {
        return Response.json({ ok: true, data: data2 }, { headers: { 'Cache-Control': 'no-store' } });
      }
    }

    return Response.json({ ok: true, data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('build route error', err);
    return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
