import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/Colors';

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Ionicons name="book-outline" size={80} color={Colors.textMuted} />
        <Text style={styles.emptyText}>Dream archive coming soon</Text>
        <Text style={styles.emptySubtext}>
          Your reconstructed dreams will be saved here for you to explore
        </Text>
      </View>
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
  },
});

