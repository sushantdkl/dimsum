/**
 * Central factual identity for Dim Sum Puri Fastfood Restaurant.
 *
 * Sourced from client-supplied Dim Sum Puri assets.
 * Do NOT invent opening hours, ratings, or social URLs — only verified fields.
 */

export const RESTAURANT = {
  name: 'Dim Sum Puri Fastfood Restaurant',
  shortName: 'Dim Sum Puri',
  nepaliName: 'डिम सम पुरी',
  tagline: 'Fast-food counter in Birendranagar-6, Surkhet',
  intro:
    'A ready-to-serve fast-food counter in Birendranagar-6, Surkhet, serving Viral Matka Biryani, momo, sekuwa, fresh coffee, snacks and fast food.',
  address: {
    line: 'Birendranagar-6, New Road',
    city: 'Surkhet',
    postalCode: '21700',
    country: 'Nepal',
    full: 'Birendranagar-6, New Road, Surkhet 21700, Nepal',
  },
  coords: { lat: 28.5967285, lng: 81.6177138732444 },
  phoneDisplay: '+977 980-8174841',
  phoneE164: '+9779808174841',
  whatsappNumber: '9779808174841',
  email: 'dimsumpurifastfood@gmail.com',
  social: {
    facebook: 'https://www.facebook.com/share/184wt4eEYk/',
    instagram: 'https://www.instagram.com/dimsumpuri',
    tiktok: 'https://www.tiktok.com/@dimsum2080',
  },
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d437.88770081949235!2d81.6177138732444!3d28.596728500000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a285c726aad3bb%3A0xfa2a5efbad5fc57d!2sDim%20Sum%20Puri%20Fastfood%20Restaurant!5e0!3m2!1sen!2snp!4v1785666510127!5m2!1sen!2snp',
  logo: '/images/brand/logo.jpeg',
  storefront: ['/images/brand/storefront-1.jpeg', '/images/brand/storefront-2.jpeg'],
  themeColor: '#A01818',
  // Override NEXT_PUBLIC_SITE_URL in production when the final domain is known.
  siteUrl: 'https://pos.example.com',
};

export function telHref() {
  return `tel:${RESTAURANT.phoneE164}`;
}

export function mailtoHref() {
  return `mailto:${RESTAURANT.email}`;
}

export function whatsappHref(message = "Hello Dim Sum Puri! I'd like to place an order.") {
  return `https://wa.me/${RESTAURANT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** External "Open in Google Maps" link (search by name near coordinates). */
export function directionsHref() {
  const { lat, lng } = RESTAURANT.coords;
  const q = encodeURIComponent(`${RESTAURANT.name}, ${RESTAURANT.address.full}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}&center=${lat},${lng}`;
}

/** "Read reviews on Google" — points to the live listing rather than copying reviews. */
export function googleReviewsHref() {
  const q = encodeURIComponent(`${RESTAURANT.name} ${RESTAURANT.address.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
