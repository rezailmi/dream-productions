import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export function GeneratingDreamView() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseAnim }, { rotate }],
          },
        ]}
      >
        <Ionicons name="moon" size={80} color={Colors.primary} />
      </Animated.View>

      {/* Title */}
      <Text style={styles.title}>Generating Your Dream</Text>
      <Text style={styles.subtitle}>
        Analyzing your sleep patterns and creating a unique narrative...
      </Text>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        <Step
          icon="document-text"
          label="Creating Narrative"
          status="complete"
        />
        <Step
          icon="videocam"
          label="Generating Video"
          status="in-progress"
        />
        <Step
          icon="sparkles"
          label="Finalizing Dream"
          status="pending"
        />
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingBar}>
        <Animated.View
          style={[
            styles.loadingProgress,
            {
              opacity: pulseAnim,
            },
          ]}
        />
      </View>

      <Text style={styles.note}>
        This may take a few minutes. You can swipe back to view sleep data while waiting.
      </Text>
    </View>
  );
}

interface StepProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  status: 'complete' | 'in-progress' | 'pending';
}

function Step({ icon, label, status }: StepProps) {
  const getIconColor = () => {
    switch (status) {
      case 'complete':
        return Colors.primary;
      case 'in-progress':
        return Colors.primary;
      case 'pending':
        return Colors.textMuted;
    }
  };

  const getIconName = () => {
    if (status === 'complete') return 'checkmark-circle';
    if (status === 'in-progress') return icon;
    return icon;
  };

  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepIcon,
          status === 'pending' && styles.stepIconPending,
        ]}
      >
        <Ionicons name={getIconName()} size={24} color={getIconColor()} />
      </View>
      <Text
        style={[
          styles.stepLabel,
          status === 'pending' && styles.stepLabelPending,
        ]}
      >
        {label}
      </Text>
      {status === 'in-progress' && (
        <View style={styles.progressDot}>
          <View style={styles.progressDotInner} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceActive,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconPending: {
    backgroundColor: Colors.surfaceSubtle,
    opacity: 0.5,
  },
  stepLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  stepLabelPending: {
    color: Colors.textMuted,
    opacity: 0.5,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surfaceActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  loadingProgress: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  note: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
