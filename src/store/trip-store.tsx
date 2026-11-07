import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { initialCrowd, initialDepartures, MY_TRIP_ID } from '@/data/mock';
import type { AppNotification, RealtimeEvent, Trip } from '@/data/types';
import { realtime } from '@/services/realtime';

interface State {
  departures: Trip[];
  crowd: number[];
  notifications: AppNotification[];
  /** Embarque da passageira confirmado pelo leitor/QR. */
  myBoarding: 'pending' | 'confirmed';
}

type Action =
  | { type: 'event'; event: RealtimeEvent }
  | { type: 'dismiss'; id: string };

const initialState: State = {
  departures: initialDepartures,
  crowd: initialCrowd,
  notifications: [],
  myBoarding: 'pending',
};

let notificationSeq = 0;
function notify(n: Omit<AppNotification, 'id' | 'createdAt'>): AppNotification {
  notificationSeq += 1;
  return { ...n, id: `n${notificationSeq}`, createdAt: Date.now() };
}

function updateTrip(departures: Trip[], id: string, patch: (t: Trip) => Partial<Trip>) {
  return departures.map((t) => (t.id === id ? { ...t, ...patch(t) } : t));
}

/** Converte um evento em tempo real em mudança de estado + aviso para a passageira. */
function applyEvent(state: State, event: RealtimeEvent): State {
  if (event.type === 'reset') return initialState;

  const isMine = event.tripId === MY_TRIP_ID;
  const trip = state.departures.find((t) => t.id === event.tripId);
  if (!trip) return state;
  const extra: AppNotification[] = [];

  switch (event.type) {
    case 'platform_changed': {
      const crowd = [...state.crowd];
      const moving = Math.min(trip.checkedIn - trip.boarded, crowd[event.from - 1] ?? 0);
      crowd[event.from - 1] = Math.max(0, (crowd[event.from - 1] ?? 0) - moving);
      crowd[event.to - 1] = (crowd[event.to - 1] ?? 0) + moving;
      if (isMine) {
        extra.push(
          notify({
            tone: 'danger',
            title: `Plataforma alterada: agora é a ${event.to}`,
            body: `Sua viagem das ${trip.departure} mudou de plataforma. O horário continua o mesmo.`,
            action: { label: 'Ver nova rota', href: '/mapa' },
          }),
        );
      }
      return {
        ...state,
        crowd,
        departures: updateTrip(state.departures, event.tripId, () => ({
          previousPlatform: event.from,
          platform: event.to,
          platformChangeReason: event.reason,
        })),
        notifications: [...state.notifications, ...extra],
      };
    }
    case 'delay': {
      if (isMine) {
        extra.push(
          notify({
            tone: 'warning',
            title: `Sua viagem atrasou ${event.minutes} min`,
            body: 'Avisaremos quando o embarque for liberado. Aproveite para um café.',
            action: { label: 'Abrir viagem', href: '/terminal' },
          }),
        );
      }
      return {
        ...state,
        departures: updateTrip(state.departures, event.tripId, (t) => ({
          status: 'delayed',
          delayMinutes: t.delayMinutes + event.minutes,
        })),
        notifications: [...state.notifications, ...extra],
      };
    }
    case 'boarding_soon': {
      if (isMine) {
        extra.push(
          notify({
            tone: 'warning',
            title: 'Embarque em 10 minutos',
            body: `Siga para a Plataforma ${trip.platform}. Você está a 3 min a pé.`,
            action: { label: 'Como chegar', href: '/mapa' },
          }),
        );
      }
      return {
        ...state,
        departures: updateTrip(state.departures, event.tripId, () => ({ status: 'boarding_soon' })),
        notifications: [...state.notifications, ...extra],
      };
    }
    case 'boarding_open': {
      if (isMine) {
        extra.push(
          notify({
            tone: 'success',
            title: `Embarque liberado na Plataforma ${trip.platform}`,
            body: `Seu ônibus encostou. Tenha o QR em mãos — poltrona ${trip.seat}.`,
            action: { label: 'Mostrar QR', href: '/qr' },
          }),
        );
      }
      return {
        ...state,
        departures: updateTrip(state.departures, event.tripId, () => ({ status: 'boarding' })),
        notifications: [...state.notifications, ...extra],
      };
    }
    case 'passenger_boarded': {
      return {
        ...state,
        myBoarding: isMine && event.locator === trip.locator ? 'confirmed' : state.myBoarding,
        departures: updateTrip(state.departures, event.tripId, (t) => ({
          boarded: Math.min(t.boarded + 1, t.checkedIn),
        })),
      };
    }
    default:
      return state;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'event':
      return applyEvent(state, action.event);
    case 'dismiss':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };
  }
}

interface TripStore extends State {
  myTrip: Trip;
  /** Publica um evento no canal em tempo real (simulado). */
  publish: (event: RealtimeEvent) => void;
  dismissNotification: (id: string) => void;
}

const TripContext = createContext<TripStore | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => realtime.subscribe((event) => dispatch({ type: 'event', event })), []);

  const publish = useCallback((event: RealtimeEvent) => realtime.publish(event), []);
  const dismissNotification = useCallback((id: string) => dispatch({ type: 'dismiss', id }), []);

  const value = useMemo<TripStore>(() => {
    const myTrip = state.departures.find((t) => t.id === MY_TRIP_ID)!;
    return { ...state, myTrip, publish, dismissNotification };
  }, [state, publish, dismissNotification]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips precisa estar dentro de <TripProvider>');
  return ctx;
}
