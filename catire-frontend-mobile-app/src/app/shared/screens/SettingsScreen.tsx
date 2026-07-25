import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';
import { useAppTheme } from '../contexts/ThemeContext';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { isDark, colors, toggleTheme } = useAppTheme();
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const enabled = await SecureStore.getItemAsync('biometric_enabled');
        setBiometric(enabled === 'true');
      } catch {}
    })();
  }, []);

  const handleToggleBiometric = async (value: boolean) => {
    setBiometric(value);
    try {
      if (value) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
      } else {
        await SecureStore.setItemAsync('biometric_enabled', 'false');
      }
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesion', 'Estas seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesion', style: 'destructive', onPress: () => logout?.() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'<'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\u2699\uFE0F'} Configuracion</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* User info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{user?.full_name || 'Usuario'}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{user?.email || 'email@correo.com'}</Text>
          <View style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{user?.role?.name || 'admin'}</Text>
          </View>
        </View>

        {/* Dark Mode toggle */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{'\u{1F319}'} Modo Oscuro</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Activa el tema oscuro en toda la app</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#E2E8F0', true: colors.primary }} thumbColor={isDark ? '#fff' : '#f4f3f4'} />
          </View>
        </View>

        {/* Biometric toggle */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{'\u{1F510}'} Login Biometrico</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Accede con huella dactilar</Text>
            </View>
            <Switch value={biometric} onValueChange={handleToggleBiometric} trackColor={{ false: '#E2E8F0', true: colors.primary }} thumbColor={biometric ? '#fff' : '#f4f3f4'} />
          </View>
        </View>

        {/* About */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>{'\u{1F4CB}'} Acerca de</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Catire Hot Dog v2.0</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>Sistema de gestion de restaurantes</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>{'\u00A9'} 2026</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={{ backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }} onPress={handleLogout}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#DC2626' }}>{'\u{1F6AA}'} Cerrar Sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
