import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SettingsCard } from '../../components/SettingsCard';
import { useHealthData } from '../../contexts/HealthDataContext';
import Colors from '../../constants/Colors';

// Ensure WebBrowser cleanup
WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';

// Configure screen options for Expo Router
export const unstable_settings = {
  headerShown: false,
};

export default function ProfileScreen() {
  const { dataSource, setDataSource, whoopAccessToken, setWhoopAccessToken } = useHealthData();

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

  const handleAppleHealthPress = () => {
    Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.');
  };

  const handleWhoopPress = async () => {
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
  };

  const handleDemoPress = () => {
    setDataSource('demo');
  };

  return (
    <View style={styles.container}>
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

        <View style={styles.footer}>
          <Text style={styles.versionText}>Dream Machine v1.0.0</Text>
          <Text style={styles.footerSubtext}>AI-powered dream reconstruction</Text>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 60,
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

