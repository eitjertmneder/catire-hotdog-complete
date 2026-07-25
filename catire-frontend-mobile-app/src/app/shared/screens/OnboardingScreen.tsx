import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, onboardingSteps } from '../../shared/store/onboarding.store';
import { useAuthStore } from '../../shared/store/auth.store';

const { width, height } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const { completeOnboarding } = useOnboardingStore();
  const { user } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
      // Navigate based on user role
      if (user) {
        if (user.role?.name === 'admin') {
          navigation.reset({ index: 0, routes: [{ name: 'AdminScreen' as any }] });
        } else if (user.role?.name === 'employee') {
          navigation.reset({ index: 0, routes: [{ name: 'EmployeeOrders' as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'BranchesMap' as any }] });
        }
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
      }
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'BranchesMap' as any }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
    }
  };

  const renderItem = ({ item, index }: { item: typeof onboardingSteps[0]; index: number }) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      <Text style={styles.emoji}>{item.image}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)' },
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex === onboardingSteps.length - 1 ? 'Empezar!' : 'Siguiente'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 2,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});

