import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';

interface IconItem {
  color: string;
  isImage?: boolean;
  image?: any;
  emoji?: string;
}

const iconDataSets: Record<"set1" | "set2" | "set3", IconItem[]> = {
  set1: [
    { emoji: '🌭', color: '#FFEBEE' },
    { emoji: '🍔', color: '#FFF3E0' },
    { emoji: '🍟', color: '#FFFDE7' },
    { emoji: '🥤', color: '#E8F5E9' },
    { emoji: '🍕', color: '#F3E5F5' },
  ],
  set2: [
    { emoji: '🌮', color: '#E3F2FD' },
    { emoji: '🌯', color: '#FCE4EC' },
    { emoji: '🥪', color: '#E8EAF6' },
    { emoji: '🥗', color: '#F1F8E9' },
    { emoji: '🍝', color: '#FFF8E1' },
  ],
  set3: [
    { emoji: '🍦', color: '#F3E5F5' },
    { emoji: '🍩', color: '#FFF3E0' },
    { emoji: '🧁', color: '#FCE4EC' },
    { emoji: '🍰', color: '#FFFDE7' },
    { emoji: '🎂', color: '#E8F5E9' },
  ],
};

const ITEM_HEIGHT = 160;
const SCROLL_SPEED = 20;

interface ScrollInfinitoSuaveProps {
  scrollDirection?: "up" | "down";
  iconSet?: "set1" | "set2" | "set3";
}

const ScrollInfinitoSuave = ({
  scrollDirection = "down",
  iconSet = "set1",
}: ScrollInfinitoSuaveProps) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [offset, setOffset] = useState(0);

  const iconData = iconDataSets[iconSet];
  const items = [...iconData, ...iconData];

  useEffect(() => {
    const startScroll = () => {
      Animated.loop(
        Animated.timing(scrollY, {
          toValue: scrollDirection === 'down' ? -1000 : 1000,
          duration: 50000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startScroll();
  }, [scrollDirection]);

  return (
    <Animated.View style={{ overflow: 'hidden', height: 200 }}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, idx) => (
          <View
            key={idx}
            style={[styles.iconContainer, { backgroundColor: item.color }]}
          >
            <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 160,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ScrollInfinitoSuave;
