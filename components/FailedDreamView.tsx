import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface FailedDreamViewProps {
  error?: string;
  onRetry: () => void;
}

export function FailedDreamView({ error, onRetry }: FailedDreamViewProps) {
  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={80} color="#FF6B6B" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Dream Generation Failed</Text>

      {/* Error Message */}
      <View style={styles.errorBox}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
        <Text style={styles.errorText}>
          {error || 'An unexpected error occurred while generating your dream'}
        </Text>
      </View>

      {/* Possible Causes */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Common Issues:</Text>
        <InfoItem icon="wifi-outline" text="Check your internet connection" />
        <InfoItem icon="server-outline" text="Service may be temporarily unavailable" />
        <InfoItem icon="time-outline" text="Request may have timed out" />
      </View>

      {/* Retry Button */}
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={20} color={Colors.text} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      {/* Help Text */}
      <Text style={styles.helpText}>
        Swipe back to view your sleep data or try generating again
      </Text>
    </View>
  );
}

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function InfoItem({ icon, text }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} />
      <Text style={styles.infoItemText}>{text}</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 32,
    alignItems: 'flex-start',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  infoSection: {
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoItemText: {
    fontSize: 13,
    color: Colors.textSubtle,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    minWidth: 180,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
