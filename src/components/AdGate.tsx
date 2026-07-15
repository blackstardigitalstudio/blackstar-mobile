import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useT } from '@/i18n';
import { loadPromo, promoItems, promoSeconds, type PromoItem } from '@/lib/promo';
import { colors, radius, spacing } from '@/theme/tokens';
import { BrandMark, Txt } from './ui';

type Phase = 'loading' | 'ad' | 'done';

/**
 * App-open ad shown once per cold start. Fetches the owner's promo from GitHub
 * (see lib/promo), shows a branded loader while it decides, then displays one
 * (randomly rotated) banner full-screen for a few seconds — tap opens the linked
 * page. Mandatory short wait, no skip, then the app proceeds. If there is nothing
 * to show or the network is down, it gets out of the way immediately.
 *
 * Rendered as a full-screen absolute overlay (not a Modal — more reliable across
 * platforms) sitting inside the root flex:1 view, so it covers the whole app.
 * The opaque backdrop doubles as the startup loading screen, so the user never
 * sees a half-rendered app flash before the ad. Made in Italy.
 */
export function AdGate() {
  const t = useT();
  const [phase, setPhase] = useState<Phase>('loading');
  const [item, setItem] = useState<PromoItem | null>(null);
  const [remaining, setRemaining] = useState(5);

  // Decide once: fetch promo, pick a banner, preload its image (bounded), else bail.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const promo = await loadPromo();
        const items = promo ? promoItems(promo) : [];
        if (!alive) return;
        if (!promo || !items.length) {
          setPhase('done');
          return;
        }
        // Daily rotation: the same banner shows all day, a different one each day,
        // cycling through the list — "ogni giorno una notizia/pagina nuova".
        const dayIndex = Math.floor(Date.now() / 86_400_000);
        const chosen = items[dayIndex % items.length];
        // Don't show a blank frame: wait for the image, but cap the wait so a slow
        // asset can never hold the app hostage.
        await Promise.race([
          Image.prefetch(chosen.image).catch(() => {}),
          new Promise((r) => setTimeout(r, 2500)),
        ]);
        if (!alive) return;
        setRemaining(promoSeconds(promo));
        setItem(chosen);
        setPhase('ad');
      } catch {
        if (alive) setPhase('done');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Countdown → auto-dismiss.
  useEffect(() => {
    if (phase !== 'ad') return;
    const iv = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(iv);
          setPhase('done');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  if (phase === 'done') return null;

  const open = () => {
    if (item?.link) WebBrowser.openBrowserAsync(item.link).catch(() => {});
  };

  return (
    <View style={styles.overlay} pointerEvents="auto">
      {phase === 'loading' || !item ? (
        <View style={styles.center}>
          <BrandMark size={40} />
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.xl }} />
        </View>
      ) : (
        <>
          <Pressable style={styles.imageWrap} onPress={open} disabled={!item.link}>
            <Image source={item.image} style={styles.image} contentFit="contain" transition={200} />
            {item.link ? (
              <View style={styles.tapHint}>
                <Txt variant="small" color={colors.white}>
                  {t('ad.tap')}
                </Txt>
              </View>
            ) : null}
          </Pressable>
          <View style={styles.badge}>
            <Txt variant="tiny" color={colors.white}>
              {t('ad.label')} · {t('ad.starting', { n: remaining })}
            </Txt>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: colors.bg,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  image: { width: '100%', height: '100%' },
  tapHint: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badge: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
});
