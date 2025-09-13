'use client';
import { useState } from 'react';
import { useBuilder } from './builder-context';
import { streamChat } from '@/lib/aiStream';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget() {
  const { data, brief, setBrief, rebuild } = useBuilder();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBuilt, setHasBuilt] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setBusy(true);

    try {
      if (!hasBuilt) {
        setBrief(text);
        setMessages((m) => [...m, { role: 'user', content: text }]);
        setInput('');
        await rebuild();
        setMessages((m) => [...m, { role: 'assistant', content: 'I created the first version of your site from that brief. Tell me what to change next.' }]);
        setHasBuilt(true);
      } else {
        const next: Msg[] = [...messages, { role: 'user', content: text }];
        setMessages(next);
        setInput('');
        const res = await streamChat(next, { site: data, brief });
        setMessages((m) => [...m, { role: 'assistant', content: res.text || '✅ Done.' }]);
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-80 overflow-auto rounded-xl border border-slate-200 p-3 bg-white space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={
              m.role === 'user'
                ? 'inline-block rounded-2xl bg-brand text-white px-3 py-1.5'
                : 'inline-block rounded-2xl bg-slate-100 text-slate-800 px-3 py-1.5'
            }>
              {m.content}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="muted text-sm">
            Try: <em>“Make the theme dark and add a pricing section with 3 plans.”</em>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="input flex-1"
          placeholder={hasBuilt ? "Type a change request…" : "Describe your site (this is your brief)..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="btn-primary" disabled={busy} onClick={send}>
          {busy ? 'Working…' : (hasBuilt ? 'Send' : 'Build')}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
