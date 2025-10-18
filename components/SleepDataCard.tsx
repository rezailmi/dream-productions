import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SleepSession } from '../constants/Types';
import { formatDuration, formatTime } from '../utils/dateHelpers';
import Colors from '../constants/Colors';

interface SleepDataCardProps {
  sleepSession: SleepSession;
  isWhoopData: boolean;
  showGenerateButton?: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function SleepDataCard({
  sleepSession,
  isWhoopData,
  showGenerateButton = false,
  onGenerate,
  isGenerating = false
}: SleepDataCardProps) {
  const getQualityStars = (quality: string) => {
    const stars = {
      excellent: 4,
      good: 3,
      fair: 2,
      poor: 1,
    }[quality] || 2;

    return Array(4)
      .fill(0)
      .map((_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={16}
          color={i < stars ? Colors.primary : Colors.textMuted}
        />
      ));
  };

  const getQualityLabel = (quality: string) => {
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  const totalREMDuration = sleepSession.remCycles.reduce((acc, cycle) => acc + cycle.durationMinutes, 0);
  const totalDeepDuration = sleepSession.stages
    .filter((s) => s.type === 'Deep')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <BlurView intensity={10} tint="dark" style={styles.container}>
      {/* Data Source Badge */}
      <View style={styles.badge}>
        <Ionicons
          name={isWhoopData ? 'fitness' : 'sparkles'}
          size={12}
          color={isWhoopData ? Colors.primary : Colors.textMuted}
        />
        <Text style={[styles.badgeText, isWhoopData && styles.badgeTextWHOOP]}>
          {isWhoopData ? 'WHOOP Data' : 'Demo Data'}
        </Text>
      </View>

      {/* Sleep Duration - Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.duration}>{formatDuration(sleepSession.totalDurationMinutes)}</Text>
        <View style={styles.qualityRow}>
          {getQualityStars(sleepSession.sleepQuality)}
          <Text style={styles.qualityText}>{getQualityLabel(sleepSession.sleepQuality)} Sleep</Text>
        </View>
        <Text style={styles.timeRange}>
          {formatTime(sleepSession.startTime)} - {formatTime(sleepSession.endTime)}
        </Text>
      </View>

      {/* REM Cycles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>REM Cycles</Text>
        </View>
        <View style={styles.remCycles}>
          {sleepSession.remCycles.map((cycle) => (
            <View
              key={cycle.cycleNumber}
              style={[
                styles.remCycle,
                cycle.isPrimaryDream && styles.primaryCycle,
                cycle.isInterrupted && styles.interruptedCycle,
              ]}
            >
              <Text style={styles.cycleNumber}>{cycle.cycleNumber}</Text>
              <Text style={styles.cycleDuration}>{cycle.durationMinutes}m</Text>
            </View>
          ))}
        </View>
        <Text style={styles.remTotal}>Total REM: {formatDuration(totalREMDuration)}</Text>
      </View>

      {/* Heart Rate */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={18} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Heart Rate</Text>
        </View>
        <View style={styles.heartRateRow}>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>{sleepSession.heartRateData.averageBPM}</Text>
            <Text style={styles.hrLabel}>Avg BPM</Text>
          </View>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>{sleepSession.heartRateData.restingBPM}</Text>
            <Text style={styles.hrLabel}>Resting</Text>
          </View>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>
              {sleepSession.heartRateData.minBPM}-{sleepSession.heartRateData.maxBPM}
            </Text>
            <Text style={styles.hrLabel}>Range</Text>
          </View>
        </View>
        {sleepSession.heartRateData.spikes.length > 0 && (
          <Text style={styles.spikeNote}>
            {sleepSession.heartRateData.spikes.length} significant{' '}
            {sleepSession.heartRateData.spikes.length === 1 ? 'spike' : 'spikes'} recorded
          </Text>
        )}
      </View>

      {/* Sleep Stages Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bed" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Sleep Stages</Text>
        </View>
        <View style={styles.stagesRow}>
          <View style={styles.stageStat}>
            <View style={[styles.stageIndicator, { backgroundColor: '#4A90E2' }]} />
            <Text style={styles.stageLabel}>Deep</Text>
            <Text style={styles.stageValue}>{formatDuration(totalDeepDuration)}</Text>
          </View>
          <View style={styles.stageStat}>
            <View style={[styles.stageIndicator, { backgroundColor: '#9B59B6' }]} />
            <Text style={styles.stageLabel}>REM</Text>
            <Text style={styles.stageValue}>{formatDuration(totalREMDuration)}</Text>
          </View>
          <View style={styles.stageStat}>
            <View style={[styles.stageIndicator, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.stageLabel}>Wake-ups</Text>
            <Text style={styles.stageValue}>{sleepSession.wakeUps}</Text>
          </View>
        </View>
      </View>

      {/* Generate Button */}
      {showGenerateButton && (
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={onGenerate}
          disabled={isGenerating}
        >
          <Ionicons name="sparkles" size={18} color={Colors.text} />
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  badgeTextWHOOP: {
    color: Colors.primary,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  duration: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -2,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timeRange: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginTop: 8,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  remCycles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  remCycle: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primaryCycle: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceActive,
  },
  interruptedCycle: {
    opacity: 0.5,
  },
  cycleNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cycleDuration: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  remTotal: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginTop: 4,
  },
  heartRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hrStat: {
    alignItems: 'center',
  },
  hrValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  hrLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  spikeNote: {
    fontSize: 12,
    color: Colors.textSubtle,
    fontStyle: 'italic',
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageStat: {
    alignItems: 'center',
    flex: 1,
  },
  stageIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  stageLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  stageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});
