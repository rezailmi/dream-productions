import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import { VideoPlayer } from './VideoPlayer';
import Colors from '../constants/Colors';

interface DreamCardProps {
  dream: Dream;
  onPress?: () => void;
}

export function DreamCard({ dream, onPress }: DreamCardProps) {
  const isGenerating = dream.status === 'generating';
  const hasFailed = dream.status === 'failed';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isGenerating}
    >
      <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          {isGenerating && (
            <View style={styles.generatingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.generatingText}>Generating your dream...</Text>
            </View>
          )}

          {!isGenerating && (
            <>
              <View style={styles.header}>
                <View style={styles.moodBadge}>
                  <Ionicons name="sparkles" size={16} color={Colors.primaryText} />
                  <Text style={styles.moodText}>{dream.mood}</Text>
                </View>
                <Text style={styles.date}>
                  {new Date(dream.generatedAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.title}>{dream.title}</Text>

              {dream.videoUrl && (
                <View style={styles.videoContainer}>
                  <VideoPlayer videoUrl={dream.videoUrl} height={200} />
                </View>
              )}

              <ScrollView
                style={styles.narrativeScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.narrative}>{dream.narrative}</Text>
              </ScrollView>

              {dream.scenes.length > 0 && (
                <View style={styles.scenesContainer}>
                  <Text style={styles.scenesTitle}>Dream Scenes</Text>
                  {dream.scenes.map((scene) => (
                    <View key={scene.sceneNumber} style={styles.sceneItem}>
                      <View style={styles.sceneNumber}>
                        <Text style={styles.sceneNumberText}>{scene.sceneNumber}</Text>
                      </View>
                      <Text style={styles.sceneDescription} numberOfLines={2}>
                        {scene.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {hasFailed && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={Colors.textMuted} />
                  <Text style={styles.errorText}>
                    {dream.error || 'Failed to generate dream'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    padding: 20,
  },
  generatingOverlay: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceActive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryText,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 16,
  },
  narrativeScroll: {
    maxHeight: 150,
    marginBottom: 16,
  },
  narrative: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSubtle,
  },
  scenesContainer: {
    marginTop: 8,
  },
  scenesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sceneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sceneNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceActive,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sceneNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryText,
  },
  sceneDescription: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.inactiveSubtle,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textMuted,
    flex: 1,
  },
});
