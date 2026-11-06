export type TripStatus =
  | 'on_time'
  | 'boarding_soon'
  | 'boarding'
  | 'delayed'
  | 'departed';

export interface Trip {
  id: string;
  /** Localizador do pedido (vai no QR code). */
  locator: string;
  passengerName: string;
  origin: string;
  originTerminal: string;
  destination: string;
  company: string;
  service: string;
  seat: number;
  /** Horários no formato HH:mm (dados de demonstração). */
  departure: string;
  arrival: string;
  boardingStart: string;
  platform: number;
  /** Preenchido quando a operação troca a plataforma. */
  previousPlatform?: number;
  platformChangeReason?: string;
  status: TripStatus;
  delayMinutes: number;
  /** Passageiros que já fizeram check-in pelo app / total de lugares. */
  checkedIn: number;
  boarded: number;
  totalSeats: number;
}

export type NotificationTone = 'info' | 'warning' | 'danger' | 'success';

export interface AppNotification {
  id: string;
  tone: NotificationTone;
  title: string;
  body: string;
  action?: { label: string; href: '/mapa' | '/terminal' | '/qr' };
  createdAt: number;
}

/**
 * Eventos que, em produção, chegariam do backend em tempo real
 * (ver docs/ARQUITETURA.md). Aqui são simulados.
 */
export type RealtimeEvent =
  | { type: 'platform_changed'; tripId: string; from: number; to: number; reason?: string }
  | { type: 'delay'; tripId: string; minutes: number }
  | { type: 'boarding_soon'; tripId: string }
  | { type: 'boarding_open'; tripId: string }
  | { type: 'passenger_boarded'; tripId: string; locator: string }
  | { type: 'reset' };
