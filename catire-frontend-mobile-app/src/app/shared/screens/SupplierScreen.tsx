import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForecastingStore, Supplier } from '../store/forecasting.store';
import { theme } from '../styles/theme';

export const SupplierScreen = () => {
  const navigation = useNavigation();
  const { suppliers, addSupplier, deleteSupplier } = useForecastingStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    products: '',
    lead_time_days: '3',
    minimum_order: '100',
  });

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Nombre y teléfono son obligatorios');
      return;
    }

    addSupplier({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      products: formData.products.split(',').map(p => p.trim()),
      lead_time_days: parseInt(formData.lead_time_days) || 3,
      minimum_order: parseInt(formData.minimum_order) || 100,
      rating: 5,
    });

    setShowModal(false);
    setFormData({ name: '', phone: '', email: '', products: '', lead_time_days: '3', minimum_order: '100' });
    Alert.alert('Éxito', 'Proveedor agregado');
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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          📦 Proveedores
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          margin: 16,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Nuevo Proveedor</Text>
      </TouchableOpacity>

      {/* Suppliers List */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>No hay proveedores registrados</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 14 }}>
                {'⭐'.repeat(Math.floor(item.rating))}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 }}>
              📞 {item.phone}
            </Text>
            {item.email && (
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 }}>
                ✉️ {item.email}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 }}>
              Productos: {item.products.join(', ')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                Entrega: {item.lead_time_days} días
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                Mínimo: ${item.minimum_order}
              </Text>
            </View>
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => {
                Alert.alert('Eliminar', `¿Eliminar proveedor ${item.name}?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: () => deleteSupplier(item.id) },
                ]);
              }}
            >
              <Text style={{ fontSize: 13, color: '#EF4444' }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Nuevo Proveedor</Text>

            {[
              { key: 'name', label: 'Nombre', placeholder: 'Nombre del proveedor' },
              { key: 'phone', label: 'Teléfono', placeholder: '0412-1234567' },
              { key: 'email', label: 'Email', placeholder: 'proveedor@email.com' },
              { key: 'products', label: 'Productos (separados por coma)', placeholder: 'Leche, Queso, Carne' },
              { key: 'lead_time_days', label: 'Días de entrega', placeholder: '3' },
              { key: 'minimum_order', label: 'Pedido mínimo ($)', placeholder: '100' },
            ].map(({ key, label, placeholder }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 }}>{label.toUpperCase()}</Text>
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                    padding: 12, fontSize: 14,
                  }}
                  placeholder={placeholder}
                  value={formData[key as keyof typeof formData]}
                  onChangeText={(v) => setFormData({ ...formData, [key]: v })}
                  keyboardType={key === 'lead_time_days' || key === 'minimum_order' ? 'numeric' : 'default'}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.borderLight }}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}
                onPress={handleSave}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
