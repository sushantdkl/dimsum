import Link from 'next/link';
import { Phone, MessageCircle, MapPin, UtensilsCrossed, ArrowRight, ArrowUpRight, Clock, Zap } from 'lucide-react';
import { RESTAURANT, googleReviewsHref } from '@/lib/restaurant-info';
import { getPublicMenuCategories } from '@/lib/public-menu';
import { getPublicHome, getPublicFestive, getPublicGallery, getPublicContact, getPublicBrand, getPublicVideos } from '@/lib/public-content';
import { getPublicWebsiteOffers } from '@/lib/public-offers';
import { formatMenuPrice } from '@/lib/menu-format';
import PublicOffersStrip from '@/components/public/offers-strip';
import FestiveShowcase from '@/components/public/festive-showcase';
import VideoPlayer from '@/components/public/video-player';
import { toPublicImageUrl } from '@/lib/public-image-url.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: { absolute: 'Dim Sum Puri | Fastfood Restaurant in Surkhet' },
  description: RESTAURANT.intro,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dim Sum Puri Fastfood Restaurant',
    description: RESTAURANT.intro,
    images: [RESTAURANT.storefront[0]],
    type: 'website',
    locale: 'en_NP',
  },
};

function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: RESTAURANT.name,
    description: RESTAURANT.intro,
    servesCuisine: ['Fast Food', 'Nepali', 'Biryani', 'Momo'],
    telephone: RESTAURANT.phoneE164,
    email: RESTAURANT.email,
    image: RESTAURANT.storefront.map((s) => s),
    address: {
      '@type': 'PostalAddress',
      streetAddress: RESTAURANT.address.line,
      addressLocality: RESTAURANT.address.city,
      postalCode: RESTAURANT.address.postalCode,
      addressCountry: 'NP',
    },
    geo: { '@type': 'GeoCoordinates', latitude: RESTAURANT.coords.lat, longitude: RESTAURANT.coords.lng },
    sameAs: [
      RESTAURANT.social.facebook,
      RESTAURANT.social.instagram,
      RESTAURANT.social.tiktok,
    ].filter(Boolean),
  };
}

function resolveCtaHref(href, contact) {
  if (!href || href === 'whatsapp') return contact.hrefs.whatsapp;
  if (href === 'tel') return contact.hrefs.tel;
  return href;
}

export default async function HomePage() {
  let categories = [];
  try {
    categories = await getPublicMenuCategories();
  } catch {
    categories = [];
  }
  const [home, festive, galleryPack, contact, brand, websiteOffers, videosPack] = await Promise.all([
    getPublicHome(),
    getPublicFestive(),
    getPublicGallery(),
    getPublicContact(),
    getPublicBrand(),
    getPublicWebsiteOffers().catch(() => []),
    getPublicVideos().catch(() => ({ heading: 'Videos', lead: '', items: [] })),
  ]);
  const preview = categories.slice(0, 4).map((c) => ({ ...c, items: c.items.slice(0, 5) }));
  const galleryStrip = galleryPack.items.slice(0, home.galleryLimit);
  const videoStrip = (videosPack.items || []).slice(0, 6);
  const sig = home.signatureItems;
  const sec = home.sections;

  const secondaryHref = resolveCtaHref(home.secondaryCta.href, contact);
  const tertiaryHref = resolveCtaHref(home.tertiaryCta.href, contact);
  const secondaryExternal = home.secondaryCta.href === 'whatsapp' || String(secondaryHref).startsWith('http');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }} />

      {sec.hero && (
        <section className="dsp-hero">
          <div className="dsp-hero-stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toPublicImageUrl(home.heroImage) || home.heroImage}
              alt={home.heroImageAlt}
              className="dsp-hero-photo"
              fetchPriority="high"
            />
            <div className="dsp-hero-veil" aria-hidden />
            <div className="dsp-hero-copy">
              <p className="dsp-hero-kicker" lang="ne">{RESTAURANT.nepaliName}</p>
              <h1 className="dsp-display">
                {home.heroHeadingLine1 ? <span>{home.heroHeadingLine1}</span> : null}
                {home.heroHeadingLine2 ? <span>{home.heroHeadingLine2}</span> : null}
                {home.heroHeadingLine3 ? <span>{home.heroHeadingLine3}</span> : null}
              </h1>
              {home.heroDescription ? <p className="dsp-hero-lead">{home.heroDescription}</p> : null}
              <div className="dsp-hero-actions">
                {home.primaryCta?.label ? (
                  <Link href={home.primaryCta.href || '/menu'} className="dsp-hero-btn dsp-hero-btn--fill dsp-focus">
                    <UtensilsCrossed className="h-4 w-4" /> {home.primaryCta.label}
                  </Link>
                ) : null}
                {home.secondaryCta?.label ? (
                  <a
                    href={secondaryHref}
                    {...(secondaryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="dsp-hero-btn dsp-hero-btn--ghost dsp-focus"
                  >
                    <MessageCircle className="h-4 w-4" /> {home.secondaryCta.label}
                  </a>
                ) : null}
                {home.tertiaryCta?.label ? (
                  <a href={tertiaryHref} className="dsp-hero-btn dsp-hero-btn--ghost dsp-focus">
                    <Phone className="h-4 w-4" /> {home.tertiaryCta.label}
                  </a>
                ) : null}
              </div>
              {(home.heroEyebrow || home.heroBadgeValue || home.heroBadgeLabel) ? (
                <div className="dsp-hero-meta">
                  {home.heroEyebrow ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {home.heroEyebrow}
                    </span>
                  ) : null}
                  {(home.heroBadgeValue || home.heroBadgeLabel) ? (
                    <span>{[home.heroBadgeValue, home.heroBadgeLabel].filter(Boolean).join(' ')}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div className="dsp-hero-stripe" aria-hidden />
        </section>
      )}

      <FestiveShowcase content={festive} />

      {websiteOffers.length > 0 && <PublicOffersStrip offers={websiteOffers} />}

      {sec.popular && (
        <section className="dsp-wrap py-12 sm:py-16">
          <SectionHeading title={home.popularTitle} lead={home.popularLead} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-2.5">
            {home.popularCategories.map((c) => (
              <Link key={c.title} href={c.href || '/menu'} className="group relative overflow-hidden rounded-2xl dsp-focus">
                <div className="aspect-[3/4] w-full" style={{ background: c.img ? undefined : 'linear-gradient(135deg, var(--dsp-brand) 0%, var(--dsp-brand-dark) 100%)' }}>
                  {c.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-2 text-center">
                      <span className="dsp-display text-base font-bold text-white/95">{c.title}</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(180deg, transparent, rgba(22,20,18,0.78))' }}>
                  <p className="text-[11px] font-bold text-white sm:text-xs">{c.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {sec.signature && sig.length > 0 && (
        <section style={{ background: 'var(--dsp-surface)' }}>
          <div className="dsp-wrap py-12 sm:py-16">
            <SectionHeading title={home.signatureTitle} lead={home.signatureLead} />
            <div className="grid gap-2.5 lg:grid-cols-3">
              <Link href={sig[0].href || '/menu'} className="group relative row-span-2 overflow-hidden rounded-2xl dsp-focus lg:col-span-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sig[0].img} alt={sig[0].name} loading="lazy" className="h-full min-h-[240px] w-full object-cover transition-transform duration-300 group-hover:scale-105 lg:min-h-full" />
                <div className="absolute inset-x-0 bottom-0 p-3.5" style={{ background: 'linear-gradient(180deg, transparent, rgba(22,20,18,0.82))' }}>
                  <p className="dsp-display text-lg font-bold text-white">{sig[0].name}</p>
                  <p className="text-[11px] text-white/80">{sig[0].category}</p>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-2.5 lg:col-span-2">
                {sig.slice(1, 5).map((it) => (
                  <Link key={it.name} href={it.href || '/menu'} className="group overflow-hidden rounded-2xl dsp-focus" style={{ background: 'var(--dsp-bg)' }}>
                    <div className="aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.img} alt={it.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="px-3 py-2">
                      <p className="dsp-display text-sm font-bold" style={{ color: 'var(--dsp-ink)' }}>{it.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--dsp-muted)' }}>{it.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {sec.howItWorks && (
        <section className="dsp-wrap py-12 sm:py-16">
          <div className="overflow-hidden rounded-2xl text-white" style={{ background: 'var(--dsp-brand-dark)' }}>
            <div className="grid md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col justify-center p-6 sm:p-8" style={{ background: 'var(--dsp-brand)' }}>
                <h2 className="dsp-display text-xl font-bold sm:text-2xl">{home.howItWorksTitle}</h2>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{home.howItWorksLead}</p>
              </div>
              <ol className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                {home.howItWorksSteps.map((f, i) => {
                  const Icon = i === 0 ? Zap : i === 1 ? Clock : MessageCircle;
                  return (
                    <li key={`${f.title}-${i}`} className="p-5 sm:p-6">
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="dsp-display text-xl font-bold tabular-nums text-white/90">{i + 1}</span>
                        <Icon className="h-4 w-4 text-white/90" />
                      </div>
                      <h3 className="dsp-display font-bold">{f.title}</h3>
                      <p className="mt-1 text-[13px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{f.text}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      )}

      {sec.menu && (
        <section style={{ background: 'var(--dsp-surface)' }}>
          <div className="dsp-wrap py-12 sm:py-16">
            <div className="mb-4 flex items-end justify-between gap-4">
              <SectionHeading title={home.menuTitle} lead={home.menuLead} className="mb-0" />
              <Link href={home.menuCtaHref || '/menu'} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold dsp-focus" style={{ color: 'var(--dsp-brand)' }}>
                {home.menuCtaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {preview.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--dsp-muted)' }}>Menu is being updated. Please check back shortly.</p>
            ) : (
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                {preview.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="dsp-display mb-2.5 border-b pb-1.5 text-base font-bold" style={{ color: 'var(--dsp-brand-dark)', borderColor: 'var(--dsp-border)' }}>{cat.title}</h3>
                    <ul className="space-y-1.5">
                      {cat.items.map((it) => (
                        <li key={it.id} className="flex items-baseline justify-between gap-3">
                          <span className="text-sm" style={{ color: 'var(--dsp-ink)' }}>{it.name}</span>
                          <span className="flex-1 translate-y-[-3px] border-b border-dotted" style={{ borderColor: 'var(--dsp-border)' }} />
                          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--dsp-brand)' }}>{formatMenuPrice(it.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {sec.about && (
        <section className="dsp-wrap py-12 sm:py-16">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={home.aboutStripImage} alt={home.aboutStripImageAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            </div>
            <div>
              <h2 className="dsp-display text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--dsp-ink)', lineHeight: 1.05 }}>{home.aboutStripTitle}</h2>
              <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--dsp-muted)' }}>{home.aboutStripText}</p>
              <Link href={home.aboutStripCtaHref || '/about'} className="mt-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold dsp-focus" style={{ color: 'var(--dsp-brand)' }}>
                {home.aboutStripCtaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {sec.gallery && (
        <section style={{ background: 'var(--dsp-surface)' }}>
          <div className="dsp-wrap py-12 sm:py-16">
            <div className="mb-4 flex items-end justify-between gap-4">
              <SectionHeading title={home.galleryTitle} className="mb-0" />
              <Link href={home.galleryCtaHref || '/gallery'} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold dsp-focus" style={{ color: 'var(--dsp-brand)' }}>
                {home.galleryCtaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-6">
              {galleryStrip.map((g, i) => (
                <div key={`${g.url}-${i}`} className="aspect-square overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={toPublicImageUrl(g.url) || g.url} alt={g.alt || 'Dim Sum Puri'} loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {videoStrip.length > 0 && (
        <section className="dsp-wrap py-12 sm:py-16">
          <div className="mb-4 flex items-end justify-between gap-4">
            <SectionHeading title={videosPack.heading || 'Videos'} lead={videosPack.lead} className="mb-0" />
            <Link href="/videos" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold dsp-focus" style={{ color: 'var(--dsp-brand)' }}>
              See more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {videoStrip.map((v, i) => (
              <figure key={`${v.url}-${i}`} className="overflow-hidden rounded-xl" style={{ background: 'var(--dsp-surface)' }}>
                <div className="relative aspect-video bg-black">
                  <VideoPlayer url={v.url} title={v.title || 'Dim Sum Puri video'} />
                </div>
                {v.title ? (
                  <figcaption className="px-3 py-2 text-sm font-semibold" style={{ color: 'var(--dsp-ink)' }}>{v.title}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      )}

      {sec.findUs && (
        <section className="dsp-wrap py-12 sm:py-16">
          <SectionHeading title={home.findUsTitle} lead={home.findUsLead} />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              <iframe
                src={contact.mapEmbedSrc}
                title={`Map to ${brand.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[280px] w-full lg:h-full lg:min-h-[280px]"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
            <div className="flex flex-col justify-center gap-3.5 rounded-2xl border p-5" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--dsp-brand)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--dsp-ink)' }}>Address</p>
                  <p className="text-sm" style={{ color: 'var(--dsp-muted)' }}>{contact.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--dsp-brand)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--dsp-ink)' }}>Phone / WhatsApp</p>
                  <a href={contact.hrefs.tel} className="text-sm dsp-focus" style={{ color: 'var(--dsp-muted)' }}>{contact.phoneDisplay}</a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={contact.hrefs.directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white dsp-focus" style={{ background: 'var(--dsp-brand)' }}>
                  <MapPin className="h-4 w-4" /> Open in Google Maps
                </a>
                <a href={googleReviewsHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold dsp-focus" style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)' }}>
                  Reviews on Google <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({ title, lead, className = '' }) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <h2 className="dsp-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2.4rem]" style={{ color: 'var(--dsp-ink)', lineHeight: 1.05 }}>{title}</h2>
      {lead && <p className="mt-2 max-w-xl text-sm leading-relaxed sm:text-[15px]" style={{ color: 'var(--dsp-muted)' }}>{lead}</p>}
    </div>
  );
}
