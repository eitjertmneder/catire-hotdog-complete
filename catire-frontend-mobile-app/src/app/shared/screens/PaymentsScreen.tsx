import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useCurrencyStore } from '../store/currency.store';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { useAppTheme } from '../contexts/ThemeContext';

const PAYMENT_CURRENCIES = [
  {
    key: 'USD',
    label: 'Dolares',
    symbol: '$',
    flag: '\uD83C\uDDFA\uD83C\uDDF8',
    color: '#10B981',
    bg: '#D1FAE5',
    borderColor: '#10B981',
  },
  {
    key: 'COP',
    label: 'Pesos Colombianos',
    symbol: '$',
    flag: '\uD83C\uDDE8\uD83C\uDDF4',
    color: '#2563EB',
    bg: '#DBEAFE',
    borderColor: '#2563EB',
  },
  {
    key: 'PAGO_MOVIL',
    label: 'Pago Movil',
    symbol: 'Bs.',
    flag: '\uD83D\uDCF1',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
];

const extractCurrency = (notes: string | null | undefined): string | null => {
  if (!notes) return null;
  const match = notes.match(/Moneda de pago:\s*(.+)/);
  if (!match) return null;
  const label = match[1].trim();
  if (label.includes('Dolares')) return 'USD';
  if (label.includes('Pesos Colombianos')) return 'COP';
  if (label.includes('Pago Movil') || label.includes('Bolivares')) return 'PAGO_MOVIL';
  return null;
};

export const PaymentsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { rates, fetchRates } = useCurrencyStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { isDark, colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (token) {
      await Promise.all([fetchOrders(token), fetchRates()]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [token]);

  // Calculate totals from PAID and DELIVERED orders
  const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED');

  // Calculate totals by currency from order notes
  const totalsByCurrency: Record<string, { count: number; amount: number }> = {
    USD: { count: 0, amount: 0 },
    COP: { count: 0, amount: 0 },
    PAGO_MOVIL: { count: 0, amount: 0 },
  };
  let unassignedCount = 0;
  let unassignedAmount = 0;

  paidOrders.forEach(order => {
    // Calculate order total in USD (base currency)
    const orderTotalUSD = (order.items || []).reduce((sum, item) => {
      return sum + (item.base_price || 0) * (item.quantity || 1);
    }, 0);

    const currency = extractCurrency(order.notes);
    if (currency && totalsByCurrency[currency]) {
      totalsByCurrency[currency].count += 1;
      // Convert USD to the payment currency
      if (currency === 'PAGO_MOVIL') {
        // Convert USD to Bs using exchange rate
        totalsByCurrency[currency].amount += orderTotalUSD * (rates.rate_bs || 843);
      } else if (currency === 'COP') {
        // Convert USD to COP using exchange rate
        totalsByCurrency[currency].amount += orderTotalUSD * (rates.rate_cop || 3600);
      } else {
        // USD stays as USD
        totalsByCurrency[currency].amount += orderTotalUSD;
      }
    } else {
      unassignedCount += 1;
      unassignedAmount += orderTotalUSD;
    }
  });

  const formatAmount = (amount: number, currencyKey: string) => {
    if (currencyKey === 'USD') return `$${amount.toFixed(2)}`;
    if (currencyKey === 'PAGO_MOVIL') return `Bs. ${amount.toFixed(0)}`;
    if (currencyKey === 'COP') return `$${amount.toFixed(0)}`;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {'\uD83D\uDCB0'} Gestion de Pagos
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC3137']} />
        }
      >
        {/* Summary header */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 16, padding: 20,
          marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
            Resumen de Pagos por Moneda
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {paidOrders.length} ordenes pagadas | Jala hacia abajo para actualizar
          </Text>
        </View>

        {/* Currency Cards */}
        {PAYMENT_CURRENCIES.map((currency) => {
          const data = totalsByCurrency[currency.key];
          return (
            <View
              key={currency.key}
              style={{
                backgroundColor: colors.white,
                borderRadius: 16,
                marginBottom: 16,
                shadowColor: currency.color,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
                elevation: 4,
                borderWidth: 1,
                borderColor: currency.bg,
                overflow: 'hidden',
              }}
            >
              {/* Color accent bar */}
              <View style={{
                height: 4,
                backgroundColor: currency.color,
              }} />

              <View style={{ padding: 20 }}>
                {/* Currency header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 14,
                    backgroundColor: currency.bg,
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 28 }}>{currency.flag}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                      {currency.key}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      {currency.label}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />

                {/* Amount received */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
                    Monto Recibido
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: currency.color }}>
                    {loading ? '...' : formatAmount(data.amount, currency.key)}
                  </Text>
                </View>

                {/* Rate info */}
                <View style={{
                  backgroundColor: currency.bg,
                  borderRadius: 10, padding: 12,
                  flexDirection: 'row', justifyContent: 'space-between',
                }}>
                  <Text style={{ fontSize: 12, color: currency.color, fontWeight: '600' }}>
                    {currency.key !== 'USD' ? `Tasa: 1 USD = ${currency.key === 'PAGO_MOVIL' ? rates.rate_bs : rates.rate_cop} ${currency.key}` : 'Moneda base'}
                  </Text>
                  <Text style={{ fontSize: 12, color: currency.color, fontWeight: '600' }}>
                    {data.count} ordenes
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Unassigned orders */}
        {unassignedCount > 0 && (
          <View style={{
            backgroundColor: isDark ? '#3B2F10' : '#FEF3C7',
            borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: isDark ? '#5C4A1A' : '#FCD34D',
            marginTop: 4,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FBBF24' : '#92400E', marginBottom: 8 }}>
              {'\u26A0\uFE0F'} Ordenes sin moneda asignada
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? '#D4A843' : '#78350F', marginBottom: 4 }}>
              {unassignedCount} ordenes pagadas sin registro de moneda
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? '#D4A843' : '#78350F' }}>
              Monto total: ${unassignedAmount.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Exchange rates info */}
        <View style={{
          backgroundColor: isDark ? '#3B2F10' : '#FEF3C7',
          borderRadius: 12, padding: 16,
          borderWidth: 1, borderColor: isDark ? '#5C4A1A' : '#FCD34D',
          marginTop: 16,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FBBF24' : '#92400E', marginBottom: 8 }}>
            {'\uD83D\uDCB1'} Tasas de Cambio Actuales
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#D4A843' : '#78350F', marginBottom: 4 }}>
            1 USD = {rates.rate_bs} BS (Venezuela)
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#D4A843' : '#78350F' }}>
            1 USD = {rates.rate_cop} COP (Colombia)
          </Text>
        </View>

        {loading && (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <ActivityIndicator size="large" color="#EC3137" />
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>Cargando datos...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
