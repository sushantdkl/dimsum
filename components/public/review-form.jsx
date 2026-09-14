'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Star } from 'lucide-react';

export default function ReviewForm({ form }) {
  const [answers, setAnswers] = useState({});
  const [identity, setIdentity] = useState({ customer_name: '', customer_phone: '', website: '' });
  const [state, setState] = useState({ saving: false, error: '', done: false, message: '' });
  const setAnswer = (id, value) => setAnswers((old) => ({ ...old, [id]: value }));

  async function submit(event) {
    event.preventDefault();
    setState({ saving: true, error: '', done: false, message: '' });
    try {
      const response = await fetch(`/api/public/reviews/${encodeURIComponent(form.slug)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...identity, answers }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Could not save your review.');
      setState({ saving: false, error: '', done: true, message: payload.message || form.thank_you_message });
    } catch (error) { setState({ saving: false, error: error.message, done: false, message: '' }); }
  }

  if (state.done) return <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h2 className="dsp-display mt-4 text-3xl font-semibold text-emerald-950">Feedback received</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-800">{state.message}</p></div>;

  return <form onSubmit={submit} className="space-y-7 rounded-3xl border bg-white p-5 shadow-sm sm:p-8" style={{ borderColor: 'var(--dsp-border)' }}>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Your name (optional)"><input value={identity.customer_name} onChange={(e) => setIdentity({ ...identity, customer_name: e.target.value })} maxLength={120} autoComplete="name" className="review-input" placeholder="How should we address you?" /></Field>
      <Field label="Phone (optional, never published)"><input value={identity.customer_phone} onChange={(e) => setIdentity({ ...identity, customer_phone: e.target.value })} maxLength={40} autoComplete="tel" className="review-input" placeholder="98XXXXXXXX" /></Field>
      <input tabIndex="-1" autoComplete="off" value={identity.website} onChange={(e) => setIdentity({ ...identity, website: e.target.value })} className="hidden" aria-hidden="true" />
    </div>
    {form.questions.map((question, index) => <Question key={question.id} question={question} number={index + 1} value={answers[question.id]} onChange={(value) => setAnswer(question.id, value)} />)}
    {state.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p> : null}
    <button disabled={state.saving} className="dsp-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white disabled:opacity-60" style={{ background: 'var(--dsp-brand)' }}>{state.saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Share my feedback'}</button>
  </form>;
}

function Field({ label, children }) { return <label className="block"><span className="mb-2 block text-sm font-semibold" style={{ color: 'var(--dsp-ink)' }}>{label}</span>{children}</label>; }

function Question({ question, number, value, onChange }) {
  return <fieldset><legend className="mb-3 text-base font-semibold" style={{ color: 'var(--dsp-ink)' }}><span className="mr-2 text-xs" style={{ color: 'var(--dsp-brand)' }}>{String(number).padStart(2, '0')}</span>{question.label}{question.is_required ? <span className="ml-1 text-red-600">*</span> : null}</legend>
    {question.field_type === 'rating' ? <div className="flex gap-1" role="radiogroup" aria-label={question.label}>{[1,2,3,4,5].map((rating) => <button key={rating} type="button" onClick={() => onChange(String(rating))} className="dsp-focus rounded-lg p-1.5" aria-label={`${rating} star${rating > 1 ? 's' : ''}`} aria-pressed={Number(value) === rating}><Star className={`h-8 w-8 ${Number(value) >= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} /></button>)}</div> : null}
    {question.field_type === 'radio' ? <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--dsp-border)' }}><input required={question.is_required} type="radio" name={`q-${question.id}`} checked={value === option} onChange={() => onChange(option)} />{option}</label>)}</div> : null}
    {question.field_type === 'checkbox' ? <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option) => { const checked = Array.isArray(value) && value.includes(option); return <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--dsp-border)' }}><input type="checkbox" checked={checked} onChange={() => onChange(checked ? value.filter((x) => x !== option) : [...(Array.isArray(value) ? value : []), option])} />{option}</label>; })}</div> : null}
    {question.field_type === 'short_text' ? <input required={question.is_required} value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={300} className="review-input" /> : null}
    {question.field_type === 'long_text' ? <textarea required={question.is_required} value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={2000} rows={5} className="review-input resize-y" /> : null}
  </fieldset>;
}

