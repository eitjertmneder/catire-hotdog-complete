import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore, lightTheme, darkTheme } from '../store/theme.store';
import { useFavoritesStore } from '../store/favorites.store';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../styles/theme';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout, toggleBiometric } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { favorites, clearFavorites } = useFavoritesStore();
  const colors = isDark ? darkTheme : lightTheme;

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Tu dispositivo no soporta autenticación biométrica');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No hay datos biométricos configurados en tu dispositivo');
        return;
      }
    }
    await toggleBiometric(enabled);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>? Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 12 }}>
          ?? Configuración
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* User Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>MI CUENTA</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{user?.full_name}</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{user?.email}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            Rol: {user?.role?.name === 'admin' ? 'Administrador' : user?.role?.name === 'employee' ? 'Trabajador' : 'Cliente'}
          </Text>
        </View>

        {/* Appearance */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>APARIENCIA</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>??</Text>
              <Text style={{ fontSize: 16, color: colors.text }}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Security */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>SEGURIDAD</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>??</Text>
              <Text style={{ fontSize: 16, color: colors.text }}>Login Biométrico</Text>
            </View>
            <Switch
              value={false}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={false ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Favorites */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>FAVORITOS</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>??</Text>
              <Text style={{ fontSize: 16, color: colors.text }}>Productos Favoritos</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{favorites.length}</Text>
          </View>

          {favorites.length > 0 && (
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => {
                Alert.alert(
                  'Limpiar Favoritos',
                  '¿Estás seguro de que quieres eliminar todos los favoritos?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: clearFavorites },
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 14, color: colors.error }}>Limpiar Favoritos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>ACERCA DE</Text>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: colors.text }}>Versión: 1.0.0</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: colors.text }}>Catire Hot Dog</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>© 2026 Catire Hot Dog. Todos los derechos reservados.</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FEE2E2',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
          onPress={() => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Estás seguro de que quieres cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
              ]
            );
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#D32F2F' }}>?? Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

