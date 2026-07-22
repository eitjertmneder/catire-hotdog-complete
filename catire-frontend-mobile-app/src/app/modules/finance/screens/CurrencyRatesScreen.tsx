import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useCurrencyStore } from '../../../shared/store/currency.store';
import financeApi from '../api/finance.api';
import { theme } from '../../../shared/styles/theme';

export const CurrencyRatesScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { rates, fetchRates } = useCurrencyStore();
  const [rateCOP, setRateCOP] = useState(String(rates.rate_cop));
  const [rateBS, setRateBS] = useState(String(rates.rate_bs));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    await fetchRates();
    const currentRates = useCurrencyStore.getState().rates;
    setRateCOP(String(currentRates.rate_cop));
    setRateBS(String(currentRates.rate_bs));
    setLoading(false);
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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          💱 Tasas de Cambio
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Tasa actual */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16, padding: 20,
          marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 }}>
            Tasa Actual
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🇺🇸</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>1 USD</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: theme.colors.textMuted }}>=</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🇻🇪</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>{rates.rate_bs} BS</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: theme.colors.textMuted }}>=</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🇨🇴</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>{rates.rate_cop} COP</Text>
            </View>
          </View>
        </View>

        {/* Ejemplo de conversión */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 12, padding: 16,
          marginBottom: 20,
          borderWidth: 1, borderColor: '#FCD34D',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 8 }}>
            📊 Ejemplo de Conversión
          </Text>
          <Text style={{ fontSize: 14, color: '#78350F' }}>
            {exampleUSD} USD = {exampleCOP.toLocaleString()} COP
          </Text>
          <Text style={{ fontSize: 14, color: '#78350F' }}>
            {exampleUSD} USD = {exampleBS.toLocaleString()} BS
          </Text>
        </View>

        {/* Formulario de edición */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16, padding: 20,
          marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 }}>
            Editar Tasas
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
              1 USD equivale a (COP)
            </Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
                padding: 14, fontSize: 16, fontWeight: '700',
                color: theme.colors.textPrimary, backgroundColor: theme.colors.background,
              }}
              placeholder="Ej: 4000"
              keyboardType="numeric"
              value={rateCOP}
              onChangeText={setRateCOP}
            />
            <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
              Pesos colombianos por cada dólar
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
              1 USD equivale a (BS)
            </Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
                padding: 14, fontSize: 16, fontWeight: '700',
                color: theme.colors.textPrimary, backgroundColor: theme.colors.background,
              }}
              placeholder="Ej: 800"
              keyboardType="numeric"
              value={rateBS}
              onChangeText={setRateBS}
            />
            <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
              Bolívares por cada dólar
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
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
