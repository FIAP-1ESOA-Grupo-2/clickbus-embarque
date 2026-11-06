import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { ActionTile, AppText, Button, Card, Icon, InfoStrip, Label, StatusBadge } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors } from '@/theme';

/** Tela 1 — Minha viagem (antes de chegar à rodoviária). */
export default function MinhaViagem() {
  const { myTrip: trip } = useTrips();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <AppText weight="semibold" size={14} color={colors.brandOnDark}>
            Olá, {trip.passengerName.split(' ')[0]}
          </AppText>
          <AppText weight="extrabold" size={24} color="#FFFFFF">
            Minhas viagens
          </AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notificações" style={styles.bell}>
          <Icon name="bell" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ padding: 16, gap: 12 }}>
            <View style={styles.rowBetween}>
              <View style={styles.todayChip}>
                <AppText weight="extrabold" size={13} color="#6A0C93">
                  Hoje
                </AppText>
              </View>
              <AppText weight="semibold" size={13} color={colors.textMuted}>
                Pedido {trip.locator}
              </AppText>
            </View>
            <View style={styles.route}>
              <AppText weight="extrabold" size={22}>
                {trip.origin}
              </AppText>
              <Icon name="arrow-right" size={20} />
              <AppText weight="extrabold" size={22}>
                {trip.destination}
              </AppText>
            </View>
            <View style={styles.statsGrid}>
              <Stat label="Partida" value={trip.departure} />
              <Stat label="Plataforma" value={String(trip.platform)} highlight />
              <Stat label="Poltrona" value={String(trip.seat)} />
            </View>
            <View style={{ gap: 6 }}>
              <View style={styles.inline}>
                <Icon name="truck" size={18} color={colors.textMuted} />
                <AppText size={14}>
                  {trip.company} · {trip.service}
                </AppText>
              </View>
              <View style={styles.inline}>
                <Icon name="map-pin" size={18} color={colors.textMuted} />
                <AppText weight="bold" size={14} color={colors.brand}>
                  {trip.originTerminal}
                </AppText>
              </View>
            </View>
            <StatusBadge trip={trip} />
          </View>
          <View style={styles.countdown}>
            <Icon name="clock" size={20} color={colors.warningText} />
            <AppText size={14} color={colors.warningText} style={{ flex: 1 }}>
              <AppText weight="extrabold" size={14} color={colors.warningText}>
                Sua viagem sai em 2h 15min.
              </AppText>{' '}
              Embarque a partir de {trip.boardingStart}.
            </AppText>
          </View>
        </Card>

        <View style={styles.tiles}>
          <ActionTile compact icon="grid" title="Cartão de embarque" href="/qr" />
          <ActionTile compact icon="star" title="Assistente de viagem" href="/assistente" />
          <ActionTile compact icon="map" title="Mapa do terminal" href="/mapa" />
        </View>

        <InfoStrip icon="bell" tone="brand">
          Chegue 30 min antes. Pelo trânsito de agora, <AppText weight="extrabold" size={14} color="#3D2450">saia às 13:20</AppText> — a gente te avisa na hora certa.
        </InfoStrip>

        <Button label="Cheguei na rodoviária" icon="map-pin" href="/terminal" style={{ marginTop: 4 }} />
      </ScrollView>

      <BottomNav active="Pedidos" />
    </View>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Label>{label}</Label>
      <AppText weight="extrabold" size={22} color={highlight ? colors.brand : colors.text}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.brandDeep,
    paddingHorizontal: 20,
    paddingBottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B57FD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { marginTop: -44 },
  content: { padding: 16, paddingTop: 0, gap: 14, paddingBottom: 24 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayChip: { backgroundColor: colors.brandSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  statsGrid: { flexDirection: 'row', gap: 8, backgroundColor: colors.background, borderRadius: 12, padding: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFBF0',
    borderTopWidth: 1,
    borderTopColor: '#EEE6F4',
  },
  tiles: { flexDirection: 'row', gap: 10 },
});
