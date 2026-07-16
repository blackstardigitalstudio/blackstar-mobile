import { Pressable, StyleSheet, View } from 'react-native';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { Txt } from './ui';

// Two big flag chips — you SEE which language is on and tap the other to switch.
// A language is always shown in its OWN name (Italiano / Español) so a speaker
// recognises it instantly (recognise, don't read). One clear choice, no menu.
const LANGS = [
  { code: 'it' as const, flag: '🇮🇹', name: 'Italiano' },
  { code: 'es' as const, flag: '🇪🇸', name: 'Español' },
];

export function LanguagePicker() {
  const lang = useStore((s) => s.settings.language);
  const update = useStore((s) => s.updateSettings);
  return (
    <View style={styles.row}>
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <Pressable
            key={l.code}
            onPress={() => update({ language: l.code })}
            android_ripple={{ color: 'rgba(217,70,239,0.18)' }}
            style={({ pressed }) => [styles.chip, active && styles.active, pressed && { opacity: 0.7 }]}
          >
            <Txt style={{ fontSize: 22 }}>{l.flag}</Txt>
            <Txt variant="small" color={active ? colors.onAccent : colors.textMuted} style={{ fontWeight: '700' }}>
              {l.name}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
});
