/**
 * Events screen — log and review life events.
 * Event logging also accessible via the float button in ConversationScreen.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { events as eventsApi, type EventRecord } from '../services/api';
import {
  Colors,
  Fonts,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  DomainIcon,
} from '../theme';

const EVENT_TYPES = ['career', 'family', 'health', 'finance', 'love', 'other'];

function EventCard({ event }: { event: EventRecord }) {
  const icon = DomainIcon[event.type] ?? '◎';
  const dateStr = new Date(event.event_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View
      style={styles.eventCard}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${event.type} event on ${dateStr}: ${event.description}`}
    >
      <View style={styles.eventCardLeft}>
        <Text style={styles.eventIcon} accessibilityElementsHidden>{icon}</Text>
      </View>
      <View style={styles.eventCardBody}>
        <View style={styles.eventCardHeader}>
          <Text style={styles.eventType}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Text>
          <Text style={styles.eventDate}>{dateStr}</Text>
        </View>
        <Text style={styles.eventDescription}>{event.description}</Text>
        {event.confirms_prediction_id && (
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedText}>✓ Confirms a prediction</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const [eventList, setEventList] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [type, setType] = useState('career');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const list = await eventsApi.list();
      setEventList(list);
    } catch {}
    setLoading(false);
  };

  const handleLog = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const newEvent = await eventsApi.log({
        type,
        event_date: new Date().toISOString().slice(0, 10),
        description: description.trim(),
      });
      setEventList((prev) => [newEvent, ...prev]);
      setShowLogModal(false);
      setDescription('');
      setType('career');
    } catch {}
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Events</Text>
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => setShowLogModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Log a new event"
        >
          <Text style={styles.logButtonText}>+ Log event</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : eventList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No events logged yet.{'\n'}When something significant happens, log it
            here to build your prediction accuracy record.
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Log event modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log a life event</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typePillRow}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typePill, type === t && styles.typePillActive]}
                  onPress={() => setType(t)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: type === t }}
                >
                  <Text style={[styles.typePillText, type === t && styles.typePillTextActive]}>
                    {DomainIcon[t] ?? '◎'} {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What happened?"
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, !description.trim() && styles.submitButtonDisabled]}
              onPress={handleLog}
              disabled={!description.trim() || submitting}
            >
              {submitting
                ? <ActivityIndicator color={Colors.surface} size="small" />
                : <Text style={styles.submitButtonText}>Log event ✓</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLogModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    minHeight: 44,
    justifyContent: 'center',
  },
  logButtonText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  loader: { flex: 1 },
  emptyState: {
    flex: 1,
    padding: Spacing[8],
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    ...Shadow.card,
  },
  eventCardLeft: {
    marginRight: Spacing[3],
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
  },
  eventIcon: { fontSize: FontSize.xl },
  eventCardBody: { flex: 1 },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  eventType: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  eventDescription: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  confirmedBadge: {
    marginTop: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmedText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    padding: Spacing[6],
    ...Shadow.modal,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing[4],
  },
  typePillRow: {
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
  typePillText: { fontSize: FontSize.sm, color: Colors.muted },
  typePillTextActive: { color: Colors.surface, fontWeight: '600' },
  descInput: {
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
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { color: Colors.surface, fontSize: FontSize.md, fontWeight: '600' },
  cancelButton: {
    paddingVertical: Spacing[2],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButtonText: { fontSize: FontSize.md, color: Colors.muted },
});
