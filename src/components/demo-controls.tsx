import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, type IconName } from '@/components/ui';
import { MY_TRIP_ID } from '@/data/mock';
import type { RealtimeEvent } from '@/data/types';
import { useTrips } from '@/store/trip-store';
import { colors, radius } from '@/theme';

/**
 * Botão "Simular" para gravar a demo só com o celular:
 * dispara os mesmos eventos que o painel do operador enviaria.
 */
export function DemoControls() {
  const [open, setOpen] = useState(false);
  const { myTrip, publish } = useTrips();
  const insets = useSafeAreaInsets();

  const newPlatform = myTrip.platform === 8 ? 12 : 8;
  const actions: { label: string; icon: IconName; event: RealtimeEvent }[] = [
    { label: 'Embarque em 10 min', icon: 'clock', event: { type: 'boarding_soon', tripId: MY_TRIP_ID } },
    {
      label: `Trocar para a Plataforma ${newPlatform}`,
      icon: 'repeat',
      event: { type: 'platform_changed', tripId: MY_TRIP_ID, from: myTrip.platform, to: newPlatform, reason: 'Plataforma em manutenção' },
    },
    { label: 'Atrasar 15 min', icon: 'alert-triangle', event: { type: 'delay', tripId: MY_TRIP_ID, minutes: 15 } },
    { label: 'Liberar embarque', icon: 'log-in', event: { type: 'boarding_open', tripId: MY_TRIP_ID } },
    { label: 'Reiniciar demonstração', icon: 'rotate-ccw', event: { type: 'reset' } },
  ];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir simulador de eventos"
        onPress={() => setOpen(true)}
        style={styles.fab}>
        <Icon name="zap" size={16} color="#FFFFFF" />
        <AppText weight="extrabold" size={13} color="#FFFFFF">
          Simular
        </AppText>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar simulador" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <AppText weight="extrabold" size={18}>
            Simular evento da operação
          </AppText>
          <AppText size={14} color={colors.textMuted}>
            Na versão real esses avisos chegam do sistema da rodoviária em tempo real.
          </AppText>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => {
                publish(a.event);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.option, { opacity: pressed ? 0.7 : 1 }]}>
              <View style={styles.optionIcon}>
                <Icon name={a.icon} size={18} />
              </View>
              <AppText weight="bold" size={15}>
                {a.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.text,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radius.pill,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(20, 8, 28, 0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    gap: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
