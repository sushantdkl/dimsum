'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, MapPin, Menu, X, Mail, LogIn, Facebook, Instagram, Music2 } from 'lucide-react';
import { RESTAURANT } from '@/lib/restaurant-info';
import { toPublicImageUrl } from '@/lib/public-image-url.js';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/offers', label: 'Offers' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/videos', label: 'Videos' },
  { href: '/contact', label: 'Contact' },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname?.startsWith(`${href}/`);
}

export default function PublicShell({ children, brand, contact }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const publicBrand = {
    name: brand?.name || RESTAURANT.name,
    shortName: brand?.shortName || RESTAURANT.shortName,
    tagline: brand?.tagline || RESTAURANT.tagline,
    logo: toPublicImageUrl(brand?.logo) || brand?.logo || RESTAURANT.logo,
  };
  const publicContact = {
    phoneDisplay: contact?.phoneDisplay || RESTAURANT.phoneDisplay,
    email: contact?.email || RESTAURANT.email,
    location: contact?.location || RESTAURANT.address.full,
    hrefs: contact?.hrefs || {},
    social: contact?.social || {},
  };
  const socialLinks = [
    ['Facebook', publicContact.social.facebook, Facebook],
    ['Instagram', publicContact.social.instagram, Instagram],
    ['TikTok', publicContact.social.tiktok, Music2],
  ].filter(([, href]) => href);
  const footerSocials = [
    ...socialLinks.map(([label, href]) => [label, href]),
    ['WhatsApp', publicContact.hrefs.whatsapp],
  ].filter(([, href]) => href);
  const showTopbar = Boolean(
    publicContact.phoneDisplay ||
    publicContact.email ||
    publicContact.location ||
    socialLinks.length
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen flex flex-col" style={showTopbar ? undefined : { ['--dsp-topbar-h']: '0px' }}>
      <header className="dsp-header">
        {showTopbar ? (
          <div className="dsp-topbar">
            <div className="dsp-wrap flex h-full items-center justify-between gap-3">
              <div className="dsp-topbar-meta">
                {publicContact.location ? (
                  <a
                    href={publicContact.hrefs.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dsp-focus rounded-md dsp-topbar-location"
                  >
                    <MapPin aria-hidden="true" />
                    <span>{publicContact.location}</span>
                  </a>
                ) : null}
                {publicContact.email ? (
                  <a href={publicContact.hrefs.mailto} className="dsp-focus rounded-md">
                    <Mail aria-hidden="true" />
                    <span className="hidden sm:inline">{publicContact.email}</span>
                  </a>
                ) : null}
                {publicContact.phoneDisplay ? (
                  <a href={publicContact.hrefs.tel} className="dsp-focus rounded-md">
                    <Phone aria-hidden="true" />
                    <span>{publicContact.phoneDisplay}</span>
                  </a>
                ) : null}
              </div>
              {socialLinks.length ? (
                <div className="dsp-topbar-social">
                  <span className="dsp-topbar-follow">Follow us</span>
                  {socialLinks.map(([label, href, Icon]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="dsp-focus rounded-md"
                    >
                      <Icon aria-hidden="true" />
                      <span className="sr-only">{label}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="dsp-header-bar">
          <div className="dsp-wrap flex h-full items-center justify-between gap-3">
            <Link href="/" className="dsp-brand dsp-focus rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicBrand.logo} alt={`${publicBrand.name} logo`} width={46} height={46} />
              <span>{publicBrand.shortName}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5" aria-label="Primary">
              {NAV.map((n) => {
                const active = isActive(pathname, n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="dsp-nav-link dsp-focus"
                    style={{
                      color: active ? 'var(--dsp-brand)' : 'var(--dsp-ink)',
                      background: active ? 'color-mix(in srgb, var(--dsp-brand) 12%, transparent)' : 'transparent',
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden sm:flex items-center gap-2">
              <a
                href={publicContact.hrefs.tel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border dsp-focus"
                style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)' }}
              >
                <Phone className="w-4 h-4" /> <span className="hidden lg:inline">Call</span>
              </a>
              <a
                href={publicContact.hrefs.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white dsp-focus"
                style={{ background: 'var(--dsp-brand)' }}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border dsp-focus"
              style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)' }}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div
            className="dsp-menu-enter md:hidden border-t px-4 py-3 space-y-0.5"
            style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}
          >
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-semibold dsp-focus"
                style={{
                  color: isActive(pathname, n.href) ? 'var(--dsp-brand)' : 'var(--dsp-ink)',
                  background: isActive(pathname, n.href) ? 'color-mix(in srgb, var(--dsp-brand) 10%, transparent)' : 'transparent',
                }}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <a
                href={publicContact.hrefs.tel}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold border"
                style={{ borderColor: 'var(--dsp-border)' }}
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <a
                href={publicContact.hrefs.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--dsp-brand)' }}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-8" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}>
        <div className="dsp-wrap py-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicBrand.logo} alt="" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
              <span className="dsp-display font-bold text-sm" style={{ color: 'var(--dsp-brand-dark)' }}>{publicBrand.shortName}</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--dsp-muted)' }}>{publicBrand.tagline}.</p>
          </div>

          <div className="space-y-1 text-[13px]">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--dsp-ink)' }}>Explore</h3>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block dsp-focus rounded py-0.5" style={{ color: 'var(--dsp-muted)' }}>{n.label}</Link>
            ))}
          </div>

          <div className="space-y-1 text-[13px]">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--dsp-ink)' }}>Contact</h3>
            <a href={publicContact.hrefs.tel} className="flex items-center gap-2 dsp-focus rounded py-0.5" style={{ color: 'var(--dsp-muted)' }}>
              <Phone className="w-3.5 h-3.5 shrink-0" /> {publicContact.phoneDisplay}
            </a>
            <a href={publicContact.hrefs.mailto} className="flex items-center gap-2 dsp-focus rounded break-all py-0.5" style={{ color: 'var(--dsp-muted)' }}>
              <Mail className="w-3.5 h-3.5 shrink-0" /> {publicContact.email}
            </a>
            <a href={publicContact.hrefs.directions} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 dsp-focus rounded py-0.5" style={{ color: 'var(--dsp-muted)' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {publicContact.location}
            </a>
          </div>

          <div className="space-y-1 text-[13px]">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--dsp-ink)' }}>Follow</h3>
            {footerSocials.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block dsp-focus rounded py-0.5" style={{ color: 'var(--dsp-muted)' }}>{label}</a>
            ))}
          </div>
        </div>
        <div className="border-t py-3.5" style={{ borderColor: 'var(--dsp-border)' }}>
          <div className="dsp-wrap flex flex-col items-center justify-between gap-3 text-xs sm:flex-row" style={{ color: 'var(--dsp-muted)' }}>
            <p>© {new Date().getFullYear()} {publicBrand.name}. All rights reserved.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition hover:opacity-90 dsp-focus"
              style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)', background: 'var(--dsp-bg)' }}
            >
              <LogIn className="h-3.5 w-3.5" /> Staff login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
