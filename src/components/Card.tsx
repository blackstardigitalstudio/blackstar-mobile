import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, font, gradients, radius } from '@/theme/tokens';
import type { MediaItem } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { Txt } from './ui';

// MOBILE: square thumbnails whose SIZE is passed in (so cards fill the column
// width responsively). Images shown "contain" (never cropped).
export const DEFAULT_CARD = 112;
export const LABEL_LINE = Math.round(font.small * 1.28);
export const LABEL_MT = 6;
export const cardHeight = (size: number, lines: number) => size + LABEL_MT + LABEL_LINE * lines;

function Fallback({ name, icon }: { name: string; icon?: any }) {
  return (
    <LinearGradient colors={gradients.brandSoft} style={[StyleSheet.absoluteFill, styles.center]}>
      {icon ? (
        <Ionicons name={icon} size={30} color={colors.white} />
      ) : (
        <Txt variant="h2" color={colors.white}>
          {(name || '?').trim().charAt(0).toUpperCase()}
        </Txt>
      )}
    </LinearGradient>
  );
}

function Square({ item, size, fallbackIcon }: { item: MediaItem; size: number; fallbackIcon?: any }) {
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      {item.logo ? (
        <Image
          source={{ uri: item.logo }}
          style={styles.img}
          contentFit="contain"
          transition={120}
          recyclingKey={item.id}
          cachePolicy="memory-disk"
        />
      ) : (
        <Fallback name={item.name} icon={fallbackIcon} />
      )}
    </View>
  );
}

export function PosterCard({ item, size = DEFAULT_CARD }: { item: MediaItem; focused?: boolean; size?: number }) {
  return (
    <View style={{ width: size }}>
      <Square item={item} size={size} fallbackIcon={item.kind === 'series' ? 'albums' : 'film'} />
      {item.rating ? (
        <View style={styles.badge}>
          <Ionicons name="star" size={11} color={colors.warning} />
          <Txt variant="tiny" color={colors.text}>
            {item.rating}
          </Txt>
        </View>
      ) : null}
      <View style={{ height: LABEL_LINE * 2, marginTop: LABEL_MT }}>
        <Txt variant="small" numberOfLines={2} style={{ lineHeight: LABEL_LINE, color: colors.text }}>
          {item.name}
        </Txt>
      </View>
    </View>
  );
}

export function ChannelCard({ item, size = DEFAULT_CARD }: { item: MediaItem; focused?: boolean; size?: number }) {
  const showNumbers = useStore((s) => s.settings.showChannelNumbers);
  return (
    <View style={{ width: size }}>
      <Square item={item} size={size} fallbackIcon="tv" />
      {showNumbers && typeof item.number === 'number' ? (
        <View style={styles.num}>
          <Txt variant="tiny" color={colors.text}>
            {item.number}
          </Txt>
        </View>
      ) : null}
      <View style={{ height: LABEL_LINE, marginTop: LABEL_MT }}>
        <Txt variant="small" numberOfLines={1} style={{ lineHeight: LABEL_LINE, color: colors.text }}>
          {item.name}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  thumb: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '90%', height: '90%' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  num: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(10,10,15,0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
