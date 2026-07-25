import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { useNavigation } from '@react-navigation/core';
import { OrderStatusType } from '../../../../../shared/api/enums';
import { theme } from '../../../../../shared/styles/theme';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

type TabType = 'active' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<string, { text: string; color: string; bg: string; icon: string; message: string }> = {
  PENDING: { text: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳', message: 'Esperando confirmación del cajero.' },
  PAID: { text: 'Pagada', color: '#10B981', bg: '#D1FAE5', icon: '💰', message: '¡Pago confirmado! Preparando tu pedido.' },
  PREPARING: { text: 'Preparando', color: '#8B5CF6', bg: '#EDE9FE', icon: '👨‍🍳', message: 'Tu comida se está preparando.' },
  READY: { text: 'Lista', color: '#3B82F6', bg: '#DBEAFE', icon: '✅', message: '¡Tu pedido está listo!' },
  ON_THE_WAY: { text: 'En Camino', color: '#F97316', bg: '#FFEDD5', icon: '🚚', message: '¡Va en camino!' },
  DELIVERED: { text: 'Entregada', color: '#10B981', bg: '#D1FAE5', icon: '📦', message: '¡Entregado! Buen provecho.' },
  CANCELLED: { text: 'Cancelada', color: '#EF4444', bg: '#FEE2E2', icon: '❌', message: 'Tu pedido fue cancelado.' },
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'active', label: 'Actuales' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

export const OrdersScreen = () => {
  const { token } = useAuthStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const intervalRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { isDark, colors } = useAppTheme();

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (token) {
      fetchOrders(token);
      
      intervalRef.current = setInterval(() => {
        if (token) {
          fetchOrders(token);
        }
      }, 10000); // 10 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeTab) {
      case 'active':
        return orders.filter((o: any) => 
          ['PENDING', 'PAID', 'PREPARING', 'READY', 'ON_THE_WAY'].includes(o.status)
        );
      case 'completed':
        return orders.filter((o: any) => o.status === 'DELIVERED');
      case 'cancelled':
        return orders.filter((o: any) => o.status === 'CANCELLED');
      default:
        return [];
    }
  }, [orders, activeTab]);

  const getStatusConfig = (status: OrderStatusType) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  };

  const renderItem = ({ item }: any) => {
    const statusConfig = getStatusConfig(item.status);
    const total = item.items?.reduce((sum: number, i: any) => sum + (i.base_price * i.quantity), 0) || 0;
    const orderDate = new Date(item.created_at).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return (
      <TouchableOpacity
        style={{
          backgroundColor: isDark ? colors.surface : theme.colors.white,
          borderRadius: 14,
          padding: 16,
          marginBottom: 10,
          marginHorizontal: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>
            #{String(item.id).substring(0, 8).toUpperCase()}
          </Text>
          <View style={{ backgroundColor: statusConfig.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: statusConfig.color, fontWeight: '600', fontSize: 12 }}>
              {statusConfig.icon} {statusConfig.text}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: statusConfig.bg + '60', padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ color: statusConfig.color, fontSize: 13 }}>{statusConfig.message}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>📅 {orderDate}</Text>
          <Text style={{ fontWeight: '700', color: theme.colors.primary, fontSize: 15 }}>${total.toFixed(2)}</Text>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 8 }}>
            {item.items.slice(0, 3).map((orderItem: any, idx: number) => (
              <Text key={idx} style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {orderItem.quantity}x {orderItem.product?.name || `Producto #${orderItem.product_id}`}
              </Text>
            ))}
            {item.items.length > 3 && (
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>+{item.items.length - 3} más...</Text>
            )}
          </View>
        )}

        {item.cancel_reason && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.colors.error }}>Motivo: {item.cancel_reason}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: isDark ? colors.surface : theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: isDark ? colors.border : theme.colors.border,
      }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? colors.textPrimary : theme.colors.textPrimary }}>Mis Pedidos</Text>
        <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
          🔄 Actualización automática cada 10 segundos
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: isDark ? colors.surface : theme.colors.white,
        paddingHorizontal: 12, paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: isDark ? colors.border : theme.colors.border,
        gap: 6,
      }}>
        {TABS.map(tab => {
          const count = tab.key === 'active' 
            ? orders?.filter((o: any) => ['PENDING', 'PAID', 'PREPARING', 'READY', 'ON_THE_WAY'].includes(o.status)).length || 0
            : tab.key === 'completed'
            ? orders?.filter((o: any) => o.status === 'DELIVERED').length || 0
            : orders?.filter((o: any) => o.status === 'CANCELLED').length || 0;

          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: activeTab === tab.key ? theme.colors.primary : theme.colors.borderLight,
                alignItems: 'center',
              }}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={{ 
                color: activeTab === tab.key ? '#fff' : theme.colors.textSecondary, 
                fontWeight: '700', fontSize: 13 
              }}>
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
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
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {activeTab === 'active' ? '📭' : activeTab === 'completed' ? '✅' : '❌'}
              </Text>
              <Text style={{ fontSize: 15, color: theme.colors.textMuted }}>
                {activeTab === 'active' ? 'No tienes pedidos activos' : 
                 activeTab === 'completed' ? 'No hay pedidos completados' : 
                 'No hay pedidos cancelados'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
