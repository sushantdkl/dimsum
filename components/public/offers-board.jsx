'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgePercent, Clock3, Package, Sparkles } from 'lucide-react'

const FILTERS = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'combo', label: 'Combos', icon: Package },
  { id: 'happy_hour', label: 'Happy Hour', icon: Clock3 },
  { id: 'discount', label: 'Discounts', icon: BadgePercent },
]

function matchesFilter(offer, filter) {
  if (filter === 'all') return true
  if (filter === 'combo') return offer.kind === 'combo'
  if (filter === 'happy_hour') return offer.kind === 'happy_hour'
  return offer.kind === 'discount' || offer.kind === 'offer'
}

function kindTone(kind) {
  if (kind === 'combo') return { bg: 'color-mix(in srgb, var(--dsp-brand-dark) 12%, white)', fg: 'var(--dsp-brand-dark)' }
  if (kind === 'happy_hour') return { bg: 'color-mix(in srgb, var(--dsp-success) 16%, white)', fg: 'var(--dsp-success)' }
  return { bg: 'color-mix(in srgb, var(--dsp-brand) 14%, white)', fg: 'var(--dsp-brand)' }
}

/**
 * Full /offers board — filters + featured banner + dense card grid.
 */
export default function PublicOffersBoard({ offers = [] }) {
  const [filter, setFilter] = useState('all')

  const featured = useMemo(() => {
    const marked = offers.find((o) => o.featured)
    return marked || offers[0] || null
  }, [offers])

  const list = useMemo(
    () => offers.filter((o) => matchesFilter(o, filter)),
    [offers, filter],
  )

  const availableFilters = FILTERS.filter((f) => {
    if (f.id === 'all') return true
    return offers.some((o) => matchesFilter(o, f.id))
  })

  if (!offers.length) {
    return (
      <div className="dsp-wrap py-12">
        <div
          className="rounded-3xl border px-6 py-16 text-center"
          style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}
        >
          <p className="dsp-display text-2xl font-semibold" style={{ color: 'var(--dsp-ink)' }}>
            No offers right now
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--dsp-muted)' }}>
            Check back soon — or browse the full menu while we cook up the next deal.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white dsp-focus"
            style={{ background: 'var(--dsp-brand)' }}
          >
            View menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dsp-wrap py-8 sm:py-10">
      {availableFilters.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {availableFilters.map((f) => {
            const active = filter === f.id
            const Icon = f.icon
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition dsp-focus"
                style={
                  active
                    ? { background: 'var(--dsp-brand)', color: '#fff' }
                    : {
                        background: 'var(--dsp-surface)',
                        color: 'var(--dsp-ink)',
                        border: '1px solid var(--dsp-border)',
                      }
                }
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {featured && matchesFilter(featured, filter) ? (
        <article
          className="relative mb-8 overflow-hidden rounded-[1.75rem] border sm:rounded-[2rem]"
          style={{ borderColor: 'var(--dsp-border)' }}
        >
          <div
            className="relative grid min-h-[320px] lg:min-h-[420px] lg:grid-cols-[1.15fr_0.85fr]"
            style={{ background: 'linear-gradient(135deg, var(--dsp-brand-dark), var(--dsp-ink))' }}
          >
            <div className="relative order-2 min-h-[220px] lg:order-1 lg:min-h-full">
              {featured.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--dsp-brand), var(--dsp-accent))' }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(8,37,31,0.55) 0%, rgba(8,37,31,0.15) 55%, transparent 100%)',
                }}
              />
            </div>

            <div className="relative order-1 flex flex-col justify-center gap-4 p-6 sm:p-8 lg:order-2 lg:p-10">
              <span
                className="w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90"
                style={{ background: 'rgba(255,255,255,0.14)' }}
              >
                {featured.featured ? 'Featured' : featured.kindLabel}
              </span>
              <h2 className="dsp-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {featured.name}
              </h2>
              {featured.description ? (
                <p className="max-w-md text-sm leading-relaxed text-white/75">{featured.description}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <span className="dsp-display text-2xl font-semibold text-white sm:text-3xl">
                  {featured.badge}
                </span>
                {featured.window ? (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ background: 'color-mix(in srgb, var(--dsp-success) 85%, #1a2e22)' }}
                  >
                    {featured.window}
                  </span>
                ) : null}
                {featured.code ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-bold text-white">
                    {featured.code}
                  </span>
                ) : null}
              </div>
              <Link
                href={featured.href || '/menu'}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white dsp-focus"
                style={{ background: 'var(--dsp-brand)' }}
              >
                Order on menu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((offer) => {
          const tone = kindTone(offer.kind)
          const isFeaturedCard = featured && offer.key === featured.key && matchesFilter(featured, filter)
          if (isFeaturedCard) return null
          return (
            <Link
              key={offer.key}
              href={offer.href || '/menu'}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md dsp-focus"
              style={{ borderColor: 'var(--dsp-border)' }}
            >
              <div className="relative aspect-[16/10] overflow-hidden" style={{ background: 'var(--dsp-brand-dark)' }}>
                {offer.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-45"
                    style={{ background: 'linear-gradient(135deg, var(--dsp-brand), var(--dsp-accent))' }}
                  />
                )}
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  {offer.kindLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <h3 className="dsp-display text-xl font-semibold leading-snug" style={{ color: 'var(--dsp-ink)' }}>
                  {offer.name}
                </h3>
                {offer.description ? (
                  <p className="line-clamp-2 text-sm" style={{ color: 'var(--dsp-muted)' }}>
                    {offer.description}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <span className="dsp-display text-lg font-semibold" style={{ color: 'var(--dsp-brand)' }}>
                    {offer.badge}
                  </span>
                  {offer.window ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      {offer.window}
                    </span>
                  ) : null}
                  {offer.code ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold"
                      style={{ background: 'var(--dsp-bg)', color: 'var(--dsp-ink)' }}
                    >
                      {offer.code}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {!list.filter((o) => !(featured && o.key === featured.key && matchesFilter(featured, filter))).length &&
      !(featured && matchesFilter(featured, filter)) ? (
        <p
          className="mt-6 rounded-2xl border px-4 py-10 text-center text-sm"
          style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-muted)' }}
        >
          No offers in this category right now.
        </p>
      ) : null}
    </div>
  )
}
