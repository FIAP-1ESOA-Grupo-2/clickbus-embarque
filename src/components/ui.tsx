import Feather from '@expo/vector-icons/Feather';
import { router, type Href } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Trip } from '@/data/types';
import { colors, fonts, radius, shadow } from '@/theme';

export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 22, color = colors.brand }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

type Weight = keyof typeof fonts;

export function AppText({
  weight = 'regular',
  size = 15,
  color = colors.text,
  style,
  ...rest
}: TextProps & { weight?: Weight; size?: number; color?: string }) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} />;
}

/* ---------- Botões ---------- */

interface ButtonProps {
  label: string;
  icon?: IconName;
  href?: Href;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'soft' | 'light';
  style?: StyleProp<ViewStyle>;
  height?: number;
  accessibilityLabel?: string;
}

export function Button({ label, icon, href, onPress, variant = 'primary', style, height = 54, accessibilityLabel }: ButtonProps) {
  const palette = {
    primary: { bg: colors.brand, fg: '#FFFFFF', border: colors.brand },
    outline: { bg: 'transparent', fg: colors.brand, border: colors.brand },
    soft: { bg: colors.brandSoft, fg: colors.brandDeep, border: colors.brandSoft },
    light: { bg: '#FFFFFF', fg: colors.brandDeep, border: '#FFFFFF' },
  }[variant];

  const content = (
    <View style={styles.buttonInner}>
      {icon ? <Icon name={icon} size={20} color={palette.fg} /> : null}
      <AppText weight="extrabold" size={height >= 50 ? 17 : 14} color={palette.fg}>
        {label}
      </AppText>
    </View>
  );

  const handlePress = () => {
    if (onPress) onPress();
    if (href) router.push(href);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { height, backgroundColor: palette.bg, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
        style,
      ]}>
      {content}
    </Pressable>
  );
}

/* ---------- Cabeçalho roxo ---------- */

export function ScreenHeader({
  title,
  subtitle,
  backHref,
  onBack,
  right,
  children,
  backIcon = 'chevron-left',
}: {
  title: string;
  subtitle?: string;
  backHref?: Href;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
  backIcon?: IconName;
}) {
  const insets = useSafeAreaInsets();
  const goBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace(backHref ?? '/');
  };
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.iconButton}>
          <Icon name={backIcon} size={24} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText weight="extrabold" size={18} color="#FFFFFF" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText size={13} color={colors.brandOnDark}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <AppText weight="bold" size={12} color="#FFFFFF">
        Ao vivo
      </AppText>
    </View>
  );
}

/* ---------- Status da viagem ---------- */

export function tripStatusInfo(trip: Trip): { label: string; icon: IconName; bg: string; fg: string } {
  if (trip.previousPlatform && trip.status !== 'boarding') {
    return { label: 'Plataforma alterada', icon: 'repeat', bg: colors.dangerSoft, fg: colors.dangerText };
  }
  switch (trip.status) {
    case 'boarding':
      return { label: 'Embarcando', icon: 'log-in', bg: colors.successSoft, fg: colors.successText };
    case 'boarding_soon':
      return { label: 'Embarque em breve', icon: 'clock', bg: colors.warningSoft, fg: colors.warningText };
    case 'delayed':
      return { label: `Atrasado ${trip.delayMinutes} min`, icon: 'alert-triangle', bg: colors.warningSoft, fg: colors.warningText };
    case 'departed':
      return { label: 'Partiu', icon: 'navigation', bg: colors.infoSoft, fg: colors.infoText };
    default:
      return { label: 'No horário', icon: 'check', bg: colors.successSoft, fg: colors.successText };
  }
}

export function StatusBadge({ trip, small }: { trip: Trip; small?: boolean }) {
  const s = tripStatusInfo(trip);
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Icon name={s.icon} size={small ? 12 : 14} color={s.fg} />
      <AppText weight="extrabold" size={small ? 12 : 13} color={s.fg}>
        {s.label}
      </AppText>
    </View>
  );
}

/* ---------- Outros blocos ---------- */

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function InfoStrip({
  icon,
  tone = 'warning',
  children,
}: {
  icon: IconName;
  tone?: 'warning' | 'brand' | 'danger' | 'success';
  children: ReactNode;
}) {
  const t = {
    warning: { bg: colors.warningSoft, fg: colors.warningText },
    brand: { bg: colors.brandSoft, fg: colors.brandInk },
    danger: { bg: colors.dangerSoft, fg: '#5C1610' },
    success: { bg: colors.successSoft, fg: colors.successText },
  }[tone];
  return (
    <View style={[styles.infoStrip, { backgroundColor: t.bg }]}>
      <Icon name={icon} size={20} color={t.fg} />
      <AppText size={14} color={t.fg} style={{ flex: 1, lineHeight: 20 }}>
        {children}
      </AppText>
    </View>
  );
}

export function ActionTile({
  icon,
  title,
  subtitle,
  href,
  compact,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  href: Href;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [compact ? styles.tileCompact : styles.tile, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={compact ? styles.tileIconRound : styles.tileIcon}>
        <Icon name={icon} size={22} />
      </View>
      <AppText
        weight={compact ? 'bold' : 'extrabold'}
        size={compact ? 12 : 15}
        numberOfLines={2}
        style={compact ? { textAlign: 'center' } : undefined}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size={13} color={colors.textMuted}>
          {subtitle}
        </AppText>
      ) : null}
    </Pressable>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <AppText weight="bold" size={12} color={colors.textMuted}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  header: {
    backgroundColor: colors.brandDeep,
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.chipActive,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.card,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  tileCompact: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
