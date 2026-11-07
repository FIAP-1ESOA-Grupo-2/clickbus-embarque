import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { PLATFORM_COUNT } from '@/data/mock';
import { colors, fonts } from '@/theme';

/**
 * Planta simplificada do Terminal Tietê (demonstração) em dois pisos.
 * Calcula a rota até a plataforma e destaca o passo atual.
 *
 * Em produção, a planta e o posicionamento viriam do "gêmeo digital" do
 * terminal e da localização indoor (beacons BLE / Wi-Fi) — ver docs.
 */

type Point = [number, number];

/** A planta mostra 7 plataformas por vez, com a do passageiro sempre visível. */
const BAY_COUNT = 7;
const firstBayFor = (platform: number) =>
  Math.min(Math.max(platform - Math.floor(BAY_COUNT / 2), 1), PLATFORM_COUNT - BAY_COUNT + 1);
const bayX = (n: number, firstBay: number) => 16 + (n - firstBay) * 52;
const bayCenter = (n: number, firstBay: number) => bayX(n, firstBay) + 23;

const START: Point = [338, 452];
const CORRIDOR_Y = 152;

export interface RoutePlan {
  steps: Point[][];
  /** Lado para onde virar no corredor (passo 3). */
  turn: 'esquerda' | 'direita';
  distanceMeters: number;
  minutes: number;
}

export function planRoute(platform: number, accessible: boolean): RoutePlan {
  const bx = bayCenter(platform, firstBayFor(platform));
  const verticalX = accessible ? 257 : 338;
  const step1: Point[] = accessible
    ? [START, [338, 326], [257, 326]]
    : [START, [338, 330]];
  const step2: Point[] = accessible
    ? [[257, 326], [257, CORRIDOR_Y]]
    : [[338, 330], [338, CORRIDOR_Y]];
  const step3: Point[] = [[verticalX, CORRIDOR_Y], [bx, CORRIDOR_Y], [bx, 116]];
  const corridorMeters = Math.round(Math.abs(verticalX - bx) * 0.55);
  const distanceMeters = (accessible ? 120 : 100) + corridorMeters;
  return {
    steps: [step1, step2, step3],
    turn: bx < verticalX ? 'esquerda' : 'direita',
    distanceMeters,
    minutes: Math.max(2, Math.round(distanceMeters / 60) + (accessible ? 1 : 0)),
  };
}

const toPath = (pts: Point[]) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');

/** Setas de direção no meio de cada trecho reto. */
function chevrons(pts: Point[]) {
  const out: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 40) continue;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90;
    const count = len > 120 ? 2 : 1;
    for (let k = 1; k <= count; k++) {
      const t = k / (count + 1);
      out.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, angle });
    }
  }
  return out;
}

export function TerminalMap({
  platform,
  step,
  accessible,
}: {
  platform: number;
  /** Passo atual, de 1 a 3. */
  step: number;
  accessible: boolean;
}) {
  const plan = planRoute(platform, accessible);
  const current = plan.steps[step - 1];
  const done = plan.steps.slice(0, step - 1);
  const next = plan.steps.slice(step);
  const you = current[0];
  const firstBay = firstBayFor(platform);
  const dest = bayCenter(platform, firstBay);
  const calloutX = Math.min(Math.max(dest - 73, 8), 390 - 154);
  const label = (x: number, y: number, text: string, size = 13, color: string = colors.brandInk) => (
    <SvgText x={x} y={y} fontSize={size} fontFamily={fonts.extrabold} fill={color} textAnchor="middle">
      {text}
    </SvgText>
  );

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 482"
      preserveAspectRatio="xMidYMid meet"
      accessibilityLabel={`Mapa do terminal com a rota até a Plataforma ${platform}. Passo ${step} de 3.`}>
      <Rect x={0} y={0} width={390} height={482} fill={colors.mapBackground} />

      {/* Piso inferior: plataformas e corredor */}
      <Rect x={0} y={0} width={390} height={196} fill="#E7DDF0" />
      {Array.from({ length: BAY_COUNT }, (_, i) => firstBay + i)
        .filter((n) => n !== platform)
        .map((n) => (
          <G key={n}>
            <Rect x={bayX(n, firstBay)} y={44} width={46} height={62} rx={10} fill="#FFFFFF" stroke="#CDBFD8" />
            {label(bayCenter(n, firstBay), 81, String(n), 15, colors.textMuted)}
          </G>
        ))}
      <Rect x={bayX(platform, firstBay) - 6} y={38} width={58} height={74} rx={12} fill={colors.brand} stroke="#FFFFFF" strokeWidth={3} />
      {label(dest, 72, 'PLAT.', 11, colors.brandOnDark)}
      {label(dest, 94, String(platform), 22, '#FFFFFF')}
      <Rect x={calloutX} y={8} width={146} height={22} rx={11} fill={colors.brand} />
      {label(calloutX + 73, 23, 'SEU EMBARQUE', 11, '#FFFFFF')}

      <Rect x={12} y={126} width={366} height={52} rx={12} fill="#FFFFFF" />
      <SvgText x={24} y={172} fontSize={10} fontFamily={fonts.extrabold} fill={colors.textMuted}>
        PISO INFERIOR · CORREDOR DE EMBARQUE
      </SvgText>

      <Line x1={0} y1={196} x2={390} y2={196} stroke="#B9A5CB" strokeWidth={2} strokeDasharray="6 6" />
      <Rect x={12} y={208} width={150} height={22} rx={11} fill="#FFFFFF" />
      <SvgText x={24} y={223} fontSize={11} fontFamily={fonts.extrabold} fill={colors.brandDeep}>
        PISO SUPERIOR · ENTRADA
      </SvgText>

      {/* Piso superior: serviços */}
      <Rect x={16} y={242} width={96} height={78} rx={12} fill="#FFFFFF" />
      <G transform="translate(52 254)" fill="none" stroke={colors.brand} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
        <Path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" />
        <Path d="M8 3v3M12 3v3" />
      </G>
      {label(64, 304, 'Café')}

      <Rect x={120} y={242} width={96} height={78} rx={12} fill="#FFFFFF" />
      <G transform="translate(156 254)" fill="none" stroke={colors.brand} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={7} cy={4} r={2} />
        <Circle cx={17} cy={4} r={2} />
        <Path d="M4 9h6l-1 6H8v6M14 9h6l1 7h-3v5" />
      </G>
      {label(168, 304, 'Banheiros')}

      <Rect x={224} y={242} width={66} height={78} rx={12} fill={accessible ? colors.brandSoft : '#FFFFFF'} />
      <G transform="translate(245 254)" fill="none" stroke={colors.brand} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={4} y={2} width={16} height={20} rx={2} />
        <Path d="M9 9l3-3 3 3M9 15l3 3 3-3" />
      </G>
      {label(257, 304, 'Elevador', 12)}

      <Rect x={298} y={236} width={80} height={90} rx={12} fill={accessible ? '#E2D8EA' : '#D9C4EA'} />
      <Path d="M308 312 h12 v-12 h12 v-12 h12 v-12 h12 v-12 h12" fill="none" stroke="#8B6FA3" strokeWidth={2.5} strokeLinejoin="round" />

      <Rect x={16} y={338} width={150} height={62} rx={12} fill="#FFFFFF" />
      {label(91, 374, 'Guichês')}
      <Rect x={174} y={338} width={116} height={62} rx={12} fill="#FFFFFF" />
      {label(232, 374, 'Lojas')}

      <Rect x={16} y={448} width={150} height={26} rx={13} fill="#FFFFFF" />
      {label(91, 465, 'ENTRADA · METRÔ', 11, colors.textMuted)}

      {/* Rota */}
      <Path d={toPath(plan.steps.flat())} fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      {done.map((pts, i) => (
        <Path key={`d${i}`} d={toPath(pts)} fill="none" stroke={colors.brandMuted} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {next.map((pts, i) => (
        <Path key={`n${i}`} d={toPath(pts)} fill="none" stroke="#B88AD6" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 10" />
      ))}
      <Path d={toPath(current)} fill="none" stroke={colors.brand} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      {chevrons(current).map((c, i) => (
        <G key={`c${i}`} transform={`translate(${c.x} ${c.y}) rotate(${c.angle})`}>
          <Path d="M-5 3 L0 -2 L5 3" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      ))}

      {/* Marcadores dos passos 2 e 3 */}
      {[2, 3].map((n) => {
        const [x, y] = plan.steps[n - 1][0];
        if (n === step) return null;
        return (
          <G key={`s${n}`}>
            <Circle cx={x} cy={y} r={13} fill="#FFFFFF" stroke={colors.brand} strokeWidth={2.5} />
            {label(x, y + 5, String(n), 13, colors.brand)}
          </G>
        );
      })}

      {/* Você está aqui */}
      <Rect x={you[0] - 114} y={you[1] - 22} width={88} height={44} rx={10} fill={colors.text} />
      {label(you[0] - 70, you[1] - 4, 'Você está', 12, '#FFFFFF')}
      {label(you[0] - 70, you[1] + 12, 'aqui', 12, '#FFFFFF')}
      <Path d={`M${you[0] - 26} ${you[1] - 6} L${you[0] - 18} ${you[1]} L${you[0] - 26} ${you[1] + 6} Z`} fill={colors.text} />
      <Circle cx={you[0]} cy={you[1]} r={20} fill={colors.brand} fillOpacity={0.16} />
      <Circle cx={you[0]} cy={you[1]} r={10} fill={colors.brand} stroke="#FFFFFF" strokeWidth={3.5} />
    </Svg>
  );
}
