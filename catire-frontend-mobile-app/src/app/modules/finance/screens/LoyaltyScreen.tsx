import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useLoyaltyStore, LoyaltyTransaction } from '../../../shared/store/loyalty.store';
import { theme } from '../../../shared/styles/theme';

export const LoyaltyScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { getPoints, getTransactionHistory } = useLoyaltyStore();
  
  const userId = user?.id || 0;
  const points = getPoints(userId);
  const transactions = getTransactionHistory(userId);

  // Niveles de fidelidad
  const getLevel = (pts: number) => {
    if (pts >= 1000) return { name: 'Diamante', color: '#8B5CF6', emoji: '??' };
    if (pts >= 500) return { name: 'Oro', color: '#F59E0B', emoji: '??' };
    if (pts >= 200) return { name: 'Plata', color: '#9CA3AF', emoji: '??' };
    if (pts >= 50) return { name: 'Bronce', color: '#D97706', emoji: '??' };
    return { name: 'Nuevo', color: '#6B7280', emoji: '?' };
  };

  const level = getLevel(points);

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
          ? Puntos de Fidelidad
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Points Card */}
            <View style={{
              backgroundColor: level.color,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              shadowColor: level.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>Tu Nivel</Text>
                <Text style={{ fontSize: 24 }}>{level.emoji}</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 4 }}>
                Nivel {level.name}
              </Text>
              <Text style={{ fontSize: 42, fontWeight: '800', color: '#fff' }}>
                {points} pts
              </Text>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.8, marginTop: 8 }}>
                1 punto por cada $1 gastado
              </Text>
            </View>

            {/* How it works */}
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
                ¿Cómo funciona?
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>??</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary, flex: 1 }}>
                  Gana 1 punto por cada $1 en compras
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>??</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary, flex: 1 }}>
                  Acumula puntos y sube de nivel
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>??</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary, flex: 1 }}>
                  Canjea por descuentos especiales
                </Text>
              </View>
            </View>

            {/* Levels */}
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
                Niveles
              </Text>
              {[
                { name: 'Nuevo', points: '0+', emoji: '?' },
                { name: 'Bronce', points: '50+', emoji: '??' },
                { name: 'Plata', points: '200+', emoji: '??' },
                { name: 'Oro', points: '500+', emoji: '??' },
                { name: 'Diamante', points: '1000+', emoji: '??' },
              ].map((lvl, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: index < 4 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{lvl.emoji}</Text>
                  <Text style={{ flex: 1, fontSize: 14, color: theme.colors.textPrimary }}>{lvl.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{lvl.points} pts</Text>
                </View>
              ))}
            </View>

            {/* History Header */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
              Historial de Puntos
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>Sin transacciones aún</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 14,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: item.type === 'earned' ? '#D1FAE5' : '#FEE2E2',
              justifyContent: 'center', alignItems: 'center',
              marginRight: 12,
            }}>
              <Text style={{ fontSize: 18 }}>{item.type === 'earned' ? '?' : '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>
                {item.description}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{
              fontSize: 16, fontWeight: '700',
              color: item.type === 'earned' ? '#10B981' : '#EF4444',
            }}>
              {item.type === 'earned' ? '+' : '-'}{item.points}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

