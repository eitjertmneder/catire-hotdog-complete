import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useReviewStore } from '../../modules/orders/store/review.store';
import { useAppTheme } from '../contexts/ThemeContext';
import { Review } from '../../modules/orders/models/Review';

export const MyReviewsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { isDark, colors } = useAppTheme();
  const { myReviews, loading, fetchMyReviews } = useReviewStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) fetchMyReviews(token);
  }, [token]);

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchMyReviews(token);
    setRefreshing(false);
  };

  const renderStars = (count: number) => (
    <Text style={{ fontSize: 14, color: '#F59E0B' }}>{'\u2605'.repeat(count)}{'\u2606'.repeat(5 - count)}</Text>
  );

  const averageRating = myReviews.length > 0
    ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
    : 0;

  const renderItem = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => navigation.navigate('Review', { orderId: item.order_id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {renderStars(item.rating)}
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {item.comment ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 8 }}>{item.comment}</Text>
      ) : null}

      <Text style={{ fontSize: 11, color: colors.textMuted }}>
        Pedido #{String(item.order_id).slice(0, 8)}
      </Text>
    </TouchableOpacity>
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
          {'\u2B50'} Mis Reseñas
        </Text>
      </View>

      {/* Summary Card */}
      {myReviews.length > 0 && (
        <View style={{
          margin: 16,
          marginBottom: 0,
          backgroundColor: colors.primary,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff' }}>
            {averageRating.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
            {'\u2605'.repeat(Math.round(averageRating))}{'\u2606'.repeat(5 - Math.round(averageRating))}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            {myReviews.length} {myReviews.length === 1 ? 'reseña' : 'reseñas'}
          </Text>
        </View>
      )}

      {loading && myReviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={myReviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4DD}'}</Text>
              <Text style={{ fontSize: 16, color: colors.textMuted }}>No has dejado reseñas</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                Califica tus pedidos para ayudarnos a mejorar
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
