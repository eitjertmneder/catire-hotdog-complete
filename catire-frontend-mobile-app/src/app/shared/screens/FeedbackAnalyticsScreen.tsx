import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/ThemeContext';

const RATING_DIST = [
  { stars: 5, count: 0, pct: 0 },
  { stars: 4, count: 0, pct: 0 },
  { stars: 3, count: 0, pct: 0 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

const TOP_COMPLIMENTS = [
  { text: 'Excelente servicio y comida deliciosa', count: 0 },
  { text: 'Muy rapido el pedido', count: 0 },
  { text: 'Buenos precios', count: 0 },
  { text: 'Personal amable', count: 0 },
];

const TOP_COMPLAINTS = [
  { text: 'Tardo mucho en llegar', count: 0 },
  { text: 'Falta un topping del pedido', count: 0 },
  { text: 'La porcion es pequena', count: 0 },
];

const REVIEWS: { user: string; rating: number; text: string; date: string }[] = [];

export const FeedbackAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\u{1F4CA}'} Analisis de Feedback</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#EC3137', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 48, fontWeight: '900', color: '#fff' }}>0.0</Text>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{'\u2B50\u2B50\u2B50\u2B50\u2B50'} de 5</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>0 resenas totales</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F4CA}'} Distribucion de Calificaciones</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {RATING_DIST.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ width: 20, fontSize: 13, fontWeight: '700', color: colors.textMuted }}>{item.stars}</Text>
              <View style={{ flex: 1, height: 14, backgroundColor: colors.borderLight, borderRadius: 7, overflow: 'hidden', marginHorizontal: 10 }}>
                <View style={{ flex: item.pct / 100, height: '100%', backgroundColor: '#F59E0B', borderRadius: 7, maxWidth: '100%' }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary, width: 55, textAlign: 'right' }}>{item.count}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u2764\uFE0F'} Lo Mas Valorado</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {TOP_COMPLIMENTS.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < TOP_COMPLIMENTS.length - 1 ? 1 : 0, borderBottomColor: colors.borderLight }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#059669' }}>+</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>{item.text}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>{item.count}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u26A0\uFE0F'} Areas de Mejora</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          {TOP_COMPLAINTS.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < TOP_COMPLAINTS.length - 1 ? 1 : 0, borderBottomColor: colors.borderLight }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626' }}>-</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>{item.text}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>{item.count}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>{'\u{1F4DD}'} Resenas Recientes</Text>
        {REVIEWS.map((review, idx) => (
          <View key={idx} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{review.user}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{review.date}</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#F59E0B', marginBottom: 4, fontWeight: '700' }}>{'\u2B50'.repeat(review.rating)}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>{review.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
