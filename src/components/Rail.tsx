import React from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { Pressable } from 'react-native';
import { spacing } from '@/theme/tokens';
import type { MediaItem } from '@/lib/types';
import { cardHeight, ChannelCard, DEFAULT_CARD, PosterCard } from './Card';
import { Txt } from './ui';

type Variant = 'poster' | 'tile';

function CardFor({ item, variant, size }: { item: MediaItem; variant: Variant; size: number }) {
  return variant === 'poster' ? <PosterCard item={item} size={size} /> : <ChannelCard item={item} size={size} />;
}

/** Horizontal, swipeable rail (home / search rows). */
export function Rail({
  title,
  items,
  onSelect,
  variant = 'poster',
}: {
  title: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  variant?: Variant;
}) {
  if (!items.length) return null;
  const size = 112;
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Txt variant="h3" style={{ marginLeft: spacing.lg, marginBottom: spacing.sm }}>
        {title}
      </Txt>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        initialNumToRender={8}
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item)} android_ripple={{ color: 'rgba(217,70,239,0.15)' }}>
            <CardFor item={item} variant={variant} size={size} />
          </Pressable>
        )}
      />
    </View>
  );
}

/** Responsive grid that fills the screen width (mobile). */
export function MediaGrid({
  items,
  onSelect,
  variant = 'poster',
  header,
  empty,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  variant?: Variant;
  header?: React.ReactElement;
  empty?: React.ReactElement;
}) {
  const { width } = useWindowDimensions();
  const pad = spacing.lg;
  const gap = spacing.md;
  // 3 columns on a phone, more on wider screens.
  const cols = Math.max(3, Math.floor((width - pad * 2 + gap) / (DEFAULT_CARD + gap)));
  const size = Math.floor((width - pad * 2 - gap * (cols - 1)) / cols);

  return (
    <FlatList
      data={items}
      key={`${variant}-${cols}`}
      numColumns={cols}
      keyExtractor={(i) => i.id}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      columnWrapperStyle={{ gap, paddingHorizontal: pad }}
      contentContainerStyle={{ gap, paddingTop: spacing.sm, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={cols * 6}
      maxToRenderPerBatch={cols * 6}
      windowSize={9}
      removeClippedSubviews
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item)} android_ripple={{ color: 'rgba(217,70,239,0.15)' }}>
          <CardFor item={item} variant={variant} size={size} />
        </Pressable>
      )}
    />
  );
}
