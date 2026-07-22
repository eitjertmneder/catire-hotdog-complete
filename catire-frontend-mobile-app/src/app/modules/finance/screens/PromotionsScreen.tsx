import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePromotionStore, Promotion } from '../../../shared/store/promotion.store';
import { theme } from '../../../shared/styles/theme';

export const PromotionsScreen = () => {
  const navigation = useNavigation();
  const { promotions, addPromotion } = usePromotionStore();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_purchase: '',
    max_uses: '',
    valid_days: '30',
  });

  const handleCreate = () => {
    if (!formData.code || !formData.discount_value) {
      Alert.alert('Error', 'Código y valor de descuento son obligatorios');
      return;
    }

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + parseInt(formData.valid_days || '30'));

    addPromotion({
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_purchase: parseFloat(formData.min_purchase || '0'),
      max_uses: parseInt(formData.max_uses || '100'),
      valid_from: now,
      valid_until: validUntil,
      active: true,
    });

    Alert.alert('Éxito', 'Promoción creada correctamente');
    setShowForm(false);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '',
      max_uses: '',
      valid_days: '30',
    });
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
          ?? Promociones
        </Text>
      </View>

      {/* Create Button */}
      {!showForm && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            margin: 16,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
          onPress={() => setShowForm(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Crear Promoción</Text>
        </TouchableOpacity>
      )}

      {/* Create Form */}
      {showForm && (
        <ScrollView style={{
          backgroundColor: theme.colors.white,
          margin: 16,
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 }}>
            Nueva Promoción
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>CÓDIGO</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                padding: 12, fontSize: 16, fontWeight: '700', backgroundColor: theme.colors.background,
              }}
              placeholder="Ej: DESCUENTO20"
              value={formData.code}
              onChangeText={(v) => setFormData({ ...formData, code: v })}
              autoCapitalize="characters"
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>DESCRIPCIÓN</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                padding: 12, fontSize: 14, backgroundColor: theme.colors.background,
              }}
              placeholder="Ej: 20% de descuento en todo"
              value={formData.description}
              onChangeText={(v) => setFormData({ ...formData, description: v })}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
                backgroundColor: formData.discount_type === 'percentage' ? theme.colors.primary : theme.colors.background,
                borderWidth: 1, borderColor: formData.discount_type === 'percentage' ? theme.colors.primary : theme.colors.border,
              }}
              onPress={() => setFormData({ ...formData, discount_type: 'percentage' })}
            >
              <Text style={{ color: formData.discount_type === 'percentage' ? '#fff' : theme.colors.textPrimary, fontWeight: '600' }}>% Porcentaje</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
                backgroundColor: formData.discount_type === 'fixed' ? theme.colors.primary : theme.colors.background,
                borderWidth: 1, borderColor: formData.discount_type === 'fixed' ? theme.colors.primary : theme.colors.border,
              }}
              onPress={() => setFormData({ ...formData, discount_type: 'fixed' })}
            >
              <Text style={{ color: formData.discount_type === 'fixed' ? '#fff' : theme.colors.textPrimary, fontWeight: '600' }}>$ Fijo</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>VALOR</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: theme.colors.background,
                }}
                placeholder={formData.discount_type === 'percentage' ? '20' : '5.00'}
                keyboardType="numeric"
                value={formData.discount_value}
                onChangeText={(v) => setFormData({ ...formData, discount_value: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>COMPRA MÍNIMA</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: theme.colors.background,
                }}
                placeholder="0"
                keyboardType="numeric"
                value={formData.min_purchase}
                onChangeText={(v) => setFormData({ ...formData, min_purchase: v })}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>USOS MÁXIMOS</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: theme.colors.background,
                }}
                placeholder="100"
                keyboardType="numeric"
                value={formData.max_uses}
                onChangeText={(v) => setFormData({ ...formData, max_uses: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 4 }}>DÍAS VÁLIDA</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: theme.colors.background,
                }}
                placeholder="30"
                keyboardType="numeric"
                value={formData.valid_days}
                onChangeText={(v) => setFormData({ ...formData, valid_days: v })}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.borderLight }}
              onPress={() => setShowForm(false)}
            >
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}
              onPress={handleCreate}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Crear Promoción</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Promotions List */}
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>??</Text>
            <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>No hay promociones</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.primary }}>{item.code}</Text>
              </View>
              <View style={{ backgroundColor: item.active ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: item.active ? '#065F46' : '#991B1B' }}>
                  {item.active ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 }}>
              {item.description || 'Sin descripción'}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>
              {item.discount_type === 'percentage' ? `${item.discount_value}% descuento` : `$${item.discount_value} descuento`}
              {item.min_purchase > 0 ? ` | Mínimo: $${item.min_purchase}` : ''}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
              Usos: {item.current_uses}/{item.max_uses} | Válido hasta: {new Date(item.valid_until).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

