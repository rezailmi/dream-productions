import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface VideoPlayerProps {
  videoUrl?: string;
  width?: number | string;
  height?: number | string;
}

export function VideoPlayer({ videoUrl, width = '100%', height = 250 }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!videoUrl) {
    return (
      <View style={[styles.container, { width, height }, styles.placeholderContainer]}>
        <Ionicons name="videocam-off" size={48} color={Colors.textMuted} />
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (err) {
      console.error('Error toggling video playback:', err);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);

      // Loop video when it ends
      if (status.didJustFinish) {
        videoRef.current?.replayAsync();
      }
    } else if (status.error) {
      console.error('Video playback error:', status.error);
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width, height }]}
      onPress={handlePlayPause}
      activeOpacity={0.9}
    >
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={false}
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(err) => {
          console.error('Video error:', err);
          setError(true);
          setIsLoading(false);
        }}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.textMuted} />
        </View>
      )}

      {!isPlaying && !isLoading && !error && (
        <View style={styles.playButtonContainer}>
          <View style={styles.playButtonBackground}>
            <Ionicons name="play" size={32} color={Colors.primaryText} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundHover,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    backgroundColor: Colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
