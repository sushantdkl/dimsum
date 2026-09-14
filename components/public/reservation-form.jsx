'use client';

import { useState } from 'react';
import { CalendarDays, Loader2, CheckCircle2 } from 'lucide-react';

const GUEST_OPTIONS = [
  { value: '2', label: '1–2 guests' },
  { value: '4', label: '3–5 guests' },
  { value: '8', label: '6–10 guests' },
  { value: '15', label: '11–20 guests' },
  { value: '30', label: '20–50 guests' },
  { value: '50', label: '50+ guests' },
];

const OCCASIONS = ['', 'Birthday', 'Anniversary', 'Family gathering', 'Business', 'Other'];

const fieldStyle = {
  borderColor: 'var(--dsp-border)',
  background: 'var(--dsp-surface)',
  color: 'var(--dsp-ink)',
};

function todayIso() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export default function ReservationForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/public/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          date: form.date,
          time: form.time,
          guests: form.guests,
          occasion: form.occasion || null,
          message: form.message.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit reservation.');
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not submit reservation.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className="rounded-2xl border p-6 sm:p-8 text-center"
        style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}
        role="status"
      >
        <CheckCircle2 className="mx-auto h-10 w-10" style={{ color: 'var(--dsp-success)' }} />
        <h3 className="mt-3 dsp-display text-xl font-bold" style={{ color: 'var(--dsp-ink)' }}>
          Reservation received
        </h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--dsp-muted)' }}>
          We will confirm via phone or WhatsApp soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setForm({ name: '', phone: '', date: '', time: '', guests: '2', occasion: '', message: '' });
          }}
          className="mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-white dsp-focus"
          style={{ background: 'var(--dsp-brand)' }}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}
      noValidate
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: 'var(--dsp-brand)' }}
        >
          <CalendarDays className="h-4.5 w-4.5 h-4 w-4" />
        </div>
        <div>
          <h2 className="dsp-display text-lg font-bold" style={{ color: 'var(--dsp-ink)' }}>
            Reserve a table
          </h2>
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--dsp-muted)' }}>
            Tell us when you are coming — we will confirm shortly.
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Name *</span>
          <input
            required
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
            placeholder="Your name"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Phone *</span>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
            inputMode="tel"
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
            placeholder="98XXXXXXXX"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Date *</span>
          <input
            required
            type="date"
            min={todayIso()}
            value={form.date}
            onChange={set('date')}
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Time *</span>
          <input
            required
            type="time"
            value={form.time}
            onChange={set('time')}
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Guests *</span>
          <select
            required
            value={form.guests}
            onChange={set('guests')}
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
          >
            {GUEST_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Occasion</span>
          <select
            value={form.occasion}
            onChange={set('occasion')}
            className="mt-1 w-full rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
          >
            {OCCASIONS.map((o) => (
              <option key={o || 'none'} value={o}>{o || 'None'}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--dsp-muted)' }}>Notes</span>
          <textarea
            rows={2}
            value={form.message}
            onChange={set('message')}
            className="mt-1 w-full resize-none rounded-xl border-2 px-3 py-2 text-sm dsp-focus"
            style={fieldStyle}
            placeholder="Allergies, preferences, or anything we should know"
          />
        </label>
      </div>

      {error && (
        <p className="mt-2.5 text-[13px]" style={{ color: 'var(--dsp-danger)' }} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60 dsp-focus"
        style={{ background: 'var(--dsp-brand)' }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? 'Sending…' : 'Request reservation'}
      </button>
    </form>
  );
}
