import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoControls } from '@/components/demo-controls';
import { planRoute } from '@/components/terminal-map';
import { ActionTile, AppText, Button, Card, Icon, InfoStrip, LiveBadge, ScreenHeader, StatusBadge } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors } from '@/theme';

const journey = ['Chegada', 'Ir à plataforma', 'Embarque', 'Viagem'];

/**
 * Tela 2 — Modo terminal. Reage em tempo real aos eventos da operação:
 * troca de plataforma, atraso, embarque liberado.
 */
export default function ModoTerminal() {
  const { myTrip: trip, myBoarding } = useTrips();
  const insets = useSafeAreaInsets();
  const changed = trip.previousPlatform !== undefined;
  const route = planRoute(trip.platform, false);
  const currentStep = myBoarding === 'confirmed' ? 3 : trip.status === 'boarding' ? 2 : 1;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Modo terminal" backHref="/" right={<LiveBadge />}>
        {changed ? (
          <View accessibilityRole="alert" style={styles.alert}>
            <Icon name="alert-triangle" size={22} color={colors.danger} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="extrabold" size={15} color="#8C1A12">
                Plataforma alterada pela operação
              </AppText>
              <AppText size={14} color="#5C1610">
                Sua viagem agora sai da Plataforma {trip.platform}. O horário continua {trip.departure}.
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.location}>
            <Icon name="map-pin" size={20} />
            <AppText size={14}>
              <AppText weight="extrabold" size={14}>
                Você está no Terminal Tietê
              </AppText>{' '}
              · Piso superior
            </AppText>
          </View>
        )}
      </ScreenHeader>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[{ gap: 14 }, changed && styles.changedCard]}>
          <View style={styles.platformRow}>
            <View>
              <AppText weight="extrabold" size={13} color={colors.textMuted} style={{ letterSpacing: 1 }}>
                {changed ? 'NOVA PLATAFORMA' : 'PLATAFORMA'}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
                <AppText weight="extrabold" size={76} color={colors.brand} style={{ lineHeight: 80 }}>
                  {trip.platform}
                </AppText>
                {changed ? (
                  <AppText weight="bold" size={22} color={colors.textMuted} style={{ textDecorationLine: 'line-through' }}>
                    {trip.previousPlatform}
                  </AppText>
                ) : null}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <StatusBadge trip={trip} />
              <AppText weight="extrabold" size={30}>
                {trip.departure}
              </AppText>
            </View>
          </View>
          <View style={styles.tripLine}>
            <AppText size={14} color={colors.textMuted}>
              {trip.origin} → {trip.destination}
            </AppText>
            <AppText size={14} color={colors.textMuted}>
              Poltrona{' '}
              <AppText weight="extrabold" size={14}>
                {trip.seat}
              </AppText>
            </AppText>
          </View>
          {trip.status === 'boarding' ? (
            <InfoStrip icon="log-in" tone="success">
              Embarque liberado! Mostre seu QR na porta do ônibus.
            </InfoStrip>
          ) : trip.status === 'delayed' ? (
            <InfoStrip icon="alert-triangle">
              Viagem atrasada {trip.delayMinutes} min. Te avisamos quando o embarque abrir.
            </InfoStrip>
          ) : (
            <InfoStrip icon="clock">
              Embarque abre {trip.status === 'boarding_soon' ? 'em 10 min' : `às ${trip.boardingStart}`}. Você está a {route.minutes} min a pé.
            </InfoStrip>
          )}
        </Card>

        <Card style={{ paddingVertical: 14 }}>
          <View style={styles.timeline}>
            {journey.map((label, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <View key={label} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.dot,
                      done && { backgroundColor: colors.success, borderColor: colors.success },
                      active && { backgroundColor: colors.brand, borderColor: '#EAD6F8', borderWidth: 4 },
                    ]}>
                    {done ? (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    ) : (
                      <AppText weight="extrabold" size={14} color={active ? '#FFFFFF' : colors.textMuted}>
                        {i + 1}
                      </AppText>
                    )}
                  </View>
                  <AppText
                    weight={active ? 'extrabold' : done ? 'bold' : 'semibold'}
                    size={12}
                    color={active ? colors.brand : done ? colors.text : colors.textMuted}
                    style={{ textAlign: 'center' }}>
                    {label}
                  </AppText>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <ActionTile icon="map" title="Como chegar" subtitle={`${route.minutes} min a pé · ${route.distanceMeters} m`} href="/mapa" />
            <ActionTile icon="star" title="Precisa de ajuda?" subtitle="Assistente com IA" href="/assistente" />
          </View>
          <View style={styles.gridRow}>
            <ActionTile icon="coffee" title="Serviços" subtitle="Café, banheiro, guarda-volumes" href="/mapa" />
            <ActionTile icon="navigation" title="Acessibilidade" subtitle="Rota sem escadas" href="/mapa?acessivel=1" />
          </View>
        </View>

        <View style={{ alignItems: 'flex-start' }}>
          <DemoControls />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="Mostrar QR de embarque" icon="grid" href="/qr" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  alert: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  changedCard: { borderWidth: 3, borderColor: '#F5B5AE' },
  platformRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  tripLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  timeline: { flexDirection: 'row', gap: 4 },
  timelineItem: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CDBFD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
