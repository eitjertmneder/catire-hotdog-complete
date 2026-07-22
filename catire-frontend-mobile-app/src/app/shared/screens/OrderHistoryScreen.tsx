import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useCurrencyStore } from '../store/currency.store';
import { Api } from '../api/api';
import { theme } from '../styles/theme';

const api = new Api();

type FilterStatus = 'all' | 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  status: FilterStatus;
  is_delivery: boolean;
  payment_method?: string;
  created_at: string;
  items?: any[];
}

export const OrderHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user } = useAuthStore();
  const { formatAllPrices } = useCurrencyStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === selectedFilter));
    }
  }, [selectedFilter, orders]);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    const res = await api.get<Order[]>('orders', 'orders', token);
    if (!res.error && res.data) {
      setOrders(res.data);
      setFilteredOrders(res.data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'PAID': return '#3B82F6';
      case 'PREPARING': return '#8B5CF6';
      case 'READY': return '#10B981';
      case 'DELIVERED': return '#6B7280';
      case 'CANCELLED': return '#EF4444';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '? Pendiente';
      case 'PAID': return '?? Pagado';
      case 'PREPARING': return '????? Preparando';
      case 'READY': return '? Listo';
      case 'DELIVERED': return '?? Entregado';
      case 'CANCELLED': return '? Cancelado';
      default: return status;
    }
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'DELIVERED', label: 'Entregados' },
    { key: 'CANCELLED', label: 'Cancelados' },
  ];

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>
          Pedido #{item.id.slice(0, 8)}
        </Text>
        <View style={{ backgroundColor: getStatusColor(item.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
        {new Date(item.created_at).toLocaleDateString()} • {item.is_delivery ? '?? Delivery' : '?? Local'}
      </Text>
      
      {item.payment_method && (
        <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
          ?? {item.payment_method === 'pago_movil' ? 'Pago Móvil' : 'Efectivo'}
        </Text>
      )}
      
      <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
        ?? {item.items?.length || 0} productos
      </Text>
    </TouchableOpacity>
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
          ?? Historial de Pedidos
        </Text>
      </View>

      {/* Filters */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        gap: 8,
      }}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedFilter === filter.key ? theme.colors.primary : theme.colors.borderLight,
            }}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: selectedFilter === filter.key ? '#fff' : theme.colors.textSecondary,
            }}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>??</Text>
              <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>No hay pedidos</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

