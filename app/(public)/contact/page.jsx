import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Music2 } from 'lucide-react';
import { RESTAURANT } from '@/lib/restaurant-info';
import { getPublicContact } from '@/lib/public-content';
import ReservationForm from '@/components/public/reservation-form';

export const metadata = {
  title: 'Contact',
  description: `Contact ${RESTAURANT.name} in Birendranagar-6, New Road, Surkhet. Call ${RESTAURANT.phoneDisplay}, message on WhatsApp, or reserve a table online.`,
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const info = await getPublicContact();
  const rows = [
    { icon: Phone, label: 'Phone', value: info.phoneDisplay, href: info.hrefs.tel },
    { icon: MessageCircle, label: 'WhatsApp', value: info.phoneDisplay, href: info.hrefs.whatsapp, external: true },
    { icon: Mail, label: 'Email', value: info.email, href: info.hrefs.mailto },
    { icon: MapPin, label: 'Address', value: info.location, href: info.hrefs.directions, external: true },
  ].filter((r) => r.value);
  const socialLinks = [
    { label: 'Facebook', href: info.social.facebook, icon: Facebook },
    { label: 'Instagram', href: info.social.instagram, icon: Instagram },
    { label: 'TikTok', href: info.social.tiktok, icon: Music2 },
  ].filter((link) => link.href);

  return (
    <div className="dsp-wrap py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
        <div className="space-y-5">
          <div className="space-y-3">
            {info.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={info.logo}
                alt={info.businessName || RESTAURANT.name}
                width={72}
                height={72}
                className="h-16 w-16 rounded-xl object-cover border"
                style={{ borderColor: 'var(--dsp-border)' }}
              />
            ) : null}
            {info.slogan ? (
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--dsp-brand)' }}
              >
                {info.slogan}
              </p>
            ) : null}
            {info.pageHeading ? (
              <h1 className="dsp-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--dsp-ink)' }}>
                {info.pageHeading}
              </h1>
            ) : null}
            {info.intro ? (
              <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--dsp-muted)' }}>
                {info.intro}
              </p>
            ) : null}
          </div>

          <div className="space-y-2.5">
            {rows.map((r) => (
              <a
                key={r.label}
                href={r.href}
                {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-start gap-3 rounded-xl border p-3.5 transition-colors dsp-focus hover:shadow-sm"
                style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ background: 'var(--dsp-brand)' }}
                >
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--dsp-ink)' }}>{r.label}</p>
                  <p className="text-[13px] break-words" style={{ color: 'var(--dsp-muted)' }}>{r.value}</p>
                </div>
              </a>
            ))}
          </div>

          {!!socialLinks.length && (
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold dsp-focus"
                  style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)', background: 'var(--dsp-surface)' }}
                  aria-label={`${info.businessName || 'Dim Sum Puri'} on ${link.label}`}
                >
                  <link.icon className="h-4 w-4" /> {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <ReservationForm />
        </div>
      </div>

      {info.mapEmbedSrc ? (
        <div
          className="mt-8 overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--dsp-border)' }}
        >
          <iframe
            src={info.mapEmbedSrc}
            title={`Map to ${info.businessName || RESTAURANT.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[280px] w-full sm:h-[340px]"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}
