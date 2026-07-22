import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useCurrencyStore } from '../store/currency.store';
import { Api } from '../api/api';
import { theme } from '../styles/theme';

const api = new Api();

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalIngredients: number;
  lowStockCount: number;
}

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { rates } = useCurrencyStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalIngredients: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!token) return;
    try {
      // Fetch orders
      const [ordersRes, productsRes, ingredientsRes] = await Promise.all([
      api.get<any[]>('orders', 'orders', token),
      api.get<any[]>('catalog', 'products', token),
      api.get<any[]>('catalog', 'ingredients', token),
    ]);
    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const ingredients = ingredientsRes.data || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => ['PENDING', 'PAID', 'PREPARING'].includes(o.status)).length,
        completedOrders: orders.filter((o: any) => o.status === 'DELIVERED').length,
        totalRevenue: orders
          .filter((o: any) => o.status === 'DELIVERED')
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        totalProducts: products.length,
        totalIngredients: ingredients.length,
        lowStockCount: ingredients.filter((i: any) => i.stock < 10).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

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
          ?? Dashboard
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
          <StatCard
            icon="??"
            title="Total Pedidos"
            value={stats.totalOrders}
            color="#3B82F6"
          />
          <StatCard
            icon="?"
            title="Pendientes"
            value={stats.pendingOrders}
            color="#F59E0B"
          />
          <StatCard
            icon="?"
            title="Completados"
            value={stats.completedOrders}
            color="#10B981"
          />
          <StatCard
            icon="??"
            title="Ingresos"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="#8B5CF6"
          />
          <StatCard
            icon="??"
            title="Productos"
            value={stats.totalProducts}
            color="#EC4899"
          />
          <StatCard
            icon="??"
            title="Ingredientes"
            value={stats.totalIngredients}
            color="#06B6D4"
          />
        </View>

        {/* Low Stock Alert */}
        {stats.lowStockCount > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#FCD34D',
            }}
            onPress={() => navigation.navigate('InventoryAdmin')}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>
              ?? Stock Bajo
            </Text>
            <Text style={{ fontSize: 13, color: '#78350F', marginTop: 4 }}>
              {stats.lowStockCount} ingredientes tienen stock bajo. Toca para ver inventario.
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            Acciones Rápidas
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <QuickAction
              icon="??"
              title="Ver Pedidos"
              onPress={() => navigation.navigate('OrdersAdmin')}
            />
            <QuickAction
              icon="??"
              title="Inventario"
              onPress={() => navigation.navigate('InventoryAdmin')}
            />
            <QuickAction
              icon="??"
              title="Tasas de Cambio"
              onPress={() => navigation.navigate('CurrencyRates')}
            />
            <QuickAction
              icon="??"
              title="Pago Móvil"
              onPress={() => navigation.navigate('PaymentConfig')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: any; color: string }) => (
  <View style={{
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  }}>
    <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase' }}>{title}</Text>
    <Text style={{ fontSize: 20, fontWeight: '700', color, marginTop: 4 }}>{value}</Text>
  </View>
);

const QuickAction = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
  <TouchableOpacity
    style={{
      width: '48%',
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }}
    onPress={onPress}
  >
    <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, textAlign: 'center' }}>{title}</Text>
  </TouchableOpacity>
);


