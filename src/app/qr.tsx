import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, Label } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors } from '@/theme';

/**
 * Tela 6 — Cartão de embarque com QR code.
 * O QR carrega o localizador e a viagem; o leitor do motorista valida.
 */
export default function CartaoEmbarque() {
  const { myTrip: trip, publish } = useTrips();
  const insets = useSafeAreaInsets();
  const payload = JSON.stringify({ v: 1, loc: trip.locator, trip: trip.id, seat: trip.seat });

  const simulateScan = () => {
    publish({ type: 'passenger_boarded', tripId: trip.id, locator: trip.locator });
    router.replace('/embarcado');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/terminal'))}
          style={styles.close}>
          <Icon name="x" size={24} color="#FFFFFF" />
        </Pressable>
        <AppText weight="extrabold" size={18} color="#FFFFFF">
          Cartão de embarque
        </AppText>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <View style={styles.inline}>
              <Icon name="sun" size={16} color={colors.textMuted} />
              <AppText weight="bold" size={13} color={colors.textMuted}>
                Aumente o brilho da tela para a leitura
              </AppText>
            </View>
            <View style={styles.qrFrame} accessible accessibilityLabel={`QR code de embarque do pedido ${trip.locator}`}>
              <QRCode value={payload} size={220} color={colors.text} backgroundColor="#FFFFFF" />
            </View>
            <AppText weight="extrabold" size={15} style={{ letterSpacing: 2 }}>
              {trip.locator}
            </AppText>
          </View>

          <View style={styles.perforation}>
            <View style={[styles.notch, { marginLeft: -11 }]} />
            <View style={styles.dashes} />
            <View style={[styles.notch, { marginRight: -11 }]} />
          </View>

          <View style={styles.details}>
            <View style={{ gap: 2 }}>
              <Label>Passageira</Label>
              <AppText weight="extrabold" size={17}>
                {trip.passengerName}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <Detail label="Plataforma" value={String(trip.platform)} highlight />
              <Detail label="Partida" value={trip.departure} />
              <Detail label="Poltrona" value={String(trip.seat)} />
            </View>
          </View>
        </View>

        <AppText size={14} color={colors.brandOnDark} style={{ textAlign: 'center', lineHeight: 20 }}>
          Aproxime o celular do leitor na porta do ônibus.{'\n'}Funciona mesmo sem internet.
        </AppText>
        <Pressable accessibilityRole="button" onPress={simulateScan} style={styles.simulate}>
          <AppText weight="bold" size={14} color="#FFFFFF" style={{ textDecorationLine: 'underline' }}>
            Simular leitura no portão
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Label>{label}</Label>
      <AppText weight="extrabold" size={24} color={highlight ? colors.brand : colors.text}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.brandDeep },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingBottom: 8 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, gap: 16, alignItems: 'stretch', maxWidth: 440, width: '100%', alignSelf: 'center' },
  ticket: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  ticketTop: { padding: 22, alignItems: 'center', gap: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrFrame: { padding: 14, borderWidth: 2, borderColor: colors.divider, borderRadius: 18 },
  perforation: { flexDirection: 'row', alignItems: 'center' },
  notch: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brandDeep },
  dashes: { flex: 1, borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#E3D6EC' },
  details: { padding: 22, paddingTop: 16, gap: 14 },
  detailRow: { flexDirection: 'row', gap: 8 },
  simulate: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
});
