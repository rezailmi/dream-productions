import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dream } from '../constants/Types';
import { VideoPlayer } from './VideoPlayer';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DreamVideoViewProps {
  dream: Dream;
  autoPlay?: boolean;
}

export function DreamVideoView({ dream, autoPlay = false }: DreamVideoViewProps) {
  if (!dream.videoUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="videocam-off-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.errorText}>Video unavailable</Text>
          <Text style={styles.errorSubtext}>
            Generation may have failed. Try generating again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <VideoPlayer
          videoUrl={dream.videoUrl}
          width={SCREEN_WIDTH - 40}
          height={SCREEN_HEIGHT * 0.6}
          autoPlay={autoPlay}
        />
        {/* Vignette Overlay */}
        <View style={styles.vignetteContainer} pointerEvents="none">
          {/* Top gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.vignetteTop}
            pointerEvents="none"
          />
          {/* Bottom gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.vignetteBottom}
            pointerEvents="none"
          />
          {/* Left gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.vignetteLeft}
            pointerEvents="none"
          />
          {/* Right gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.vignetteRight}
            pointerEvents="none"
          />
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{dream.title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 15,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 22,
  },
  videoWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  vignetteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '25%',
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '25%',
  },
  titleContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
});
