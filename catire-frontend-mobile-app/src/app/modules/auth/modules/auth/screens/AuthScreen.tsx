import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Image } from 'expo-image';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';
import { useCatalogStore } from '../../../../catalog/store/catalog.store';
import { useOrdersStore } from '../../../../orders/store/orders.store';
import { useFinanceStore } from '../../../../finance/store/finance.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { authenticate, checkBiometricsAvailability } from '../../../api/auth.local';
import ScrollInfinitoSuave from '../../../../../shared/components/ScrollInfinitoSuave';
import { useAuditStore } from '../../../../../shared/store/audit.store';

const Logo = require('@assets/logo.png');
const { width, height } = Dimensions.get('window');

export default function AuthScreen() { const navigation = useNavigation<any>();
  const [isLogin, setIsLogin] = useState(true);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const { loginWithBiometrics, loading, login, error, clearAuthError } = useAuthStore();

  useEffect(() => {
    useCatalogStore.persist.clearStorage();
    useOrdersStore.persist.clearStorage();
    useFinanceStore.persist.clearStorage();
    async function checkBiometrics() {
      if (Platform.OS === 'web') return;
      try {
        const available = await checkBiometricsAvailability();
        const enabled = (await SecureStore.getItemAsync('biometric_enabled')) || 'false';
        setCanUseBiometrics(available && enabled === 'true');
      } catch (e) { console.warn('Operation failed:', e); }
    }
    checkBiometrics();
  }, []);

  const handleBiometricPress = async () => {
    try {
      clearAuthError();
      const valid = await authenticate();
      if (valid) {
        await loginWithBiometrics();
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EC3137' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* TOP - Scroll infinito llenando espacio */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingTop: 20,
          paddingBottom: 16,
          paddingHorizontal: 4,
          gap: 4,
        }}>
          <ScrollInfinitoSuave scrollDirection="down" />
          <ScrollInfinitoSuave scrollDirection="up" />
          <ScrollInfinitoSuave scrollDirection="down" />
          <ScrollInfinitoSuave scrollDirection="up" />
        </View>

        {/* BOTTOM - Formulario profesional */}
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingTop: 32,
          paddingBottom: 20,
          paddingHorizontal: 28,
          flex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 8,
        }}>
          {/* Titulo */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '900',
              color: '#1A1A2E',
              textAlign: 'center',
              letterSpacing: 0.5,
            }}>
              {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
            </Text>
            <Text style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
              {isLogin
                ? 'Ingresa tus credenciales para acceder a tu cuenta'
                : 'Registrate para empezar a ordenar tu comida favorita'}
            </Text>
          </View>

          {/* Formulario card */}
          <View style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}>
            {isLogin ? <LoginForm /> : <RegisterForm />}

            {isLogin && canUseBiometrics && (
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                  <Text style={{ marginHorizontal: 12, color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>
                    O
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                </View>
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    backgroundColor: '#FEF2F2',
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                  }}
                  onPress={handleBiometricPress}
                  disabled={loading}
                >
                  <Image source={require('@assets/huella.png')} style={{ width: 28, height: 28, marginRight: 10 }} />
                  <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 14 }}>
                    {loading ? 'Verificando...' : 'Usar huella digital'}
                  </Text>
                </TouchableOpacity>
                {error && (
                  <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                    {error}
                  </Text>
                )}
              </View>
            )}

            {/* Divider + toggle */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: '#E2E8F0',
            }}>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                {isLogin ? 'No tienes cuenta? ' : 'Ya tienes cuenta? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={{ color: '#EC3137', fontSize: 13, fontWeight: '700' }}>
                  {isLogin ? 'Registrate ahora' : 'Inicia sesion'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Boton Invitado moderno */}
          <TouchableOpacity
            onPress={async () => {
              try {
                await login({ email: 'guest@test.com', password: 'guest123' } as any);
                await SecureStore.setItemAsync('user_password', 'guest123');
              } catch (e) {
                console.log('Guest error:', e);
              }
            }}
            style={{
              width: '100%',
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: '#F1F5F9',
              alignItems: 'center',
              marginTop: 16,
              borderWidth: 1.5,
              borderColor: '#E2E8F0',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: '#475569', fontWeight: '700', letterSpacing: 0.3 }}>
              Continuar como Invitado
            </Text>
          </TouchableOpacity>

          {/* Google Sign-In button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('GoogleSignIn')}
            style={{
              width: '100%',
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: '#4285F4',
              alignItems: 'center',
              marginTop: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 14, color: '#fff', fontWeight: '700', letterSpacing: 0.3 }}>
              Continuar con Google
            </Text>
          </TouchableOpacity>

          {/* Logo + Copyright */}
          <View style={{ alignItems: 'center', marginTop: 28, paddingBottom: 10 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#EC3137',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#EC3137',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
              marginBottom: 10,
            }}>
              <Image source={Logo} style={{ width: 52, height: 52 }} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A2E', letterSpacing: 1 }}>
              CATIRE HOT DOG
            </Text>
            <Text style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
              Desde 2003 - La mejor comida rapida
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}