import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Image } from 'expo-image';

import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';
import { styles } from '../styles/auth.styles';
import { useCatalogStore } from '../../../../catalog/store/catalog.store';
import { useOrdersStore } from '../../../../orders/store/orders.store';
import { useFinanceStore } from '../../../../finance/store/finance.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { authenticate, checkBiometricsAvailability } from '../../../api/auth.local';
import ScrollInfinitoSuave from '../../../../../shared/components/ScrollInfinitoSuave';

const Logo = require('@assets/logo.png');
const BiometricLogo = require('@assets/huella.png');

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  const { loginWithBiometrics, loading } = useAuthStore();

  useEffect(() => {
    useCatalogStore.persist.clearStorage();
    useOrdersStore.persist.clearStorage();
    useFinanceStore.persist.clearStorage();
    
    async function checkBiometrics () {
      if (Platform.OS === 'web') return;
      try {
        const isBiometricAvailable = await checkBiometricsAvailability();
        const isBiometricEnabled = await SecureStore.getItemAsync('biometric_enabled') || 'false';
        setCanUseBiometrics(isBiometricAvailable && isBiometricEnabled === 'true');
      } catch {}
    };

    checkBiometrics();
  }, []);

  const handleBiometricPress = async () => {
    try {
      const isFingerprintValid = await authenticate();
      if (isFingerprintValid) {
        await loginWithBiometrics();
      }
    } catch (error) {
      console.error("Error biometrico:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Header con Logo y Scroll Infinito */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 10,
        }}>
          {/* Logo a la izquierda */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#D32F2F',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#D32F2F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Image source={Logo} style={{ width: 80, height: 80 }} />
            </View>
            <Text style={{
              fontSize: 12,
              color: '#D32F2F',
              fontWeight: '700',
              marginTop: 8,
              letterSpacing: 2,
            }}>DESDE 2003</Text>
          </View>

          {/* Scroll Infinito a la derecha */}
          <View style={{
            width: 120,
            height: 200,
            overflow: 'hidden',
            borderRadius: 20,
          }}>
            <ScrollInfinitoSuave 
              scrollDirection="down" 
              iconSet="set1"
            />
          </View>
        </View>

        {/* Título */}
        <View style={{
          alignItems: 'center',
          marginVertical: 20,
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#212121',
            textAlign: 'center',
          }}>
            {isLogin ? 'BIENVENIDO DE VUELTA!' : 'UNETE A LA FAMILIA!'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#757575',
            textAlign: 'center',
            marginTop: 8,
          }}>
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta para empezar'}
          </Text>
        </View>

        {/* Formulario */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 24,
          marginHorizontal: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          {isLogin ? <LoginForm /> : <RegisterForm />}

          {isLogin && canUseBiometrics && (
            <View style={{ marginTop: 25, alignItems: 'center' }}>
              <Text style={{ marginBottom: 10, color: '#888', fontSize: 12 }}>
                O usa tu huella para acceder rápido:
              </Text>
              <TouchableOpacity
                style={{
                  padding: 12,
                  backgroundColor: '#FEE2E2',
                  borderRadius: 50,
                  opacity: loading ? 0.7 : 1
                }}
                onPress={handleBiometricPress}
                disabled={loading}
              >
                <Image source={BiometricLogo} style={{ width: 50, height: 50 }} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 20,
          }}>
            <Text style={{ color: '#757575', fontSize: 14 }}>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={{
                color: '#D32F2F',
                fontSize: 14,
                fontWeight: '700',
              }}>
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{
          alignItems: 'center',
          marginTop: 30,
          paddingBottom: 20,
        }}>
          <Text style={{
            fontSize: 12,
            color: '#9E9E9E',
          }}>
            🌭 Catire Hot Dog © 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
