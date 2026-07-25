import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { useAuthStore } from '../store/auth.store';
import { useAppTheme } from '../contexts/ThemeContext';
import { Order } from '../../modules/orders/models/Order';

type FilterStatus = 'all' | 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export const OrderHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { isDark, colors } = useAppTheme();
  const { orders, loading, fetchOrders } = useOrdersStore();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (token) fetchOrders(token);
  }, [token]);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === selectedFilter));
    }
  }, [selectedFilter, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'PAID': return '#10B981';
      case 'PREPARING': return '#2563EB';
      case 'READY': return '#059669';
      case 'DELIVERED': return '#7C3AED';
      case 'CANCELLED': return '#EF4444';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '\u23F3 Pendiente';
      case 'PAID': return '\u2705 Pagado';
      case 'PREPARING': return '\uD83D\uDD25 Preparando';
      case 'READY': return '\uD83D\uDCCB Listo';
      case 'DELIVERED': return '\uD83D\uDE9A Entregado';
      case 'CANCELLED': return '\u274C Cancelado';
      default: return status;
    }
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'DELIVERED', label: 'Entregados' },
    { key: 'CANCELLED', label: 'Cancelados' },
  ];

  const renderItem = ({ item }: { item: Order }) => {
    const total = item.items?.reduce((sum, i) => sum + i.base_price * i.quantity, 0) ?? 0;
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            Pedido #{String(item.id).slice(0, 8)}
          </Text>
          <View style={{ backgroundColor: getStatusColor(item.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: colors.textMuted || colors.textSecondary }}>
          {new Date(item.created_at).toLocaleDateString()} \u2022 {item.is_delivery ? '\uD83D\uDE97 Delivery' : '\uD83C\uDFE2 Local'}
        </Text>

        {item.payment_method && (
          <Text style={{ fontSize: 12, color: colors.textMuted || colors.textSecondary, marginTop: 4 }}>
            \uD83D\uDCB3 {item.payment_method === 'pago_movil' ? 'Pago M\u00F3vil' : 'Efectivo'}
          </Text>
        )}

        {item.items && item.items.length > 0 && (
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
            {item.items.slice(0, 3).map((i, idx) => (
              <Text key={idx} style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                {i.quantity}x {i.features?.[0]?.value || 'Producto'} \u2014 ${i.base_price.toFixed(2)}
              </Text>
            ))}
            {item.items.length > 3 && (
              <Text style={{ fontSize: 11, color: colors.textMuted || colors.textSecondary }}>
                +{item.items.length - 3} m\u00E1s
              </Text>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>
            Total: ${total.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          {'\uD83D\uDCD1'} Historial de Pedidos
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        gap: 8,
      }}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedFilter === filter.key ? colors.primary : colors.borderLight,
            }}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: selectedFilter === filter.key ? '#fff' : colors.textSecondary,
            }}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCCB'}</Text>
              <Text style={{ fontSize: 16, color: colors.textMuted || colors.textSecondary }}>No hay pedidos</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
