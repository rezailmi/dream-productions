import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Dream } from '../constants/Types';
import Colors from '../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DreamInsightsViewProps {
  dream: Dream;
  onDelete?: (dreamId: string) => void;
}

export function DreamInsightsView({ dream }: DreamInsightsViewProps) {
  // Mock interpretation data - this would come from AI in the future
  const interpretation = {
    category: dream.title || 'Dream Interpretation',
    content: dream.narrative || 'Your dream holds unique meanings and symbols that reflect your subconscious mind. Dreams often process our daily experiences, emotions, and deeper psychological patterns. This interpretation provides insights into the symbolism and potential significance of your dream experience.',
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Oneiromancy</Text>
        <Text style={styles.pageSubtitle}>Dream interpretation for you.</Text>
      </View>

      {/* Interpretation Card */}
      <View style={styles.card}>
        <ScrollView
          style={styles.cardScrollView}
          contentContainerStyle={styles.cardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.interpretationTitle}>{interpretation.category}</Text>
          <Text style={styles.interpretationContent}>{interpretation.content}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.background,
    paddingHorizontal: 45,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: -0.25,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#ccc',
    letterSpacing: -0.1,
    lineHeight: 19.2,
  },
  card: {
    flex: 1,
    backgroundColor: '#fefdf2',
    borderRadius: 8,
    borderWidth: 18,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    padding: 22,
  },
  interpretationTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: '#202020',
    lineHeight: 32 * 0.8,
    letterSpacing: -0.075,
    marginBottom: 20,
  },
  interpretationContent: {
    fontSize: 16,
    color: '#202020',
    lineHeight: 19.2,
    letterSpacing: -0.1,
  },
});
