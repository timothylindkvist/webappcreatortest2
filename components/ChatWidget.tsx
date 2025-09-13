'use client';
import { useState } from 'react';
import { useBuilder } from './builder-context';
import { streamChat } from '@/lib/aiStream';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget() {
  const { brief, setBrief, rebuild, data } = useBuilder();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);

  const sendChat = async (content: string) => {
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    const res = await streamChat(next, { site: data, brief });
    setMessages([...next, { role: 'assistant', content: res.text }]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await rebuild();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label className="text-sm font-medium">Website brief</label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g., Landing page for a yoga studio in Stockholm..."
          className="textarea min-h-[110px]"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Generating…' : 'Generate site'}
        </button>
      </form>

      <div className="h-px bg-slate-200 my-2" />

      <div className="space-y-2">
        <div className="text-sm font-medium">Chat to edit</div>
        <ChatInput onSend={sendChat} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 p-3 space-y-2 bg-white">
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
          {messages.length === 0 && <div className="muted text-sm">Try: “Make the theme dark and add a pricing section with 3 plans.”</div>}
        </div>
      </div>
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <input
        className="input flex-1"
        placeholder="Type a change request…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (val.trim()) { await onSend(val.trim()); setVal(''); }
          }
        }}
      />
      <button
        className="btn-primary"
        onClick={async () => { if (val.trim()) { await onSend(val.trim()); setVal(''); } }}
      >
        Send
      </button>
    </div>
  );
}
