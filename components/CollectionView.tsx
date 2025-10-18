import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { OneiromancyCard } from './OneiromancyCard';
import Colors from '../constants/Colors';
import { Dream } from '../constants/Types';

// Define all 12 oneiromancy categories
const ONEIROMANCY_CATEGORIES = [
  { 
    id: 'wealth', 
    title: 'Wealth & Prosperity', 
    image: require('../assets/oneiromancy/wealth.png'),
    category: 'wealth'
  },
  { 
    id: 'love', 
    title: 'Love & Relationships', 
    image: require('../assets/oneiromancy/love.png'),
    category: 'love'
  },
  { 
    id: 'animals', 
    title: 'Animals', 
    image: require('../assets/oneiromancy/animals.png'),
    category: 'animals'
  },
  { 
    id: 'travel', 
    title: 'Travel & Journey', 
    image: require('../assets/oneiromancy/travel.png'),
    category: 'travel'
  },
  { 
    id: 'transformation', 
    title: 'Transformation', 
    image: require('../assets/oneiromancy/transformation.png'),
    category: 'transformation'
  },
  { 
    id: 'spiritual', 
    title: 'Spiritual Growth', 
    image: require('../assets/oneiromancy/spritual.png'),
    category: 'spiritual'
  },
  { 
    id: 'family', 
    title: 'Family & Home', 
    image: require('../assets/oneiromancy/family.png'),
    category: 'family'
  },
  { 
    id: 'career', 
    title: 'Career & Success', 
    image: require('../assets/oneiromancy/career.png'),
    category: 'career'
  },
  { 
    id: 'water', 
    title: 'Water & Emotions', 
    image: require('../assets/oneiromancy/water.png'),
    category: 'water'
  },
  { 
    id: 'danger', 
    title: 'Warning & Danger', 
    image: require('../assets/oneiromancy/danger.png'),
    category: 'danger'
  },
  { 
    id: 'health', 
    title: 'Health & Vitality', 
    image: require('../assets/oneiromancy/health.png'),
    category: 'health'
  },
  { 
    id: 'food', 
    title: 'Food & Nourishment', 
    image: require('../assets/oneiromancy/food.png'),
    category: 'food'
  },
];

interface CollectionViewProps {
  dreams: Dream[];
}

export function CollectionView({ dreams }: CollectionViewProps) {
  // Count dreams per category
  const dreamCountByCategory = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    dreams.forEach(dream => {
      if (dream.prediction?.category) {
        const category = dream.prediction.category.toLowerCase();
        counts[category] = (counts[category] || 0) + 1;
      }
    });
    
    return counts;
  }, [dreams]);

  // Calculate total collected categories
  const collectedCount = Object.keys(dreamCountByCategory).length;
  const totalCategories = ONEIROMANCY_CATEGORIES.length;
  const hasCollectedAll = collectedCount === totalCategories;

  return (
    <View style={styles.container}>
      {collectedCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No cards collected yet</Text>
          <Text style={styles.emptySubtitle}>
            Generate dreams to start collecting oneiromancy cards
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.headerText}>
            {hasCollectedAll 
              ? `You have collected all ${totalCategories} oneiromancy cards!`
              : `Collected ${collectedCount} of ${totalCategories} oneiromancy cards`
            }
          </Text>

          <View style={styles.grid}>
            {ONEIROMANCY_CATEGORIES.map((category) => {
              const dreamCount = dreamCountByCategory[category.category] || 0;
              
              // Only show cards that have been collected
              if (dreamCount === 0) return null;
              
              return (
                <View key={category.id} style={styles.cardColumn}>
                  <OneiromancyCard
                    title={category.title}
                    dreamCount={dreamCount}
                    imageSource={category.image}
                    isCollected={true}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: -0.43,
    lineHeight: 22,
    marginBottom: 32,
    width: 181,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginHorizontal: -7, // Offset for better spacing
  },
  cardColumn: {
    width: '48%', // 2 columns with some gap
  },
});

