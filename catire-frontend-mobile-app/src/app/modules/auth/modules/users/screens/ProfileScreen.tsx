import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useUserStore } from '../../../store/user.store';
import { theme } from '../../../../../shared/styles/theme';

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { updateProfile, loading } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_1: user?.phone_1 || '',
    dni: String(user?.dni || ''),
  });

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';
  const roleName = user?.role?.name === 'admin' ? 'Administrador' : user?.role?.name === 'employee' ? 'Cajero' : 'Cliente';

  const handleSave = async () => {
    const changes: any = {};
    if (formData.full_name !== user?.full_name) changes.full_name = formData.full_name;
    if (formData.email !== user?.email) changes.email = formData.email;
    if (formData.phone_1 !== user?.phone_1) changes.phone_1 = formData.phone_1;
    if (Number(formData.dni) !== user?.dni) changes.dni = Number(formData.dni);

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfile(changes);
      // Verificar si hubo error en el store
      const storeError = useUserStore.getState().loading;
      if (!storeError) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>Mi Perfil</Text>
        {!isEditing ? (
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FEE2E2', 
              paddingHorizontal: 14, 
              paddingVertical: 6, 
              borderRadius: 8 
            }} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>Editar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Avatar Section */}
      <View style={{ 
        alignItems: 'center', 
        paddingVertical: 28, 
        backgroundColor: theme.colors.white,
        marginBottom: 12,
      }}>
        <View style={{
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: theme.colors.primary,
          justifyContent: 'center', alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.white }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary }}>{user?.full_name}</Text>
        <View style={{ 
          backgroundColor: '#FEE2E2', 
          paddingHorizontal: 14, paddingVertical: 4, 
          borderRadius: 12, marginTop: 6 
        }}>
          <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>{roleName}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={{ 
        backgroundColor: theme.colors.white, 
        marginHorizontal: 12,
        borderRadius: 14, 
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      }}>
        {[
          { key: 'full_name', label: 'Nombre Completo', keyboard: 'default' },
          { key: 'email', label: 'Correo Electrónico', keyboard: 'email-address' },
          { key: 'phone_1', label: 'Teléfono', keyboard: 'phone-pad' },
          { key: 'dni', label: 'Cédula', keyboard: 'numeric' },
        ].map(({ key, label, keyboard }) => (
          <View key={key} style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, 
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 
            }}>{label}</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: isEditing ? theme.colors.primary : theme.colors.border,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: theme.colors.textPrimary,
                backgroundColor: isEditing ? theme.colors.white : theme.colors.background,
              }}
              value={formData[key as keyof typeof formData]}
              onChangeText={(val) => setFormData({ ...formData, [key]: val })}
              editable={isEditing}
              keyboardType={keyboard as any}
            />
          </View>
        ))}

        {isEditing && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity 
              style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.borderLight, alignItems: 'center' }} 
              onPress={() => setIsEditing(false)}
            >
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 2, padding: 14, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center' }} 
              onPress={handleSave} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
