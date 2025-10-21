import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { CollectionView } from '../../components/CollectionView';
import { SettingsCard } from '../../components/SettingsCard';
import { SegmentedControl, SegmentItem } from '../../components/SegmentedControl';
import { useHealthData } from '../../contexts/HealthDataContext';
import Colors from '../../constants/Colors';

// Ensure WebBrowser cleanup
WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';

// Configure screen options for Expo Router
export const unstable_settings = {
  headerShown: false,
};

// Segmented control items (memoized outside component)
const PROFILE_SEGMENT_ITEMS: SegmentItem[] = [
  { icon: 'bulb' },
  { icon: 'settings' },
];

export default function ProfileScreen() {
  const { dataSource, setDataSource, whoopAccessToken, setWhoopAccessToken, clearAllData, dreams, fetchWhoopSleepData } = useHealthData();
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Collection, 1 = My Data
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Handle OAuth callback via deep linking
    const handleUrl = ({ url }: { url: string }) => {
      const params = new URL(url).searchParams;
      const accessToken = params.get('accessToken');
      const error = params.get('message');

      if (error) {
        Alert.alert('Authentication Error', error);
      } else if (accessToken) {
        setWhoopAccessToken(accessToken);
        setDataSource('whoop');
        Alert.alert('Success', 'Connected to WHOOP!');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, [setWhoopAccessToken, setDataSource]);

  const handleAppleHealthPress = useCallback(() => {
    Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.');
  }, []);

  const handleWhoopPress = useCallback(async () => {
    if (whoopAccessToken) {
      // Already connected, offer to disconnect
      Alert.alert(
        'WHOOP Connected',
        'You are already connected to WHOOP. Would you like to disconnect?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setWhoopAccessToken(null);
              if (dataSource === 'whoop') {
                setDataSource('demo');
              }
            },
          },
        ]
      );
      return;
    }

    // Start OAuth flow
    try {
      const authUrl = `${API_BASE_URL}/auth/whoop`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'exp://localhost:8081/--/auth');

      if (result.type === 'success' && result.url) {
        // Extract tokens from the callback URL
        console.log('OAuth completed, processing URL:', result.url);
        const params = new URL(result.url).searchParams;
        const accessToken = params.get('accessToken');
        const error = params.get('message');

        if (error) {
          Alert.alert('Authentication Error', error);
        } else if (accessToken) {
          console.log('Access token received, saving...');
          await setWhoopAccessToken(accessToken);
          setDataSource('whoop');
          Alert.alert('Success', 'Connected to WHOOP!');
        } else {
          Alert.alert('Error', 'No access token received from WHOOP');
        }
      } else if (result.type === 'cancel') {
        Alert.alert('Authentication Cancelled', 'WHOOP authentication was cancelled.');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      Alert.alert('Error', 'Failed to start WHOOP authentication.');
    }
  }, [whoopAccessToken, setWhoopAccessToken, setDataSource, dataSource]);

  const handleDemoPress = useCallback(() => {
    setDataSource('demo');
  }, [setDataSource]);

  const handleRefreshWhoopData = useCallback(async () => {
    if (!whoopAccessToken) {
      Alert.alert('Not Connected', 'Please connect your WHOOP account first.');
      return;
    }

    try {
      setIsRefreshing(true);

      // Fetch last 30 days of WHOOP data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      await fetchWhoopSleepData(startDate.toISOString(), endDate.toISOString());

      Alert.alert('Success', 'WHOOP data refreshed successfully!');
    } catch (error: any) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh WHOOP data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [whoopAccessToken, fetchWhoopSleepData]);

  const handleClearAllData = useCallback(() => {
    const dreamCount = dreams.length;

    Alert.alert(
      'Clear All Data',
      `This will permanently delete ${dreamCount} dream${dreamCount !== 1 ? 's' : ''} and disconnect your WHOOP account. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  }, [dreams.length, clearAllData]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My profile</Text>

        <SegmentedControl
          items={PROFILE_SEGMENT_ITEMS}
          selectedIndex={selectedTab}
          onIndexChange={setSelectedTab}
          width={120}
          height={36}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 0 ? (
          <CollectionView dreams={dreams} />
        ) : (
          <View style={styles.dataView}>
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
                title={whoopAccessToken ? "WHOOP Connected" : "Connect Whoop"}
                description={whoopAccessToken ? "Tap to disconnect or sync data" : "Sync your Whoop sleep and recovery data"}
                icon="body"
                status={whoopAccessToken ? 'active' : 'inactive'}
                onPress={handleWhoopPress}
                isActive={whoopAccessToken !== null}
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Management</Text>

              {whoopAccessToken && (
                <SettingsCard
                  title="Refresh WHOOP Data"
                  description={isRefreshing ? "Fetching latest sleep data..." : "Sync latest sleep sessions from WHOOP"}
                  icon="refresh"
                  status={isRefreshing ? "active" : "inactive"}
                  onPress={handleRefreshWhoopData}
                  isActive={false}
                />
              )}

              <SettingsCard
                title="Clear All Data"
                description={`Delete ${dreams.length} dream${dreams.length !== 1 ? 's' : ''} and reset to demo mode`}
                icon="trash"
                status="inactive"
                onPress={handleClearAllData}
                isActive={false}
                isDanger={true}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.versionText}>Dream Machine v1.0.0</Text>
              <Text style={styles.footerSubtext}>AI-powered dream reconstruction</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '510',
    color: Colors.text,
    letterSpacing: -0.25,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  dataView: {
    flex: 1,
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
