import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Vibration, Platform, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { useNavigation } from '@react-navigation/core';
import { OrderStatusType } from '../../../../../shared/api/enums';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';
import { useAuditStore } from '../../../../../shared/store/audit.store';

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 3, name: 'El Malecón' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

type TabType = 'active' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<string, { text: string; color: string; bg: string; icon: string }> = {
  PENDING: { text: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  PAID: { text: 'Pagada', color: '#10B981', bg: '#D1FAE5', icon: '💰' },
  PREPARING: { text: 'Preparando', color: '#8B5CF6', bg: '#EDE9FE', icon: '👨‍🍳' },
  READY: { text: 'Lista', color: '#3B82F6', bg: '#DBEAFE', icon: '✅' },
  ON_THE_WAY: { text: 'En Camino', color: '#F97316', bg: '#FFEDD5', icon: '🚚' },
  DELIVERED: { text: 'Entregada', color: '#10B981', bg: '#D1FAE5', icon: '📦' },
  CANCELLED: { text: 'Cancelada', color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'active', label: 'Activas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

export const EmployeeOrdersScreen = () => {
  const { token, user } = useAuthStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { isDark, colors } = useAppTheme();
  const lastOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const intervalRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);
  const { logEvent } = useAuditStore();
  const hasLoggedView = useRef(false);

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

  // Log audit event when orders are first viewed
  useEffect(() => {
    if (orders && orders.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logEvent({
        event_type: 'ORDER_VIEW',
        user_id: user?.id,
        user_name: user?.full_name,
        description: `${user?.full_name || 'Employee'} viewed orders panel`,
        metadata: { branch_id: user?.branch_id, order_count: orders.length },
      });
    }
  }, [orders]);

  // Detectar nuevas ordenes y vibrar
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Filtrar ordenes de la sucursal del cajero
    const branchOrders = user?.branch_id
      ? orders.filter((o: any) => o.branch_id === user.branch_id)
      : orders;

    // Obtener IDs de ordenes activas
    const currentOrderIds = new Set(
      branchOrders
        .filter((o: any) => ['PENDING', 'PAID'].includes(o.status))
        .map((o: any) => o.id)
    );

    // En la primera carga, solo guardar los IDs
    if (isInitialLoad.current) {
      lastOrderIds.current = currentOrderIds;
      isInitialLoad.current = false;
      return;
    }

    // Detectar nuevas ordenes (IDs que no existian antes)
    const newOrderIds = [...currentOrderIds].filter(id => !lastOrderIds.current.has(id));

    if (newOrderIds.length > 0) {
      // Hay nuevas ordenes!
      const newOrder = branchOrders.find((o: any) => o.id === newOrderIds[0]);
      if (newOrder) {
        const clientName = newOrder.user?.full_name || 'Cliente';
        const branchName = BRANCHES.find(b => b.id === newOrder.branch_id)?.name || `Sucursal ${newOrder.branch_id}`;
        playNotificationSound(clientName, branchName, newOrderIds.length);
      }
    }

    // Actualizar los IDs conocidos
    lastOrderIds.current = currentOrderIds;
  }, [orders]);

  const playNotificationSound = async (clientName: string, branchName: string, count: number) => {
    try {
      // Vibrar con patron fuerte
      const pattern = [0, 500, 200, 500, 200, 500];
      Vibration.vibrate(pattern);
      
      // Mostrar alerta
      const title = count > 1 ? `${count} Nuevas Ordenes!` : 'Nueva Orden!';
      const message = `Sucursal: ${branchName}\nCliente: ${clientName}`;
      Alert.alert(title, message);
    } catch (error) {
      Alert.alert('Nueva Orden!', `Sucursal: ${branchName}\nCliente: ${clientName}`);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    // Filter by branch_id for cajeros (employees see only their branch's orders)
    const branchOrders = user?.branch_id
      ? orders.filter((o: any) => o.branch_id === user.branch_id)
      : orders;
    switch (activeTab) {
      case 'active':
        return branchOrders.filter((o: any) => 
          ['PENDING', 'PAID', 'PREPARING', 'READY', 'ON_THE_WAY'].includes(o.status)
        );
      case 'completed':
        return branchOrders.filter((o: any) => o.status === 'DELIVERED');
      case 'cancelled':
        return branchOrders.filter((o: any) => o.status === 'CANCELLED');
      default:
        return [];
    }
  }, [orders, activeTab, user?.branch_id]);

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
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 16,
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            #{String(item.id).substring(0, 8).toUpperCase()}
          </Text>
          <View style={{ backgroundColor: statusConfig.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: statusConfig.color, fontWeight: '600', fontSize: 12 }}>
              {statusConfig.icon} {statusConfig.text}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
          👤 {item.user?.full_name || 'Cliente'}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
          📍 Sucursal: {BRANCHES.find(b => b.id === item.branch_id)?.name || `Sucursal ${item.branch_id}`}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
          📅 {orderDate}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {item.items?.length || 0} producto(s)
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
            ${total.toFixed(2)}
          </Text>
        </View>

        {item.status === 'CANCELLED' && item.cancel_reason && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.error }}>Motivo: {item.cancel_reason}</Text>
          </View>
        )}

        {/* Payment proof indicator for Pago Movil */}
        {item.payment_method === 'pago_movil' && item.payment_proof && (
          <TouchableOpacity
            style={{ marginTop: 8, padding: 8, backgroundColor: '#DBEAFE', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
          >
            <Text style={{ fontSize: 12, marginRight: 6 }}>{'\u{1F4F7}'}</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#1E40AF' }}>Ver comprobante de pago</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.surface,
      }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
          Panel de Órdenes
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          Actualización automática cada 10 segundos
        </Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        paddingHorizontal: 12, paddingVertical: 8,
        gap: 6,
      }}>
        {TABS.map(tab => {
          const branchOrders = user?.branch_id ? orders?.filter((o: any) => o.branch_id === user.branch_id) : orders;
          const count = tab.key === 'active' 
            ? branchOrders?.filter((o: any) => ['PENDING', 'PAID', 'PREPARING', 'READY', 'ON_THE_WAY'].includes(o.status)).length || 0
            : tab.key === 'completed'
            ? branchOrders?.filter((o: any) => o.status === 'DELIVERED').length || 0
            : branchOrders?.filter((o: any) => o.status === 'CANCELLED').length || 0;

          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: activeTab === tab.key ? colors.primary : colors.border,
                alignItems: 'center',
              }}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={{ 
                color: activeTab === tab.key ? '#fff' : colors.textSecondary, 
                fontWeight: '700', fontSize: 13 
              }}>
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => token && fetchOrders(token)}
          refreshing={loading}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {activeTab === 'active' ? '📭' : activeTab === 'completed' ? '✅' : '❌'}
              </Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary }}>
                {activeTab === 'active' ? 'No hay órdenes activas' : 
                 activeTab === 'completed' ? 'No hay órdenes completadas' : 
                 'No hay órdenes canceladas'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
