import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useHealthData } from '../../contexts/HealthDataContext';
import { DreamCard } from '../../components/DreamCard';
import Colors from '../../constants/Colors';

export default function HomeScreen() {
  const { dreams, isGeneratingDream, generateDream, sleepSessions } = useHealthData();

  const handleGenerateDemo = async () => {
    if (sleepSessions.length > 0) {
      await generateDream(sleepSessions[0].id);
    }
  };

  if (dreams.length === 0 && !isGeneratingDream) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Ionicons name="moon-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Your dreams will appear here</Text>
          <Text style={styles.emptySubtext}>
            Generate your first dream from sleep data
          </Text>

          <TouchableOpacity style={styles.demoButton} onPress={handleGenerateDemo}>
            <Ionicons name="sparkles" size={20} color={Colors.text} />
            <Text style={styles.demoButtonText}>Generate Demo Dream</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Dreams</Text>
          <Text style={styles.headerSubtitle}>{dreams.length} dream{dreams.length !== 1 ? 's' : ''} generated</Text>
        </View>

        {isGeneratingDream && (
          <View style={styles.generatingBanner}>
            <ActivityIndicator size="small" color={Colors.primaryText} />
            <Text style={styles.generatingText}>Generating dream...</Text>
          </View>
        )}

        {dreams.map((dream) => (
          <DreamCard key={dream.id} dream={dream} />
        ))}

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateDemo}>
          <Ionicons name="add-circle" size={24} color={Colors.primaryText} />
          <Text style={styles.generateButtonText}>Generate Another Dream</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSubtle,
  },
  generatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceActive,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  generatingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
});

