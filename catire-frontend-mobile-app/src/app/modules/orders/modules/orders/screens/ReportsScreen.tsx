import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Api } from '../../../../../shared/api/api';
import { theme } from '../../../../../shared/styles/theme';

const api = new Api();

export const ReportsScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const fetchReport = async () => {
    if (!token) return;
    setLoading(true);
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    const start = startDate.toISOString().split('T')[0];

    const res = await api.get('orders', `orders/reports/daily?date=${start}`, token);
    if (!res.error && res.data) {
      setReport(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const shareViaWhatsApp = () => {
    const periodLabel = period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes';
    const text = [
      `*Reporte Catire Hot Dog*`,
      `Periodo: ${periodLabel}`,
      ``,
      `Total de órdenes: ${report?.totalOrders || 0}`,
      `Ingresos totales: $${(report?.totalRevenue || 0).toFixed(2)}`,
      `Orden promedio: $${(report?.averageOrder || 0).toFixed(2)}`,
    ].join('\n');
    const url = `https://wa.me/584127995855?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header con botón volver */}
      <View style={{ 
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>📊 Reportes</Text>
      </View>

      {/* Period Selector */}
      <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              backgroundColor: period === p ? theme.colors.primary : theme.colors.white,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: period === p ? 0.15 : 0.04,
              shadowRadius: 4,
              elevation: period === p ? 3 : 1,
            }}
            onPress={() => setPeriod(p)}
          >
            <Text style={{ color: period === p ? '#fff' : theme.colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {report ? (
            <View style={{ 
              backgroundColor: theme.colors.white, borderRadius: 16, padding: 20, 
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: theme.colors.textPrimary }}>Resumen</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <Text style={{ color: theme.colors.textSecondary }}>Total de órdenes:</Text>
                <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{report.totalOrders || 0}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <Text style={{ color: theme.colors.textSecondary }}>Ingresos totales:</Text>
                <Text style={{ fontWeight: '700', color: theme.colors.success }}>${(report.totalRevenue || 0).toFixed(2)}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textSecondary }}>Orden promedio:</Text>
                <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>${(report.averageOrder || 0).toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: '#25D366',
                  marginTop: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={shareViaWhatsApp}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Enviar por WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
              <Text style={{ fontSize: 15, color: theme.colors.textMuted }}>No hay datos disponibles</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
