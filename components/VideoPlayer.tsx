import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  DimensionValue,
  ViewStyle,
} from 'react-native';
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import { setAudioModeAsync } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface VideoPlayerProps {
  videoUrl?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, width = '100%', height = 250, autoPlay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isBuffered, setIsBuffered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerDimensions = useMemo<ViewStyle>(() => {
    const style: ViewStyle = {};
    if (typeof width !== 'undefined') {
      style.width = width as DimensionValue;
    }
    if (typeof height !== 'undefined') {
      style.height = height as DimensionValue;
    }
    return style;
  }, [width, height]);

  const videoSource: VideoSource = useMemo(() => {
    if (!videoUrl) {
      return null;
    }
    return {
      uri: videoUrl,
      headers: {},
    };
  }, [videoUrl]);

  const player = useVideoPlayer(videoSource, (createdPlayer) => {
    createdPlayer.loop = false;
    createdPlayer.audioMixingMode = 'auto';
  });

  // Configure audio session for proper playback
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch (audioError) {
        console.error('Error configuring audio session:', audioError);
      }
    };

    configureAudio();
  }, []);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => () => clearLoadingTimeout(), []);

  // Set a loading timeout (30 seconds for large videos)
  useEffect(() => {
    if (isLoading && videoUrl) {
      clearLoadingTimeout();
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Video loading timed out after 30 seconds');
        setError(true);
        setErrorMessage('Video loading timed out. The file may be too large or network is slow.');
        setIsLoading(false);
      }, 30000);
    } else {
      clearLoadingTimeout();
    }

    return () => {
      clearLoadingTimeout();
    };
  }, [isLoading, videoUrl]);

  const handleRetry = async () => {
    setError(false);
    setErrorMessage('');
    setIsLoading(true);
    setIsBuffered(false);
    setRetryCount((prev) => prev + 1);
    if (videoSource && player) {
      try {
        await player.replaceAsync(videoSource);
      } catch (replaceError) {
        console.error('Error restarting video:', replaceError);
      }
    }
  };

  if (!videoUrl) {
    return (
      <View style={[styles.container, containerDimensions, styles.placeholderContainer]}>
        <Ionicons name="videocam-off" size={48} color={Colors.textMuted} />
        <Text style={styles.placeholderText}>No video available</Text>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (!player) {
      return;
    }

    try {
      if (isPlaying) {
        player.pause();
        setUserPaused(true); // User manually paused
      } else {
        player.play();
        setUserPaused(false); // User manually played
      }
    } catch (playbackError) {
      console.error('Error toggling video playback:', playbackError);
    }
  };

  // Reset userPaused when scrolling away
  useEffect(() => {
    if (!autoPlay) {
      setUserPaused(false);
    }
  }, [autoPlay]);

  // Handle autoplay based on prop
  useEffect(() => {
    if (!player || !isBuffered) {
      return;
    }

    try {
      if (autoPlay && !isPlaying && !error && !userPaused) {
        // Autoplay when in view (only if user hasn't manually paused)
        player.play();
      } else if (!autoPlay && isPlaying) {
        // Pause when scrolled away
        player.pause();
      }
    } catch (playbackError) {
      console.error('Error controlling video playback:', playbackError);
    }
  }, [autoPlay, player, isBuffered, isPlaying, error, userPaused]);

  useEffect(() => {
    if (!player) {
      return;
    }

    const statusListener = player.addListener('statusChange', ({ status, error: playerError }) => {
      clearLoadingTimeout();

      if (playerError) {
        const errorStr = String(playerError?.message ?? playerError);
        let message = 'Failed to load video';

        if (errorStr.includes('-1001') || errorStr.includes('timed out')) {
          message = 'Video loading timed out. Check your network connection.';
        } else if (errorStr.includes('404')) {
          message = 'Video not found or expired.';
        } else if (errorStr.includes('CORS')) {
          message = 'Video access denied.';
        }

        setErrorMessage(message);
        setError(true);
        setIsLoading(false);
        return;
      }

      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (status === 'readyToPlay') {
        setIsLoading(false);
        setError(false);
        if (!isBuffered) {
          setIsBuffered(true);
        }
      }
    });

    const playingListener = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
      if (playing) {
        setIsLoading(false);
        setError(false);
        clearLoadingTimeout();
      }
    });

    const endListener = player.addListener('playToEnd', () => {
      setIsPlaying(false);
      try {
        player.replay();
      } catch (replayError) {
        console.error('Error replaying video:', replayError);
      }
    });

    return () => {
      statusListener.remove();
      playingListener.remove();
      endListener.remove();
    };
  }, [isBuffered, player]);

  const handleFirstFrameRender = () => {
    setIsLoading(false);
    setError(false);
    clearLoadingTimeout();
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerDimensions]}
      onPress={handlePlayPause}
      activeOpacity={0.9}
    >
      {!error && videoSource && (
        <VideoView
          style={styles.video}
          contentFit="cover"
          player={player}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          nativeControls={false}
          onFirstFrameRender={handleFirstFrameRender}
        />
      )}

      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {error && (
        <TouchableOpacity
          style={styles.errorContainer}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="alert-circle" size={48} color={Colors.textMuted} />
          <Text style={styles.errorText}>{errorMessage || 'Failed to load video'}</Text>
          <View style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
            <Text style={styles.retryText}>Tap to retry</Text>
          </View>
          {retryCount > 0 && (
            <Text style={styles.retryCountText}>Retry attempt: {retryCount}</Text>
          )}
        </TouchableOpacity>
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
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
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
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceActive,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  retryCountText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSubtle,
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
