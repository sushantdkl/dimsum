'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, UtensilsCrossed, Plus, Minus, ShoppingBag, MessageCircle, Trash2, Check, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import DishImage from '@/components/public/dish-image';
import { formatMenuPrice } from '@/lib/menu-format';
import { RESTAURANT } from '@/lib/restaurant-info';
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from '@/lib/whatsapp-order';
import { compactOrderNumber } from '@/lib/document-display.js';
import { sortCombosFirst } from '@/lib/promotion-display.js';

const CART_KEY = 'dsp_cart_v1';
const lineKey = (item, variant) => `${item.id}${variant ? `:${variant.name}` : ''}`;

function MenuCard({ item, onAdd }) {
  const hasVariants = item.variants && item.variants.length > 0;
  return (
    <article className="group mb-3 inline-flex w-full break-inside-avoid flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-md sm:mb-4" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}>
      <div className="relative">
        <DishImage src={item.image} alt={item.name} rounded="rounded-none" className="aspect-[4/3] w-full" />
        {item.offerBadge ? (
          <span
            className={`absolute ${item.isCombo ? 'left-2 top-8' : 'left-2 top-2'} rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm`}
          >
            {item.offerBadge}
          </span>
        ) : null}
        {item.isCombo ? (
          <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white" style={{ background: 'var(--dsp-brand)' }}>
            COMBO
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="dsp-display text-sm font-bold leading-snug sm:text-base" style={{ color: 'var(--dsp-ink)' }}>{item.name}</h3>
        {item.offerName ? (
          <p className="truncate text-[10px] font-semibold text-rose-700">{item.offerName}</p>
        ) : null}
        {item.description ? <p className="line-clamp-2 text-xs" style={{ color: 'var(--dsp-muted)' }}>{item.description}</p> : null}
        {item.combo ? (
          <div className="mt-1 space-y-0.5 text-[11px] leading-snug" style={{ color: 'var(--dsp-muted)' }}>
            {item.combo.components.map((component, index) => <p key={`${component.id}-${component.variant || ''}-${index}`}>{component.quantity}× {component.name}{component.variant ? ` (${component.variant})` : ''}</p>)}
          </div>
        ) : null}
        <div className="mt-auto pt-2">
          {hasVariants ? (
            <div className="flex flex-col gap-1.5">
              {item.variants.map((v) => (
                <button key={v.name} type="button" onClick={() => onAdd(item, v)}
                        className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left dsp-focus"
                        style={{ borderColor: 'var(--dsp-border)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--dsp-ink)' }}>{v.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--dsp-brand)' }}>{formatMenuPrice(v.price)}</span>
                    <Plus className="h-3.5 w-3.5" style={{ color: 'var(--dsp-brand)' }} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span>
                {item.combo?.originalPrice > item.price ? <span className="mr-1.5 text-xs line-through" style={{ color: 'var(--dsp-muted)' }}>{formatMenuPrice(item.combo.originalPrice)}</span> : null}
                <span className="text-base font-bold tabular-nums" style={{ color: 'var(--dsp-brand)' }}>{formatMenuPrice(item.price)}</span>
                {item.combo?.savings > 0 ? <span className="block text-[10px] font-semibold text-emerald-600">Save {formatMenuPrice(item.combo.savings)}</span> : null}
              </span>
              <button type="button" onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white dsp-focus" style={{ background: 'var(--dsp-brand)' }}>
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Grid({ items, onAdd }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5 2xl:columns-6">
      {items.map((it) => <MenuCard key={it.id} item={it} onAdd={onAdd} />)}
    </div>
  );
}

export default function MenuBrowser({ categories, whatsappNumber, deliveryPricing = {}, minimumOrderAmount = 500 }) {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState('takeaway');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryBandId, setDeliveryBandId] = useState('');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [orderErr, setOrderErr] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [promotion, setPromotion] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const idempotencyRef = useRef(null);
  const inFlightRef = useRef(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const locationRef = useRef(null);
  const deliveryRangeRef = useRef(null);

  // Persist cart across navigation.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (Array.isArray(saved)) setCart(saved);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  const addItem = (item, variant) => {
    const key = lineKey(item, variant);
    setCart((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { key, id: item.id, name: item.name, variant: variant?.name || null, price: variant ? variant.price : item.price, qty: 1 }];
    });
  };
  const changeQty = (key, delta) =>
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  const removeLine = (key) => setCart((prev) => prev.filter((l) => l.key !== key));
  const clearCart = () => setCart([]);

  async function checkPromotion(code = '') {
    if (!cart.length) { setPromotion(null); return; }
    setCouponBusy(true);
    try {
      const res = await fetch('/api/public/promotions/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: code.trim(), items: cart.map((l) => ({ menu_item_id: l.id, variant_name: l.variant, quantity: l.qty })) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not apply coupon.');
      setPromotion(json.promotion || null);
      setOrderErr('');
    } catch (error) { setPromotion(null); setOrderErr(error.message); }
    finally { setCouponBusy(false); }
  }

  useEffect(() => {
    const timer = setTimeout(() => { checkPromotion(couponCode && promotion?.code ? couponCode : ''); }, 250);
    return () => clearTimeout(timer);
    // Recheck the chosen/automatic offer whenever cart quantities change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const validateCheckout = () => {
    if (minimumOrderAmount > 0 && cartTotal < minimumOrderAmount) {
      setOrderErr(`Minimum online order is ${formatMenuPrice(minimumOrderAmount)}. Add ${formatMenuPrice(minimumOrderAmount - cartTotal)} more.`);
      return false;
    }
    const errors = {};
    const digits = phone.replace(/\D/g, '');
    if (!name.trim()) errors.name = 'Please enter your name.';
    if (/[A-Za-z]/.test(phone) || digits.length < 10 || digits.length > 15) errors.phone = 'Please enter a valid phone number.';
    if (orderType === 'delivery' && !location.trim()) errors.location = 'Please enter a delivery location.';
    if (orderType === 'delivery' && deliveryPricing.enabled && deliveryPricing.mode === 'distance_bands' && !deliveryBandId) errors.deliveryRange = 'Please choose your delivery distance range.';
    if (orderType === 'delivery' && deliveryPricing.enabled && deliveryPricing.mode === 'per_km' && !(Number(deliveryDistanceKm) > 0)) errors.deliveryDistance = 'Please enter the delivery distance.';
    setFieldErrors(errors);
    const first = errors.name ? nameRef : errors.phone ? phoneRef : errors.location ? locationRef : (errors.deliveryRange || errors.deliveryDistance) ? deliveryRangeRef : null;
    first?.current?.focus();
    if (first) setOrderErr(Object.values(errors)[0]);
    return Object.keys(errors).length === 0;
  };

  async function placeOrder({ openWhatsApp = false } = {}) {
    if (placing || inFlightRef.current) return;
    setOrderErr('');
    if (!validateCheckout()) return;
    if (!idempotencyRef.current) {
      idempotencyRef.current = globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    const whatsappWindow = openWhatsApp ? window.open('about:blank', '_blank') : null;
    if (whatsappWindow) whatsappWindow.opener = null;
    inFlightRef.current = true;
    setPlacing(true);
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          delivery_address: location.trim(),
          nearby_landmark: landmark.trim(),
          customer_note: customerNote.trim(),
          order_type: orderType,
          delivery_band_id: deliveryBandId || undefined,
          delivery_distance_km: deliveryDistanceKm || undefined,
          idempotency_key: idempotencyRef.current,
          coupon_code: promotion?.code ? couponCode.trim() : undefined,
          items: cart.map((l) => ({ menu_item_id: l.id, variant_name: l.variant, quantity: l.qty })),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setPlaced(compactOrderNumber(j.order_number) || 'your order');
        if (openWhatsApp) {
          const message = buildWhatsAppOrderMessage(j.order, {
            restaurantName: RESTAURANT.shortName,
            pickupName: RESTAURANT.name,
          });
          const url = buildWhatsAppOrderUrl(whatsappNumber, message);
          if (whatsappWindow) whatsappWindow.location.replace(url);
          else window.open(url, '_blank', 'noopener,noreferrer');
        }
        clearCart();
        idempotencyRef.current = null;
      } else {
        whatsappWindow?.close();
        setOrderErr(j.error || 'Could not place the order. Please try again.');
        if (j.field === 'name') nameRef.current?.focus();
        if (j.field === 'phone') phoneRef.current?.focus();
        if (j.field === 'delivery_address') locationRef.current?.focus();
        if (j.field === 'delivery_range' || j.field === 'delivery_distance_km') deliveryRangeRef.current?.focus();
      }
    } catch {
      whatsappWindow?.close();
      setOrderErr('Network error. Your details are still here — please try again.');
    } finally {
      inFlightRef.current = false;
      setPlacing(false);
    }
  }

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((n, l) => n + l.qty * l.price, 0);
  const selectedBand = (deliveryPricing.bands || []).find((band) => band.id === deliveryBandId);
  const deliveryFee = orderType !== 'delivery' || !deliveryPricing.enabled ? 0
    : deliveryPricing.mode === 'fixed' ? Number(deliveryPricing.fixedFee || 0)
      : deliveryPricing.mode === 'distance_bands' ? Number(selectedBand?.fee || 0)
        : Math.max(Number(deliveryPricing.minimumFee || 0), Number(deliveryDistanceKm || 0) * Number(deliveryPricing.perKmRate || 0));
  const promotionDiscount = Math.min(cartTotal, Number(promotion?.discount || 0));
  const discountedPayableTotal = Math.max(0, cartTotal - promotionDiscount) + deliveryFee;
  const minimumRemaining = Math.max(0, Number(minimumOrderAmount || 0) - cartTotal);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const searchResults = useMemo(
    () =>
      sortCombosFirst(
        searching
          ? categories.flatMap((c) =>
              c.id === 'combos' ? [] : c.items.filter((it) => it.name.toLowerCase().includes(q)),
            )
          : [],
      ),
    [categories, q, searching],
  );
  const totalItems = useMemo(() => {
    // Avoid double-counting combos that appear in Combos + their food category.
    const seen = new Set();
    let n = 0;
    for (const c of categories) {
      for (const it of c.items) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        n += 1;
      }
    }
    return n;
  }, [categories]);
  const visibleCategories = useMemo(() => {
    if (searching) return [];
    if (activeCat === 'all') {
      // Combos section first; hide duplicates from food categories in the All view.
      return categories
        .map((c) => (c.id === 'combos' ? c : { ...c, items: c.items.filter((it) => !it.isCombo) }))
        .filter((c) => c.items.length > 0);
    }
    return categories.filter((c) => c.id === activeCat);
  }, [categories, activeCat, searching]);

  return (
    <div>
      {/* Sticky control bar */}
      <div className="sticky z-30 border-b backdrop-blur" style={{ top: 'calc(var(--dsp-topbar-h) + var(--dsp-header-h))', background: 'color-mix(in srgb, var(--dsp-bg) 92%, transparent)', borderColor: 'var(--dsp-border)' }}>
        <div className="dsp-wrap py-3 space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--dsp-muted)' }} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" aria-label="Search the menu"
                   className="w-full rounded-xl border-2 py-2.5 pl-9 pr-9 text-sm dsp-focus" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 dsp-focus" style={{ color: 'var(--dsp-muted)' }}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!searching && (
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}>
              <button type="button" onClick={() => setCategoriesExpanded((value) => !value)} aria-expanded={categoriesExpanded}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left dsp-focus">
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dsp-muted)' }}>Categories</span>
                  {!categoriesExpanded && <span className="block truncate text-sm font-medium" style={{ color: 'var(--dsp-ink)' }}>{activeCat === 'all' ? `All dishes (${totalItems})` : categories.find((c) => c.id === activeCat)?.title}</span>}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold" style={{ color: 'var(--dsp-brand)' }}>
                  {categoriesExpanded ? 'Hide' : 'Show'} {categoriesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-200 ${categoriesExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="min-h-0 overflow-hidden">
                  <div className="flex max-h-[24dvh] flex-wrap gap-2 overflow-y-auto border-t p-3" role="tablist" aria-label="Menu categories" style={{ borderColor: 'var(--dsp-border)' }}>
                    <Chip label={`All (${totalItems})`} active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
                    {categories.map((c) => (
                      <Chip key={c.id} label={`${c.title} (${c.items.length})`} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dsp-wrap py-8 pb-28">
        {searching ? (
          searchResults.length > 0 ? (
            <>
              <p className="mb-4 text-sm" style={{ color: 'var(--dsp-muted)' }}>{searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for “{query}”</p>
              <Grid items={searchResults} onAdd={addItem} />
            </>
          ) : <EmptyState query={query} />
        ) : (
          <div className="space-y-12">
            {visibleCategories.map((cat) => (
              <section key={cat.id} id={cat.id} aria-labelledby={`h-${cat.id}`} className="scroll-mt-40">
                <div className="mb-4 flex items-baseline justify-between gap-3 border-b pb-2" style={{ borderColor: 'var(--dsp-border)' }}>
                  <h2 id={`h-${cat.id}`} className="dsp-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--dsp-brand-dark)' }}>{cat.title}</h2>
                  <span className="text-xs" style={{ color: 'var(--dsp-muted)' }}>{cat.items.length} items</span>
                </div>
                <Grid items={cat.items} onAdd={addItem} />
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button type="button" onClick={() => setCartOpen(true)} aria-label="View cart"
                className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full py-3 pl-4 pr-5 text-white shadow-lg dsp-focus" style={{ background: 'var(--dsp-brand)' }}>
          <ShoppingBag className="h-5 w-5" />
          <span className="font-bold tabular-nums">{formatMenuPrice(cartTotal)}</span>
          <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-bold" style={{ color: 'var(--dsp-brand)' }}>{cartCount}</span>
        </button>
      )}

      {/* Cart sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Close cart" className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="dsp-menu-enter relative flex h-full w-full max-w-md flex-col shadow-2xl" style={{ background: 'var(--dsp-surface)' }}>
            <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--dsp-border)' }}>
              <h2 className="dsp-display text-lg font-bold" style={{ color: 'var(--dsp-ink)' }}>Your order</h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close" className="rounded-lg p-1.5 dsp-focus" style={{ color: 'var(--dsp-muted)' }}><X className="h-5 w-5" /></button>
            </div>

            {placed ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-white" style={{ background: 'var(--dsp-success)' }}>
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="dsp-display text-xl font-bold" style={{ color: 'var(--dsp-ink)' }}>Order received!</h3>
                <p className="text-sm" style={{ color: 'var(--dsp-muted)' }}>
                  Your order <strong>{placed}</strong> has been sent to the counter. We&apos;ll call you at{' '}
                  <strong>{phone}</strong> to confirm.
                </p>
                <button type="button" onClick={() => { setPlaced(null); setCartOpen(false); setName(''); setPhone(''); setLocation(''); setLandmark(''); setCustomerNote(''); setFieldErrors({}); }}
                        className="mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white dsp-focus" style={{ background: 'var(--dsp-brand)' }}>Done</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <p className="py-10 text-center text-sm" style={{ color: 'var(--dsp-muted)' }}>Your cart is empty.</p>
                  ) : (
                    <ul className="space-y-3">
                      {cart.map((l) => (
                        <li key={l.key} className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: 'var(--dsp-border)' }}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold" style={{ color: 'var(--dsp-ink)' }}>{l.name}{l.variant ? ` · ${l.variant}` : ''}</p>
                            <p className="text-xs tabular-nums" style={{ color: 'var(--dsp-muted)' }}>{formatMenuPrice(l.price)} each</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => changeQty(l.key, -1)} aria-label="Decrease" className="flex h-7 w-7 items-center justify-center rounded-lg border dsp-focus" style={{ borderColor: 'var(--dsp-border)' }}><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-6 text-center text-sm font-bold tabular-nums">{l.qty}</span>
                            <button type="button" onClick={() => changeQty(l.key, 1)} aria-label="Increase" className="flex h-7 w-7 items-center justify-center rounded-lg border dsp-focus" style={{ borderColor: 'var(--dsp-border)' }}><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <span className="w-16 text-right text-sm font-bold tabular-nums" style={{ color: 'var(--dsp-brand)' }}>{formatMenuPrice(l.price * l.qty)}</span>
                          <button type="button" onClick={() => removeLine(l.key)} aria-label="Remove" className="rounded-lg p-1 dsp-focus" style={{ color: 'var(--dsp-danger)' }}><Trash2 className="h-4 w-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="max-h-[62vh] overflow-y-auto border-t p-4" style={{ borderColor: 'var(--dsp-border)' }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--dsp-muted)' }}>Items subtotal</span>
                      <span className="dsp-display text-xl font-bold tabular-nums" style={{ color: 'var(--dsp-ink)' }}>{formatMenuPrice(cartTotal)}</span>
                    </div>
                    <div className="mb-3 rounded-xl border p-3" style={{ borderColor: 'var(--dsp-border)' }}>
                      <label className="text-xs font-semibold" style={{ color: 'var(--dsp-ink)' }}>Coupon code</label>
                      <div className="mt-1.5 flex gap-2">
                        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm uppercase dsp-focus" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }} />
                        <button type="button" disabled={couponBusy || !couponCode.trim()} onClick={() => checkPromotion(couponCode)} className="rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50" style={{ background: 'var(--dsp-brand)' }}>{couponBusy ? 'Checking…' : 'Apply'}</button>
                      </div>
                      {promotion && <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--dsp-success)' }}><Check className="mr-1 inline h-3.5 w-3.5" />{promotion.name}: save {formatMenuPrice(promotionDiscount)}</p>}
                    </div>
                    {minimumOrderAmount > 0 && (
                      <div className="mb-3 rounded-xl border px-3 py-2.5 text-xs" style={{ borderColor: minimumRemaining > 0 ? 'var(--dsp-brand)' : 'var(--dsp-success)', background: 'color-mix(in srgb, var(--dsp-brand) 5%, var(--dsp-surface))' }}>
                        {minimumRemaining > 0 ? (
                          <p style={{ color: 'var(--dsp-ink)' }}>Minimum order is <strong>{formatMenuPrice(minimumOrderAmount)}</strong>. Add <strong>{formatMenuPrice(minimumRemaining)}</strong> more to place the order.</p>
                        ) : (
                          <p className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--dsp-success)' }}><Check className="h-3.5 w-3.5" /> Minimum order reached</p>
                        )}
                      </div>
                    )}

                    {/* Order details */}
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        {['takeaway', 'delivery'].map((t) => (
                          <button key={t} type="button" onClick={() => setOrderType(t)}
                                  className="rounded-lg border-2 py-2 text-sm font-semibold capitalize dsp-focus"
                                  style={{ borderColor: orderType === t ? 'var(--dsp-brand)' : 'var(--dsp-border)', color: orderType === t ? 'var(--dsp-brand)' : 'var(--dsp-ink)', background: orderType === t ? 'color-mix(in srgb, var(--dsp-brand) 8%, transparent)' : 'transparent' }}>
                            {t === 'takeaway' ? 'Pickup' : 'Delivery'}
                          </button>
                        ))}
                      </div>
                      <div>
                        <input ref={nameRef} value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((v) => ({ ...v, name: null })); }} placeholder="Your name *" aria-label="Your name" aria-invalid={!!fieldErrors.name}
                               className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: fieldErrors.name ? 'var(--dsp-danger)' : 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                        {fieldErrors.name && <p className="mt-1 text-xs" style={{ color: 'var(--dsp-danger)' }}>{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <input ref={phoneRef} value={phone} onChange={(e) => { setPhone(e.target.value); setFieldErrors((v) => ({ ...v, phone: null })); }} inputMode="tel" placeholder="Phone number *" aria-label="Phone number" aria-invalid={!!fieldErrors.phone}
                               className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: fieldErrors.phone ? 'var(--dsp-danger)' : 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                        {fieldErrors.phone && <p className="mt-1 text-xs" style={{ color: 'var(--dsp-danger)' }}>{fieldErrors.phone}</p>}
                      </div>
                      {orderType === 'delivery' && (
                        <>
                          <div>
                            <input ref={locationRef} value={location} onChange={(e) => { setLocation(e.target.value); setFieldErrors((v) => ({ ...v, location: null })); }} placeholder="Delivery location *" aria-label="Delivery location" aria-invalid={!!fieldErrors.location}
                                   className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: fieldErrors.location ? 'var(--dsp-danger)' : 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                            {fieldErrors.location && <p className="mt-1 text-xs" style={{ color: 'var(--dsp-danger)' }}>{fieldErrors.location}</p>}
                          </div>
                          <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Nearby landmark (optional)" aria-label="Nearby landmark"
                                 className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                          {deliveryPricing.enabled && deliveryPricing.mode === 'distance_bands' && <div>
                            <select ref={deliveryRangeRef} value={deliveryBandId} onChange={(e) => { setDeliveryBandId(e.target.value); setFieldErrors((value) => ({ ...value, deliveryRange: null })); }} aria-label="Delivery distance range" className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: fieldErrors.deliveryRange ? 'var(--dsp-danger)' : 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }}>
                              <option value="">Choose delivery distance *</option>
                              {(deliveryPricing.bands || []).map((band) => <option key={band.id} value={band.id}>{band.label} · {formatMenuPrice(band.fee)}</option>)}
                            </select>
                            {fieldErrors.deliveryRange && <p className="mt-1 text-xs" style={{ color: 'var(--dsp-danger)' }}>{fieldErrors.deliveryRange}</p>}
                          </div>}
                          {deliveryPricing.enabled && deliveryPricing.mode === 'per_km' && <div>
                            <input ref={deliveryRangeRef} type="number" min="0.1" step="0.1" inputMode="decimal" value={deliveryDistanceKm} onChange={(e) => { setDeliveryDistanceKm(e.target.value); setFieldErrors((value) => ({ ...value, deliveryDistance: null })); }} placeholder="Distance from restaurant (km) *" aria-label="Delivery distance in kilometres" className="w-full rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: fieldErrors.deliveryDistance ? 'var(--dsp-danger)' : 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                            {fieldErrors.deliveryDistance && <p className="mt-1 text-xs" style={{ color: 'var(--dsp-danger)' }}>{fieldErrors.deliveryDistance}</p>}
                          </div>}
                        </>
                      )}
                      <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Customer note (optional)" aria-label="Customer note" rows={2}
                                className="w-full resize-none rounded-lg border-2 px-3 py-2 text-sm dsp-focus" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)', color: 'var(--dsp-ink)' }} />
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--dsp-border)', background: 'color-mix(in srgb, var(--dsp-brand) 4%, var(--dsp-surface))' }}>
                      <div className="flex justify-between"><span style={{ color: 'var(--dsp-muted)' }}>Items</span><span className="tabular-nums">{formatMenuPrice(cartTotal)}</span></div>
                      {promotionDiscount > 0 && <div className="flex justify-between gap-3" style={{ color: 'var(--dsp-success)' }}><span>{promotion.name}</span><span className="tabular-nums">−{formatMenuPrice(promotionDiscount)}</span></div>}
                      {orderType === 'delivery' && <div className="flex justify-between gap-3"><span className="inline-flex items-center gap-1.5" style={{ color: 'var(--dsp-muted)' }}><Truck className="h-3.5 w-3.5" />Delivery</span><span className="tabular-nums">{deliveryPricing.enabled ? (deliveryFee > 0 ? formatMenuPrice(deliveryFee) : selectedBand || deliveryPricing.mode === 'fixed' ? 'Free' : 'Choose distance') : 'Free'}</span></div>}
                      <div className="flex justify-between border-t pt-1.5 font-bold" style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-ink)' }}><span>Total</span><span className="tabular-nums">{formatMenuPrice(discountedPayableTotal)}</span></div>
                      {orderType === 'delivery' && deliveryPricing.enabled && <p className="pt-1 text-[11px]" style={{ color: 'var(--dsp-muted)' }}>The restaurant will confirm the distance against your address.</p>}
                    </div>

                    {orderErr && <p className="mt-2 text-xs font-medium" role="alert" style={{ color: 'var(--dsp-danger)' }}>{orderErr}</p>}

                    <button type="button" onClick={() => placeOrder()} disabled={placing || minimumRemaining > 0}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 dsp-focus" style={{ background: 'var(--dsp-brand)' }}>
                      <ShoppingBag className="h-5 w-5" /> {placing ? 'Placing order…' : 'Place Order'}
                    </button>
                    <button type="button" onClick={() => placeOrder({ openWhatsApp: true })} disabled={placing || minimumRemaining > 0}
                       className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold dsp-focus" style={{ borderColor: 'var(--dsp-brand)', color: 'var(--dsp-brand)' }}>
                      <MessageCircle className="h-5 w-5" /> {placing ? 'Saving order…' : 'Send via WhatsApp'}
                    </button>
                    <p className="mt-2 text-center text-[11px]" style={{ color: 'var(--dsp-muted)' }}>
                      No online payment — pay at the counter or on delivery. We&apos;ll call {RESTAURANT.phoneDisplay ? 'you' : ''} to confirm.
                    </p>
                    <button type="button" onClick={clearCart} className="mt-1 w-full rounded-lg py-2 text-xs font-medium dsp-focus" style={{ color: 'var(--dsp-danger)' }}>Clear cart</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick}
            className="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors dsp-focus"
            style={{ borderColor: active ? 'var(--dsp-brand)' : 'var(--dsp-border)', background: active ? 'var(--dsp-brand)' : 'var(--dsp-surface)', color: active ? '#fff' : 'var(--dsp-ink)' }}>
      {label}
    </button>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--dsp-border)' }}>
        <UtensilsCrossed className="h-6 w-6" style={{ color: 'var(--dsp-muted)' }} />
      </div>
      <p className="dsp-display text-lg font-bold" style={{ color: 'var(--dsp-ink)' }}>No dishes match “{query}”</p>
      <p className="mt-1 text-sm" style={{ color: 'var(--dsp-muted)' }}>Try a different search, or browse the categories.</p>
    </div>
  );
}

