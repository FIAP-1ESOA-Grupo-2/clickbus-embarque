import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, Label, type IconName } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors } from '@/theme';

/** Tela 7 — Embarque confirmado. */
export default function EmbarqueConfirmado() {
  const { myTrip: trip } = useTrips();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 48 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.halo}>
          <View style={styles.check}>
            <Icon name="check" size={52} color="#FFFFFF" />
          </View>
        </View>
        <AppText weight="extrabold" size={28} style={{ textAlign: 'center' }} accessibilityRole="header">
          Embarque confirmado!
        </AppText>
        <AppText size={16} color={colors.textMuted} style={{ textAlign: 'center' }}>
          Boa viagem, {trip.passengerName.split(' ')[0]}. Seu lugar está te esperando.
        </AppText>

        <View style={styles.seatCard}>
          <View style={{ gap: 2 }}>
            <Label>Poltrona</Label>
            <AppText weight="extrabold" size={44} color={colors.brand} style={{ lineHeight: 48 }}>
              {trip.seat}
            </AppText>
            <AppText size={13} color={colors.textMuted}>
              Janela · lado direito
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <AppText size={14}>
              <AppText weight="extrabold" size={14}>
                {trip.departure}
              </AppText>{' '}
              {trip.origin}
            </AppText>
            <AppText size={14}>
              <AppText weight="extrabold" size={14}>
                {trip.arrival}
              </AppText>{' '}
              {trip.destination}
            </AppText>
            <AppText size={13} color={colors.textMuted}>
              Plataforma {trip.platform} · {trip.company}
            </AppText>
          </View>
        </View>

        <Extra icon="map-pin" title="Compartilhe a viagem" detail="Quem te espera acompanha em tempo real" />
        <Extra icon="gift" title="Você ganhou R$ 4,50 de cashback" detail="Já está na sua Carteira ClickBus" />
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20), paddingTop: 12 }}>
        <Button label="Concluir" href="/" />
      </View>
    </View>
  );
}

function Extra({ icon, title, detail }: { icon: IconName; title: string; detail: string }) {
  return (
    <View style={styles.extra}>
      <View style={styles.extraIcon}>
        <Icon name={icon} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="extrabold" size={14}>
          {title}
        </AppText>
        <AppText size={14} color={colors.textMuted}>
          {detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 24, gap: 16, alignItems: 'center', maxWidth: 480, width: '100%', alignSelf: 'center' },
  halo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 18,
  },
  extra: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 14,
  },
  extraIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
