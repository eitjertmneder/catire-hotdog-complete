import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { Api } from '../api/api';
import { theme } from '../styles/theme';

const api = new Api();
const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; count: number; revenue: number }[];
  salesByHour: { hour: number; sales: number }[];
  salesByBranch: { branch: string; sales: number }[];
  dailyTrend: { date: string; sales: number }[];
}

export const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByHour: [],
    salesByBranch: [],
    dailyTrend: [],
  });
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    // Simulated analytics data
    setAnalytics({
      totalSales: 12500,
      totalOrders: 342,
      averageOrderValue: 36.55,
      topProducts: [
        { name: 'Perro Caliente Normal', count: 156, revenue: 546 },
        { name: 'Hamburguesa Sencilla', count: 89, revenue: 356 },
        { name: 'Salchipapa Normal', count: 67, revenue: 301.5 },
        { name: 'Coca Cola 2L', count: 45, revenue: 112.5 },
        { name: 'Agua Mineral', count: 34, revenue: 34 },
      ],
      salesByHour: [
        { hour: 10, sales: 800 },
        { hour: 11, sales: 1200 },
        { hour: 12, sales: 2500 },
        { hour: 13, sales: 2200 },
        { hour: 14, sales: 1800 },
        { hour: 15, sales: 1500 },
        { hour: 16, sales: 1200 },
        { hour: 17, sales: 900 },
        { hour: 18, sales: 600 },
      ],
      salesByBranch: [
        { branch: 'Barrio Sucre', sales: 3200 },
        { branch: 'Carabobo', sales: 2800 },
        { branch: 'El Malecón', sales: 2500 },
        { branch: 'Prados del Este', sales: 2100 },
        { branch: 'Barrio Obrero', sales: 1900 },
      ],
      dailyTrend: [
        { date: 'Lun', sales: 1800 },
        { date: 'Mar', sales: 2100 },
        { date: 'Mié', sales: 1900 },
        { date: 'Jue', sales: 2400 },
        { date: 'Vie', sales: 2800 },
        { date: 'Sáb', sales: 3200 },
        { date: 'Dom', sales: 2500 },
      ],
    });
  };

  const renderBarChart = (data: { label: string; value: number; maxValue: number }[]) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120 }}>
      {data.map((item, index) => (
        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 20,
            height: (item.value / item.maxValue) * 100,
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
            marginBottom: 4,
          }} />
          <Text style={{ fontSize: 10, color: theme.colors.textMuted }}>{item.label}</Text>
        </View>
      ))}
    </View>
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
          ?? Analytics
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Period Selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['day', 'week', 'month'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: period === p ? theme.colors.primary : theme.colors.white,
                alignItems: 'center',
              }}
              onPress={() => setPeriod(p)}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: period === p ? '#fff' : theme.colors.textPrimary,
              }}>
                {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <View style={{ width: '48%', backgroundColor: theme.colors.white, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>Ventas Totales</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#10B981', marginTop: 4 }}>
              ${analytics.totalSales.toLocaleString()}
            </Text>
          </View>
          <View style={{ width: '48%', backgroundColor: theme.colors.white, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>Total Pedidos</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#3B82F6', marginTop: 4 }}>
              {analytics.totalOrders}
            </Text>
          </View>
          <View style={{ width: '100%', backgroundColor: theme.colors.white, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>Promedio por Pedido</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#8B5CF6', marginTop: 4 }}>
              ${analytics.averageOrderValue.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Sales by Hour Chart */}
        <View style={{ backgroundColor: theme.colors.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            ?? Ventas por Hora
          </Text>
          {renderBarChart(
            analytics.salesByHour.map(h => ({
              label: `${h.hour}:00`,
              value: h.sales,
              maxValue: Math.max(...analytics.salesByHour.map(x => x.sales)),
            }))
          )}
        </View>

        {/* Sales by Branch */}
        <View style={{ backgroundColor: theme.colors.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            ?? Ventas por Sucursal
          </Text>
          {analytics.salesByBranch.map((branch, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ flex: 1, fontSize: 13, color: theme.colors.textPrimary }}>{branch.branch}</Text>
              <View style={{ flex: 2, height: 8, backgroundColor: theme.colors.borderLight, borderRadius: 4, marginHorizontal: 8 }}>
                <View style={{
                  width: `${(branch.sales / analytics.salesByBranch[0].sales) * 100}%`,
                  height: '100%',
                  backgroundColor: theme.colors.primary,
                  borderRadius: 4,
                }} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary }}>
                ${branch.sales.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Products */}
        <View style={{ backgroundColor: theme.colors.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            ?? Productos Más Vendidos
          </Text>
          {analytics.topProducts.map((product, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: index < analytics.topProducts.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border,
            }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>
                {index === 0 ? '??' : index === 1 ? '??' : index === 2 ? '??' : `${index + 1}.`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>
                  {product.name}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  {product.count} vendidos
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#10B981' }}>
                ${product.revenue.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Daily Trend */}
        <View style={{ backgroundColor: theme.colors.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
            ?? Tendencia Diaria
          </Text>
          {renderBarChart(
            analytics.dailyTrend.map(d => ({
              label: d.date,
              value: d.sales,
              maxValue: Math.max(...analytics.dailyTrend.map(x => x.sales)),
            }))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

