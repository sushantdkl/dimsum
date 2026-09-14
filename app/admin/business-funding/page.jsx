'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, X } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';
import DateInput from '@/components/ui/date-input.jsx';
import { apiJson } from '@/lib/authed-fetch';
import { friendlyFromError, friendlyMessage } from '@/lib/friendly-message';
import { nepalDateString } from '@/lib/report-dates.js';
import { useToast } from '@/components/ui/toast';
import { formatCalendarDate } from '@/lib/calendar-system.js';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BusinessFundingPage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: null, date: nepalDateString(), amount: '', note: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setProfile(await apiJson('/api/admin/business-funding')); }
    catch (error) { addToast(friendlyFromError(error, 'load_failed')); }
    finally { setLoading(false); }
  }, [addToast]);
  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    if (!form.id && !(Number(form.amount) > 0)) {
      addToast(friendlyMessage('validation', { description: 'Investment amount must be greater than zero.' }));
      return;
    }
    setSaving(true);
    try {
      await apiJson('/api/admin/business-funding', {
        method: form.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      addToast(friendlyMessage('save_success', { description: form.id ? 'Investment date corrected.' : 'Owner investment added to Business Funding.' }));
      setForm({ id: null, date: nepalDateString(), amount: '', note: '' });
      setModal(false);
      await load();
    } catch (error) { addToast(friendlyFromError(error, 'save_failed')); }
    finally { setSaving(false); }
  }

  return <AdminLayout>
    <header className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Owner capital · not revenue</p><h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Business Funding</h1><p className="mt-1 max-w-3xl text-sm text-gray-500">Permanent capital available to cover cash or bank shortfalls on dated purchases and expenses.</p></div>
        <div className="flex gap-2"><button onClick={load} className={BUTTON}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>Refresh</button><button onClick={() => { setForm({ id: null, date: nepalDateString(), amount: '', note: '' }); setModal(true); }} className={PRIMARY}><Plus className="h-4 w-4"/>Add Investment</button></div>
      </div>
    </header>
    <main className="space-y-5 bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Available now" value={money(profile?.availableBalance)} tone="text-emerald-700" />
        <Metric label="Total invested" value={money(profile?.totalInvested)} />
        <Metric label="Used for shortfalls" value={money(profile?.totalUsed)} />
      </div>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-bold text-gray-900">Funding history</h2>
          <p className="text-xs text-gray-500">Every investment and automatic shortfall transfer, dated for audit.</p>
          <p className="mt-2 text-xs text-violet-700">For a past purchase, the investment must be dated on or before its invoice date. If you recorded existing funding late, use Edit date instead of adding it twice.</p>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">By</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{(profile?.history || []).map((row) => <tr key={row.id}><td className="whitespace-nowrap px-4 py-3">{formatCalendarDate(row.entry_date)}</td><td className="px-4 py-3 font-medium">{row.source_type === 'business_funding_investment' ? 'Investment' : row.source_type === 'reversal' ? 'Funding returned' : 'Used for shortfall'}</td><td className="px-4 py-3 text-gray-600">{row.memo || '—'}</td><td className="px-4 py-3 text-gray-500">{row.created_by_name || 'System'}</td><td className={`px-4 py-3 text-right font-bold tabular-nums ${Number(row.amount) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{Number(row.amount) >= 0 ? '+' : '−'}{money(Math.abs(row.amount))}</td><td className="px-4 py-3 text-right">{row.source_type === 'business_funding_investment' ? <button type="button" className={BUTTON} onClick={() => { setForm({ id: Number(row.source_id), date: String(row.entry_date).slice(0, 10), amount: String(Math.abs(Number(row.amount))), note: String(row.memo || '').replace(/^Owner investment(?: — )?/, '') }); setModal(true); }}><Pencil className="h-3.5 w-3.5"/>Edit date</button> : null}</td></tr>)}</tbody></table>{!loading && !profile?.history?.length && <p className="py-14 text-center text-sm text-gray-500">No investments yet.</p>}</div>
      </section>
    </main>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><div><h2 className="font-bold text-gray-900">{form.id ? 'Correct investment date' : 'Add owner investment'}</h2><p className="text-xs text-gray-500">{form.id ? 'Use the date the funds actually became available to the business.' : 'Increases capital and available Business Funding.'}</p></div><button type="button" onClick={() => setModal(false)} className={ICON}><X className="h-4 w-4"/></button></div><div className="space-y-4 p-5"><Field label="Investment date"><DateInput value={form.date} onChange={(date) => setForm((value) => ({ ...value, date }))} className={INPUT}/></Field><Field label="Amount"><input required min="0.01" step="0.01" type="number" value={form.amount} disabled={Boolean(form.id)} onChange={(event) => setForm((value) => ({ ...value, amount: event.target.value }))} className={`${INPUT} disabled:bg-gray-100 disabled:text-gray-500`}/></Field><Field label="Note / source"><textarea rows={3} value={form.note} onChange={(event) => setForm((value) => ({ ...value, note: event.target.value }))} className="w-full rounded-xl border border-gray-300 p-3 text-sm" placeholder="e.g. Initial owner capital"/></Field>{form.id && <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">This corrects when the existing funds became available; it does not add more money.</p>}</div><div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4"><button type="button" onClick={() => setModal(false)} className={BUTTON}>Cancel</button><button disabled={saving} className={PRIMARY}>{saving ? 'Saving…' : form.id ? 'Save Correction' : 'Add Investment'}</button></div></form></div>}
  </AdminLayout>;
}

function Metric({ label, value, tone = 'text-gray-900' }) { return <div className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p></div>; }
function Field({ label, children }) { return <label className="block text-sm font-medium text-gray-700">{label}<div className="mt-1">{children}</div></label>; }
const INPUT = 'h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900';
const BUTTON = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';
const PRIMARY = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-50';
const ICON = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100';
