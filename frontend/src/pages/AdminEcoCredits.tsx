import { useEffect, useState } from 'react';
import { fetchPendingEcoCredits, verifyEcoCredit } from '@/lib/api';

export default function AdminEcoCredits() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingEcoCredits();
      setPending(res.pending || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold">Admin — Pending Eco Credits</h2>
      <p className="text-sm text-muted-foreground mb-4">Approve or reject submitted eco actions.</p>

      {loading && <div>Loading…</div>}

      <div className="space-y-3">
        {pending.length === 0 && <div className="glass-card p-4">No pending submissions.</div>}
        {pending.map((c: any) => (
          <div key={c.request_id} className="glass-card p-4 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">{c.action_type} — +{c.credits_earned} credits</div>
              <div className="text-xs text-muted-foreground">By: {c.user_id} · {new Date(c.timestamp).toLocaleString()}</div>
              <div className="mt-2 text-sm">{c.description}</div>
              {c.photo_url && (
                <div className="mt-2"><img src={c.photo_url} alt="evidence" className="w-48 h-auto rounded-md" /></div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={async () => {
                try {
                  await verifyEcoCredit(c.request_id, 'admin');
                  alert('Verified');
                  load();
                } catch (err) {
                  console.error(err);
                  alert('Failed to verify');
                }
              }}>Verify</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
