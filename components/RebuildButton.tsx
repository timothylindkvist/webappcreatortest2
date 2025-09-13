import { useState } from "react";

export default function RebuildButton({ onConfirm }: { onConfirm: (starter?: string)=>void }) {
  const [open, setOpen] = useState(false);
  const [starter, setStarter] = useState("empty");

  return (
    <div className="">
      <button
        className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        onClick={() => setOpen(true)}
      >
        Rebuild site
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Reset your work?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will clear the current site. You can start from an empty canvas or a starter.
            </p>

            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="starter" value="empty" checked={starter==="empty"} onChange={()=>setStarter("empty")} />
                <span>Empty</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="starter" value="marketing" checked={starter==="marketing"} onChange={()=>setStarter("marketing")} />
                <span>Marketing landing (hero, features, pricing, footer)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="starter" value="portfolio" checked={starter==="portfolio"} onChange={()=>setStarter("portfolio")} />
                <span>Portfolio (intro, projects grid, contact)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="starter" value="docs" checked={starter==="docs"} onChange={()=>setStarter("docs")} />
                <span>Docs (sidebar nav, content)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setOpen(false)}>Cancel</button>
              <button
                className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={()=>{ setOpen(false); onConfirm(starter); }}
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
