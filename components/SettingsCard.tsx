import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'active' | 'inactive';
  onPress: () => void;
  isActive?: boolean;
}

export const SettingsCard = ({
  title,
  description,
  icon,
  status,
  onPress,
  isActive = false,
}: SettingsCardProps) => {
  const statusColor = status === 'active' ? Colors.success : Colors.inactive;
  const statusText = status === 'active' ? 'Active' : 'Not Connected';
  
  const CardContainer = Platform.OS === 'ios' ? BlurView : View;
  const blurProps = Platform.OS === 'ios' ? { intensity: 10, tint: 'dark' as const } : {};

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <CardContainer
        {...blurProps}
        style={[
          styles.card,
          isActive && styles.cardActive,
          Platform.OS !== 'ios' && styles.cardAndroid,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={icon} size={28} color={statusColor} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}25` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
      </CardContainer>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
  },
  cardAndroid: {
    backgroundColor: Colors.surface,
  },
  cardActive: {
    borderColor: Colors.primaryText,
    backgroundColor: Colors.surfaceActive,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

