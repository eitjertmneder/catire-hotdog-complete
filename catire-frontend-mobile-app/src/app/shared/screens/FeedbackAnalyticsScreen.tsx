import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useReviewStore } from '../store/review.store';
import { theme } from '../styles/theme';

export const FeedbackAnalyticsScreen = () => {
  const navigation = useNavigation();
  const { reviews } = useReviewStore();
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
    recentReviews: [] as any[],
    topCompliments: [] as { text: string; count: number }[],
    topComplaints: [] as { text: string; count: number }[],
  });

  useEffect(() => {
    calculateAnalytics();
  }, [reviews]);

  const calculateAnalytics = () => {
    const total = reviews.length;
    if (total === 0) return;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;

    setAnalytics({
      totalReviews: total,
      averageRating: avg,
      fiveStarCount: reviews.filter(r => r.rating === 5).length,
      fourStarCount: reviews.filter(r => r.rating === 4).length,
      threeStarCount: reviews.filter(r => r.rating === 3).length,
      twoStarCount: reviews.filter(r => r.rating === 2).length,
      oneStarCount: reviews.filter(r => r.rating === 1).length,
      recentReviews: reviews.slice(0, 5),
      topCompliments: [
        { text: 'Rápido', count: 12 },
        { text: 'Delicioso', count: 10 },
        { text: 'Buen precio', count: 8 },
      ],
      topComplaints: [
        { text: 'Tardó mucho', count: 3 },
        { text: 'Faltó un topping', count: 2 },
      ],
    });
  };

  const renderBar = (label: string, count: number, maxCount: number, color: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Text style={{ width: 30, fontSize: 14, color: theme.colors.textSecondary }}>{label}</Text>
      <View style={{ flex: 1, height: 20, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: 8 }}>
        <View style={{
          width: `${(count / Math.max(maxCount, 1)) * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 4,
        }} />
      </View>
      <Text style={{ width: 30, fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>{count}</Text>
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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>? Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          ?? Analytics de Feedback
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Overall Rating */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: theme.colors.primary }}>
            {analytics.averageRating.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 20, marginTop: 4 }}>
            {'?'.repeat(Math.round(analytics.averageRating))}
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textMuted, marginTop: 8 }}>
            {analytics.totalReviews} reseñas
          </Text>
        </View>

        {/* Rating Distribution */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            Distribución de Calificaciones
          </Text>
          {renderBar('5?', analytics.fiveStarCount, analytics.totalReviews, '#10B981')}
          {renderBar('4?', analytics.fourStarCount, analytics.totalReviews, '#34D399')}
          {renderBar('3?', analytics.threeStarCount, analytics.totalReviews, '#FBBF24')}
          {renderBar('2?', analytics.twoStarCount, analytics.totalReviews, '#F97316')}
          {renderBar('1?', analytics.oneStarCount, analytics.totalReviews, '#EF4444')}
        </View>

        {/* Top Compliments */}
        <View style={{
          backgroundColor: '#D1FAE5',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 12 }}>
            ?? Lo Más Valorado
          </Text>
          {analytics.topCompliments.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#047857' }}>{item.text}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46' }}>{item.count} menciones</Text>
            </View>
          ))}
        </View>

        {/* Top Complaints */}
        <View style={{
          backgroundColor: '#FEE2E2',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#991B1B', marginBottom: 12 }}>
            ?? Áreas de Mejora
          </Text>
          {analytics.topComplaints.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#B91C1C' }}>{item.text}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>{item.count} menciones</Text>
            </View>
          ))}
        </View>

        {/* Recent Reviews */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            Reseñas Recientes
          </Text>
          {analytics.recentReviews.length === 0 ? (
            <Text style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', padding: 20 }}>
              No hay reseñas aún
            </Text>
          ) : (
            analytics.recentReviews.map((review, index) => (
              <View key={index} style={{
                borderBottomWidth: index < analytics.recentReviews.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border,
                paddingVertical: 12,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>
                    {review.user_name}
                  </Text>
                  <Text style={{ fontSize: 14 }}>{'?'.repeat(review.rating)}</Text>
                </View>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                  {review.comment || 'Sin comentario'}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


