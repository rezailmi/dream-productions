import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';

interface OneiromancyCardProps {
  title: string;
  dreamCount: number;
  imageSource: ImageSourcePropType;
  isCollected: boolean;
}

export function OneiromancyCard({ title, dreamCount, imageSource, isCollected }: OneiromancyCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={[styles.card, !isCollected && styles.cardUncollected]}>
          <Image 
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.title, !isCollected && styles.titleUncollected]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, !isCollected && styles.subtitleUncollected]}>
          {isCollected 
            ? `${dreamCount} dream${dreamCount !== 1 ? 's' : ''} captured`
            : 'Not yet collected'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 24,
  },
  cardWrapper: {
    aspectRatio: 156.5 / 249.292, // Based on Figma dimensions
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FEFDF2',
    borderRadius: 4,
    borderWidth: 9,
    borderColor: Colors.card,
    overflow: 'hidden',
  },
  cardUncollected: {
    opacity: 0.4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  infoContainer: {
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '590',
    color: Colors.text,
    letterSpacing: -0.43,
    lineHeight: 22,
  },
  titleUncollected: {
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSubtle,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  subtitleUncollected: {
    opacity: 0.5,
  },
});

