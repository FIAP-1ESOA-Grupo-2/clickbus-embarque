/**
 * Tokens visuais do ClickBus Embarque.
 * As cores seguem o app atual da ClickBus (roxo da marca, fundo lavanda claro).
 */
export const colors = {
  brandDeep: '#5E0870',
  brand: '#7E10AB',
  brandSoft: '#F2E6FB',
  brandMuted: '#C99BE8',
  brandOnDark: '#E9D5F7',
  /** Texto roxo sobre fundos lavanda (chips, etiquetas). */
  brandText: '#6A0C93',
  brandInk: '#3D2450',
  chipActive: '#7A1C96',
  background: '#F7F2FB',
  mapBackground: '#F1EBF6',
  surface: '#FFFFFF',
  border: '#ECE4F2',
  borderStrong: '#D8CBE3',
  divider: '#EEE6F4',
  text: '#1E1A24',
  textMuted: '#5F5868',
  textSoft: '#3A3442',

  success: '#0B7A43',
  successText: '#0B6B3A',
  successSoft: '#E3F5EB',
  warning: '#FFC93C',
  warningText: '#6B4600',
  warningSoft: '#FFF6DE',
  danger: '#B42318',
  dangerText: '#9A1F15',
  dangerSoft: '#FDE8E6',
  info: '#1F5FBF',
  infoText: '#1F4F9E',
  infoSoft: '#EAF1FC',
  live: '#5BE49B',
  scannerBg: '#16131A',
} as const;

export const fonts = {
  regular: 'NunitoSans_400Regular',
  semibold: 'NunitoSans_600SemiBold',
  bold: 'NunitoSans_700Bold',
  extrabold: 'NunitoSans_800ExtraBold',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#3E0852',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
