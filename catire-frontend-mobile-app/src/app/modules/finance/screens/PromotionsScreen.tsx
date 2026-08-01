import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePromotionStore, Promotion } from '../../../shared/store/promotion.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

const BRANCH_OPTIONS = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 3, name: 'El Malecon' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

const DURATION_OPTIONS = [
  { label: '1 mes', days: 30 },
  { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 ano', days: 365 },
  { label: 'Personalizado', days: 0 },
];

const emptyForm = {
  name: '',
  description: '',
  discount_value: '',
  min_purchase: '',
  max_uses: '100',
  notes: '',
  valid_days: '',
};

export const PromotionsScreen = () => {
  const navigation = useNavigation<any>();
  const { promotions, addPromotion, updatePromotion, removePromotion, togglePromotionActive } = usePromotionStore();
  const { isDark, colors } = useAppTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [customDays, setCustomDays] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const toggleBranch = (branchId: number) => {
    setSelectedBranches(prev =>
      prev.includes(branchId) ? prev.filter(b => b !== branchId) : [...prev, branchId]
    );
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedBranches([]);
    setSelectedDuration(30);
    setCustomDays('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!formData.discount_value || isNaN(parseFloat(formData.discount_value)) || parseFloat(formData.discount_value) <= 0) {
      Alert.alert('Error', 'Ingresa un valor de descuento valido');
      return;
    }

    try {
      const now = new Date();
      const validUntil = new Date(now);
      const days = selectedDuration === 0 ? (parseInt(customDays) || 30) : selectedDuration;
      validUntil.setDate(validUntil.getDate() + days);

      const promoData = {
        code: formData.name.toUpperCase().replace(/\s+/g, '_').slice(0, 20),
        name: formData.name,
        description: formData.description || 'Sin descripcion',
        discount_type: 'percentage' as const,
        discount_value: parseFloat(formData.discount_value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_uses: parseInt(formData.max_uses) || 100,
        valid_from: now,
        valid_until: validUntil,
        active: true,
        notes: formData.notes,
        valid_days: formData.valid_days,
        applicable_branches: selectedBranches,
      };

      if (editingId) {
        updatePromotion(editingId, promoData);
        Alert.alert('Exito', 'Promocion actualizada: ' + formData.name);
      } else {
        addPromotion(promoData);
        Alert.alert('Exito', 'Promocion creada: ' + formData.name);
      }

      resetForm();
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo guardar: ' + e.message);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingId(promo.id);
    setFormData({
      name: promo.name,
      description: promo.description,
      discount_value: promo.discount_value.toString(),
      min_purchase: promo.min_purchase.toString(),
      max_uses: promo.max_uses.toString(),
      notes: promo.notes || '',
      valid_days: promo.valid_days || '',
    });
    setSelectedBranches(promo.applicable_branches || []);
    
    // Calculate remaining days
    const now = new Date();
    const validUntil = new Date(promo.valid_until);
    const remainingDays = Math.max(0, Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setSelectedDuration(remainingDays > 365 ? 365 : remainingDays > 180 ? 180 : remainingDays > 90 ? 90 : remainingDays > 30 ? 30 : 0);
    if (remainingDays <= 30 || remainingDays > 365) {
      setCustomDays(remainingDays.toString());
    }
    
    setShowForm(true);
  };

  const handleDelete = (promo: Promotion) => {
    Alert.alert('Eliminar', `Eliminar "${promo.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removePromotion(promo.id) },
    ]);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRemainingDays = (validUntil: Date) => {
    const now = new Date();
    const end = new Date(validUntil);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
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
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<-'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {'\uD83C\uDF81'} Promociones
        </Text>
        <TouchableOpacity 
          style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          onPress={() => { resetForm(); setShowForm(true); }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Promotions List */}
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83C\uDF81'}</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Sin promociones
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
              Crea una promocion para ofrecer descuentos a tus clientes
            </Text>
          </View>
        }
        renderItem={({ item: promo }) => {
          const remainingDays = getRemainingDays(promo.valid_until);
          const isExpired = remainingDays <= 0;
          const branchNames = (promo.applicable_branches || [])
            .map(id => BRANCH_OPTIONS.find(b => b.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'Todas';

          return (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
              opacity: isExpired ? 0.6 : 1,
              borderLeftWidth: 4,
              borderLeftColor: promo.active ? (isExpired ? '#9CA3AF' : '#10B981') : '#EF4444',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{promo.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{promo.description}</Text>
                </View>
                <View style={{
                  backgroundColor: promo.discount_type === 'percentage' ? '#DBEAFE' : '#D1FAE5',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '700', 
                    color: promo.discount_type === 'percentage' ? '#1E40AF' : '#065F46' 
                  }}>
                    {promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `-$${promo.discount_value}`}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                <View style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {'\uD83D\uDCCD'} {branchNames}
                  </Text>
                </View>
                <View style={{ backgroundColor: isExpired ? '#FEE2E2' : colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, color: isExpired ? '#991B1B' : colors.textSecondary }}>
                    {'\u23F0'} {isExpired ? 'Expirada' : `${remainingDays} dias restantes`}
                  </Text>
                </View>
                {promo.code && (
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, color: '#92400E' }}>Cod: {promo.code}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {formatDate(promo.valid_from)} - {formatDate(promo.valid_until)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{ padding: 6 }}
                    onPress={() => handleEdit(promo)}
                  >
                    <Text style={{ fontSize: 16 }}>{'\u270F\uFE0F'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 6 }}
                    onPress={() => togglePromotionActive(promo.id)}
                  >
                    <Text style={{ fontSize: 16 }}>{promo.active ? '\u2705' : '\u26AA'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 6 }}
                    onPress={() => handleDelete(promo)}
                  >
                    <Text style={{ fontSize: 16 }}>{'\uD83D\uDDD1\uFE0F'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Create/Edit Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                  {editingId ? 'Editar Promocion' : 'Nueva Promocion'}
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <Text style={{ fontSize: 20, color: colors.textSecondary }}>{'\u2715'}</Text>
                </TouchableOpacity>
              </View>

              {/* Name */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>NOMBRE</Text>
              <TextInput
                style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 12, color: colors.textPrimary }}
                placeholder="Ej: 2x1 en Perros"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(t) => setFormData(prev => ({ ...prev, name: t }))}
              />

              {/* Description */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>DESCRIPCION</Text>
              <TextInput
                style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 12, color: colors.textPrimary }}
                placeholder="Descripcion de la promocion"
                placeholderTextColor={colors.textMuted}
                value={formData.description}
                onChangeText={(t) => setFormData(prev => ({ ...prev, description: t }))}
              />

              {/* Discount Value */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>DESCUENTO (%)</Text>
              <TextInput
                style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 12, color: colors.textPrimary }}
                placeholder="Ej: 15"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.discount_value}
                onChangeText={(t) => setFormData(prev => ({ ...prev, discount_value: t }))}
              />

              {/* Duration */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>DURACION</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {DURATION_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: selectedDuration === opt.days ? '#EC3137' : colors.background,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: selectedDuration === opt.days ? '#EC3137' : colors.border,
                    }}
                    onPress={() => setSelectedDuration(opt.days)}
                  >
                    <Text style={{ color: selectedDuration === opt.days ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDuration === 0 && (
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 12, color: colors.textPrimary }}
                  placeholder="Dias de duracion"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customDays}
                  onChangeText={setCustomDays}
                />
              )}

              {/* Branches */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>SUCURSALES (dejar vacio = todas)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {BRANCH_OPTIONS.map(branch => (
                  <TouchableOpacity
                    key={branch.id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: selectedBranches.includes(branch.id) ? '#EC3137' : colors.background,
                      borderWidth: 1,
                      borderColor: selectedBranches.includes(branch.id) ? '#EC3137' : colors.border,
                    }}
                    onPress={() => toggleBranch(branch.id)}
                  >
                    <Text style={{ color: selectedBranches.includes(branch.id) ? '#fff' : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                      {branch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={{ backgroundColor: '#EC3137', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 }}
                onPress={handleCreate}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {editingId ? 'Guardar Cambios' : 'Crear Promocion'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
