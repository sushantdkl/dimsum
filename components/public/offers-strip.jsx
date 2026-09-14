'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'combo', label: 'Combos' },
  { id: 'happy_hour', label: 'Happy Hour' },
  { id: 'discount', label: 'Discounts' },
]

function matchesFilter(offer, filter) {
  if (filter === 'all') return true
  if (filter === 'combo') return offer.kind === 'combo'
  if (filter === 'happy_hour') return offer.kind === 'happy_hour'
  return offer.kind === 'discount' || offer.kind === 'offer'
}

function featuredLabel(kind) {
  if (kind === 'combo') return 'Featured combo'
  if (kind === 'happy_hour') return 'Happy hour'
  if (kind === 'offer') return 'Featured offer'
  return 'Featured discount'
}

function MountainMark({ className = 'h-5 w-8' }) {
  return (
    <svg className={className} viewBox="0 0 40 20" fill="none" aria-hidden="true">
      <path
        d="M2 18 L12 6 L18 12 L26 4 L38 18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Special offers — one featured hero banner + secondary cards.
 * Parent only renders when offers.length > 0.
 */
export default function PublicOffersStrip({
  offers = [],
  eyebrow = 'Special offers',
  title = 'Good food tastes better together.',
  tagline = 'Good food brings people closer.',
}) {
  const [filter, setFilter] = useState('all')

  const featuredOffer = useMemo(() => {
    const marked = offers.find((o) => o.featured)
    return marked || offers[0] || null
  }, [offers])

  const filteredCards = useMemo(
    () => offers.filter((o) => o.key !== featuredOffer?.key && matchesFilter(o, filter)),
    [offers, filter, featuredOffer],
  )

  const showFeatured = featuredOffer && matchesFilter(featuredOffer, filter)

  const availableFilters = FILTERS.filter((f) => {
    if (f.id === 'all') return true
    return offers.some((o) => matchesFilter(o, f.id))
  })

  if (!offers.length) return null

  return (
    <section
      className="dsp-offers"
      style={{ background: 'var(--dsp-bg)', borderBottom: '1px solid var(--dsp-border)' }}
    >
      <div className="dsp-wrap py-10 sm:py-12">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--dsp-brand)' }}
          >
            {eyebrow}
          </p>
          <h2
            className="dsp-display mt-3 text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.65rem]"
            style={{ color: 'var(--dsp-ink)' }}
          >
            {title}
          </h2>
          <Link
            href="/offers"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold dsp-focus"
            style={{ color: 'var(--dsp-brand)' }}
          >
            See all offers <ArrowRight className="h-4 w-4" />
          </Link>

          {availableFilters.length > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {availableFilters.map((f) => {
                const active = filter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className="rounded-full px-4 py-2 text-sm font-medium dsp-focus"
                    style={
                      active
                        ? { background: 'var(--dsp-brand)', color: '#fff' }
                        : {
                            background: 'transparent',
                            color: 'var(--dsp-ink)',
                            border: '1px solid var(--dsp-border)',
                          }
                    }
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        {showFeatured ? (
          <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
            <div
              className="relative min-h-[440px] w-full sm:min-h-[520px] lg:min-h-[560px]"
              style={{ background: 'linear-gradient(135deg, var(--dsp-brand-dark), var(--dsp-ink))' }}
            >
              {featuredOffer.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredOffer.image_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, rgba(28,18,14,0.35) 0%, rgba(28,18,14,0.12) 42%, rgba(28,18,14,0.05) 100%)',
                }}
              />

              <div className="relative z-[1] flex min-h-[440px] items-end p-4 sm:min-h-[520px] sm:items-center sm:p-7 lg:min-h-[560px] lg:p-9">
                <div
                  className="w-full max-w-[18.5rem] rounded-2xl border border-white/15 p-4 shadow-2xl backdrop-blur-xl sm:max-w-[20rem] sm:rounded-3xl sm:p-5"
                  style={{ background: 'rgba(36, 22, 16, 0.62)' }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--dsp-accent)' }}
                  >
                    {featuredOffer.featured
                      ? featuredLabel(featuredOffer.kind)
                      : featuredOffer.kindLabel}
                  </p>
                  <h3 className="dsp-display mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                    {featuredOffer.name}
                  </h3>
                  {featuredOffer.description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                      {featuredOffer.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="dsp-display text-xl font-semibold text-white sm:text-2xl">
                      {featuredOffer.badge}
                    </span>
                    {featuredOffer.window ? (
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ background: 'color-mix(in srgb, var(--dsp-success) 85%, #1a2e22)' }}
                      >
                        {featuredOffer.window}
                      </span>
                    ) : featuredOffer.code ? (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                        {featuredOffer.code}
                      </span>
                    ) : null}
                  </div>

                  <Link
                    href={featuredOffer.href || '/menu'}
                    className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white dsp-focus"
                    style={{ background: 'var(--dsp-brand)' }}
                  >
                    View details <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3.5 text-white/70">
                    <MountainMark className="h-4 w-7 shrink-0 opacity-80" />
                    <p className="text-xs tracking-wide">{tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {filteredCards.length > 0 ? (
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${showFeatured ? 'mt-5 lg:mt-6' : ''}`}>
            {filteredCards.map((offer) => (
              <Link
                key={offer.key}
                href={offer.href || '/menu'}
                className="group flex min-h-[112px] overflow-hidden rounded-2xl border bg-white dsp-focus"
                style={{ borderColor: 'var(--dsp-border)' }}
              >
                <div
                  className="relative w-[38%] min-w-[108px] shrink-0 overflow-hidden"
                  style={{ background: 'var(--dsp-brand-dark)' }}
                >
                  {offer.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={offer.image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, var(--dsp-brand), var(--dsp-accent))' }} />
                  )}
                </div>
                <div className="relative flex flex-1 flex-col justify-center px-4 py-3.5 pr-11">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--dsp-brand)' }}
                  >
                    {offer.kindLabel}
                  </p>
                  <p className="dsp-display mt-1 text-lg font-semibold leading-snug" style={{ color: 'var(--dsp-ink)' }}>
                    {offer.kind === 'combo' ? offer.name : (offer.badge || offer.name)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: 'var(--dsp-muted)' }}>
                    {offer.kind === 'combo'
                      ? (offer.badge || offer.description)
                      : (offer.window || offer.name)}
                  </p>
                  <span
                    className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border transition group-hover:border-[var(--dsp-brand)] group-hover:bg-[var(--dsp-brand)] group-hover:text-white"
                    style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)' }}
                    aria-hidden
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : !showFeatured ? (
          <p className="rounded-2xl border px-4 py-10 text-center text-sm" style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-muted)' }}>
            No offers in this category right now.
          </p>
        ) : null}
      </div>
    </section>
  )
}
