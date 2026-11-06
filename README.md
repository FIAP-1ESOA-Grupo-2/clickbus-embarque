# ClickBus Embarque

MVP do **Challenge FIAP 2026 · ClickBus** — Engenharia de Software, 3º ano.

> **Desafio:** conectar o mundo digital (app) com o mundo físico (terminal rodoviário), tornando a experiência do passageiro fluida, rápida e inteligente.

O **ClickBus Embarque** é um "modo terminal" dentro do app da ClickBus. Quando o passageiro chega à rodoviária, o app passa a guiá-lo até sentar no ônibus:

| Problema no terminal (kickoff ClickBus) | Como o app resolve |
| --- | --- |
| Desorientação em rodoviárias grandes | **Mapa do terminal** com navegação passo a passo até a plataforma e opção de rota sem escadas |
| Falta de informação em tempo real | **Avisos instantâneos** de troca de plataforma, atraso e embarque liberado |
| Validação manual lenta e filas | **QR de embarque** lido pelo motorista em menos de 1 segundo |
| Aglomeração e desbalanceamento | **Painel do operador** com ocupação por plataforma e troca de plataforma com aviso automático |
| Dependência de atendimento humano | **Assistente de viagem com IA** que conhece a viagem do passageiro |
| Baixa acessibilidade | Rota sem escadas, pedido de assistência e interface com alto contraste |

## Telas

| Perfil | Rota | Tela |
| --- | --- | --- |
| Passageiro | `/` | Minha viagem |
| Passageiro | `/terminal` | Modo terminal (plataforma, status ao vivo, jornada) |
| Passageiro | `/mapa` | Mapa do terminal passo a passo |
| Passageiro | `/qr` | Cartão de embarque com QR code |
| Passageiro | `/embarcado` | Embarque confirmado |
| Passageiro | `/assistente` | Assistente de viagem (IA) |
| Operação | `/operador` | Painel do operador (melhor na web/desktop) |
| Operação | `/leitor` | Leitor de QR do motorista |
| Demo | `/demo` | Atalhos para todos os perfis (aba **Conta**) |

## Como rodar

Pré-requisitos: [Node.js 20+](https://nodejs.org) e o app **Expo Go** no celular (Android ou iOS).

```bash
npm install
npx expo start
```

- **No celular:** escaneie o QR code que aparece no terminal com o Expo Go (Android) ou com a câmera (iOS). Celular e computador precisam estar na mesma rede Wi-Fi.
- **No navegador:** pressione `w` no terminal (ou rode `npm run web`).

Verificação de tipos: `npm run typecheck`.

## Roteiro da demonstração (vídeo pitch)

1. **Minha viagem** → toque em **Cheguei na rodoviária**.
2. **Modo terminal** mostra a Plataforma 12 e o status ao vivo.
3. Troque a plataforma de um destes jeitos:
   - **Web, duas abas:** abra `/operador` numa aba e `/terminal` em outra. No painel, escolha a plataforma 8 e clique em **Alterar e avisar**. O aviso chega na aba do passageiro na hora.
   - **Só no celular:** toque em **Simular** (no fim da tela do modo terminal) → **Trocar para a Plataforma 8**.
4. O aviso vermelho aparece no topo → **Ver nova rota** → o mapa já leva até a Plataforma 8. Use **Próximo passo** para andar pela rota.
5. **Cheguei na plataforma** → QR de embarque → **Simular leitura no portão** → **Embarque confirmado**.
6. Mostre o **Assistente** com a pergunta "Estou com 3 malas e preciso de um café, onde vou?".
7. Mostre o **Leitor do motorista** (QR válido e inválido) pela aba **Conta → Modo demonstração**.

## O que é simulado nesta versão

Para o MVP, o tempo real, os dados e a IA são **simulados dentro do app**, mas atrás de interfaces prontas para um backend de verdade:

- `src/services/realtime.ts` — canal de eventos (`publish`/`subscribe`). Hoje é `MockRealtimeChannel` (memória + `BroadcastChannel` entre abas na web). Em produção: Socket.io/WebSocket ou Firebase.
- `src/services/assistant.ts` — respostas por regras. Em produção: backend chamando um modelo de IA generativa com o contexto do pedido.
- `src/data/mock.ts` — partidas, plataformas e passageira fictícias.

A arquitetura completa, com o backend proposto, está em **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.

## Estrutura

```
src/
  app/            telas (Expo Router: cada arquivo é uma rota)
  components/     componentes reutilizáveis (UI, mapa, aviso, simulador)
  data/           tipos e dados de demonstração
  services/       tempo real e assistente (simulados, prontos para backend)
  store/          estado da viagem (React Context + reducer)
  theme.ts        cores e fontes do design
docs/
  ARQUITETURA.md  arquitetura e integração com backend
```

## Tecnologias

React Native · Expo (SDK 58) · Expo Router · TypeScript · react-native-svg · react-native-qrcode-svg · Nunito Sans (Google Fonts)

## Equipe

| Nome | RM |
| --- | --- |
| [Integrante 1] | [RM] |
| [Integrante 2] | [RM] |
| [Integrante 3] | [RM] |
| [Integrante 4] | [RM] |
| [Integrante 5] | [RM] |

---

Projeto acadêmico desenvolvido para o Challenge FIAP 2026 em parceria com a ClickBus. Empresas de ônibus, passageiros e números exibidos no app são fictícios.
