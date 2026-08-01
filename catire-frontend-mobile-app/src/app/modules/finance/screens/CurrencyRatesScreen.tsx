import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useCurrencyStore } from '../../../shared/store/currency.store';
import financeApi from '../api/finance.api';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

export const CurrencyRatesScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { rates, fetchRates } = useCurrencyStore();
  const { isDark, colors } = useAppTheme();
  const [rateCOP, setRateCOP] = useState(String(rates.rate_cop));
  const [rateBS, setRateBS] = useState(String(rates.rate_bs));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    await fetchRates();
    const currentRates = useCurrencyStore.getState().rates;
    setRateCOP(String(currentRates.rate_cop));
    setRateBS(String(currentRates.rate_bs));
    setLastRefresh(new Date());
    setLoading(false);
  };

  const handleRefreshFromAPI = async () => {
    setRefreshing(true);
    try {
      const res = await financeApi.getCurrencyRates();
      if (!res.error && res.data) {
        await fetchRates();
        const currentRates = useCurrencyStore.getState().rates;
        setRateCOP(String(currentRates.rate_cop));
        setRateBS(String(currentRates.rate_bs));
        setLastRefresh(new Date());
        Alert.alert(
          'Tasas Actualizadas',
          `USD -> VES: ${currentRates.rate_bs}\nUSD -> COP: ${currentRates.rate_cop}\n\nFuente: API del backend`
        );
      } else {
        Alert.alert('Error', 'No se pudieron obtener las tasas del servidor. Usando tasas guardadas.');
        await loadRates();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor de tasas.');
    }
    setRefreshing(false);
  };

  const handleSave = async () => {
    const cop = parseFloat(rateCOP);
    const bs = parseFloat(rateBS);

    if (isNaN(cop) || cop <= 0) {
      Alert.alert('Error', 'La tasa de COP debe ser un número mayor a 0');
      return;
    }
    if (isNaN(bs) || bs <= 0) {
      Alert.alert('Error', 'La tasa de BS debe ser un número mayor a 0');
      return;
    }

    setSaving(true);
    const res = await financeApi.updateCurrencyRates(token!, { rate_cop: cop, rate_bs: bs });
    if (!res.error) {
      await fetchRates();
      Alert.alert('Éxito', 'Tasas de cambio actualizadas correctamente');
    } else {
      Alert.alert('Error', 'No se pudieron actualizar las tasas');
    }
    setSaving(false);
  };

  // Ejemplos de conversión
  const exampleUSD = 7;
  const exampleCOP = exampleUSD * (parseFloat(rateCOP) || 4000);
  const exampleBS = exampleUSD * (parseFloat(rateBS) || 800);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          💱 Tasas de Cambio
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Tasa actual */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 16, padding: 20,
          marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
              Tasa Actual
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: refreshing ? '#94A3B8' : '#10B981',
                paddingHorizontal: 16, paddingVertical: 10,
                borderRadius: 10,
                flexDirection: 'row', alignItems: 'center', gap: 6,
                opacity: refreshing ? 0.7 : 1,
              }}
              onPress={handleRefreshFromAPI}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 14 }}>{'\u{1F504}'}</Text>
              )}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                {refreshing ? 'Actualizando...' : 'Refrescar API'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83C\uDDFA\uD83C\uDDF8'}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>1 USD</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: colors.textMuted }}>=</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83C\uDDFB\uD83C\uDDEA'}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{rates.rate_bs} BS</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: colors.textMuted }}>=</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83C\uDDE8\uD83C\uDDF4'}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{rates.rate_cop} COP</Text>
            </View>
          </View>

          {lastRefresh && (
            <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 12 }}>
              Ultima actualizacion: {lastRefresh.toLocaleString()}
            </Text>
          )}

          {/* API endpoint info */}
          <View style={{
            backgroundColor: isDark ? '#0C2D48' : '#F0F9FF',
            borderRadius: 10, padding: 12, marginTop: 12,
            borderWidth: 1, borderColor: isDark ? '#1E4D6E' : '#BAE6FD',
          }}>
            <Text style={{ fontSize: 12, color: isDark ? '#7DD3FC' : '#0369A1', fontWeight: '600' }}>
              {'\uD83D\uDD17'} API: /api/finance/currency-rates
            </Text>
            <Text style={{ fontSize: 11, color: isDark ? '#38BDF8' : '#0284C7', marginTop: 4 }}>
              El boton "Refrescar API" consulta el backend para obtener tasas actualizadas
            </Text>
          </View>
        </View>

        {/* Ejemplo de conversión */}
        <View style={{
          backgroundColor: isDark ? '#3B2F10' : '#FEF3C7',
          borderRadius: 12, padding: 16,
          marginBottom: 20,
          borderWidth: 1, borderColor: isDark ? '#5C4A1A' : '#FCD34D',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FBBF24' : '#92400E', marginBottom: 8 }}>
            📊 Ejemplo de Conversión
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#D4A843' : '#78350F' }}>
            {exampleUSD} USD = {exampleCOP.toLocaleString()} COP
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#D4A843' : '#78350F' }}>
            {exampleUSD} USD = {exampleBS.toLocaleString()} BS
          </Text>
        </View>

        {/* Formulario de edición */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 16, padding: 20,
          marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
            Editar Tasas
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
              1 USD equivale a (COP)
            </Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 14, fontSize: 16, fontWeight: '700',
                color: colors.textPrimary, backgroundColor: colors.background,
              }}
              placeholder="Ej: 4000"
              keyboardType="numeric"
              value={rateCOP}
              onChangeText={setRateCOP}
            />
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              Pesos colombianos por cada dólar
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
              1 USD equivale a (BS)
            </Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 14, fontSize: 16, fontWeight: '700',
                color: colors.textPrimary, backgroundColor: colors.background,
              }}
              placeholder="Ej: 800"
              keyboardType="numeric"
              value={rateBS}
              onChangeText={setRateBS}
            />
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              Bolívares por cada dólar
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16, borderRadius: 12, alignItems: 'center',
              opacity: saving ? 0.7 : 1,
            }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Guardar Tasas</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
