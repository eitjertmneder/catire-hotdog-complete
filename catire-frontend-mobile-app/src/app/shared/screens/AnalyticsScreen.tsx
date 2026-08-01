import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/ThemeContext';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { useAuthStore } from '../store/auth.store';

const BRANCH_COLORS: Record<string, string> = {
  'Barrio Sucre': '#EC3137',
  'Carabobo': '#2563EB',
  'El Malecon': '#059669',
  'Prados del Este': '#7C3AED',
  'Barrio Obrero': '#D97706',
};

const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

export const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { orders, loading, fetchOrders } = useOrdersStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) fetchOrders(token);
  }, [token]);

  const analytics = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => {
      const orderTotal = (o.items || []).reduce((s, item) => s + item.base_price * item.quantity, 0);
      return sum + orderTotal;
    }, 0);

    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const revenueByBranch: Record<string, number> = {};
    for (const o of paidOrders) {
      const branchName = o.user?.branch_id ? `Sucursal ${o.user.branch_id}` : 'Sin sucursal';
      const orderTotal = (o.items || []).reduce((s, item) => s + item.base_price * item.quantity, 0);
      revenueByBranch[branchName] = (revenueByBranch[branchName] || 0) + orderTotal;
    }

    const productMap: Record<number, { name: string; count: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of o.items || []) {
        const existing = productMap[item.product_id];
        if (existing) {
          existing.count += item.quantity;
          existing.revenue += item.base_price * item.quantity;
        } else {
          productMap[item.product_id] = {
            name: `Producto #${item.product_id}`,
            count: item.quantity,
            revenue: item.base_price * item.quantity,
          };
        }
      }
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const hourlyMap: Record<number, number> = {};
    for (const o of paidOrders) {
      const hour = new Date(o.created_at).getHours();
      const orderTotal = (o.items || []).reduce((s, item) => s + item.base_price * item.quantity, 0);
      hourlyMap[hour] = (hourlyMap[hour] || 0) + orderTotal;
    }
    const hourlySales = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => ({
      hour: h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
      sales: hourlyMap[h] || 0,
    }));

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const dailyMap: Record<number, number> = {};
    for (const o of paidOrders) {
      const day = new Date(o.created_at).getDay();
      const orderTotal = (o.items || []).reduce((s, item) => s + item.base_price * item.quantity, 0);
      dailyMap[day] = (dailyMap[day] || 0) + orderTotal;
    }
    const dailyTrend = dayNames.map((day, idx) => ({
      day,
      sales: dailyMap[idx] || 0,
    }));

    const branchSales = Object.entries(revenueByBranch).map(([name, sales], idx) => ({
      name,
      sales,
      color: BRANCH_COLORS[name] || ['#EC3137', '#2563EB', '#059669', '#7C3AED', '#D97706'][idx % 5],
    }));

    return { totalRevenue, totalOrders: orders.length, statusCounts, branchSales, topProducts, hourlySales, dailyTrend };
  }, [orders]);

  const hasData = orders.length > 0;
  const maxBranch = Math.max(...analytics.branchSales.map(b => b.sales), 1);
  const maxHourly = Math.max(...analytics.hourlySales.map(h => h.sales), 1);
  const maxDaily = Math.max(...analytics.dailyTrend.map(d => d.sales), 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\u{1F4CA}'} Analisis</Text>
      </View>

      {loading && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && !hasData && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4CA}'}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>Sin datos</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
            Aun no hay ordenes registradas. Los analisis apareceran cuando haya pedidos.
          </Text>
        </View>
      )}

      {!loading && hasData && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: '#EC3137', borderRadius: 14, padding: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>{'\u{1F4B0}'} Ventas Total</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>${analytics.totalRevenue.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2563EB', borderRadius: 14, padding: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>{'\u{1F4E6}'} Pedidos</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{analytics.totalOrders}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <View key={status} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted }}>{status}</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{count}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F4C8}'} Ventas por Hora</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            {analytics.hourlySales.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ width: 45, fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>{item.hour}</Text>
                <View style={{ flex: 1, height: 12, backgroundColor: colors.borderLight, borderRadius: 6, overflow: 'hidden', marginHorizontal: 8 }}>
                  <View style={{ height: '100%', backgroundColor: '#EC3137', borderRadius: 6, flex: maxHourly > 0 ? item.sales / maxHourly : 0 }} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary, width: 70, textAlign: 'right' }}>${item.sales.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F3EA}'} Ventas por Sucursal</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            {analytics.branchSales.map((branch, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: branch.color, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{branch.name}</Text>
                  <View style={{ height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                    <View style={{ height: '100%', backgroundColor: branch.color, borderRadius: 3, flex: maxBranch > 0 ? branch.sales / maxBranch : 0 }} />
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: branch.color, marginLeft: 8 }}>${branch.sales.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F3C6}'} Productos Mas Vendidos</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            {analytics.topProducts.length === 0 && (
              <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', padding: 12 }}>Sin productos vendidos</Text>
            )}
            {analytics.topProducts.map((product, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < analytics.topProducts.length - 1 ? 1 : 0, borderBottomColor: colors.borderLight }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: idx === 0 ? '#FCD34D' : idx === 1 ? '#D1D5DB' : idx === 2 ? '#F59E0B' : '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: idx < 3 ? '#fff' : '#94A3B8' }}>{idx < 3 ? MEDALS[idx] : (idx + 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{product.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{product.count} vendidos</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#059669' }}>${product.revenue.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F4C9}'} Tendencia Diaria</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            {analytics.dailyTrend.map((day, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ width: 35, fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{day.day}</Text>
                <View style={{ flex: 1, height: 20, backgroundColor: colors.borderLight, borderRadius: 10, overflow: 'hidden', marginHorizontal: 10 }}>
                  <View style={{ height: '100%', backgroundColor: '#EC3137', borderRadius: 10, flex: maxDaily > 0 ? day.sales / maxDaily : 0 }} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, width: 70, textAlign: 'right' }}>${day.sales.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
