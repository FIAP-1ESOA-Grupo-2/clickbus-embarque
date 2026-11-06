import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { MY_TRIP_ID } from '@/data/mock';
import { useTrips } from '@/store/trip-store';
import { colors } from '@/theme';

type Result =
  | { kind: 'idle' }
  | { kind: 'valid'; name: string; seat: number; locator: string }
  | { kind: 'invalid'; name: string; seat: number; reason: string; detail: string };

/**
 * Telas 10 e 11 — Leitor de QR do motorista/portão.
 * Na demonstração a leitura é simulada pelos botões. Em produção usaria a
 * câmera (expo-camera) e validaria a assinatura do QR no backend/offline.
 */
export default function Leitor() {
  const { departures, publish } = useTrips();
  const insets = useSafeAreaInsets();
  const trip = departures.find((d) => d.id === MY_TRIP_ID)!;
  const [result, setResult] = useState<Result>({ kind: 'idle' });

  const readValid = () => {
    publish({ type: 'passenger_boarded', tripId: trip.id, locator: trip.locator });
    setResult({ kind: 'valid', name: trip.passengerName, seat: trip.seat, locator: trip.locator });
  };
  const readInvalid = () =>
    setResult({
      kind: 'invalid',
      name: 'Carlos Lima',
      seat: 7,
      reason: 'Passagem de outro horário',
      detail: 'Viagem para o Rio às 16:00, na Plataforma 11.',
    });

  const frameColor = result.kind === 'invalid' ? '#FF8A80' : colors.live;
  const pct = Math.round((trip.boarded / trip.checkedIn) * 100);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.replace('/demo')} style={styles.back}>
            <Icon name="chevron-left" size={24} color="#FFFFFF" />
          </Pressable>
          <AppText weight="bold" size={13} color="#CFC6D8">
            Leitor de embarque · Motorista
          </AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText weight="extrabold" size={20} color="#FFFFFF">
            {trip.departure} · {trip.destination}
          </AppText>
          <View style={styles.platChip}>
            <AppText weight="extrabold" size={14} color="#FFFFFF">
              Plat. {trip.platform}
            </AppText>
          </View>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <AppText weight="bold" size={14} color="#FFFFFF">
            {trip.boarded} de {trip.checkedIn} embarcados
          </AppText>
        </View>
      </View>

      <View style={styles.viewfinderArea}>
        <View accessible accessibilityLabel="Área da câmera para leitura do QR" style={styles.viewfinder}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View
              key={c}
              style={[
                styles.corner,
                { borderColor: frameColor },
                c.includes('t') ? { top: 0, borderTopWidth: 5 } : { bottom: 0, borderBottomWidth: 5 },
                c.includes('l') ? { left: 0, borderLeftWidth: 5 } : { right: 0, borderRightWidth: 5 },
              ]}
            />
          ))}
          <View style={styles.camera}>
            <Icon name="camera" size={32} color="#5F5868" />
          </View>
        </View>
      </View>

      {result.kind === 'idle' ? (
        <View style={[styles.sheet, { backgroundColor: '#24202A', paddingBottom: insets.bottom + 24 }]}>
          <AppText weight="extrabold" size={18} color="#FFFFFF">
            Aponte para o QR do passageiro
          </AppText>
          <AppText size={14} color="#CFC6D8">
            Demonstração: simule uma leitura abaixo.
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="QR válido" icon="check" variant="light" height={52} onPress={readValid} style={{ flex: 1 }} />
            <Button label="QR inválido" icon="x" variant="light" height={52} onPress={readInvalid} style={{ flex: 1 }} />
          </View>
        </View>
      ) : result.kind === 'valid' ? (
        <View accessibilityRole="alert" style={[styles.sheet, { backgroundColor: colors.success, paddingBottom: insets.bottom + 24 }]}>
          <ResultHead icon="check" color={colors.success} title="Embarque autorizado" subtitle={`Lido em 0,8 s · ${result.locator}`} />
          <View style={[styles.infoBox, { backgroundColor: '#08613A' }]}>
            <AppText weight="extrabold" size={18} color="#FFFFFF">
              {result.name}
            </AppText>
            <AppText size={15} color="#DDF5E8">
              Poltrona {result.seat} · destino {trip.destination}
            </AppText>
          </View>
          <Button label="Próximo passageiro" variant="light" onPress={() => setResult({ kind: 'idle' })} />
        </View>
      ) : (
        <ScrollView
          accessibilityRole="alert"
          style={[styles.sheetScroll, { backgroundColor: colors.danger }]}
          contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}>
          <ResultHead icon="x" color={colors.danger} title="Embarque não autorizado" subtitle={result.reason} />
          <View style={[styles.infoBox, { backgroundColor: '#8F1B12' }]}>
            <AppText weight="extrabold" size={16} color="#FFFFFF">
              {result.name} · Poltrona {result.seat}
            </AppText>
            <AppText size={15} color="#FDE1DE">
              {result.detail}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="star" size={18} color="#FFE9E6" />
            <AppText size={14} color="#FFE9E6" style={{ flex: 1 }}>
              Sugestão: há {trip.totalSeats - trip.checkedIn} lugares livres nesta viagem. O passageiro pode antecipar pelo app.
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Ler novamente" variant="light" height={52} style={{ flex: 1 }} onPress={() => setResult({ kind: 'idle' })} />
            <Button label="Chamar apoio" variant="outline" height={52} style={{ flex: 1, borderColor: '#FFFFFF' }} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ResultHead({ icon, color, title, subtitle }: { icon: 'check' | 'x'; color: string; title: string; subtitle: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={styles.resultIcon}>
        <Icon name={icon} size={30} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="extrabold" size={22} color="#FFFFFF">
          {title}
        </AppText>
        <AppText size={15} color="#FFFFFF">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.scannerBg },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginLeft: -12 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  platChip: { backgroundColor: colors.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#3A3442', overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.live },
  viewfinderArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  viewfinder: { width: 230, height: 230 },
  corner: { position: 'absolute', width: 48, height: 48, borderRadius: 14 },
  camera: {
    position: 'absolute',
    top: 36,
    left: 36,
    right: 36,
    bottom: 36,
    borderRadius: 12,
    backgroundColor: '#2A2530',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 14 },
  sheetScroll: { borderTopLeftRadius: 26, borderTopRightRadius: 26, flexGrow: 0 },
  sheetContent: { padding: 20, gap: 14 },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: { borderRadius: 14, padding: 14, gap: 4 },
});
