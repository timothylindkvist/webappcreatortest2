'use client';
import { useState } from 'react';
import { useBuilder } from './builder-context';

export default function ChatWidget() {
  const { brief, setBrief, rebuild } = useBuilder();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Website brief</label>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="e.g., 'Landing page for a yoga studio in Stockholm...'"
        style={{ flex: 1, resize: 'none', borderRadius: 8, border: '1px solid #e5e7eb', padding: 8 }}
      />
      <button type="submit" disabled={loading} style={{ marginTop: 8, borderRadius: 8, background: '#0b0f19', color: 'white', padding: '10px 12px', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Generating…' : 'Generate site'}
      </button>
      {err && <p style={{ marginTop: 8, fontSize: 12, color: '#dc2626' }}>{err}</p>}
    </form>
  );
}
