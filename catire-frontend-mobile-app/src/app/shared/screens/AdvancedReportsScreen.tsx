import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useReportingStore, Report } from '../store/reporting.store';
import { theme } from '../styles/theme';

export const AdvancedReportsScreen = () => {
  const navigation = useNavigation();
  const { reports, generateReport, deleteReport, getReports } = useReportingStore();
  const [selectedType, setSelectedType] = useState<Report['type']>('sales');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');

  const reportTypes: { type: Report['type']; label: string; icon: string }[] = [
    { type: 'sales', label: 'Ventas', icon: '??' },
    { type: 'inventory', label: 'Inventario', icon: '??' },
    { type: 'orders', label: 'Pedidos', icon: '??' },
    { type: 'products', label: 'Productos', icon: '??' },
    { type: 'employees', label: 'Empleados', icon: '??' },
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
    Alert.alert('Éxito', `Reporte "${report.title}" generado`);
  };

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
          ?? Reportes Avanzados
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Report Type Selector */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
          Tipo de Reporte
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {reportTypes.map((rt) => (
            <TouchableOpacity
              key={rt.type}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selectedType === rt.type ? theme.colors.primary : theme.colors.white,
                borderWidth: 1,
                borderColor: selectedType === rt.type ? theme.colors.primary : theme.colors.border,
              }}
              onPress={() => setSelectedType(rt.type)}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: selectedType === rt.type ? '#fff' : theme.colors.textPrimary,
              }}>
                {rt.icon} {rt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range Selector */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
          Período
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: dateRange === range ? theme.colors.primary : theme.colors.white,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: dateRange === range ? theme.colors.primary : theme.colors.border,
              }}
              onPress={() => setDateRange(range)}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: dateRange === range ? '#fff' : theme.colors.textPrimary,
              }}>
                {range === 'week' ? 'Última Semana' : range === 'month' ? 'Último Mes' : 'Último Trimestre'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 20,
          }}
          onPress={handleGenerate}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>?? Generar Reporte</Text>
        </TouchableOpacity>

        {/* Previous Reports */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
          Reportes Generados
        </Text>
        
        {reports.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>??</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>No hay reportes generados</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View
              key={report.id}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 10,
                backgroundColor: theme.colors.background,
                justifyContent: 'center', alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 20 }}>
                  {reportTypes.find(rt => rt.type === report.type)?.icon || '??'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>
                  {report.title}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  {new Date(report.generated_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => Alert.alert('Exportar', 'PDF export functionality')}
                >
                  <Text>??</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => Alert.alert('Exportar', 'CSV export functionality')}
                >
                  <Text>??</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => {
                    Alert.alert('Eliminar', '¿Eliminar este reporte?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => deleteReport(report.id) },
                    ]);
                  }}
                >
                  <Text>???</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

