import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated, Image, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import Colors from '../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DreamInsightsViewProps {
  dream: Dream;
  onDelete?: (dreamId: string) => void;
}

export const DreamInsightsView = React.memo<DreamInsightsViewProps>(({ dream }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Only show if oneiromancy prediction exists
  if (!dream.prediction) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Dream Prediction</Text>
          <Text style={styles.emptySubtext}>
            Oneiromancy prediction was not generated for this dream.
          </Text>
        </View>
      </View>
    );
  }

  const prediction = dream.prediction;

  // Map category to image
  const getCategoryImage = (category: string) => {
    const categoryMap: { [key: string]: any } = {
      'Wealth': require('../assets/oneiromancy/wealth.png'),
      'Love': require('../assets/oneiromancy/love.png'),
      'Career': require('../assets/oneiromancy/career.png'),
      'Danger': require('../assets/oneiromancy/danger.png'),
      'Health': require('../assets/oneiromancy/health.png'),
      'Family': require('../assets/oneiromancy/family.png'),
      'Animals': require('../assets/oneiromancy/animals.png'),
      'Water': require('../assets/oneiromancy/water.png'),
      'Food': require('../assets/oneiromancy/food.png'),
      'Travel': require('../assets/oneiromancy/travel.png'),
      'Spiritual': require('../assets/oneiromancy/spritual.png'),
      'Death': require('../assets/oneiromancy/transformation.png'),
    };
    return categoryMap[category] || require('../assets/oneiromancy/health.png');
  };

  const categoryImage = getCategoryImage(prediction.category);
  const categoryTitle = prediction.category || dream.title || 'Dream Interpretation';

  const handleFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Interpolate rotation values for 3D effect
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  // Scale animation for depth effect
  const scale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Oneiromancy</Text>
        <Text style={styles.pageSubtitle}>Dream interpretation for you.</Text>
      </View>

      {/* Flippable Card Container */}
      <View style={styles.cardContainer}>
        {/* Front Side - Image */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            {
              transform: [
                { perspective: 1200 },
                { rotateY: frontRotateY },
                { scale: scale },
              ],
              opacity: frontOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={handleFlip}
            activeOpacity={0.9}
          >
            <Image 
              source={categoryImage} 
              style={styles.cardImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Back Side - Interpretation Text */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            {
              transform: [
                { perspective: 1200 },
                { rotateY: backRotateY },
                { scale: scale },
              ],
              opacity: backOpacity,
            },
          ]}
        >
          <View style={styles.card}>
            {/* Tap to flip hint at top */}
            <TouchableOpacity
              style={styles.flipHintArea}
              onPress={handleFlip}
              activeOpacity={0.7}
            >
              <View style={styles.flipHint}>
                <Ionicons name="sync" size={16} color="#999" />
                <Text style={styles.flipHintText}>Tap to flip</Text>
              </View>
            </TouchableOpacity>

            <ScrollView
              style={styles.cardScrollView}
              contentContainerStyle={styles.cardScrollContent}
              showsVerticalScrollIndicator={true}
              scrollIndicatorInsets={{ right: -8 }}
            >
              <Text style={styles.interpretationTitle}>{categoryTitle}</Text>

              {/* Summary */}
              <Text style={styles.sectionLabel}>Summary</Text>
              <Text style={styles.interpretationContent}>{prediction.summary}</Text>

              {/* Themes */}
              {prediction.themes && prediction.themes.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Themes</Text>
                  <View style={styles.tagContainer}>
                    {prediction.themes.map((theme, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Symbols */}
              {prediction.symbols && prediction.symbols.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Symbols</Text>
                  <View style={styles.tagContainer}>
                    {prediction.symbols.map((symbol, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{symbol}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Advice */}
              {prediction.advice && (
                <>
                  <Text style={styles.sectionLabel}>Guidance</Text>
                  <Text style={styles.adviceText}>{prediction.advice}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </View>
  );
});

DreamInsightsView.displayName = 'DreamInsightsView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.background,
    paddingHorizontal: 45,
    paddingTop: 45,
    paddingBottom: 140,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
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
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#fefdf2',
    borderRadius: 8,
    borderWidth: 18,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  flipHintArea: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flipHintText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  interpretationTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: '#202020',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  interpretationContent: {
    fontSize: 16,
    color: '#202020',
    lineHeight: 22,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e8e4d8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#202020',
    fontWeight: '500',
  },
  adviceText: {
    fontSize: 16,
    color: '#202020',
    lineHeight: 22,
    letterSpacing: -0.1,
    fontStyle: 'italic',
  },
});
