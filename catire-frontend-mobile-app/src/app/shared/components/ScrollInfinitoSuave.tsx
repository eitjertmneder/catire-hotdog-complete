import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const foodItems = [
  { emoji: '🌭', color: '#FFEBEE' },
  { emoji: '🍔', color: '#FFF3E0' },
  { emoji: '🍟', color: '#FFFDE7' },
  { emoji: '🥤', color: '#E8F5E9' },
  { emoji: '🍕', color: '#F3E5F5' },
];

const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 2;

const ScrollInfinitoSuave = ({ scrollDirection = 'down' as 'up' | 'down' }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const totalHeight = foodItems.length * (ITEM_HEIGHT + 8);
    const startVal = scrollDirection === 'down' ? 0 : -totalHeight;
    const endVal = scrollDirection === 'down' ? -totalHeight : 0;

    scrollAnim.setValue(startVal);

    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: endVal,
        duration: foodItems.length * 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const items = [...foodItems, ...foodItems, ...foodItems];

  return (
    <View style={styles.container}>
      <View style={styles.clipContainer}>
        <Animated.View style={{ transform: [{ translateY: scrollAnim }] }}>
          {items.map((item, idx) => (
            <View key={idx} style={[styles.itemCard, { backgroundColor: item.color }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS + 16,
    width: 80,
    overflow: 'hidden',
    borderRadius: 16,
  },
  clipContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  itemCard: {
    width: 80,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 36,
  },
});

export default ScrollInfinitoSuave;