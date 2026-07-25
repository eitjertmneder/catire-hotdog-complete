import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';

const BRANCH_SALES = [
  { name: 'Barrio Sucre', sales: 4200, color: '#EC3137' },
  { name: 'Carabobo', sales: 3800, color: '#2563EB' },
  { name: 'El Malecon', sales: 3500, color: '#059669' },
  { name: 'Prados del Este', sales: 3100, color: '#7C3AED' },
  { name: 'Barrio Obrero', sales: 2900, color: '#D97706' },
];

const TOP_PRODUCTS = [
  { name: 'Perro Caliente Normal', count: 156, revenue: 780 },
  { name: 'Hamburguesa Sencilla', count: 89, revenue: 356 },
  { name: 'Salchipapa Normal', count: 78, revenue: 390 },
  { name: 'Coca Cola 2L', count: 67, revenue: 167 },
  { name: 'Nestea', count: 45, revenue: 45 },
];

const HOURLY_SALES = [
  { hour: '10am', sales: 320 }, { hour: '11am', sales: 580 },
  { hour: '12pm', sales: 890 }, { hour: '1pm', sales: 750 },
  { hour: '2pm', sales: 420 }, { hour: '3pm', sales: 310 },
  { hour: '4pm', sales: 480 }, { hour: '5pm', sales: 620 },
  { hour: '6pm', sales: 710 }, { hour: '7pm', sales: 540 },
  { hour: '8pm', sales: 380 },
];

const DAILY_TREND = [
  { day: 'Lun', sales: 2100 }, { day: 'Mar', sales: 2450 },
  { day: 'Mie', sales: 2800 }, { day: 'Jue', sales: 2650 },
  { day: 'Vie', sales: 3200 }, { day: 'Sab', sales: 3800 },
  { day: 'Dom', sales: 2900 },
];

const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

export const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const totalSales = BRANCH_SALES.reduce((s, b) => s + b.sales, 0);
  const maxSale = Math.max(...BRANCH_SALES.map(b => b.sales));
  const maxHourly = Math.max(...HOURLY_SALES.map(h => h.sales));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\u{1F4CA}'} Analytics</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#EC3137', borderRadius: 14, padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>{'\u{1F4B0}'} Ventas Total</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{totalSales.toLocaleString()}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#2563EB', borderRadius: 14, padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>{'\u{1F4E6}'} Pedidos</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>437</Text>
          </View>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>{'\u{1F4C8}'} Ventas por Hora</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {HOURLY_SALES.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ width: 45, fontSize: 12, color: '#64748B', fontWeight: '600' }}>{item.hour}</Text>
              <View style={{ flex: 1, height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginHorizontal: 8 }}>
                <View style={{ height: '100%', backgroundColor: '#EC3137', borderRadius: 6, flex: item.sales / maxHourly }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', width: 50, textAlign: 'right' }}>{item.sales}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>{'\u{1F3EA}'} Ventas por Sucursal</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {BRANCH_SALES.map((branch, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: branch.color, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>{branch.name}</Text>
                <View style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                  <View style={{ height: '100%', backgroundColor: branch.color, borderRadius: 3, flex: branch.sales / maxSale }} />
                </View>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: branch.color, marginLeft: 8 }}>{branch.sales.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>{'\u{1F3C6}'} Productos Mas Vendidos</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {TOP_PRODUCTS.map((product, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < TOP_PRODUCTS.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: idx === 0 ? '#FCD34D' : idx === 1 ? '#D1D5DB' : idx === 2 ? '#F59E0B' : '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: idx < 3 ? '#fff' : '#94A3B8' }}>{idx < 3 ? MEDALS[idx] : (idx + 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{product.name}</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{product.count} vendidos</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#059669' }}>{product.revenue}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>{'\u{1F4C9}'} Tendencia Diaria</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          {DAILY_TREND.map((day, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ width: 35, fontSize: 13, fontWeight: '700', color: '#64748B' }}>{day.day}</Text>
              <View style={{ flex: 1, height: 20, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden', marginHorizontal: 10 }}>
                <View style={{ height: '100%', backgroundColor: '#EC3137', borderRadius: 10, flex: day.sales / 4000 }} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155', width: 50, textAlign: 'right' }}>{day.sales}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
