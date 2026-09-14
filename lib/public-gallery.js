/**
 * Curated public-site imagery — client-provided local assets only.
 * Client-provided Dim Sum Puri photography from public/images/.
 */

export const STOREFRONT = [
  { src: '/images/brand/storefront-1.jpeg', alt: 'Dim Sum Puri Fastfood Restaurant storefront on New Road, Birendranagar' },
  { src: '/images/brand/storefront-2.jpeg', alt: 'Dim Sum Puri storefront with Viral Matka Biryani signage' },
];

/** Hero imagery (distinct from every other section). */
export const HERO = {
  main: { src: '/images/chicken-chilly.jpg', alt: 'Chicken chilly at Dim Sum Puri' },
  inset: { src: '/images/chicken-timur-szechuan.jpg', alt: 'Chicken timur szechuan at Dim Sum Puri' },
  accents: [
    { src: '/images/mutton-sekuwa.jpg', alt: '' },
    { src: '/images/milk-coffee.jpg', alt: '' },
  ],
};

export const EXPERIENCE = {
  src: '/images/brand/storefront-2.jpeg',
  alt: 'Dim Sum Puri storefront in Birendranagar',
};

/** Signature dishes on the home page — all distinct photos. */
export const SIGNATURE_ITEMS = [
  { name: 'Chicken Lollipop', img: '/images/chicken-lollipop.jpg', category: 'Non-Vegetarian Snacks' },
  { name: 'Chicken Wings', img: '/images/chicken-wings.jpg', category: 'Non-Vegetarian Snacks' },
  { name: 'Mutton Tass Set', img: '/images/mutton-tas.jpg', category: 'Non-Vegetarian Snacks' },
  { name: 'Chicken Fried Rice', img: '/images/chicken-fried-rice.jpg', category: 'Fast Food' },
];

/** Popular categories — distinct photos; `img: null` renders a branded tile. */
export const POPULAR_CATEGORIES = [
  { title: 'Biryani', note: 'Viral Matka Biryani', img: '/images/chicken-roast.jpg' },
  { title: 'Momo', note: 'Steam, fried, jhol and C-momo', img: '/images/chicken-lollipop.jpg' },
  { title: 'Sekuwa & Snacks', note: 'Chicken and mutton', img: '/images/mutton-sekuwa.jpg' },
  { title: 'Fast Food', note: 'Chowmein and fried rice', img: '/images/chicken-chow-mein.jpg' },
  { title: 'Coffee & Tea', note: 'Espresso to milk tea', img: '/images/milk-coffee.jpg' },
];

/** Gallery grid — room + food photos used by the static landing / CMS defaults. */
export const GALLERY = [
  '/images/brand/storefront-1.jpeg',
  '/images/chicken-sekuwa.jpg',
  '/images/egg-fried-rice.jpg',
  '/images/veg-pakauda.jpg',
  '/images/paneer-pakauda.jpg',
  '/images/chatpate.jpg',
  '/images/mutton-choila-fry.jpg',
  '/images/local-chicken-choila.jpg',
  '/images/kaju-fry.jpg',
  '/images/fresh-lime-soda.jpg',
  '/images/green-salad.jpg',
  '/images/brand/storefront-2.jpeg',
];
