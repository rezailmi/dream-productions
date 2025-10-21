import React, { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SleepSession, WhoopSleepRecord } from '../constants/Types';
import { formatDuration, formatTime, formatDateTimeISO, formatDateAndTimeParts, formatTimezoneGMT } from '../utils/dateHelpers';
import Colors from '../constants/Colors';

type SleepDataCardProps = {
  sleepSession: SleepSession | WhoopSleepRecord;
  isWhoopData: boolean;
  showGenerateButton?: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

type MetricRowProps = {
  label: string;
  value: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

type Section = {
  label: string;
  metrics?: { label: string; value: string }[];
  rawJson?: unknown;
  isDebug?: boolean; // hidden by default, revealed via toggle
};

const MetricRow = ({ label, value, icon }: MetricRowProps) => (
  <View style={styles.metricRow}>
    <View style={styles.metricLabelWrapper}>
      {icon && <Ionicons name={icon} size={16} color={Colors.textMuted} style={styles.metricIcon} />}
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const isSleepSessionRecord = (
  data: SleepSession | WhoopSleepRecord,
): data is SleepSession => {
  return 'remCycles' in data;
};

const minutesFromMilliseconds = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value / 60000);
};

const formatPercentage = (value?: number) => {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
};

const formatMinutes = (value?: number) => {
  if (value == null || Number.isNaN(value)) return '—';
  return formatDuration(Math.round(value));
};

const stringifyValue = (value: unknown): string => {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const formatDateTimeSafe = (
  primaryISO?: string,
  fallbackParts?: { date: string; time: string },
  raw?: string,
) => {
  const formatted = formatDateTimeISO(primaryISO);
  if (formatted) return formatted;
  if (fallbackParts) return formatDateAndTimeParts(fallbackParts.date, fallbackParts.time);
  if (raw) return raw; // show raw value instead of dash when rendering fails
  return '—';
};

const formatSleepNeeded = (millis?: number) => {
  if (millis == null) return '—';
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.round((millis % 3600000) / 60000);
  if (hours === 0 && minutes === 0) return '0m';
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const buildWhoopSections = (record: WhoopSleepRecord, mappedFallback?: SleepSession): Section[] => {
  const summary = record.score?.stage_summary;
  const sleepNeeded = record.score?.sleep_needed;

  const mappedParts = mappedFallback
    ? { date: mappedFallback.date, start: mappedFallback.startTime, end: mappedFallback.endTime }
    : undefined;

  // Calculate end date: if endTime < startTime, sleep crossed midnight (add 1 day)
  const calculateEndDate = (startDate: string, startTime: string, endTime: string): string => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // If end is earlier than start, sleep crossed midnight
    if (endMinutes < startMinutes) {
      const date = new Date(startDate + 'T00:00:00');
      date.setDate(date.getDate() + 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return startDate;
  };

  const endDate = mappedParts ? calculateEndDate(mappedParts.date, mappedParts.start, mappedParts.end) : undefined;

  const startDisplay = formatDateTimeSafe(
    record.start,
    mappedParts ? { date: mappedParts.date, time: mappedParts.start } : undefined,
    record.start,
  );
  const endDisplay = formatDateTimeSafe(
    record.end,
    endDate && mappedParts ? { date: endDate, time: mappedParts.end } : undefined,
    record.end,
  );
  const recordedDisplay = formatDateTimeSafe(
    record.created_at,
    mappedParts ? { date: mappedParts.date, time: mappedParts.start } : undefined,
    record.created_at || record.start,
  );
  const timezoneDisplay =
    formatTimezoneGMT(record.timezone_offset, record.start) ?? record.timezone_offset ?? '—';

  const inBedMinutes = summary
    ? minutesFromMilliseconds(summary.total_in_bed_time_milli)
    : mappedFallback?.totalDurationMinutes ?? null;
  const awakeMinutes = summary
    ? minutesFromMilliseconds(summary.total_awake_time_milli)
    : mappedFallback?.stages
        .filter((stage) => stage.type === 'Awake')
        .reduce((acc, stage) => acc + stage.durationMinutes, 0) ?? null;

  const lightMinutes = summary ? minutesFromMilliseconds(summary.total_light_sleep_time_milli) : undefined;
  const deepMinutes = summary ? minutesFromMilliseconds(summary.total_slow_wave_sleep_time_milli) : mappedFallback
    ? mappedFallback.stages.filter((stage) => stage.type === 'Deep').reduce((acc, stage) => acc + stage.durationMinutes, 0)
    : undefined;
  const remMinutes = summary ? minutesFromMilliseconds(summary.total_rem_sleep_time_milli) : mappedFallback
    ? mappedFallback.remCycles.reduce((acc, cycle) => acc + cycle.durationMinutes, 0)
    : undefined;
  const disturbanceCount = summary?.disturbance_count ?? mappedFallback?.wakeUps;

  return [
    {
      label: 'Entry',
      metrics: [
        { label: 'Source', value: record.nap ? 'WHOOP Nap' : 'WHOOP Sleep' },
        { label: 'Recorded', value: recordedDisplay },
        { label: 'Timezone', value: timezoneDisplay },
        { label: 'Score State', value: record.score_state ?? '—' },
      ],
    },
    {
      label: 'Duration',
      metrics: [
        { label: 'Start', value: startDisplay },
        { label: 'End', value: endDisplay },
        { label: 'In Bed', value: inBedMinutes != null ? formatMinutes(inBedMinutes) : '—' },
        { label: 'Awake', value: awakeMinutes != null ? formatMinutes(awakeMinutes) : '—' },
      ],
    },
    {
      label: 'Sleep Quality',
      metrics: [
        { label: 'Performance', value: formatPercentage(record.score?.sleep_performance_percentage) },
        { label: 'Consistency', value: formatPercentage(record.score?.sleep_consistency_percentage) },
        { label: 'Efficiency', value: formatPercentage(record.score?.sleep_efficiency_percentage) },
        { label: 'Respiratory Rate', value: record.score?.respiratory_rate ? `${record.score.respiratory_rate.toFixed(1)} rpm` : '—' },
      ],
    },
    {
      label: 'Sleep Needed',
      metrics: [
        { label: 'Baseline', value: formatSleepNeeded(sleepNeeded?.baseline_milli) },
        { label: 'From Sleep Debt', value: formatSleepNeeded(sleepNeeded?.need_from_sleep_debt_milli) },
        { label: 'From Strain', value: formatSleepNeeded(sleepNeeded?.need_from_recent_strain_milli) },
        { label: 'From Recent Nap', value: formatSleepNeeded(sleepNeeded?.need_from_recent_nap_milli) },
      ],
    },
    {
      label: 'Stage Summary',
      metrics: [
        { label: 'Light (Core)', value: lightMinutes != null ? formatMinutes(lightMinutes) : '—' },
        { label: 'Deep', value: deepMinutes != null ? formatMinutes(deepMinutes) : '—' },
        { label: 'REM', value: remMinutes != null ? formatMinutes(remMinutes) : '—' },
        { label: 'Disturbances', value: disturbanceCount != null ? String(disturbanceCount) : '—' },
      ],
    },
    {
      label: 'Raw WHOOP JSON',
      rawJson: record,
      isDebug: true,
    },
    {
      label: 'Raw WHOOP Data',
      metrics: [
        { label: 'id', value: stringifyValue(record.id) },
        { label: 'cycle_id', value: stringifyValue(record.cycle_id) },
        { label: 'v1_id', value: stringifyValue(record.v1_id) },
        { label: 'user_id', value: stringifyValue(record.user_id) },
        { label: 'created_at', value: stringifyValue(record.created_at) },
        { label: 'updated_at', value: stringifyValue(record.updated_at) },
        { label: 'start', value: stringifyValue(record.start) },
        { label: 'end', value: stringifyValue(record.end) },
        { label: 'timezone_offset', value: stringifyValue(record.timezone_offset) },
        { label: 'nap', value: stringifyValue(record.nap) },
        { label: 'score_state', value: stringifyValue(record.score_state) },
        { label: 'respiratory_rate', value: stringifyValue(record.score?.respiratory_rate) },
        { label: 'performance_%', value: stringifyValue(record.score?.sleep_performance_percentage) },
        { label: 'consistency_%', value: stringifyValue(record.score?.sleep_consistency_percentage) },
        { label: 'efficiency_%', value: stringifyValue(record.score?.sleep_efficiency_percentage) },
        { label: 'stage_summary', value: stringifyValue(record.score?.stage_summary) },
        { label: 'sleep_needed', value: stringifyValue(record.score?.sleep_needed) },
      ],
      isDebug: true,
    },
  ];
};

export const SleepDataCard = React.memo<SleepDataCardProps>(({
  sleepSession,
  isWhoopData,
  showGenerateButton = false,
  onGenerate,
  isGenerating = false
}) => {
  const canGenerate = isSleepSessionRecord(sleepSession);
  const shouldRenderRaw = isWhoopData || !canGenerate;

  if (shouldRenderRaw) {
    const sections = useMemo(
      () => buildWhoopSections(sleepSession as WhoopSleepRecord, canGenerate ? (sleepSession as SleepSession) : undefined),
      [sleepSession, canGenerate]
    );

    const [showMissing, setShowMissing] = useState(false);

    const { visibleSections, hiddenCount } = useMemo(() => {
      let count = 0;
      const filtered = sections
        .map((section) => {
          if (!showMissing && section.isDebug) {
            // Count all items hidden in this debug section (JSON block counts as 1)
            count += (section.metrics ? section.metrics.length : 0) + (section.rawJson !== undefined ? 1 : 0);
            return { ...section, metrics: [], rawJson: undefined } as Section; // will be filtered out below
          }
          if (!section.metrics) return section;
          const missing = section.metrics.filter((m) => m.value === '—');
          count += missing.length;
          if (showMissing) return section;
          const present = section.metrics.filter((m) => m.value !== '—');
          return { ...section, metrics: present };
        })
        .filter((s) => {
          if (s.metrics && s.metrics.length === 0 && s.rawJson === undefined) return false;
          return true;
        });
      return { visibleSections: filtered, hiddenCount: count };
    }, [sections, showMissing]);

    return (
      <BlurView intensity={10} tint="dark" style={styles.containerRaw}>
        <View style={styles.headerRow}>
          <Ionicons name="fitness" size={16} color={Colors.primary} />
          <Text style={styles.rawTitle}>WHOOP Sleep Entry</Text>
        </View>
        <ScrollView style={styles.rawScroll} showsVerticalScrollIndicator={false}>
          {visibleSections.map((section) => (
            <View key={section.label} style={styles.groupCard}>
              <Text style={styles.groupLabel}>{section.label}</Text>
              {section.metrics && section.metrics.map((metric) => (
                <MetricRow key={metric.label} label={metric.label} value={metric.value} />
              ))}
              {section.rawJson !== undefined && (
                <View style={styles.codeContainer}>
                  <Text selectable style={styles.codeText}>
                    {JSON.stringify(section.rawJson, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setShowMissing((v) => !v)}
            style={styles.toggleMissingButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showMissing ? 'eye-off' : 'eye'}
              size={16}
              color={Colors.textMuted}
            />
            <Text style={styles.toggleMissingText}>
              {showMissing ? 'Hide' : 'Show'} hidden details{hiddenCount > 0 ? ` (${hiddenCount})` : ''}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {showGenerateButton && (
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={onGenerate}
            disabled={isGenerating}
            activeOpacity={isGenerating ? 1 : 0.7}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#000000" />
                <Text style={styles.generateButtonText}>Generate Dream</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </BlurView>
    );
  }

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
          activeOpacity={isGenerating ? 1 : 0.7}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#000000" />
              <Text style={styles.generateButtonText}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </BlurView>
  );
});

SleepDataCard.displayName = 'SleepDataCard';

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
    backgroundColor: Colors.surface,
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
    color: '#000000',
  },
  generateButtonTextMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  containerRaw: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rawTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  rawScroll: {
    maxHeight: 420,
  },
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  toggleMissingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    marginTop: 6,
  },
  toggleMissingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  metricLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    marginRight: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  codeContainer: {
    backgroundColor: Platform.select({ ios: 'rgba(0,0,0,0.3)', android: 'rgba(0,0,0,0.3)', default: 'rgba(0,0,0,0.3)' }),
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    color: Colors.textSubtle,
  },
});
