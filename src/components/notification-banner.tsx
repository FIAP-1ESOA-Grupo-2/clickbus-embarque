import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, type IconName } from '@/components/ui';
import type { NotificationTone } from '@/data/types';
import { useTrips } from '@/store/trip-store';
import { colors, radius } from '@/theme';

const toneStyle: Record<NotificationTone, { bg: string; fg: string; icon: IconName }> = {
  danger: { bg: colors.danger, fg: '#FFFFFF', icon: 'alert-triangle' },
  warning: { bg: colors.warning, fg: '#4A3100', icon: 'clock' },
  success: { bg: colors.success, fg: '#FFFFFF', icon: 'check' },
  info: { bg: colors.info, fg: '#FFFFFF', icon: 'map-pin' },
};

const AUTO_DISMISS_MS = 8000;

/**
 * Aviso no topo da tela, como uma notificação push.
 * Mostra o aviso mais antigo ainda não dispensado.
 */
export function NotificationBanner() {
  const { notifications, dismissNotification } = useTrips();
  const insets = useSafeAreaInsets();
  const current = notifications[0];
  const translate = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (!current) return;
    translate.setValue(-200);
    Animated.spring(translate, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const timer = setTimeout(() => dismissNotification(current.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [current, dismissNotification, translate]);

  if (!current) return null;
  const tone = toneStyle[current.tone];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + 8, transform: [{ translateY: translate }] }]}>
      <View accessibilityRole="alert" style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
            <Icon name={tone.icon} size={20} color={tone.fg} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText weight="bold" size={12} color={colors.textMuted}>
              CLICKBUS · EMBARQUE
            </AppText>
            <AppText weight="extrabold" size={15}>
              {current.title}
            </AppText>
            <AppText size={14} color={colors.textSoft}>
              {current.body}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            onPress={() => dismissNotification(current.id)}
            style={styles.close}>
            <Icon name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
        {current.action ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              dismissNotification(current.id);
              router.push(current.action!.href);
            }}
            style={styles.action}>
            <AppText weight="extrabold" size={14} color="#FFFFFF">
              {current.action.label}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 12, right: 12, zIndex: 100, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  action: {
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
