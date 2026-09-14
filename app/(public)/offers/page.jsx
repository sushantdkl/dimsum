import { RESTAURANT } from '@/lib/restaurant-info';
import { getPublicWebsiteOffers } from '@/lib/public-offers';
import PublicOffersBoard from '@/components/public/offers-board';

export const metadata = {
  title: 'Offers',
  description: `Combos, happy hour, and discounts at ${RESTAURANT.name} in Surkhet.`,
  alternates: { canonical: '/offers' },
};

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const offers = await getPublicWebsiteOffers().catch(() => []);

  return (
    <div className="dsp-offers-page">
      <header
        className="relative overflow-hidden border-b"
        style={{
          borderColor: 'var(--dsp-border)',
          background:
            'radial-gradient(120% 80% at 10% 0%, color-mix(in srgb, var(--dsp-brand) 18%, transparent), transparent 55%), radial-gradient(90% 70% at 100% 20%, color-mix(in srgb, var(--dsp-brand-dark) 14%, transparent), transparent 50%), var(--dsp-bg)',
        }}
      >
        <div className="dsp-wrap py-8 sm:py-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--dsp-brand)' }}
          >
            Combos · Happy hour · Discounts
          </p>
          <h1
            className="dsp-display mt-2 max-w-2xl text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-[2.6rem]"
            style={{ color: 'var(--dsp-ink)' }}
          >
            What&apos;s on at the counter
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--dsp-muted)' }}>
            Pack deals, timed specials, and savings you can use when you order — dine-in, takeaway, or delivery.
          </p>
        </div>
      </header>

      <PublicOffersBoard offers={offers} />
    </div>
  );
}
