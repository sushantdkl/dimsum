import { notFound } from 'next/navigation';
import { MessageSquareHeart } from 'lucide-react';
import ReviewForm from '@/components/public/review-form';
import { getReviewFormBySlug } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const form = await getReviewFormBySlug(slug).catch(() => null);
  return { title: form?.title || 'Customer review', description: form?.description || 'Share your Dim Sum Puri experience.', robots: { index: false, follow: false } };
}

export default async function ReviewPage({ params }) {
  const { slug } = await params;
  const form = await getReviewFormBySlug(slug).catch(() => null);
  if (!form) notFound();
  return <div className="dsp-wrap max-w-3xl py-10 sm:py-16"><header className="mb-8 text-center"><span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700"><MessageSquareHeart className="h-6 w-6" /></span><p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--dsp-brand)' }}>Your experience matters</p><h1 className="dsp-display mt-2 text-4xl font-semibold sm:text-5xl" style={{ color: 'var(--dsp-ink)' }}>{form.title}</h1>{form.description ? <p className="mx-auto mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--dsp-muted)' }}>{form.description}</p> : null}</header><ReviewForm form={form} /><p className="mt-5 text-center text-xs" style={{ color: 'var(--dsp-muted)' }}>Reviews are checked by our team before appearing publicly.</p></div>;
}

