'use client';
import { BuilderProvider } from '../components/builder-context';
import Builder from '../components/Builder';
import ChatWidget from '../components/ChatWidget';
import RebuildButton from '@/components/RebuildButton';

export default function Page() {
  return (
    <BuilderProvider>
      <div className="container py-6 md:py-10 space-y-6">
        <header className="card bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="pill">Sidesmith</div>
              <h1 className="title text-[var(--brand)] mt-2">Website Creator</h1>
              <p className="subtitle mt-1">Chat to build the first version, then keep editing with more messages.</p>
            </div>
            <RebuildButton onConfirm={async (starter) => {
              await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: 'Rebuild' }], intent: 'rebuild', starter }),
              });
            }} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <Builder />
          </div>
          <div className="card">
            <ChatWidget />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
}
