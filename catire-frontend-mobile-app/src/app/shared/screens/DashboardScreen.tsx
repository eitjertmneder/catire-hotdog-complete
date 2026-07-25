import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useCurrencyStore } from '../store/currency.store';
import { Api } from '../api/api';
import { theme } from '../styles/theme';
import { useAppTheme } from '../contexts/ThemeContext';

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

const BRANCHES = [
  { name: 'Barrio Sucre', country: 'Venezuela', lat: 10.4806, lng: -66.9036, status: 'Activa' },
  { name: 'Carabobo', country: 'Venezuela', lat: 10.4680, lng: -66.9520, status: 'Activa' },
  { name: 'El Malecon', country: 'Colombia', lat: 7.8891, lng: -72.4967, status: 'Activa' },
  { name: 'Prados del Este', country: 'Colombia', lat: 7.7669, lng: -72.3350, status: 'Activa' },
  { name: 'Barrio Obrero', country: 'Venezuela', lat: 10.4916, lng: -66.8790, status: 'Activa' },
  { name: 'La Asogata', country: 'Venezuela', lat: 10.4520, lng: -66.9320, status: 'Activa' },
  { name: 'La Grita', country: 'Venezuela', lat: 8.133760, lng: -71.978650, status: 'Activa' },
  { name: 'Sambil', country: 'Venezuela', lat: 10.4710, lng: -66.9260, status: 'Activa' },
  { name: 'Mestizos', country: 'Venezuela', lat: 10.4650, lng: -66.9100, status: 'Activa' },
];

const FLAG: Record<string, string> = {
  Venezuela: '\u{1F1FB}\u{1F1EA}',
  Colombia: '\u{1F1E8}\u{1F1F4}',
};

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { rates } = useCurrencyStore();
  const { isDark, colors } = useAppTheme();
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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          Dashboard
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
          <StatCard
            icon={'\u{1F4CB}'}
            title="Total Pedidos"
            value={stats.totalOrders}
            color="#3B82F6"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <StatCard
            icon={'\u{23F3}'}
            title="Pendientes"
            value={stats.pendingOrders}
            color="#F59E0B"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <StatCard
            icon={'\u{2705}'}
            title="Completados"
            value={stats.completedOrders}
            color="#10B981"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <StatCard
            icon={'\u{1F4B0}'}
            title="Ingresos"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="#8B5CF6"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <StatCard
            icon={'\u{1F37D}'}
            title="Productos"
            value={stats.totalProducts}
            color="#EC4899"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <StatCard
            icon={'\u{1F9CA}'}
            title="Ingredientes"
            value={stats.totalIngredients}
            color="#06B6D4"
            isDark={isDark}
            surfaceColor={colors.surface}
            textColor={colors.textPrimary}
          />
        </View>

        {/* Low Stock Alert */}
        {stats.lowStockCount > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: isDark ? '#3B2F10' : '#FEF3C7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: isDark ? '#5C4A1A' : '#FCD34D',
            }}
            onPress={() => navigation.navigate('InventoryAdmin')}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FBBF24' : '#92400E' }}>
              {'\u{26A0}'} Stock Bajo
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? '#D4A843' : '#78350F', marginTop: 4 }}>
              {stats.lowStockCount} ingredientes tienen stock bajo. Toca para ver inventario.
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
            {'\u{26A1}'} Acciones R\u00E1pidas
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <QuickAction
              icon={'\u{1F4CB}'}
              title="Ver Pedidos"
              onPress={() => navigation.navigate('OrdersAdmin')}
              isDark={isDark}
              surfaceColor={colors.surface}
              textColor={colors.textPrimary}
            />
            <QuickAction
              icon={'\u{1F4E8}'}
              title="Inventario"
              onPress={() => navigation.navigate('InventoryAdmin')}
              isDark={isDark}
              surfaceColor={colors.surface}
              textColor={colors.textPrimary}
            />
            <QuickAction
              icon={'\u{1F4B1}'}
              title="Tasas de Cambio"
              onPress={() => navigation.navigate('CurrencyRates')}
              isDark={isDark}
              surfaceColor={colors.surface}
              textColor={colors.textPrimary}
            />
            <QuickAction
              icon={'\u{1F4B3}'}
              title="Pago M\u00F3vil"
              onPress={() => navigation.navigate('PaymentConfig')}
              isDark={isDark}
              surfaceColor={colors.surface}
              textColor={colors.textPrimary}
            />
          </View>
        </View>

        {/* Sucursales Section */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
            {'\u{1F3EA}'} Sucursales ({BRANCHES.length})
          </Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.tableHeaderText, { flex: 2.2 }]}>Sucursal</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.3 }]}>Pa\u00EDs</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.8, textAlign: 'right' }]}>Coordenadas</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Estado</Text>
            </View>

            {/* Table Rows */}
            {BRANCHES.map((branch, index) => (
              <View
                key={branch.name}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: index % 2 === 0
                      ? (isDark ? '#1A1A1A' : '#FAFAFA')
                      : (isDark ? '#222222' : '#FFFFFF'),
                    borderBottomWidth: index < BRANCHES.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }
                ]}
              >
                <View style={{ flex: 2.2 }}>
                  <Text style={[styles.rowText, { color: colors.textPrimary, fontWeight: '600' }]}>{branch.name}</Text>
                </View>
                <View style={{ flex: 1.3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14 }}>{FLAG[branch.country] || '\u{1F30D}'}</Text>
                  <Text style={[styles.rowText, { color: colors.textSecondary }]}>{branch.country}</Text>
                </View>
                <View style={{ flex: 1.8, alignItems: 'flex-end' }}>
                  <Text style={[styles.rowCoord, { color: colors.textMuted }]}>
                    {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.statusText}>{branch.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({
  icon, title, value, color, isDark, surfaceColor, textColor
}: {
  icon: string; title: string; value: any; color: string;
  isDark: boolean; surfaceColor: string; textColor: string;
}) => (
  <View style={{
    width: '48%',
    backgroundColor: surfaceColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.15 : 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#F3F4F6',
  }}>
    <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ fontSize: 12, color: isDark ? '#999' : theme.colors.textMuted, textTransform: 'uppercase' }}>{title}</Text>
    <Text style={{ fontSize: 20, fontWeight: '700', color, marginTop: 4 }}>{value}</Text>
  </View>
);

const QuickAction = ({
  icon, title, onPress, isDark, surfaceColor, textColor
}: {
  icon: string; title: string; onPress: () => void;
  isDark: boolean; surfaceColor: string; textColor: string;
}) => (
  <TouchableOpacity
    style={{
      width: '48%',
      backgroundColor: surfaceColor,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.06,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#F3F4F6',
    }}
    onPress={onPress}
  >
    <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: textColor, textAlign: 'center' }}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowCoord: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
});
