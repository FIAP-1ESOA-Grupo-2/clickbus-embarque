import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, StatusBadge, type IconName } from '@/components/ui';
import { changeReasons, MY_TRIP_ID, PLATFORM_COUNT } from '@/data/mock';
import type { Trip } from '@/data/types';
import { useTrips } from '@/store/trip-store';
import { colors, radius } from '@/theme';

/**
 * Tela 9 — Painel do operador do terminal (pensado para web/desktop).
 * Cada ação publica um evento no canal em tempo real; os apps dos
 * passageiros da viagem recebem o aviso na hora.
 */
export default function PainelOperador() {
  const { departures, crowd, publish } = useTrips();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1000;
  const [selectedId, setSelectedId] = useState(MY_TRIP_ID);
  const selected = departures.find((t) => t.id === selectedId) ?? departures[0];
  const [target, setTarget] = useState<number | null>(null);
  const [reason, setReason] = useState(changeReasons[0]);
  const [sent, setSent] = useState<string | null>(null);
  const sentTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(sentTimer.current), []);

  const busy = useMemo(() => new Set(departures.map((d) => d.platform)), [departures]);
  const freePlatforms = Array.from({ length: PLATFORM_COUNT }, (_, i) => i + 1).filter((p) => !busy.has(p));
  const toPlatform = target && !busy.has(target) ? target : freePlatforms.includes(8) ? 8 : freePlatforms[0];
  const passengers = selected.checkedIn - selected.boarded;

  const confirm = (message: string) => {
    setSent(message);
    clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setSent(null), 4000);
  };

  const changePlatform = () => {
    publish({ type: 'platform_changed', tripId: selected.id, from: selected.platform, to: toPlatform, reason });
    confirm(`Plataforma alterada para ${toPlatform}. ${passengers} passageiros avisados.`);
    setTarget(null);
  };

  const kpis: { label: string; value: string; tone?: string }[] = [
    { label: 'Partidas na próxima hora', value: String(departures.length) },
    { label: 'Atrasos ativos', value: String(departures.filter((d) => d.status === 'delayed').length), tone: colors.dangerText },
    { label: 'Check-ins pelo app', value: String(departures.reduce((s, d) => s + d.checkedIn, 0)) },
    { label: 'Plataformas aglomeradas', value: String(crowd.filter((c) => c >= 40).length) },
  ];

  return (
    <View style={[styles.screen, { flexDirection: wide ? 'row' : 'column' }]}>
      <View style={[styles.sidebar, wide ? { width: 240 } : { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: wide ? 'column' : 'row', alignItems: wide ? 'flex-start' : 'center', gap: 12 }}>
          {!wide ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.replace('/demo')} style={styles.back}>
              <Icon name="chevron-left" size={24} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <View>
            <AppText weight="extrabold" size={20} color="#FFFFFF">
              ClickBus
            </AppText>
            <AppText weight="semibold" size={13} color={colors.brandOnDark}>
              Operação · Terminal Tietê
            </AppText>
          </View>
        </View>
        {wide ? (
          <View style={{ gap: 4 }}>
            <SideItem icon="truck" label="Partidas" active />
            <SideItem icon="grid" label="Plataformas" />
            <SideItem icon="bell" label="Avisos enviados" />
            <SideItem icon="bar-chart-2" label="Relatórios" />
            <View style={{ height: 16 }} />
            <SideItem icon="smartphone" label="Ver app do passageiro" onPress={() => router.push('/terminal')} />
          </View>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.titleRow}>
          <View>
            <AppText weight="extrabold" size={26} accessibilityRole="header">
              Partidas de hoje
            </AppText>
            <AppText size={14} color={colors.textMuted}>
              {today} · atualizado agora
            </AppText>
          </View>
          <View style={styles.demoChip}>
            <AppText weight="extrabold" size={12} color="#7A4F00">
              Dados de demonstração
            </AppText>
          </View>
        </View>

        <View style={styles.kpis}>
          {kpis.map((k) => (
            <View key={k.label} style={[styles.kpi, { flexBasis: wide ? 0 : '45%' }]}>
              <AppText weight="bold" size={13} color={colors.textMuted}>
                {k.label}
              </AppText>
              <AppText weight="extrabold" size={30} color={k.tone ?? colors.text}>
                {k.value}
              </AppText>
            </View>
          ))}
        </View>

        {sent ? (
          <View accessibilityRole="alert" style={styles.toast}>
            <Icon name="check-circle" size={20} color="#FFFFFF" />
            <AppText weight="bold" size={14} color="#FFFFFF" style={{ flex: 1 }}>
              {sent}
            </AppText>
          </View>
        ) : null}

        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
          <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', gap: 20 }}>
            <View style={styles.panel}>
              <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
                <View style={{ minWidth: 640, flex: 1 }}>
                  <View style={[styles.tr, styles.thead]}>
                    {['Hora', 'Destino', 'Plataforma', 'Status', 'Check-in no app'].map((h, i) => (
                      <AppText key={h} weight="extrabold" size={12} color={colors.textMuted} style={[styles.cell, colWidths[i]]}>
                        {h.toUpperCase()}
                      </AppText>
                    ))}
                  </View>
                  {departures.map((d) => (
                    <DepartureRow key={d.id} trip={d} selected={d.id === selected.id} onPress={() => setSelectedId(d.id)} />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.panel, { padding: 18, gap: 14 }]}>
              <View style={styles.titleRow}>
                <AppText weight="extrabold" size={17}>
                  Pessoas por plataforma agora
                </AppText>
                <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                  <Legend color={colors.brandSoft} label="Tranquila" />
                  <Legend color={colors.brandMuted} label="Movimentada" />
                  <Legend color={colors.brandDeep} label="Aglomerada" />
                </View>
              </View>
              <View style={styles.heatmap}>
                {crowd.map((people, i) => {
                  const level = people >= 40 ? 2 : people >= 25 ? 1 : 0;
                  const bg = [colors.brandSoft, colors.brandMuted, colors.brandDeep][level];
                  const fg = [colors.brandInk, '#2A0A3D', '#FFFFFF'][level];
                  return (
                    <View key={i} style={[styles.heatCell, { backgroundColor: bg }]}>
                      <AppText weight="extrabold" size={15} color={fg}>
                        {i + 1}
                      </AppText>
                      <AppText weight="bold" size={11} color={fg}>
                        {people} pess.
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={[styles.panel, styles.detail, wide ? { width: 360 } : { width: '100%' }]}>
            <View style={{ gap: 2 }}>
              <AppText weight="extrabold" size={12} color={colors.textMuted} style={{ letterSpacing: 1 }}>
                VIAGEM SELECIONADA
              </AppText>
              <AppText weight="extrabold" size={20}>
                {selected.departure} · {selected.destination}
              </AppText>
              <AppText size={14} color={colors.textMuted}>
                {selected.company} · {passengers} passageiros aguardando com o app
              </AppText>
            </View>
            <StatusBadge trip={selected} />

            <View style={{ gap: 8 }}>
              <AppText weight="bold" size={13} color={colors.textSoft}>
                Plataforma atual: <AppText weight="extrabold" size={13}>{selected.platform}</AppText> · Nova plataforma (livres):
              </AppText>
              <View style={styles.platformPicker}>
                {freePlatforms.map((p) => (
                  <Pressable
                    key={p}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: p === toPlatform }}
                    onPress={() => setTarget(p)}
                    style={[styles.platformChip, p === toPlatform && styles.platformChipActive]}>
                    <AppText weight="extrabold" size={14} color={p === toPlatform ? '#FFFFFF' : colors.brandDeep}>
                      {p}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <AppText weight="bold" size={13} color={colors.textSoft}>
                Motivo
              </AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {changeReasons.map((r) => (
                  <Pressable
                    key={r}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: r === reason }}
                    onPress={() => setReason(r)}
                    style={[styles.reason, r === reason && styles.reasonActive]}>
                    <AppText weight="bold" size={13} color={r === reason ? colors.brandDeep : colors.textSoft}>
                      {r}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <AppText weight="bold" size={13} color={colors.textSoft}>
                Prévia do aviso no app
              </AppText>
              <View style={styles.preview}>
                <View style={styles.previewIcon}>
                  <Icon name="alert-triangle" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText weight="extrabold" size={14}>
                    Plataforma alterada: agora é a {toPlatform}
                  </AppText>
                  <AppText size={13} color={colors.textSoft}>
                    Sua viagem das {selected.departure} mudou de plataforma. O app já mostra a nova rota.
                  </AppText>
                </View>
              </View>
            </View>

            <Button label={`Alterar e avisar ${passengers} passageiros`} onPress={changePlatform} height={50} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                label="Atrasar 15 min"
                variant="outline"
                height={44}
                style={{ flex: 1, paddingHorizontal: 8 }}
                onPress={() => {
                  publish({ type: 'delay', tripId: selected.id, minutes: 15 });
                  confirm(`Atraso registrado. ${passengers} passageiros avisados.`);
                }}
              />
              <Button
                label="Liberar embarque"
                variant="outline"
                height={44}
                style={{ flex: 1, paddingHorizontal: 8 }}
                onPress={() => {
                  publish({ type: 'boarding_open', tripId: selected.id });
                  confirm(`Embarque liberado na Plataforma ${selected.platform}.`);
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const today = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

const colWidths = [{ width: 80 }, { flex: 1, minWidth: 180 }, { width: 110 }, { width: 190 }, { width: 170 }];

function DepartureRow({ trip, selected, onPress }: { trip: Trip; selected: boolean; onPress: () => void }) {
  const pct = Math.round((trip.checkedIn / trip.totalSeats) * 100);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tr, { backgroundColor: selected ? '#F5ECFC' : 'transparent' }]}>
      <AppText weight="extrabold" size={16} style={[styles.cell, colWidths[0]]}>
        {trip.departure}
      </AppText>
      <View style={[styles.cell, colWidths[1]]}>
        <AppText weight="extrabold" size={14}>
          {trip.destination}
        </AppText>
        <AppText size={13} color={colors.textMuted}>
          {trip.company}
        </AppText>
      </View>
      <AppText weight="extrabold" size={16} style={[styles.cell, colWidths[2]]}>
        {trip.previousPlatform ? `${trip.previousPlatform} → ${trip.platform}` : trip.platform}
      </AppText>
      <View style={[styles.cell, colWidths[3]]}>
        <StatusBadge trip={trip} small />
      </View>
      <View style={[styles.cell, colWidths[4], { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <AppText weight="bold" size={13} color={colors.textSoft}>
          {trip.checkedIn}/{trip.totalSeats}
        </AppText>
      </View>
    </Pressable>
  );
}

function SideItem({ icon, label, active, onPress }: { icon: IconName; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={[styles.sideItem, active && { backgroundColor: colors.chipActive }]}>
      <Icon name={icon} size={20} color="#FFFFFF" />
      <AppText weight={active ? 'extrabold' : 'semibold'} size={15} color={active ? '#FFFFFF' : '#F3E6FC'}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color, borderWidth: 1, borderColor: colors.borderStrong }} />
      <AppText weight="semibold" size={13} color={colors.textSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  sidebar: { backgroundColor: colors.brandDeep, padding: 20, gap: 24 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -12 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 12, borderRadius: 10 },
  main: { padding: 24, gap: 20 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  demoChip: { backgroundColor: '#FFF3D6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: { flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: radius.md, padding: 16, gap: 4 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    padding: 14,
  },
  panel: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.divider, minHeight: 60 },
  thead: { borderTopWidth: 0, minHeight: 44 },
  cell: { paddingHorizontal: 12, paddingVertical: 8 },
  barTrack: { width: 90, height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.brand },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatCell: { width: 58, flexGrow: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 2 },
  detail: { padding: 20, gap: 16, borderWidth: 2, borderColor: colors.brandMuted },
  platformPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  platformChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  reason: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
  },
  reasonActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  preview: { flexDirection: 'row', gap: 10, backgroundColor: colors.background, borderRadius: 14, padding: 12 },
  previewIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
