import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useReportingStore, Report } from '../store/reporting.store';
import { useAppTheme } from '../contexts/ThemeContext';
import { generateAndSharePDF, buildAdminReportHTML, buildCajeroReportHTML } from '../utils/pdf';

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

const CAJERO_REPORTS_PLACEHOLDER = [
  { id: '1', branch: 'Barrio Sucre', cajero: 'Maria Gonzalez', date: '2026-07-26', orders: 23, revenue: 345.50 },
  { id: '2', branch: 'Libertadores', cajero: 'Carlos Rodriguez', date: '2026-07-26', orders: 18, revenue: 267.00 },
  { id: '3', branch: 'Prados del Este', cajero: 'Ana Martinez', date: '2026-07-26', orders: 31, revenue: 489.75 },
  { id: '4', branch: 'Sambil', cajero: 'Pedro Lopez', date: '2026-07-25', orders: 27, revenue: 412.25 },
  { id: '5', branch: 'Centro', cajero: 'Luisa Fernandez', date: '2026-07-25', orders: 15, revenue: 198.50 },
];

export const AdvancedReportsScreen = () => {
  const navigation = useNavigation();
  const { reports, generateReport, deleteReport } = useReportingStore();
  const { colors } = useAppTheme();
  const [selectedType, setSelectedType] = useState<Report['type']>('sales');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [showCajeroReports, setShowCajeroReports] = useState(false);

  const reportTypes: { type: Report['type']; label: string; icon: string }[] = [
    { type: 'sales', label: 'Ventas', icon: '\uD83D\uDCCA' },
    { type: 'inventory', label: 'Inventario', icon: '\uD83D\uDCE6' },
    { type: 'orders', label: 'Pedidos', icon: '\uD83D\uDED2' },
    { type: 'products', label: 'Productos', icon: '\uD83C\uDF54' },
    { type: 'employees', label: 'Empleados', icon: '\uD83D\uDC65' },
  ];

  const getDateRange = () => {
    const now = new Date();
    const from = new Date();

    switch (dateRange) {
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(now.getMonth() - 3);
        break;
    }

    return { from, to: now };
  };

  const handleGenerate = async () => {
    const { from, to } = getDateRange();
    const report = await generateReport(selectedType, from, to);
    Alert.alert('Exito', `Reporte "${report.title}" generado para todas las sucursales`);
  };

  const sendViaWhatsApp = (report: Report) => {
    const periodLabel = dateRange === 'week' ? 'Ultima Semana' : dateRange === 'month' ? 'Ultimo Mes' : 'Ultimo Trimestre';
    const text = [
      `*${report.title}*`,
      `Tipo: ${report.type}`,
      `Periodo: ${periodLabel}`,
      `Sucursales: Todas`,
      `Generado: ${new Date(report.generated_at).toLocaleDateString()}`,
    ].join('\n');
    const phoneNumber = '584127995855';
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const altUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
        Linking.openURL(altUrl).catch(() => {
          Alert.alert('Error', 'No se pudo abrir WhatsApp');
        });
      }
    });
  };

  const sendCajeroReportWhatsApp = (r: any) => {
    const text = [
      `*Reporte Cajero - ${r.branch}*`,
      `Cajero: ${r.cajero}`,
      `Fecha: ${r.date}`,
      `Ordenes: ${r.orders}`,
      `Ingresos: $${r.revenue.toFixed(2)}`,
    ].join('\n');
    const phoneNumber = '584127995855';
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const altUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
        Linking.openURL(altUrl).catch(() => {
          Alert.alert('Error', 'No se pudo abrir WhatsApp');
        });
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {'\uD83D\uDCCA'} Reportes
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Tab selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1, paddingVertical: 12, borderRadius: 10,
              backgroundColor: !showCajeroReports ? colors.primary : colors.white,
              alignItems: 'center', borderWidth: 1,
              borderColor: !showCajeroReports ? colors.primary : colors.border,
            }}
            onPress={() => setShowCajeroReports(false)}
          >
            <Text style={{
              fontSize: 14, fontWeight: '600',
              color: !showCajeroReports ? '#fff' : colors.textPrimary,
            }}>
              {'\uD83D\uDCC8'} Reportes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1, paddingVertical: 12, borderRadius: 10,
              backgroundColor: showCajeroReports ? colors.primary : colors.white,
              alignItems: 'center', borderWidth: 1,
              borderColor: showCajeroReports ? colors.primary : colors.border,
            }}
            onPress={() => setShowCajeroReports(true)}
          >
            <Text style={{
              fontSize: 14, fontWeight: '600',
              color: showCajeroReports ? '#fff' : colors.textPrimary,
            }}>
              {'\uD83D\uDCC4'} Reportes de Cajeros
            </Text>
          </TouchableOpacity>
        </View>

        {!showCajeroReports ? (
          <>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              Tipo de Reporte (Todas las Sucursales)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {reportTypes.map((rt) => (
                <TouchableOpacity
                  key={rt.type}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: selectedType === rt.type ? colors.primary : colors.white,
                    borderWidth: 1,
                    borderColor: selectedType === rt.type ? colors.primary : colors.border,
                  }}
                  onPress={() => setSelectedType(rt.type)}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: selectedType === rt.type ? '#fff' : colors.textPrimary,
                  }}>
                    {rt.icon} {rt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              Periodo
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['week', 'month', 'quarter'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: dateRange === range ? colors.primary : colors.white,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: dateRange === range ? colors.primary : colors.border,
                  }}
                  onPress={() => setDateRange(range)}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: dateRange === range ? '#fff' : colors.textPrimary,
                  }}>
                    {range === 'week' ? 'Ultima Semana' : range === 'month' ? 'Ultimo Mes' : 'Ultimo Trimestre'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
              }}
              onPress={handleGenerate}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{'\uD83D\uDD0D'} Generar Reporte</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              Reportes Generados
            </Text>

            {reports.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCCB'}</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>No hay reportes generados</Text>
              </View>
            ) : (
              reports.map((report) => (
                <View
                  key={report.id}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 10,
                    backgroundColor: colors.background,
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 20 }}>
                      {reportTypes.find(rt => rt.type === report.type)?.icon || '\uD83D\uDCC4'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                      {report.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      {new Date(report.generated_at).toLocaleDateString()} | Todas las sucursales
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{ padding: 8 }}
                      onPress={() => sendViaWhatsApp(report)}
                    >
                      <Text>{'\uD83D\uDCAC'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 8 }}
                      onPress={() => generateAndSharePDF(report.title, buildAdminReportHTML(report))}
                    >
                      <Text>{'\uD83D\uDCC4'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 8 }}
                      onPress={() => {
                        Alert.alert('Eliminar', 'Eliminar este reporte?', [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Eliminar', style: 'destructive', onPress: () => deleteReport(report.id) },
                        ]);
                      }}
                    >
                      <Text>{'\uD83D\uDDD1\uFE0F'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              {'\uD83D\uDCC4'} Reportes de Cajeros por Sucursal
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 16 }}>
              Reportes diarios enviados por los cajeros de cada sucursal
            </Text>

            {CAJERO_REPORTS_PLACEHOLDER.map((r) => (
              <View
                key={r.id}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 10,
                      backgroundColor: '#EDE9FE',
                      justifyContent: 'center', alignItems: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>{'\uD83C\uDFEA'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{r.branch}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Cajero: {r.cajero}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Fecha:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>{r.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Ordenes:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>{r.orders}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Ingresos:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#10B981' }}>${r.revenue.toFixed(2)}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#D1FAE5', alignItems: 'center' }}
                    onPress={() => sendCajeroReportWhatsApp(r)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#065F46' }}>{'\uD83D\uDCAC'} WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#DBEAFE', alignItems: 'center' }}
                    onPress={() => generateAndSharePDF(`Reporte ${r.branch} - ${r.date}`, buildCajeroReportHTML(r))}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563EB' }}>{'\uD83D\uDCC4'} PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
