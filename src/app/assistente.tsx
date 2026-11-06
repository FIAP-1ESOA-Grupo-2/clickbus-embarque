import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon } from '@/components/ui';
import type { Trip } from '@/data/types';
import { askAssistant, quickQuestions, type AssistantCard } from '@/services/assistant';
import { useTrips } from '@/store/trip-store';
import { colors, fonts, radius } from '@/theme';

interface Message {
  id: number;
  from: 'user' | 'ai';
  text: string;
  cards?: AssistantCard[];
}

/** Tela 8 — Assistente de viagem com IA (respostas simuladas). */
export default function Assistente() {
  const { myTrip: trip } = useTrips();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: 'ai',
      text: `Oi, ${trip.passengerName.split(' ')[0]}! Já sei da sua viagem das ${trip.departure} para ${trip.destination}. Como posso ajudar aqui no terminal?`,
    },
  ]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput('');
    setMessages((m) => [...m, { id: m.length, from: 'user', text: question }]);
    setLoading(true);
    const reply = await askAssistant(question, trip);
    setMessages((m) => [...m, { id: m.length, from: 'ai', text: reply.text, cards: reply.cards }]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/terminal'))}
          style={styles.back}>
          <Icon name="chevron-left" size={24} />
        </Pressable>
        <Icon name="star" size={20} />
        <View style={{ flex: 1 }}>
          <AppText weight="extrabold" size={17}>
            Assistente de viagem
          </AppText>
          <AppText size={12} color={colors.textMuted}>
            Sabe da sua viagem das {trip.departure} · Plataforma {trip.platform}
          </AppText>
        </View>
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.map((m) =>
          m.from === 'user' ? (
            <View key={m.id} style={styles.userBubble}>
              <AppText size={15}>{m.text}</AppText>
            </View>
          ) : (
            <View key={m.id} style={styles.aiBubble}>
              <View style={styles.aiChip}>
                <Icon name="star" size={12} color="#6A0C93" />
                <AppText weight="extrabold" size={12} color="#6A0C93">
                  Mensagem da nossa IA
                </AppText>
              </View>
              <AppText size={15} style={{ lineHeight: 22 }}>
                {m.text}
              </AppText>
              {m.cards?.map((card) => <ReplyCard key={card} card={card} trip={trip} />)}
            </View>
          ),
        )}
        {loading ? (
          <View style={[styles.aiBubble, styles.typing]}>
            <ActivityIndicator color={colors.brand} />
            <AppText size={14} color={colors.textMuted}>
              Consultando sua viagem…
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {quickQuestions.map((q) => (
            <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={styles.chip}>
              <AppText weight="bold" size={13} color={colors.brandDeep}>
                {q}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <TextInput
              accessibilityLabel="Mensagem para o assistente"
              placeholder="Pergunte sobre sua viagem"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              style={styles.input}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Falar por voz" style={styles.mic}>
              <Icon name="mic" size={20} />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Enviar" onPress={() => send(input)} style={styles.send}>
            <Icon name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ReplyCard({ card, trip }: { card: AssistantCard; trip: Trip }) {
  switch (card) {
    case 'cafe':
      return (
        <Pressable accessibilityRole="link" onPress={() => router.push('/mapa?acessivel=1')} style={styles.placeCard}>
          <View style={styles.placeIcon}>
            <Icon name="coffee" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="extrabold" size={14}>
              Café Expresso · 1 min
            </AppText>
            <AppText size={13} color={colors.textMuted}>
              Piso superior · rota sem escadas
            </AppText>
          </View>
          <AppText weight="extrabold" size={14} color={colors.brand}>
            Ir
          </AppText>
        </Pressable>
      );
    case 'bagagem':
      return (
        <View style={[styles.note, { backgroundColor: colors.warningSoft }]}>
          <Icon name="briefcase" size={20} color={colors.warningText} />
          <AppText size={14} color="#5A3B00" style={{ flex: 1, lineHeight: 20 }}>
            Sua passagem inclui 2 volumes no bagageiro (até 30 kg) e 1 de mão. A 3ª mala pode ter taxa — confirme com o motorista.
          </AppText>
        </View>
      );
    case 'atraso':
      return (
        <View style={[styles.note, { backgroundColor: trip.delayMinutes > 0 ? colors.warningSoft : colors.successSoft }]}>
          <Icon name="clock" size={20} color={trip.delayMinutes > 0 ? colors.warningText : colors.successText} />
          <AppText weight="bold" size={14} color={trip.delayMinutes > 0 ? colors.warningText : colors.successText}>
            {trip.departure} · Plataforma {trip.platform}
            {trip.delayMinutes > 0 ? ` · +${trip.delayMinutes} min` : ' · no horário'}
          </AppText>
        </View>
      );
    case 'acessibilidade':
      return (
        <View style={[styles.note, { backgroundColor: colors.brandSoft }]}>
          <Icon name="user-check" size={20} color="#6A0C93" />
          <AppText size={14} color="#3D2450" style={{ flex: 1 }}>
            Pedido de assistência enviado. Tempo médio de chegada: 5 min.
          </AppText>
        </View>
      );
    case 'guarda-volumes':
      return (
        <View style={[styles.note, { backgroundColor: colors.brandSoft }]}>
          <Icon name="lock" size={20} color="#6A0C93" />
          <AppText size={14} color="#3D2450" style={{ flex: 1 }}>
            Guarda-volumes · Piso superior · 6h às 23h
          </AppText>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: 16, gap: 12 },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3D6EC',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    gap: 10,
  },
  typing: { flexDirection: 'row', alignItems: 'center', width: 'auto' },
  aiChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#EEE6F4',
    borderRadius: 14,
    padding: 10,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 10 },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 10,
  },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#C9A6E3',
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputBox: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, minWidth: 0 },
  mic: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
