import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import { VideoPlayer } from './VideoPlayer';
import Colors from '../constants/Colors';

interface DreamCardProps {
  dream: Dream;
  onPress?: () => void;
  onDelete?: (dreamId: string) => void;
}

export function DreamCard({ dream, onPress, onDelete }: DreamCardProps) {
  const isGenerating = dream.status === 'generating';
  const hasFailed = dream.status === 'failed';

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
                <View style={styles.headerRight}>
                  <Text style={styles.date}>
                    {new Date(dream.generatedAt).toLocaleDateString()}
                  </Text>
                  {onDelete && (
                    <TouchableOpacity
                      onPress={handleDelete}
                      style={styles.deleteButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.title}>{dream.title}</Text>

              {dream.videoUrl ? (
                <View style={styles.videoContainer}>
                  <VideoPlayer videoUrl={dream.videoUrl} height={200} />
                </View>
              ) : (
                <View style={styles.videoErrorContainer}>
                  <Ionicons name="videocam-off-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.videoErrorText}>Video unavailable</Text>
                  <Text style={styles.videoErrorSubtext}>
                    Generation may have failed. Try generating again.
                  </Text>
                </View>
              )}

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
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    opacity: 0.8,
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
  videoErrorContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 200,
  },
  videoErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 12,
  },
  videoErrorSubtext: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginTop: 4,
    textAlign: 'center',
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
