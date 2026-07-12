import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Focusable } from '@/tv/Focusable';
import { useT } from '@/i18n';
import { useStore } from '@/store/useStore';
import { sortCategories } from '@/lib/categories';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Category, MediaItem, MediaKind } from '@/lib/types';
import { MediaGrid } from './Rail';
import { Empty, Txt } from './ui';

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Focusable onSelect={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Txt variant="small" numberOfLines={1} color={active ? colors.onAccent : colors.textMuted} style={{ fontWeight: '600' }}>
        {label}
      </Txt>
    </Focusable>
  );
}

export function Browser({
  title,
  items,
  categories,
  kind,
  onSelect,
  variant,
}: {
  title: string;
  items: MediaItem[];
  categories: Category[];
  kind: MediaKind;
  onSelect: (item: MediaItem) => void;
  variant: 'poster' | 'tile';
}) {
  const t = useT();
  const order = useStore((s) => s.settings.categoryOrder);
  const manual = useStore((s) => s.settings.categoryManual);
  const taste = useStore((s) => s.taste);
  const cats = useMemo(
    () => sortCategories(categories.filter((c) => c.kind === kind), order, taste, manual),
    [categories, kind, order, taste, manual],
  );
  const [sel, setSel] = useState<string>('all');

  const filtered = useMemo(
    () => (sel === 'all' ? items : items.filter((i) => i.categoryId === sel)),
    [items, sel],
  );

  if (!items.length) {
    return <Empty title={t('br.empty', { title })} hint={t('br.emptyHint')} />;
  }

  const data = [{ id: 'all', name: t('common.all') }, ...cats.map((c) => ({ id: c.id, name: c.name }))];

  // Mobile: title + a horizontal, scrollable chip bar of categories, then the grid.
  const header = (
    <View>
      <Txt variant="h2" style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.sm }}>
        {title} <Txt variant="small" color={colors.textFaint}>{`· ${items.length}`}</Txt>
      </Txt>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipBar}
        style={{ marginBottom: spacing.xs }}
      >
        {data.map((c) => (
          <Chip key={c.id} label={c.name} active={sel === c.id} onPress={() => setSel(c.id)} />
        ))}
      </ScrollView>
    </View>
  );

  return <MediaGrid items={filtered} onSelect={onSelect} variant={variant} header={header} />;
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
});
