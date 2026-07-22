import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGamificationStore, Achievement, Challenge } from '../store/gamification.store';
import { theme } from '../styles/theme';

export const GamificationScreen = () => {
  const navigation = useNavigation();
  const { 
    achievements, challenges, user_level, user_xp, xp_to_next_level,
    getActiveChallenges, getLevelBenefits, checkAchievements
  } = useGamificationStore();
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'challenges' | 'levels'>('achievements');

  useEffect(() => {
    checkAchievements();
  }, []);

  const levelProgress = (user_xp / xp_to_next_level) * 100;

  const renderAchievement = (achievement: Achievement) => (
    <View
      key={achievement.id}
      style={{
        backgroundColor: achievement.unlocked ? '#D1FAE5' : theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        opacity: achievement.unlocked ? 1 : 0.6,
        borderWidth: achievement.unlocked ? 2 : 0,
        borderColor: achievement.unlocked ? '#10B981' : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, marginRight: 12 }}>
          {achievement.icon}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '700', 
            color: achievement.unlocked ? '#065F46' : theme.colors.textPrimary 
          }}>
            {achievement.name}
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
            {achievement.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
              <View style={{
                width: `${Math.min(100, (achievement.current_progress / achievement.requirement) * 100)}%`,
                height: '100%',
                backgroundColor: achievement.unlocked ? '#10B981' : theme.colors.primary,
                borderRadius: 3,
              }} />
            </View>
            <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginLeft: 8 }}>
              {achievement.current_progress}/{achievement.requirement}
            </Text>
          </View>
        </View>
        <View style={{ marginLeft: 8 }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '700', 
            color: achievement.unlocked ? '#10B981' : '#F59E0B' 
          }}>
            +{achievement.reward_points}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderChallenge = (challenge: Challenge) => (
    <View
      key={challenge.id}
      style={{
        backgroundColor: challenge.completed ? '#D1FAE5' : theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>{challenge.icon}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
            {challenge.name}
          </Text>
        </View>
        {challenge.completed && <Text style={{ fontSize: 18 }}>✅</Text>}
      </View>
      <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 }}>
        {challenge.description}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginRight: 12 }}>
          <View style={{
            width: `${(challenge.progress / challenge.target) * 100}%`,
            height: '100%',
            backgroundColor: challenge.completed ? '#10B981' : theme.colors.primary,
            borderRadius: 4,
          }} />
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }}>
          {challenge.progress}/{challenge.target}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
          Recompensa: +{challenge.reward_points} pts
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
          Expira: {new Date(challenge.valid_until).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          🏆 Gamificación
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Level Card */}
        <View style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.8 }}>Tu Nivel</Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff' }}>Nivel {user_level}</Text>
            </View>
            <Text style={{ fontSize: 48 }}>⭐</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>Experiencia</Text>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>
                {user_xp}/{xp_to_next_level} XP
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }}>
              <View style={{
                width: `${levelProgress}%`,
                height: '100%',
                backgroundColor: '#fff',
                borderRadius: 4,
              }} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'achievements', label: 'Logros', icon: '🏆' },
            { key: 'challenges', label: 'Retos', icon: '🎯' },
            { key: 'levels', label: 'Niveles', icon: '📊' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: selectedTab === tab.key ? theme.colors.primary : theme.colors.white,
                alignItems: 'center',
              }}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedTab === tab.key ? '#fff' : theme.colors.textPrimary,
              }}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {selectedTab === 'achievements' && (
          achievements.map(renderAchievement)
        )}

        {selectedTab === 'challenges' && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
              Retos Activos
            </Text>
            {getActiveChallenges().map(renderChallenge)}
            {getActiveChallenges().length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 48 }}>🎯</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>No hay retos activos</Text>
              </View>
            )}
          </>
        )}

        {selectedTab === 'levels' && (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 16,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
              Beneficios por Nivel
            </Text>
            {getLevelBenefits().map((benefit, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>✅</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>{benefit}</Text>
              </View>
            ))}
            {getLevelBenefits().length === 0 && (
              <Text style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: 'center' }}>
                ¡Sigue acumulando XP para desbloquear beneficios!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
