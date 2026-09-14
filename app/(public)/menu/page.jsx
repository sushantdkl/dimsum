import MenuBrowser from '@/components/public/menu-browser';
import { getPublicDeliveryPricing, getPublicMenuCategories } from '@/lib/public-menu';
import { RESTAURANT } from '@/lib/restaurant-info';
import { getPublicContact } from '@/lib/public-content';
import { loadOnlineOrderMinimum } from '@/lib/online-order-minimum';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Menu',
  description:
    'The full menu at Dim Sum Puri Fastfood Restaurant, Birendranagar-6, Surkhet — biryani, momo, sekuwa, coffee, snacks and fast food with live prices.',
  alternates: { canonical: '/menu' },
};

export default async function MenuPage() {
  let categories = [];
  let contact = { whatsappNumber: RESTAURANT.whatsappNumber };
  let deliveryPricing = { enabled: false, mode: 'fixed', fixedFee: 0, bands: [] };
  let minimumOrderAmount = 500;
  try {
    [categories, contact, deliveryPricing, minimumOrderAmount] = await Promise.all([
      getPublicMenuCategories(), getPublicContact(), getPublicDeliveryPricing(), loadOnlineOrderMinimum(),
    ]);
  } catch {
    categories = [];
  }

  const seenIds = new Set();
  let itemCount = 0;
  for (const cat of categories) {
    for (const item of cat.items || []) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      itemCount += 1;
    }
  }
  const categoryCount = categories.filter((c) => c.id !== 'combos').length || categories.length;

  return (
    <>
      <section className="dsp-wrap pt-10 pb-2">
        <h1 className="dsp-display text-3xl font-bold sm:text-4xl" style={{ color: 'var(--dsp-ink)' }}>Our Menu</h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--dsp-muted)' }}>
          {itemCount > 0
            ? `${itemCount} dishes across ${categoryCount} categories — biryani, momo, sekuwa, coffee, snacks and fast food, served fresh at our counter in Surkhet.`
            : 'Our menu is being updated. Please check back shortly, or contact us for today’s dishes.'}
        </p>
      </section>

      {categories.length > 0 ? (
        <MenuBrowser categories={categories} whatsappNumber={contact.whatsappNumber} deliveryPricing={deliveryPricing} minimumOrderAmount={minimumOrderAmount} />
      ) : (
        <div className="dsp-wrap py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--dsp-muted)' }}>
            Menu unavailable right now. Call{' '}
            <a href={`tel:${RESTAURANT.phoneE164}`} className="font-semibold underline" style={{ color: 'var(--dsp-brand)' }}>
              {RESTAURANT.phoneDisplay}
            </a>.
          </p>
        </div>
      )}
    </>
  );
}
