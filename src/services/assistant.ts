import type { Trip } from '@/data/types';

export type AssistantCard = 'cafe' | 'bagagem' | 'atraso' | 'acessibilidade' | 'guarda-volumes';

export interface AssistantReply {
  text: string;
  cards: AssistantCard[];
}

/**
 * Assistente de viagem (simulado).
 *
 * Na demonstração as respostas vêm de regras por palavra-chave, usando os
 * dados da viagem. Em produção, esta função chamaria o backend, que envia a
 * pergunta + contexto do pedido para um modelo de IA generativa e devolve a
 * resposta (ver docs/ARQUITETURA.md).
 */
export async function askAssistant(question: string, trip: Trip): Promise<AssistantReply> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const q = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos

  const cards: AssistantCard[] = [];
  const parts: string[] = [];

  const mentionsBags = /mala|bagag|volume/.test(q);
  const mentionsFood = /cafe|comer|fome|lanche|agua/.test(q);

  if (mentionsFood) {
    parts.push(
      mentionsBags
        ? `Dá tempo! O embarque abre às ${trip.boardingStart}. O café mais próximo da Plataforma ${trip.platform} fica a 1 min do elevador — melhor que a escada com malas.`
        : `O café mais próximo fica no piso superior, no caminho para a Plataforma ${trip.platform}. Você ainda tem tempo antes do embarque (${trip.boardingStart}).`,
    );
    cards.push('cafe');
  }
  if (mentionsBags) {
    if (!mentionsFood) parts.push('Sobre bagagem, aqui vai a regra da sua passagem:');
    cards.push('bagagem');
  }
  if (/atras|horario|sai que horas|vai sair/.test(q)) {
    parts.push(
      trip.delayMinutes > 0
        ? `Sua viagem está com ${trip.delayMinutes} min de atraso. Te avisamos assim que o embarque for liberado.`
        : `Sua viagem está no horário: saída às ${trip.departure}, embarque a partir de ${trip.boardingStart} na Plataforma ${trip.platform}.`,
    );
    cards.push('atraso');
  }
  if (/assist|cadeira|acessib|mobilidade|idoso|gestante/.test(q)) {
    parts.push(
      'Posso pedir assistência para você. Um funcionário te encontra no ponto de apoio, ao lado dos guichês, e acompanha até o ônibus. A rota sem escadas também está disponível no mapa.',
    );
    cards.push('acessibilidade');
  }
  if (/guarda|deixar a mala|guardar/.test(q)) {
    parts.push('O guarda-volumes fica no piso superior, ao lado dos banheiros. Funciona das 6h às 23h.');
    cards.push('guarda-volumes');
  }

  if (parts.length === 0) {
    parts.push(
      `Posso ajudar com sua viagem para ${trip.destination}: plataforma, horários, bagagem, serviços do terminal e acessibilidade. Experimente uma das sugestões abaixo.`,
    );
  }

  return { text: parts.join(' '), cards };
}

export const quickQuestions = [
  'Estou com 3 malas e preciso de um café, onde vou?',
  'Meu ônibus está atrasado?',
  'Preciso de assistência especial',
  'Onde fica o guarda-volumes?',
];
