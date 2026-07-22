import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useReviewStore, Review } from '../../../shared/store/review.store';
import { theme } from '../../../shared/styles/theme';

export const ReviewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { addReview, getReviewsByOrder, hasUserReviewedOrder } = useReviewStore();
  
  const orderId = route.params?.orderId || '';
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const reviews = getReviewsByOrder(orderId);
  const hasReviewed = user ? hasUserReviewedOrder(user.id, orderId) : false;

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Selecciona una calificación');
      return;
    }

    addReview({
      order_id: orderId,
      user_id: user?.id || 0,
      user_name: user?.full_name || 'Anónimo',
      rating,
      comment: comment.trim(),
    });

    Alert.alert('Gracias', 'Tu reseña ha sido guardada', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && setRating(star)}
            disabled={!interactive}
          >
            <Text style={{ fontSize: 28 }}>
              {star <= count ? '?' : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
          ? Reseñas - Pedido #{orderId.slice(0, 8)}
        </Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          !hasReviewed ? (
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
                Califica tu experiencia
              </Text>
              
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {renderStars(rating, true)}
              </View>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  backgroundColor: theme.colors.background,
                }}
                placeholder="Cuéntanos sobre tu experiencia (opcional)"
                placeholderTextColor={theme.colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
              />

              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 12,
                }}
                onPress={handleSubmit}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Enviar Reseña</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{
              backgroundColor: '#D1FAE5',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#6EE7B7',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46' }}>
                ? Ya calificaste este pedido
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>
                {item.user_name}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            {renderStars(item.rating)}
            {item.comment ? (
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 }}>
                {item.comment}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>?</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>No hay reseñas aún</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};



