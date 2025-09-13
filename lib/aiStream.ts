export type ChatMessage = { role: 'user'|'assistant'|'system'; content: string };

// Minimal client-side helper that proxies to /api/build using the last user message as the brief.
export async function streamChat(messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const brief = lastUser?.content ?? '';
  const res = await fetch('/api/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Build failed: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return { ok: true, data: json?.data, text: JSON.stringify(json?.data) };
}
