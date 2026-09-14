import { MessageSquareHeart, Quote, Star } from 'lucide-react';
import { listReviews } from '@/lib/reviews';
import { RESTAURANT } from '@/lib/restaurant-info';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customer Reviews', description: `What guests say about ${RESTAURANT.name}.`, alternates: { canonical: '/reviews' } };

function ratingOf(review) { const row = review.answers.find((a) => a.field_type === 'rating'); const value = Number(row?.value); return value >= 1 && value <= 5 ? value : null; }
function commentsOf(review) { return review.answers.filter((a) => ['short_text','long_text'].includes(a.field_type) && a.value).slice(0, 2); }

export default async function ReviewsPage() {
  const reviews = await listReviews({ status: 'published', limit: 60 }).catch(() => []);
  return <div className="dsp-wrap py-10 sm:py-14"><header className="mx-auto mb-10 max-w-2xl text-center"><MessageSquareHeart className="mx-auto h-8 w-8" style={{ color: 'var(--dsp-brand)' }} /><p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--dsp-brand)' }}>From our guests</p><h1 className="dsp-display mt-2 text-4xl font-semibold sm:text-6xl" style={{ color: 'var(--dsp-ink)' }}>Shared around the table</h1><p className="mt-3 text-sm leading-6" style={{ color: 'var(--dsp-muted)' }}>Real feedback from customers, published by the Dim Sum Puri team.</p></header>
    {reviews.length ? <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">{reviews.map((review) => { const rating = ratingOf(review); const comments = commentsOf(review); return <article key={review.id} className="mb-5 break-inside-avoid rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--dsp-border)' }}><Quote className="h-7 w-7 text-red-200" />{rating ? <div className="mt-4 flex gap-0.5" aria-label={`${rating} out of 5 stars`}>{[1,2,3,4,5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />)}</div> : null}{comments.map((answer, index) => <p key={index} className="mt-4 text-sm leading-7" style={{ color: 'var(--dsp-ink)' }}>{answer.value}</p>)}<footer className="mt-5 border-t pt-4 text-sm font-semibold" style={{ borderColor: 'var(--dsp-border)' }}>{review.customer_name || 'A Dim Sum Puri guest'}<span className="mt-0.5 block text-xs font-normal" style={{ color: 'var(--dsp-muted)' }}>{new Date(review.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'long' })}</span></footer></article>; })}</div> : <div className="rounded-3xl border bg-white px-6 py-14 text-center" style={{ borderColor: 'var(--dsp-border)' }}><h2 className="dsp-display text-2xl font-semibold">Guest stories are coming soon</h2><p className="mt-2 text-sm" style={{ color: 'var(--dsp-muted)' }}>Published customer feedback will appear here.</p></div>}
  </div>;
}

