import AsyncStorage from '@react-native-async-storage/async-storage';
import { UPDATE_REPO } from './version';

// Startup promo ("app-open ad") served ONLY from the user's own GitHub repo — no
// ad network, no external server, no tracking. The owner edits promo.json on the
// GitHub web UI and it goes live for everyone instantly, with no new build.
//
// promo.json shape (all fields optional except enabled):
//   {
//     "enabled": true,
//     "seconds": 5,
//     "rotate": [                         // shown at random, one per app launch
//       { "image": "https://…/a.png", "link": "https://cuentas-clara.com" },
//       { "image": "https://…/b.png", "link": "https://teknosteps.com" }
//     ]
//   }
// A single { "image": …, "link": … } (without rotate) is also accepted.
// Made in Italy.
const PROMO_URL = `https://raw.githubusercontent.com/${UPDATE_REPO}/main/promo.json`;
const CACHE_KEY = 'promo.cache.v1';

export interface PromoItem {
  image: string;
  link?: string;
}

export interface Promo {
  enabled: boolean;
  seconds?: number;
  image?: string;
  link?: string;
  rotate?: PromoItem[];
}

async function fetchJsonTimeout(url: string, ms: number): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    // Bust GitHub's raw CDN cache with a query param only. Do NOT add a
    // `cache-control` request header: it isn't CORS-safelisted, so on the web
    // build it would trigger an OPTIONS preflight that raw.githubusercontent
    // doesn't answer, making the fetch fail. The `?t=` is enough.
    const res = await fetch(`${url}?t=${Date.now()}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`http ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Loads the promo config: tries GitHub (short timeout), caches the last good
 * copy, and falls back to that cache when offline. Returns null when there is
 * nothing to show (disabled / never fetched / no items) — the caller must then
 * NEVER block the app.
 */
export async function loadPromo(): Promise<Promo | null> {
  let promo: Promo | null = null;
  try {
    promo = await fetchJsonTimeout(PROMO_URL, 3500);
    if (promo) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(promo)).catch(() => {});
  } catch {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) promo = JSON.parse(raw);
    } catch {
      promo = null;
    }
  }
  if (!promo || !promo.enabled) return null;
  return promo;
}

/** Flattens single/rotate forms into a list of displayable items. */
export function promoItems(promo: Promo): PromoItem[] {
  if (promo.rotate && promo.rotate.length) return promo.rotate.filter((i) => i && i.image);
  if (promo.image) return [{ image: promo.image, link: promo.link }];
  return [];
}

/** Clamped display duration in seconds (default 5, sane bounds). */
export function promoSeconds(promo: Promo): number {
  const s = promo.seconds ?? 5;
  return Math.max(2, Math.min(15, Math.round(s)));
}
