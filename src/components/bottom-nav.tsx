import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, type IconName } from '@/components/ui';
import { colors } from '@/theme';

/**
 * Barra inferior igual à do app atual da ClickBus.
 * O "modo terminal" vive dentro de Pedidos; "Conta" abre o menu de demonstração.
 */
const items: { label: string; icon: IconName; href?: Href }[] = [
  { label: 'Comprar', icon: 'shopping-bag' },
  { label: 'Pedidos', icon: 'file-text', href: '/' },
  { label: 'Ofertas', icon: 'tag' },
  { label: 'Benefícios', icon: 'gift' },
  { label: 'Conta', icon: 'user', href: '/demo' },
];

export function BottomNav({ active }: { active: 'Pedidos' | 'Conta' }) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const selected = item.label === active;
        const color = selected ? colors.brand : colors.textMuted;
        return (
          <Pressable
            key={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: !item.href }}
            onPress={() => item.href && !selected && router.replace(item.href)}
            style={styles.item}>
            <Icon name={item.icon} size={22} color={color} />
            <AppText weight={selected ? 'extrabold' : 'semibold'} size={12} color={color}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: 48, justifyContent: 'center' },
});
