import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { isDark, colors, toggleTheme } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      
      Alert.alert('Exito', 'Perfil actualizado correctamente');
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* User avatar */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff' }}>
              {user?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{user?.full_name || 'Usuario'}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{user?.email || 'email@correo.com'}</Text>
          <View style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{user?.role?.name || 'admin'}</Text>
          </View>
        </View>

        {/* Edit form */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Informacion Personal</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>{editing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Nombre completo</Text>
          <TextInput
            style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
            value={fullName}
            onChangeText={setFullName}
            editable={editing}
          />

          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Correo electronico</Text>
          <TextInput
            style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
          />

          {editing && (
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' }}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Dark mode toggle */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{'\u{1F319}'} Modo Oscuro</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Activa el tema oscuro en toda la app</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#E2E8F0', true: colors.primary }} thumbColor={isDark ? '#fff' : '#f4f3f4'} />
          </View>
        </View>

        {/* Account info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Informacion de Cuenta</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Rol</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{user?.role?.name || 'admin'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Miembro desde</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>2026</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Estado</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#10B981' }}>Activo</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
