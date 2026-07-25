import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePromotionStore, Promotion } from '../../../shared/store/promotion.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

const BRANCH_OPTIONS = [
  'Barrio Sucre', 'Carabobo', 'El Malecon', 'Prados del Este',
  'Barrio Obrero', 'La Asogata', 'La Grita', 'Sambil', 'Mestizos',
];

export const PromotionsScreen = () => {
  const navigation = useNavigation();
  const { promotions, addPromotion } = usePromotionStore();
  const { colors } = useAppTheme();
  const [showForm, setShowForm] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const toggleBranch = (branch: string) => {
    setSelectedBranches(prev =>
      prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
    );
  };

  const [formData, setFormData] = useState({
    name: 'Promo Perra + Hamburguesa',
    description: 'Hamburguesa doble a precio especial',
    discount_value: '25000',
    valid_days: 'Martes y Jueves',
    notes: 'Solo disponible en sucursales de Colombia',
  });

  const handleCreate = () => {
    if (!formData.name || !formData.discount_value) {
      Alert.alert('Error', 'Nombre y valor son obligatorios');
      return;
    }

    try {
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + 30);

      addPromotion({
        code: formData.name.toUpperCase().replace(/\s+/g, '_').slice(0, 20),
        name: formData.name,
        description: formData.description,
        discount_type: 'fixed',
        discount_value: parseFloat(formData.discount_value),
        min_purchase: 0,
        max_uses: 100,
        valid_from: now,
        valid_until: validUntil,
        active: true,
        notes: formData.notes,
        valid_days: formData.valid_days,
        applicable_branches: selectedBranches,
      });

      Alert.alert('Exito', 'Promocion creada: ' + formData.name);
      setShowForm(false);
      setSelectedBranches([]);
      setFormData({ name: '', description: '', discount_value: '', valid_days: '30', notes: '' });
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo crear: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u{2190}'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {'\u{1F3F7}\uFE0F'} Promociones
        </Text>
      </View>

      {!showForm && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            margin: 16,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
          onPress={() => setShowForm(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Crear Promocion</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <ScrollView style={{
          backgroundColor: colors.white,
          margin: 16,
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
            Nueva Promocion
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 }}>NOMBRE</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                padding: 12, fontSize: 16, fontWeight: '700', backgroundColor: colors.background,
              }}
              placeholder="Ej: Promo Perra + Hamburguesa"
              value={formData.name}
              onChangeText={(v) => setFormData({ ...formData, name: v })}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 }}>DESCRIPCION</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                padding: 12, fontSize: 14, backgroundColor: colors.background,
              }}
              placeholder="Ej: Hamburguesa doble a precio especial"
              value={formData.description}
              onChangeText={(v) => setFormData({ ...formData, description: v })}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 }}>VALOR</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: colors.background,
                }}
                placeholder="25000"
                keyboardType="numeric"
                value={formData.discount_value}
                onChangeText={(v) => setFormData({ ...formData, discount_value: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 }}>DIAS VALIDA</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: colors.background,
                }}
                placeholder="Ej: Martes y Jueves"
                value={formData.valid_days}
                onChangeText={(v) => setFormData({ ...formData, valid_days: v })}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 }}>NOTAS</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                padding: 12, fontSize: 14, backgroundColor: colors.background,
              }}
              placeholder="Ej: Solo disponible en sucursales de Colombia"
              value={formData.notes}
              onChangeText={(v) => setFormData({ ...formData, notes: v })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 6 }}>SUCURSALES APLICABLES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BRANCH_OPTIONS.map((branch) => {
                const isSelected = selectedBranches.includes(branch);
                return (
                  <TouchableOpacity
                    key={branch}
                    onPress={() => toggleBranch(branch)}
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: isSelected ? '#fff' : colors.textSecondary, fontWeight: isSelected ? '700' : '400' }}>
                      {isSelected ? '\u2713 ' : ''}{branch}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedBranches.length > 0 && (
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
                {selectedBranches.length} sucursal(es) seleccionada(s)
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.borderLight }}
              onPress={() => setShowForm(false)}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.primary }}
              onPress={handleCreate}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Crear Promocion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F3F7}\uFE0F'}</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted }}>No hay promociones</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>{item.name || item.code}</Text>
              </View>
              <View style={{ backgroundColor: item.active ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: item.active ? '#065F46' : '#991B1B' }}>
                  {item.active ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              {item.description || 'Sin descripcion'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              {item.discount_type === 'percentage' ? `${item.discount_value}% descuento` : `$${item.discount_value} descuento`}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              Usos: {item.current_uses}/{item.max_uses} | Valido hasta: {new Date(item.valid_until).toLocaleDateString()}
            </Text>
            {item.applicable_branches && item.applicable_branches.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {item.applicable_branches.map((b: string) => (
                  <View key={b} style={{ backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: '#2563EB', fontWeight: '600' }}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};
