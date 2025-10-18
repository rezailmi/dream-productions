import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import Colors from '../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DreamInsightsViewProps {
  dream: Dream;
  onDelete?: (dreamId: string) => void;
}

export function DreamInsightsView({ dream, onDelete }: DreamInsightsViewProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(dream.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      <BlurView intensity={10} tint="dark" style={styles.card}>
        {/* Mood badge and date */}
        <View style={styles.header}>
          <View style={styles.moodBadge}>
            <Ionicons name="sparkles" size={16} color={Colors.primaryText} />
            <Text style={styles.moodText}>{dream.mood}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(dream.generatedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{dream.title}</Text>

        {/* Narrative */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Narrative</Text>
          <Text style={styles.narrative}>{dream.narrative}</Text>
        </View>

        {/* Emotional context */}
        {dream.emotionalContext && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotional Context</Text>
            <Text style={styles.contextText}>{dream.emotionalContext}</Text>
          </View>
        )}

        {/* Scenes */}
        {dream.scenes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dream Scenes</Text>
            {dream.scenes.map((scene) => (
              <View key={scene.sceneNumber} style={styles.sceneItem}>
                <View style={styles.sceneNumber}>
                  <Text style={styles.sceneNumberText}>{scene.sceneNumber}</Text>
                </View>
                <View style={styles.sceneContent}>
                  <Text style={styles.sceneDescription}>{scene.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delete button */}
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.deleteText}>Delete Dream</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceActive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  moodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryText,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 34,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  narrative: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  contextText: {
    fontSize: 15,
    color: Colors.textSubtle,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  sceneItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  sceneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceActive,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sceneNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryText,
  },
  sceneContent: {
    flex: 1,
  },
  sceneDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSubtle,
    marginTop: 16,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
