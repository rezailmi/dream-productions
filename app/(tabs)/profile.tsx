import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SettingsCard } from '../../components/SettingsCard';
import { useHealthData } from '../../contexts/HealthDataContext';
import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const { dataSource, setDataSource } = useHealthData();

  const handleAppleHealthPress = () => {
    Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.');
  };

  const handleWhoopPress = () => {
    Alert.alert('Coming Soon', 'Whoop integration will be available in a future update.');
  };

  const handleDemoPress = () => {
    setDataSource('demo');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your data sources</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Data Source</Text>
          
          <SettingsCard
            title="Connect Apple Health"
            description="Access sleep data from your Apple Watch"
            icon="fitness"
            status={dataSource === 'apple-health' ? 'active' : 'inactive'}
            onPress={handleAppleHealthPress}
            isActive={dataSource === 'apple-health'}
          />

          <SettingsCard
            title="Connect Whoop"
            description="Sync your Whoop sleep and recovery data"
            icon="body"
            status={dataSource === 'whoop' ? 'active' : 'inactive'}
            onPress={handleWhoopPress}
            isActive={dataSource === 'whoop'}
          />

          <SettingsCard
            title="Use Demo Data"
            description="Try the app with sample sleep data"
            icon="sparkles"
            status={dataSource === 'demo' ? 'active' : 'inactive'}
            onPress={handleDemoPress}
            isActive={dataSource === 'demo'}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Dream Machine v1.0.0</Text>
          <Text style={styles.footerSubtext}>AI-powered dream reconstruction</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 32,
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
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
});

