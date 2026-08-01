import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/ThemeContext';
import { generateAndSharePDF, buildCajeroReportHTML } from '../utils/pdf';

let Print: any;
let Sharing: any;
try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch {
  // Not available in Expo Go
}

const CAJERO_REPORTS = [
  { id: '1', branch: 'Barrio Sucre', cajero: 'Maria Gonzalez', date: '2026-07-26', orders: 23, revenue: 345.50 },
  { id: '2', branch: 'Libertadores', cajero: 'Carlos Rodriguez', date: '2026-07-26', orders: 18, revenue: 267.00 },
  { id: '3', branch: 'Prados del Este', cajero: 'Ana Martinez', date: '2026-07-26', orders: 31, revenue: 489.75 },
  { id: '4', branch: 'Sambil', cajero: 'Pedro Lopez', date: '2026-07-25', orders: 27, revenue: 412.25 },
  { id: '5', branch: 'Centro', cajero: 'Luisa Fernandez', date: '2026-07-25', orders: 15, revenue: 198.50 },
  { id: '6', branch: 'La Concordia', cajero: 'Jose Ramirez', date: '2026-07-25', orders: 20, revenue: 310.00 },
  { id: '7', branch: 'Barrio Obrero', cajero: 'Carmen Diaz', date: '2026-07-24', orders: 12, revenue: 156.75 },
  { id: '8', branch: 'Mestizos', cajero: 'Roberto Silva', date: '2026-07-24', orders: 19, revenue: 278.25 },
  { id: '9', branch: 'Carabobo', cajero: 'Elena Vargas', date: '2026-07-24', orders: 25, revenue: 395.00 },
];

export const PDFReportsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<-'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\uD83D\uDCC4'} Reportes de Cajeros</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 16, padding: 16,
          marginBottom: 16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
            Reportes Diarios por Sucursal
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {CAJERO_REPORTS.length} reportes de cajeros | Todas las sucursales
          </Text>
        </View>

        {CAJERO_REPORTS.map((r) => (
          <View
            key={r.id}
            style={{
              backgroundColor: colors.white,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
              borderLeftWidth: 4,
              borderLeftColor: '#7C3AED',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: '#EDE9FE',
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>{'\uD83C\uDFEA'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{r.branch}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Cajero: {r.cajero}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#7C3AED' }}>{r.date}</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#2563EB' }}>{r.orders}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Ordenes</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#10B981' }}>${r.revenue.toFixed(2)}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Ingresos</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#EDE9FE', alignItems: 'center' }}
                onPress={() => generateAndSharePDF(`Reporte ${r.branch}`, buildCajeroReportHTML(r))}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED' }}>{'\uD83D\uDC40'} Ver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#DBEAFE', alignItems: 'center' }}
                onPress={() => generateAndSharePDF(`Reporte ${r.branch} - ${r.date}`, buildCajeroReportHTML(r))}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB' }}>{'\uD83D\uDCE5'} PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#D1FAE5', alignItems: 'center' }}
                onPress={() => generateAndSharePDF(`Reporte ${r.branch}`, buildCajeroReportHTML(r))}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>{'\uD83D\uDCE4'} Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
