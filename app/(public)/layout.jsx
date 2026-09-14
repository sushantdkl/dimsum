import { Fraunces, Manrope, Noto_Sans_Devanagari } from 'next/font/google';
import PublicShell from '@/components/public/public-shell';
import { getPublicBrand, getPublicContact } from '@/lib/public-content';

export const dynamic = 'force-dynamic';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const nepali = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['500', '600', '700'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

export default async function PublicLayout({ children }) {
  const [brand, contact] = await Promise.all([getPublicBrand(), getPublicContact()]);

  return (
    <div
      className={`dsp-site ${display.variable} ${sans.variable} ${nepali.variable}`}
      style={{
        ['--font-display']: 'var(--font-fraunces), Georgia, serif',
        fontFamily: 'var(--font-manrope), ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <PublicShell brand={brand} contact={contact}>{children}</PublicShell>
    </div>
  );
}
