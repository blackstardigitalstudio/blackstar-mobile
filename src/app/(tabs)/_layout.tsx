import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '@/i18n';
import { colors, font } from '@/theme/tokens';

export default function TabsLayout() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const icon = (name: any) => (p: any) => <Ionicons name={name} size={p.size} color={p.color} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: font.weightSemi },
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 58 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('nav.home'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="live" options={{ title: t('nav.live'), tabBarIcon: icon('tv') }} />
      <Tabs.Screen name="movies" options={{ title: t('nav.movies'), tabBarIcon: icon('film') }} />
      <Tabs.Screen name="series" options={{ title: t('nav.series'), tabBarIcon: icon('albums') }} />
      <Tabs.Screen name="search" options={{ title: t('nav.search'), tabBarIcon: icon('search') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings'), tabBarIcon: icon('settings') }} />
      {/* EPG grid is desktop-shaped; keep the route but off the phone tab bar. */}
      <Tabs.Screen name="guide" options={{ href: null }} />
    </Tabs>
  );
}
