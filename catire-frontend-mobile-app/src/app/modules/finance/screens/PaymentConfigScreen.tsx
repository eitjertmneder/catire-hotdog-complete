import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import financeApi from '../api/finance.api';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

export const PaymentConfigScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    holder_name: '',
    holder_dni: '',
    phone: '',
    bank: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const res = await financeApi.getActivePaymentConfig();
    if (!res.error && res.data) {
      setConfig(res.data);
      setFormData({
        holder_name: res.data.holder_name,
        holder_dni: res.data.holder_dni,
        phone: res.data.phone,
        bank: res.data.bank,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.holder_name || !formData.holder_dni || !formData.phone || !formData.bank) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    const res = await financeApi.createPaymentConfig(token!, formData);
    if (!res.error) {
      setConfig(res.data);
      setIsEditing(false);
      Alert.alert('Éxito', 'Datos de pago actualizados correctamente');
    } else {
      Alert.alert('Error', 'No se pudieron actualizar los datos de pago');
    }
    setSaving(false);
  };

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
          💳 Datos de Pago Móvil
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Vista actual */}
        {config && !isEditing && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16, padding: 20,
            marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
              Datos Actuales
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' }}>Titular</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{config.holder_name}</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' }}>Cédula</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{config.holder_dni}</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' }}>Teléfono</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{config.phone}</Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' }}>Banco</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{config.bank}</Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: '#FEE2E2',
                paddingVertical: 14, borderRadius: 12, alignItems: 'center',
              }}
              onPress={() => setIsEditing(true)}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Editar Datos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Formulario de edición */}
        {(!config || isEditing) && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16, padding: 20,
            marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
              {config ? 'Editar Datos de Pago' : 'Configurar Datos de Pago'}
            </Text>

            {[
              { key: 'holder_name', label: 'Nombre del Titular', placeholder: 'Ej: Juan Perez' },
              { key: 'holder_dni', label: 'Cédula', placeholder: 'Ej: 3154684' },
              { key: 'phone', label: 'Teléfono', placeholder: 'Ej: 0414544735' },
              { key: 'bank', label: 'Banco', placeholder: 'Ej: Vicentenario' },
            ].map(({ key, label, placeholder }) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
                  {label}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                    padding: 14, fontSize: 15,
                    color: colors.textPrimary, backgroundColor: colors.background,
                  }}
                  placeholder={placeholder}
                  placeholderTextColor="#9E9E9E"
                  value={formData[key as keyof typeof formData]}
                  onChangeText={(val) => setFormData({ ...formData, [key]: val })}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {config && (
                <TouchableOpacity
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                    backgroundColor: colors.borderLight,
                  }}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                  backgroundColor: colors.primary,
                  opacity: saving ? 0.7 : 1,
                }}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
