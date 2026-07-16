import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Focusable } from '@/tv/Focusable';
import { useT } from '@/i18n';
import { useStore } from '@/store/useStore';
import { sortCategories } from '@/lib/categories';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Category, MediaItem, MediaKind } from '@/lib/types';
import { MediaGrid } from './Rail';
import { Empty, Txt } from './ui';

function Chip({
  label,
  active,
  pinned,
  onPress,
  onLongPress,
}: {
  label: string;
  active: boolean;
  pinned?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Focusable onSelect={onPress} onLongPress={onLongPress} style={[styles.chip, active && styles.chipActive]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {pinned ? <Ionicons name="star" size={12} color={active ? colors.onAccent : colors.accent} /> : null}
        <Txt variant="small" numberOfLines={1} color={active ? colors.onAccent : colors.textMuted} style={{ fontWeight: '600' }}>
          {label}
        </Txt>
      </View>
    </Focusable>
  );
}

/** A friendly icon guessed from the category name (recognise, don't read). */
function iconForCategory(name: string): any {
  const n = name.toLowerCase();
  if (/(sport|calcio|football|f[uú]tbol|deporte|tennis|basket|motogp|f1)/.test(n)) return 'football';
  if (/(news|notizi|notici|tg\b|24h|24\/7|meteo)/.test(n)) return 'newspaper';
  if (/(kid|bimb|bambin|cartoon|infantil|ni[nñ]o|junior|disney)/.test(n)) return 'happy';
  if (/(cinema|film|movie|pel[ií]cul|cine)/.test(n)) return 'film';
  if (/(music|m[uú]sic|radio|hits)/.test(n)) return 'musical-notes';
  if (/(serie|show|entertain|intratten)/.test(n)) return 'albums';
  if (/(doc|natur|planet|discovery|history|storia)/.test(n)) return 'planet';
  if (/(cucin|food|cook|gastro|chef|recip)/.test(n)) return 'restaurant';
  if (/(viagg|travel|viaje|turism)/.test(n)) return 'airplane';
  if (/(relig|church|chiesa|iglesia|cristian|islam|gospel)/.test(n)) return 'book';
  if (/(lifestyle|fashion|moda|shopping|casa|home)/.test(n)) return 'shirt';
  if (/(adult|xxx|18\+|\+18|porn)/.test(n)) return 'lock-closed';
  return 'tv';
}

/** Big tappable category folder tile: icon + name + channel count. */
function FolderTile({
  name,
  count,
  countKey,
  icon,
  width,
  pinned,
  onPress,
  onLongPress,
}: {
  name: string;
  count: number;
  countKey: string;
  icon: any;
  width: number;
  pinned?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: 'rgba(217,70,239,0.18)' }}
      style={({ pressed }) => [styles.folder, { width }, pinned && styles.folderPinned, pressed && { opacity: 0.6 }]}
    >
      {pinned ? (
        <View style={styles.pinBadge}>
          <Ionicons name="star" size={14} color={colors.accent} />
        </View>
      ) : null}
      <View style={styles.folderIcon}>
        <Ionicons name={icon} size={26} color={colors.accent} />
      </View>
      <Txt variant="body" numberOfLines={2} style={{ fontWeight: '700', marginTop: spacing.sm }}>
        {name}
      </Txt>
      <Txt variant="small" color={colors.textMuted} style={{ marginTop: 2 }}>
        {t(countKey, { n: count })}
      </Txt>
    </Pressable>
  );
}

export function Browser({
  title,
  items,
  categories,
  kind,
  onSelect,
  variant,
  folders,
}: {
  title: string;
  items: MediaItem[];
  categories: Category[];
  kind: MediaKind;
  onSelect: (item: MediaItem) => void;
  variant: 'poster' | 'tile';
  /** When true, show category FOLDERS first; tapping one opens its channels. */
  folders?: boolean;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const order = useStore((s) => s.settings.categoryOrder);
  const manual = useStore((s) => s.settings.categoryManual);
  const pins = useStore((s) => s.settings.categoryPins);
  const togglePin = useStore((s) => s.toggleCategoryPin);
  const taste = useStore((s) => s.taste);
  const cats = useMemo(
    () => sortCategories(categories.filter((c) => c.kind === kind), order, taste, manual, pins),
    [categories, kind, order, taste, manual, pins],
  );

  // How many channels each category holds (also decides if a folder is worth showing).
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) if (i.categoryId) m.set(i.categoryId, (m.get(i.categoryId) ?? 0) + 1);
    return m;
  }, [items]);

  // Favourite channels present in this list → their own "⭐ Preferiti" folder,
  // shown first. Intersect with `items` so we play a fresh entry (and never show a
  // stale favourite that no longer exists in the current source).
  const favorites = useStore((s) => s.favorites);
  const favItems = useMemo(() => {
    const favIds = new Set(favorites.map((f) => f.id));
    return items.filter((i) => favIds.has(i.id));
  }, [favorites, items]);

  // Recently-watched items of THIS section, in watch order (most recent first),
  // limited to entries still present in the current list → "Visti di recente"
  // folder for quick re-access and to reflect what you like.
  const recents = useStore((s) => s.recents);
  const recentItems = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const out: MediaItem[] = [];
    for (const r of recents) {
      const it = byId.get(r.id);
      if (it) out.push(it);
    }
    return out;
  }, [recents, items]);

  // Folder view: which folder is open. null = show the folder grid.
  const [openCat, setOpenCat] = useState<string | null>(null);
  // Chip view (movies/series): selected chip.
  const [sel, setSel] = useState<string>('all');

  // If the list refreshes and the selected category id disappears, fall back so the
  // grid never ends up mysteriously empty.
  useEffect(() => {
    // folders mode (openCat)
    if (openCat === 'fav' && !favItems.length) setOpenCat(null);
    else if (openCat === 'recent' && !recentItems.length) setOpenCat(null);
    else if (openCat && openCat !== 'all' && openCat !== 'fav' && openCat !== 'recent' && !cats.some((c) => c.id === openCat)) setOpenCat(null);
    // chip mode (sel)
    if (sel === 'fav' && !favItems.length) setSel('all');
    else if (sel === 'recent' && !recentItems.length) setSel('all');
    else if (sel !== 'all' && sel !== 'fav' && sel !== 'recent' && !cats.some((c) => c.id === sel)) setSel('all');
  }, [cats, openCat, sel, favItems.length, recentItems.length]);

  if (!items.length) {
    return <Empty title={t('br.empty', { title })} hint={t('br.emptyHint')} />;
  }

  // Kind-aware labels so folders read right in Film/Serie too (not "canali").
  const allLabel = kind === 'movie' ? t('br.allMovies') : kind === 'series' ? t('br.allSeries') : t('br.allChannels');
  const countKey = kind === 'movie' ? 'br.moviesCount' : kind === 'series' ? 'br.seriesCount' : 'br.channelsCount';

  const filteredBy = (id: string) =>
    id === 'all'
      ? items
      : id === 'fav'
        ? favItems
        : id === 'recent'
          ? recentItems
          : items.filter((i) => i.categoryId === id);

  // ---- FOLDERS MODE (Live): categories as big folders, then their channels. ----
  if (folders && (cats.length || favItems.length || recentItems.length)) {
    // Level 2: channels inside the chosen folder, with a clear "back to folders" bar.
    if (openCat) {
      const folderName =
        openCat === 'all'
          ? allLabel
          : openCat === 'fav'
            ? t('br.favorites')
            : openCat === 'recent'
              ? t('br.recent')
              : cats.find((c) => c.id === openCat)?.name ?? title;
      const channels = filteredBy(openCat);
      const header = (
        <View>
          <Pressable
            onPress={() => setOpenCat(null)}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
            hitSlop={8}
            style={({ pressed }) => [styles.backRow, { paddingTop: insets.top + spacing.sm }, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
            <Txt variant="small" color={colors.accent} style={{ fontWeight: '700' }}>
              {t('br.backToFolders')}
            </Txt>
          </Pressable>
          <Txt variant="h2" style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
            {folderName} <Txt variant="small" color={colors.textFaint}>{`· ${t(countKey, { n: channels.length })}`}</Txt>
          </Txt>
        </View>
      );
      return <MediaGrid items={channels} onSelect={onSelect} variant={variant} header={header} />;
    }

    // Level 1: the folder grid (Preferiti / Visti di recente first, then Tutti + categories).
    return (
      <FolderGrid
        title={title}
        total={items.length}
        cats={cats}
        counts={counts}
        favCount={favItems.length}
        recentCount={recentItems.length}
        pins={pins}
        onTogglePin={togglePin}
        allLabel={allLabel}
        countKey={countKey}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onOpen={setOpenCat}
      />
    );
  }

  // ---- CHIP MODE (movies / series): quick "Preferiti" / "Visti di recente" chips first. ----
  const data = [
    ...(favItems.length ? [{ id: 'fav', name: t('br.favorites') }] : []),
    ...(recentItems.length ? [{ id: 'recent', name: t('br.recent') }] : []),
    { id: 'all', name: t('common.all') },
    ...cats.map((c) => ({ id: c.id, name: c.name })),
  ];
  const filtered = filteredBy(sel);
  const header = (
    <View>
      <Txt variant="h2" style={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.sm, marginBottom: spacing.sm }}>
        {title} <Txt variant="small" color={colors.textFaint}>{`· ${items.length}`}</Txt>
      </Txt>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipBar}
        style={{ marginBottom: spacing.xs }}
      >
        {data.map((c) => {
          const special = c.id === 'all' || c.id === 'fav' || c.id === 'recent';
          return (
            <Chip
              key={c.id}
              label={c.name}
              active={sel === c.id}
              pinned={!special && pins.includes(c.id)}
              onPress={() => setSel(c.id)}
              onLongPress={special ? undefined : () => togglePin(c.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  return <MediaGrid items={filtered} onSelect={onSelect} variant={variant} header={header} />;
}

/** The folder grid — 2 columns of big, tappable category tiles. */
function FolderGrid({
  title,
  total,
  cats,
  counts,
  favCount,
  recentCount,
  pins,
  onTogglePin,
  allLabel,
  countKey,
  topInset,
  bottomInset,
  onOpen,
}: {
  title: string;
  total: number;
  cats: Category[];
  counts: Map<string, number>;
  favCount: number;
  recentCount: number;
  pins: string[];
  onTogglePin: (id: string) => void;
  allLabel: string;
  countKey: string;
  topInset: number;
  bottomInset: number;
  onOpen: (id: string) => void;
}) {
  const t = useT();
  const { width } = useWindowDimensions();
  const pad = spacing.lg;
  const gap = spacing.md;
  const cols = Math.max(2, Math.floor((width - pad * 2 + gap) / (170 + gap)));
  const tileW = Math.floor((width - pad * 2 - gap * (cols - 1)) / cols);

  // "⭐ Preferiti" and "Visti di recente" first (if any), then "Tutti i canali",
  // then a folder per category.
  const tiles = [
    ...(favCount > 0 ? [{ id: 'fav', name: t('br.favorites'), count: favCount, icon: 'heart' as any }] : []),
    ...(recentCount > 0 ? [{ id: 'recent', name: t('br.recent'), count: recentCount, icon: 'time' as any }] : []),
    { id: 'all', name: allLabel, count: total, icon: 'apps' as any },
    ...cats.map((c) => ({ id: c.id, name: c.name, count: counts.get(c.id) ?? 0, icon: iconForCategory(c.name) })),
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.folderHeader, { paddingTop: topInset + spacing.sm }]}>
        <Txt variant="h2">
          {title} <Txt variant="small" color={colors.textFaint}>{`· ${t(countKey, { n: total })}`}</Txt>
        </Txt>
        <Txt variant="small" color={colors.textMuted} style={{ marginTop: 2 }}>
          {t('br.pickFolder')}
        </Txt>
      </View>
      <ScrollView
        contentContainerStyle={[styles.folderGrid, { paddingBottom: bottomInset + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tiles.map((tile) => {
          const special = tile.id === 'all' || tile.id === 'fav' || tile.id === 'recent';
          return (
            <FolderTile
              key={tile.id}
              name={tile.name}
              count={tile.count}
              countKey={countKey}
              icon={tile.icon}
              width={tileW}
              pinned={!special && pins.includes(tile.id)}
              onPress={() => onOpen(tile.id)}
              onLongPress={special ? undefined : () => onTogglePin(tile.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipBar: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  folderHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  folderPinned: { borderColor: colors.accent },
  pinBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  folder: {
    minHeight: 120,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'center',
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
});
