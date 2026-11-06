import type { RealtimeEvent } from '@/data/types';

/**
 * Canal de eventos em tempo real entre a operação do terminal e o app.
 *
 * O app só conhece esta interface. Na demonstração usamos
 * `MockRealtimeChannel`; em produção ela seria implementada por um cliente
 * de WebSocket (ex.: Socket.io) ou Firebase, sem mudar nenhuma tela.
 * Detalhes em docs/ARQUITETURA.md.
 */
export interface RealtimeChannel {
  publish(event: RealtimeEvent): void;
  subscribe(handler: (event: RealtimeEvent) => void): () => void;
}

const CHANNEL_NAME = 'clickbus-embarque-demo';

/**
 * Simulação local:
 * - entrega o evento para quem está ouvindo neste mesmo app;
 * - na web, também repassa para as outras abas abertas via BroadcastChannel.
 *   Assim dá para abrir o painel do operador numa aba e o app do passageiro
 *   em outra, e ver a troca de plataforma acontecer "ao vivo".
 */
export class MockRealtimeChannel implements RealtimeChannel {
  private handlers = new Set<(event: RealtimeEvent) => void>();
  private broadcast: BroadcastChannel | null = null;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcast = new BroadcastChannel(CHANNEL_NAME);
      this.broadcast.onmessage = (message: MessageEvent<RealtimeEvent>) => {
        this.emitLocal(message.data);
      };
    }
  }

  publish(event: RealtimeEvent) {
    // Simula a pequena latência de rede de um backend real.
    setTimeout(() => this.emitLocal(event), 250);
    this.broadcast?.postMessage(event);
  }

  subscribe(handler: (event: RealtimeEvent) => void) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private emitLocal(event: RealtimeEvent) {
    this.handlers.forEach((handler) => handler(event));
  }
}

export const realtime: RealtimeChannel = new MockRealtimeChannel();
