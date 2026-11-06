import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { planRoute, TerminalMap } from '@/components/terminal-map';
import { AppText, Button, Icon, ScreenHeader, type IconName } from '@/components/ui';
import { useTrips } from '@/store/trip-store';
import { colors, radius } from '@/theme';

interface Instruction {
  icon: IconName;
  title: string;
  detail: string;
}

function instructions(platform: number, accessible: boolean): Instruction[] {
  const plan = planRoute(platform, accessible);
  const arrow: IconName = plan.turn === 'esquerda' ? 'corner-up-left' : 'corner-up-right';
  return accessible
    ? [
        { icon: 'arrow-up', title: 'Siga até o elevador', detail: 'Passe pelas lojas e vire à esquerda' },
        { icon: 'arrow-down-circle', title: 'Desça 1 piso de elevador', detail: 'Saída para o corredor de embarque' },
        { icon: arrow, title: `Vire à ${plan.turn}`, detail: `Siga pelo corredor até a Plataforma ${platform}` },
      ]
    : [
        { icon: 'arrow-up', title: 'Siga em frente por 90 m', detail: 'Passe pelas lojas até a escada rolante' },
        { icon: 'arrow-down-circle', title: 'Desça a escada rolante', detail: 'Ela leva ao corredor de embarque' },
        { icon: arrow, title: `Vire à ${plan.turn}`, detail: `Siga pelo corredor até a Plataforma ${platform}` },
      ];
}

/** Tela 3 — Mapa do terminal com navegação passo a passo. */
export default function MapaTerminal() {
  const params = useLocalSearchParams<{ acessivel?: string }>();
  const { myTrip: trip } = useTrips();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [accessible, setAccessible] = useState(params.acessivel === '1');

  const plan = planRoute(trip.platform, accessible);
  const steps = instructions(trip.platform, accessible);
  const current = steps[step - 1];

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`Como chegar à Plataforma ${trip.platform}`} backHref="/terminal">
        <View accessibilityLiveRegion="polite" style={styles.instruction}>
          <View style={styles.instructionIcon}>
            <Icon name={current.icon} size={30} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText weight="extrabold" size={12} color="#6A0C93" style={{ letterSpacing: 0.5 }}>
              PASSO {step} DE {steps.length}
            </AppText>
            <AppText weight="extrabold" size={18}>
              {current.title}
            </AppText>
            <AppText size={14} color={colors.textMuted}>
              {current.detail}
            </AppText>
          </View>
        </View>
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.progressBar, { backgroundColor: i < step ? '#FFFFFF' : '#8E4AAE' }]} />
          ))}
        </View>
      </ScreenHeader>

      <View style={styles.mapArea}>
        <TerminalMap platform={trip.platform} step={step} accessible={accessible} />
      </View>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={styles.handle} />
        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <AppText weight="extrabold" size={18}>
              {plan.minutes} min · {plan.distanceMeters} m
            </AppText>
            <AppText size={14} color={colors.textMuted}>
              Embarque a partir de {trip.boardingStart}
            </AppText>
          </View>
          <View style={styles.switchRow}>
            <AppText weight="bold" size={13} style={{ textAlign: 'right' }}>
              Rota sem{'\n'}escadas
            </AppText>
            <Switch
              accessibilityLabel="Rota sem escadas"
              value={accessible}
              onValueChange={(v) => {
                setAccessible(v);
                setStep(1);
              }}
              trackColor={{ true: colors.brand, false: colors.borderStrong }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Passo anterior"
            disabled={step === 1}
            onPress={() => setStep((s) => Math.max(1, s - 1))}
            style={[styles.prev, step === 1 && { opacity: 0.4 }]}>
            <Icon name="chevron-left" size={24} />
          </Pressable>
          {step < steps.length ? (
            <Button label="Próximo passo" icon="arrow-right" onPress={() => setStep((s) => s + 1)} style={{ flex: 1 }} height={52} />
          ) : (
            <Button label="Cheguei na plataforma" icon="check" href="/qr" style={{ flex: 1 }} height={52} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mapBackground },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  instructionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flexDirection: 'row', gap: 6, marginHorizontal: 4 },
  progressBar: { flex: 1, height: 5, borderRadius: 3 },
  mapArea: { flex: 1, paddingHorizontal: 4, paddingTop: 4 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 12,
    shadowColor: '#3E0852',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  prev: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
