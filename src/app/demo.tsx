import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { AppText, Icon, type IconName } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors, radius } from '@/theme';

const entries: { icon: IconName; title: string; detail: string; href: Href }[] = [
  {
    icon: 'smartphone',
    title: 'App do passageiro',
    detail: 'Minha viagem → modo terminal → mapa → QR',
    href: '/',
  },
  {
    icon: 'monitor',
    title: 'Painel do operador',
    detail: 'Troque a plataforma e veja o aviso chegar no app',
    href: '/operador',
  },
  {
    icon: 'camera',
    title: 'Leitor de QR do motorista',
    detail: 'Valide o embarque (válido e inválido)',
    href: '/leitor',
  },
];

/** Menu de demonstração (aba "Conta"): atalhos para cada perfil do MVP. */
export default function Demo() {
  const { publish } = useTrips();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <AppText weight="extrabold" size={24} color="#FFFFFF">
          Modo demonstração
        </AppText>
        <AppText size={14} color={colors.brandOnDark}>
          ClickBus Embarque · MVP Challenge FIAP 2026
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {entries.map((e) => (
          <Pressable
            key={e.title}
            accessibilityRole="link"
            onPress={() => router.push(e.href)}
            style={({ pressed }) => [styles.entry, { opacity: pressed ? 0.8 : 1 }]}>
            <View style={styles.entryIcon}>
              <Icon name={e.icon} size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="extrabold" size={16}>
                {e.title}
              </AppText>
              <AppText size={14} color={colors.textMuted}>
                {e.detail}
              </AppText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}

        <View style={styles.tip}>
          <Icon name="info" size={20} color={colors.brandInk} />
          <AppText size={14} color={colors.brandInk} style={{ flex: 1, lineHeight: 20 }}>
            Dica para a demo na web: abra o painel do operador em uma aba e o app do passageiro em outra. A troca de plataforma aparece nas duas ao mesmo tempo.
          </AppText>
        </View>

        <Pressable accessibilityRole="button" onPress={() => publish({ type: 'reset' })} style={styles.reset}>
          <Icon name="rotate-ccw" size={18} />
          <AppText weight="extrabold" size={15} color={colors.brand}>
            Reiniciar demonstração
          </AppText>
        </Pressable>
      </ScrollView>
      <BottomNav active="Conta" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.brandDeep, paddingHorizontal: 20, paddingBottom: 24, gap: 4 },
  content: { padding: 16, gap: 12 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 14,
  },
  entryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { flexDirection: 'row', gap: 10, backgroundColor: colors.brandSoft, borderRadius: radius.md, padding: 14 },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.brand,
  },
});
