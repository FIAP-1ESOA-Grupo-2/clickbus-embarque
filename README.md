# ClickBus Embarque

MVP do **Challenge FIAP 2026 · ClickBus**, Engenharia de Software, 3º ano.

> **Desafio:** conectar o mundo digital (app) com o mundo físico (terminal rodoviário), tornando a experiência do passageiro fluida, rápida e inteligente.

| | |
| --- | --- |
| 🎬 **Vídeo pitch** | [link do vídeo no YouTube](https://youtube.com/) |
| 💻 **Repositório** | [github.com/FIAP-1ESOA-Grupo-2/clickbus-embarque](https://github.com/FIAP-1ESOA-Grupo-2/clickbus-embarque) |

## A solução

O **ClickBus Embarque** é um "modo terminal" dentro do app da ClickBus. Quando o passageiro chega à rodoviária, o app passa a guiá-lo até ele sentar no ônibus. Do outro lado, a operação do terminal e o motorista usam o mesmo sistema, e tudo se conecta por eventos em tempo real.

| Problema no terminal (kickoff ClickBus) | Como o ClickBus Embarque resolve |
| --- | --- |
| **Desorientação** em rodoviárias grandes | Mapa do terminal com navegação passo a passo até a plataforma |
| **Previsibilidade:** falta de informação sobre atrasos e trocas de plataforma | Avisos instantâneos de troca de plataforma, atraso e embarque liberado |
| **Validação manual** lenta e filas no portão | QR de embarque lido pelo motorista em menos de 1 segundo |
| **Filas e ocupação** desbalanceadas | Painel do operador com pessoas por plataforma e troca de plataforma com aviso automático aos passageiros |
| **Autonomia:** dependência de atendimento humano | Assistente de viagem com IA que conhece a viagem do passageiro |
| **Acessibilidade** baixa | Rota sem escadas (elevador), pedido de assistência pelo assistente e rótulos para leitores de tela |

### Três perfis, um sistema

| Perfil | Onde roda | O que faz |
| --- | --- | --- |
| **Passageiro** | App ClickBus (iOS/Android) | Modo terminal, mapa, avisos, QR de embarque e assistente |
| **Operador do terminal** | Painel web | Troca plataforma, registra atraso, libera embarque e acompanha a ocupação |
| **Motorista / portão** | Celular ou leitor fixo | Lê o QR e confirma o embarque |

## Telas

| Perfil | Rota | Tela |
| --- | --- | --- |
| Passageiro | `/` | Minha viagem |
| Passageiro | `/terminal` | Modo terminal (plataforma, status ao vivo, jornada) |
| Passageiro | `/mapa` | Mapa do terminal passo a passo (com rota sem escadas) |
| Passageiro | `/qr` | Cartão de embarque com QR code |
| Passageiro | `/embarcado` | Embarque confirmado |
| Passageiro | `/assistente` | Assistente de viagem com IA |
| Operação | `/operador` | Painel do operador (melhor na web/desktop) |
| Operação | `/leitor` | Leitor de QR do motorista |
| Demonstração | `/demo` | Atalhos para todos os perfis (aba **Conta**) |

## Como rodar

Pré-requisitos: [Node.js 20+](https://nodejs.org) e o app **Expo Go** no celular (Android ou iOS).

```bash
npm install
npx expo start
```

- **No celular:** escaneie o QR code que aparece no terminal com o Expo Go (Android) ou com a câmera (iOS). Celular e computador precisam estar na mesma rede Wi-Fi.
- **No navegador:** pressione `w` no terminal (ou rode `npm run web`).

Verificação de tipos: `npm run typecheck`.

## Roteiro de demonstração

1. **Minha viagem** → toque em **Cheguei na rodoviária**.
2. O **modo terminal** mostra a Plataforma 12 e o status ao vivo.
3. Troque a plataforma de um destes jeitos:
   - **Na web, com duas abas:** abra `/operador` numa aba e `/terminal` em outra. No painel, escolha a nova plataforma e clique em **Alterar e avisar**. O aviso chega na aba do passageiro na hora.
   - **Só no celular:** toque em **Simular** (no fim da tela do modo terminal) → **Trocar para a Plataforma 8**.
4. O aviso vermelho aparece no topo → **Ver nova rota** → o mapa já leva até a nova plataforma. Use **Próximo passo** para seguir a rota e ative **Rota sem escadas** para ver o caminho pelo elevador.
5. **Cheguei na plataforma** → QR de embarque → **Simular leitura no portão** → **Embarque confirmado**.
6. Abra o **Assistente** e pergunte "Estou com 3 malas e preciso de um café, onde vou?".
7. Em **Conta → Modo demonstração**, abra o **Leitor do motorista** e simule um QR válido e um inválido.

O botão **Simular** também dispara "Embarque em 10 min", "Atrasar 15 min" e "Liberar embarque". **Reiniciar demonstração** volta tudo ao estado inicial.

## O que é simulado nesta versão

No MVP, o tempo real, os dados e a IA são **simulados dentro do app**, mas ficam atrás de interfaces prontas para um backend de verdade. Nenhuma tela sabe de onde os dados vêm:

| Arquivo | Hoje (MVP) | Em produção |
| --- | --- | --- |
| `src/services/realtime.ts` | `MockRealtimeChannel`: eventos em memória e, na web, entre abas via `BroadcastChannel` | Socket.io/WebSocket ou Firebase, com a mesma interface `publish`/`subscribe` |
| `src/services/assistant.ts` | Respostas por regras, usando os dados da viagem | Backend que envia a pergunta e o contexto do pedido para um modelo de IA generativa |
| `src/data/mock.ts` | Partidas, plataformas e passageira fictícias | API da ClickBus e sistema da rodoviária |

A arquitetura completa, com o backend proposto, os endpoints e o fluxo de eventos, está em **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.

## Próximos passos

O MVP é o primeiro passo da visão de futuro apresentada pela ClickBus no kickoff:

| Visão ClickBus | No MVP | Evolução |
| --- | --- | --- |
| Reconhecimento ao chegar (raio de 500 m) | Botão "Cheguei na rodoviária" | Geofencing com `expo-location` |
| Portões inteligentes / biometria | QR code | NFC e validação facial com consentimento (LGPD) |
| Totens cognitivos | Assistente no app | O mesmo assistente em totens, com voz |
| Gêmeo digital do pátio | Mapa do terminal e ocupação por plataforma | Localização indoor (beacons BLE) e sugestão automática de plataforma pela ocupação |
| Notificações contextuais | Avisos por evento da operação | Avisos pela posição do passageiro e pelo tempo até a plataforma |

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
