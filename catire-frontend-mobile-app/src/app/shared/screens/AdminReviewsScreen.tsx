import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useReviewStore } from '../../modules/orders/store/review.store';
import { useAppTheme } from '../contexts/ThemeContext';
import { Review, ReviewStats } from '../../modules/orders/models/Review';

export const AdminReviewsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { isDark, colors } = useAppTheme();
  const { reviews, stats, loading, fetchAllReviews, fetchReviewStats, removeReview, actionLoading } = useReviewStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAllReviews(token);
      fetchReviewStats(token);
    }
  }, [token]);

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await Promise.all([fetchAllReviews(token), fetchReviewStats(token)]);
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar Reseña', '¿Estás seguro de eliminar esta reseña?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (token) removeReview(token, id);
        },
      },
    ]);
  };

  const renderStars = (count: number) => (
    <Text style={{ fontSize: 14, color: '#F59E0B' }}>{'\u2605'.repeat(count)}{'\u2606'.repeat(5 - count)}</Text>
  );

  const renderStatsCard = () => {
    if (!stats) return null;
    const dist = stats.rating_distribution;
    const maxCount = Math.max(dist[1], dist[2], dist[3], dist[4], dist[5], 1);

    return (
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
          {'\u{1F4CA}'} Estadísticas de Reseñas
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ alignItems: 'center', marginRight: 24 }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: colors.primary }}>
              {stats.average_rating.toFixed(1)}
            </Text>
            {renderStars(Math.round(stats.average_rating))}
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              {stats.total_reviews} reseñas
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            {([5, 4, 3, 2, 1] as const).map((star) => (
              <View key={star} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ width: 16, fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{star}</Text>
                <View style={{
                  flex: 1,
                  height: 10,
                  backgroundColor: isDark ? '#333' : '#F1F5F9',
                  borderRadius: 5,
                  overflow: 'hidden',
                  marginHorizontal: 6,
                }}>
                  <View style={{
                    width: `${(dist[star as keyof typeof dist] / maxCount) * 100}%`,
                    height: '100%',
                    backgroundColor: '#F59E0B',
                    borderRadius: 5,
                  }} />
                </View>
                <Text style={{ width: 30, fontSize: 11, color: colors.textMuted, textAlign: 'right' }}>
                  {dist[star as keyof typeof dist]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Review }) => (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
          {item.user?.full_name || `Usuario #${item.user_id}`}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} disabled={actionLoading}>
          <Text style={{ fontSize: 13, color: colors.error }}>{'\u{1F5D1}'} Eliminar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {renderStars(item.rating)}
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {item.comment ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>{item.comment}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          Pedido #{String(item.order_id).slice(0, 8)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          {'\u2B50'} Reseñas
        </Text>
      </View>

      {loading && reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={renderStatsCard}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4DD}'}</Text>
              <Text style={{ fontSize: 16, color: colors.textMuted }}>No hay reseñas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
