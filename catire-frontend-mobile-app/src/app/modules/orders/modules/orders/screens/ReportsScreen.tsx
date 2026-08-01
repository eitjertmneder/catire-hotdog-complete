import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { Api } from '../../../../../shared/api/api';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';
import { generateAndSharePDF, buildDailyReportHTML, buildSummaryReportHTML } from '../../../../../shared/utils/pdf';

const api = new Api();

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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendientes',
  PAID: 'Pagadas',
  PREPARING: 'Preparando',
  READY: 'Listas',
  ON_THE_WAY: 'En Camino',
  DELIVERED: 'Entregadas',
  CANCELLED: 'Canceladas',
};

export const ReportsScreen = () => {
  const navigation = useNavigation();
  const { token, user } = useAuthStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { colors } = useAppTheme();
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
    if (token) fetchOrders(token);
  }, [period]);

  const branchName = BRANCHES.find(b => b.id === user?.branch_id)?.name || `Sucursal ${user?.branch_id || 'N/A'}`;

  const generateDailyReport = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    const ordersByStatus: Record<string, number> = {};
    const todayOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      return orderDate.toDateString() === today.toDateString();
    });

    todayOrders.forEach((o: any) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    const totalRevenue = todayOrders.reduce((sum: number, o: any) => {
      const orderTotal = (o.items || []).reduce((itemSum: number, item: any) => {
        return itemSum + (item.base_price || 0) * (item.quantity || 1);
      }, 0);
      return sum + orderTotal;
    }, 0);

    const statusLines = Object.entries(ordersByStatus)
      .map(([status, count]) => `  - ${STATUS_LABELS[status] || status}: ${count}`)
      .join('\n');

    const text = [
      `*Reporte Diario - Catire Hot Dog*`,
      `Fecha: ${dateStr}`,
      `Sucursal: ${branchName}`,
      ``,
      `Total de ordenes: ${todayOrders.length}`,
      `Ingresos totales: $${totalRevenue.toFixed(2)}`,
      ``,
      `Ordenes por estado:`,
      statusLines || '  - Sin ordenes hoy',
    ].join('\n');

    Alert.alert('Reporte Diario', 'Como deseas compartir el reporte?', [
      { 
        text: 'WhatsApp', 
        onPress: () => {
          const phoneNumber = '584127995855';
          const encodedText = encodeURIComponent(text);
          const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
          
          Linking.canOpenURL(url).then((supported) => {
            if (supported) {
              Linking.openURL(url);
            } else {
              const altUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
              Linking.openURL(altUrl).catch(() => {
                Alert.alert('Error', 'No se pudo abrir WhatsApp.');
              });
            }
          });
        }
      },
      { 
        text: 'PDF', 
        onPress: () => {
          generateAndSharePDF(
            `Reporte Diario - ${dateStr}`,
            buildDailyReportHTML({
              branchName,
              totalOrders: todayOrders.length,
              totalRevenue,
              averageOrder: todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0,
              ordersByStatus,
              statusLabels: STATUS_LABELS,
            }),
          );
        }
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const shareViaWhatsApp = () => {
    const periodLabel = period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes';
    const text = [
      `*Reporte Catire Hot Dog*`,
      `Periodo: ${periodLabel}`,
      ``,
      `Total de ordenes: ${report?.totalOrders || 0}`,
      `Ingresos totales: $${(report?.totalRevenue || 0).toFixed(2)}`,
      `Orden promedio: $${(report?.averageOrder || 0).toFixed(2)}`,
    ].join('\n');
    const url = `https://wa.me/584127995855?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header con boton volver */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>{'<-'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>{'\uD83D\uDCCA'} Reportes</Text>
      </View>

      {/* Daily Report Button */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#25D366',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#25D366',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={generateDailyReport}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {'\uD83D\uDCC4'} Generar Reporte Diario
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
            Enviar resumen del dia por WhatsApp
          </Text>
        </TouchableOpacity>
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
              backgroundColor: period === p ? colors.primary : colors.white,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: period === p ? 0.15 : 0.04,
              shadowRadius: 4,
              elevation: period === p ? 3 : 1,
            }}
            onPress={() => setPeriod(p)}
          >
            <Text style={{ color: period === p ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {report ? (
            <View style={{
              backgroundColor: colors.white, borderRadius: 16, padding: 20,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.textPrimary }}>Resumen</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textSecondary }}>Total de ordenes:</Text>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{report.totalOrders || 0}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textSecondary }}>Ingresos totales:</Text>
                <Text style={{ fontWeight: '700', color: colors.success }}>${(report.totalRevenue || 0).toFixed(2)}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary }}>Orden promedio:</Text>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>${(report.averageOrder || 0).toFixed(2)}</Text>
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
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  marginTop: 10,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={() => {
                  const periodLabel = period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes';
                  generateAndSharePDF(
                    `Reporte Catire Hot Dog - ${periodLabel}`,
                    buildSummaryReportHTML({
                      totalOrders: report?.totalOrders || 0,
                      totalRevenue: report?.totalRevenue || 0,
                      averageOrder: report?.averageOrder || 0,
                      periodLabel,
                    }),
                  );
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  {'\uD83D\uDCC4'} Generar PDF
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCCA'}</Text>
              <Text style={{ fontSize: 15, color: colors.textMuted }}>No hay datos disponibles</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
