/**
 * Conversation screen — persistent chat with Hardev.
 *
 * Design rules:
 * - AI persona: "Hardev" with ⊕ avatar
 * - AI responses: letter/card style (bordered, not bubbles)
 * - Memory tag: 🕐 stamped seal inside response card
 * - User messages: right-aligned standard bubbles
 * - Rate limit bar (trial users)
 * - Float button: "✓ Something happened" → event logging bottom sheet
 * - Empty state: warm, inviting, not "No messages yet"
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { chat, events, type ChatMessage, type Profile, onboarding } from '../services/api';
import { RateLimitError } from '../services/api';
import {
  Colors,
  Fonts,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  DomainIcon,
} from '../theme';

// ─── Message components ──────────────────────────────────────────────────────────

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={styles.userBubbleContainer} accessible accessibilityRole="text"
      accessibilityLabel={`You: ${message.content}`}
    >
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{message.content}</Text>
      </View>
    </View>
  );
}

function HardevCard({ message }: { message: ChatMessage }) {
  return (
    <View style={styles.hardevCardContainer}>
      {/* Avatar */}
      <View style={styles.hardevAvatar} accessibilityElementsHidden>
        <Text style={styles.hardevAvatarText}>⊕</Text>
      </View>

      {/* Letter-style card */}
      <View
        style={styles.hardevCard}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Hardev: ${message.content}`}
      >
        <View style={styles.hardevCardHeader}>
          <Text style={styles.hardevName}>Hardev</Text>
          <Text style={styles.hardevTimestamp}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <Text style={styles.hardevCardText}>{message.content}</Text>

        {/* Memory seal — stamped inside the card */}
        {message.memory_context && message.memory_context.length > 0 && (
          <View
            style={styles.memorySeal}
            accessible
            accessibilityLabel={`Based on sessions from ${message.memory_context.join(', ')}`}
          >
            <Text style={styles.memorySealIcon}>🕐</Text>
            <Text style={styles.memorySealText}>
              Based on: {message.memory_context.slice(0, 2).join(', ')}
              {message.memory_context.length > 2
                ? ` + ${message.memory_context.length - 2} more`
                : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer} accessibilityLabel="Hardev is typing">
      <View style={styles.hardevAvatar} accessibilityElementsHidden>
        <Text style={styles.hardevAvatarText}>⊕</Text>
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { opacity: dot }]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Event logging bottom sheet ──────────────────────────────────────────────────

interface EventSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogged: () => void;
}

function EventBottomSheet({ visible, onClose, onLogged }: EventSheetProps) {
  const [type, setType] = useState('career');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const EVENT_TYPES = ['career', 'family', 'health', 'finance', 'love', 'other'];

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await events.log({
        type,
        event_date: new Date().toISOString().slice(0, 10),
        description: description.trim(),
      });
      onLogged();
      onClose();
      setDescription('');
    } catch {
      // Silent — user can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>What happened?</Text>
          <Text style={styles.sheetSubtitle}>
            Log a life event to build your accuracy record
          </Text>

          {/* Event type pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typePillScroll}
          >
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typePill, type === t && styles.typePillActive]}
                onPress={() => setType(t)}
                accessibilityRole="radio"
                accessibilityState={{ checked: type === t }}
                accessibilityLabel={`Event type: ${t}`}
              >
                <Text style={[styles.typePillText, type === t && styles.typePillTextActive]}>
                  {DomainIcon[t] ?? '◎'} {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.sheetInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Briefly describe what happened..."
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={3}
            accessibilityLabel="Event description"
          />

          <TouchableOpacity
            style={[styles.sheetSubmit, !description.trim() && styles.sheetSubmitDisabled]}
            onPress={handleSubmit}
            disabled={!description.trim() || submitting}
            accessibilityRole="button"
            accessibilityLabel="Log this event"
          >
            {submitting ? (
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <Text style={styles.sheetSubmitText}>Log event ✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetCancel}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────────

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [sessionCount, setSessionCount] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me = await onboarding.getMe();
      setProfile(me.profile);
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const history = await chat.history();
      setMessages(history.reverse()); // chronological
      setSessionCount(Math.floor(history.length / 2));
    } catch {
      // Silent — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    setRateLimitError('');
    setSending(true);

    // Optimistic user message
    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await chat.send(text, currentSessionId);
      setCurrentSessionId(response.session_id);
      setMessagesUsed(response.messages_used_today);
      setDailyLimit(response.daily_limit);

      // Replace optimistic message + add assistant response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        { ...optimisticUser, id: `user-${Date.now()}` },
        response.message,
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        setRateLimitError("You've used your messages for today. Upgrade for unlimited.");
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      }
    } finally {
      setSending(false);
    }
  };

  const now = new Date();
  const trialActive = profile
    ? now < new Date(profile.trial_expires_at)
    : false;
  const trialExpired = profile
    ? !profile.subscription_active && !trialActive
    : false;
  const daysLeft = profile
    ? Math.ceil(
        (new Date(profile.trial_expires_at).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
      )
    : null;
  const showTrialWarning = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') return <UserBubble message={item} />;
    return <HardevCard message={item} />;
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Trust strip */}
      <View style={styles.trustStrip} accessibilityRole="header">
        <Text style={styles.trustIcon}>🧠</Text>
        <Text style={styles.trustText}>
          {sessionCount > 0
            ? `Remembers ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
            : 'Starting a new conversation'}
        </Text>
      </View>

      {/* Trial warning banner */}
      {showTrialWarning && (
        <View style={styles.trialBanner}>
          <Text style={styles.trialBannerText}>
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your trial ·{' '}
          </Text>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Continue your journey — upgrade"
          >
            <Text style={styles.trialBannerCta}>Continue your journey →</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyAvatar}>⊕</Text>
            <Text style={styles.emptyName}>Hardev</Text>
            <Text style={styles.emptyText}>
              Ask me anything about your chart, your year ahead, or what's on
              your mind.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {sending && <TypingIndicator />}

        {/* Rate limit bar */}
        {!profile?.subscription_active && trialActive && (
          <View style={styles.rateLimitBar} accessibilityLiveRegion="polite"
            accessibilityLabel={`${messagesUsed} of ${dailyLimit} messages used today`}
          >
            <Text style={styles.rateLimitText}>
              {messagesUsed}/{dailyLimit} msgs today
            </Text>
            <View style={styles.rateLimitTrack}>
              <View
                style={[
                  styles.rateLimitFill,
                  { width: `${(messagesUsed / dailyLimit) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Rate limit error */}
        {rateLimitError && (
          <View style={styles.rateLimitErrorBar}>
            <Text style={styles.rateLimitErrorText}>{rateLimitError}</Text>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Upgrade for unlimited messages"
            >
              <Text style={styles.rateLimitErrorCta}>Upgrade →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trial expired overlay */}
        {trialExpired && (
          <View style={styles.trialExpiredOverlay}>
            <Text style={styles.trialExpiredTitle}>
              Your chart and timeline are yours forever.
            </Text>
            <Text style={styles.trialExpiredBody}>
              To continue your conversation with Hardev, upgrade for ₹199/month.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              accessibilityRole="button"
              accessibilityLabel="Continue with Hardev"
            >
              <Text style={styles.upgradeButtonText}>Continue with Hardev →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.maybeLaterButton}
              accessibilityRole="button"
              accessibilityLabel="Maybe later"
            >
              <Text style={styles.maybeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input row */}
        {!trialExpired && (
          <View style={[styles.inputRow, { paddingBottom: insets.bottom + Spacing[2] }]}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Hardev..."
              placeholderTextColor={Colors.muted}
              multiline
              maxLength={1000}
              editable={!sending && !trialExpired}
              accessibilityLabel="Message input"
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Float button: Something happened */}
      {!trialExpired && (
        <TouchableOpacity
          style={styles.eventFloatButton}
          onPress={() => setShowEventSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Log a life event — something happened"
        >
          <Text style={styles.eventFloatText}>✓ Something happened</Text>
        </TouchableOpacity>
      )}

      <EventBottomSheet
        visible={showEventSheet}
        onClose={() => setShowEventSheet(false)}
        onLogged={() => {
          // Could show confirmation toast
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  // Trust strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  trustIcon: { fontSize: FontSize.sm },
  trustText: {
    fontSize: FontSize.xs,
    color: Colors.surface + 'CC',
    fontWeight: '500',
  },
  // Trial banner
  trialBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gold + '40',
  },
  trialBannerText: {
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  trialBannerCta: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Messages
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[8],
  },
  emptyAvatar: {
    fontSize: 48,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  emptyName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageList: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[4],
  },
  // User bubbles
  userBubbleContainer: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.card,
    borderBottomRightRadius: 4,
    padding: Spacing[3],
    maxWidth: '80%',
  },
  userBubbleText: {
    fontSize: FontSize.md,
    color: Colors.surface,
    lineHeight: 22,
  },
  // Hardev card
  hardevCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  hardevAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hardevAvatarText: {
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  hardevCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    ...Shadow.card,
  },
  hardevCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  hardevName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  hardevTimestamp: {
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  hardevCardText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  // Memory seal — stamped inside card
  memorySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[3],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  memorySealIcon: {
    fontSize: FontSize.xs,
  },
  memorySealText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    flex: 1,
  },
  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[3],
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.muted,
  },
  // Rate limit
  rateLimitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2],
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rateLimitText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    minWidth: 80,
  },
  rateLimitTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rateLimitFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  // Rate limit error
  rateLimitErrorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    backgroundColor: '#FFF3F3',
    borderTopWidth: 1,
    borderTopColor: Colors.error + '40',
    gap: Spacing[3],
  },
  rateLimitErrorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  rateLimitErrorCta: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Trial expired overlay
  trialExpiredOverlay: {
    backgroundColor: Colors.surface,
    padding: Spacing[6],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.modal,
  },
  trialExpiredTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.primary,
    marginBottom: Spacing[2],
  },
  trialExpiredBody: {
    fontSize: FontSize.md,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: Spacing[4],
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  upgradeButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  maybeLaterButton: {
    paddingVertical: Spacing[2],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  maybeLaterText: {
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing[2],
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: Colors.surface,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  // Float button
  eventFloatButton: {
    position: 'absolute',
    bottom: 80,
    right: Spacing[4],
    backgroundColor: Colors.success,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    minHeight: 44,
    justifyContent: 'center',
    ...Shadow.modal,
  },
  eventFloatText: {
    fontSize: FontSize.sm,
    color: Colors.surface,
    fontWeight: '600',
  },
  // Event sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    padding: Spacing[6],
    paddingTop: Spacing[4],
    ...Shadow.modal,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing[4],
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing[1],
  },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing[4],
  },
  typePillScroll: {
    marginBottom: Spacing[4],
  },
  typePill: {
    marginRight: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  typePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typePillText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  typePillTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing[3],
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing[4],
  },
  sheetSubmit: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  sheetSubmitDisabled: {
    opacity: 0.4,
  },
  sheetSubmitText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  sheetCancel: {
    paddingVertical: Spacing[2],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: FontSize.md,
    color: Colors.muted,
  },
});
