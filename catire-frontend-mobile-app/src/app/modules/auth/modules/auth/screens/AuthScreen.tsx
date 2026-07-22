import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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

const Logo = require('@assets/logo.png');
const BiometricLogo = require('@assets/huella.png');

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
        
        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            <Image source={Logo} style={{ width: 120, height: 120 }} />
          </View>
          <Text style={styles.subtitle}>DESDE 2003</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {isLogin ? 'BIENVENIDO DE VUELTA!' : 'UNETE A LA FAMILIA!'}
          </Text>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          {isLogin && canUseBiometrics && (
            <View style={{ marginTop: 25, alignItems: 'center' }}>
              <Text style={{ marginBottom: 10, color: '#888', fontSize: 12 }}>
                O usa tu huella para acceder rapido:
              </Text>
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#f0f0f0',
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

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? 'No tienes cuenta?' : 'Ya tienes cuenta?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleLink}>
                {isLogin ? 'Registrate aqui' : 'Inicia sesion'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}