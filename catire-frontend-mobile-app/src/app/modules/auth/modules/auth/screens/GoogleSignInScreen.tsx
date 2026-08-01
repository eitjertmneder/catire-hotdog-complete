import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../../../../shared/config/firebase';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import authApi from '../../../api/auth.api';
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '578924968420-pv3kurmhk0j9q1u1d5ev85c8kiotrv2g.apps.googleusercontent.com';

export const GoogleSignInScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Use ONLY the Web Client ID for all cases (Expo Go and dev client).
  // expo-auth-session automatically uses the Expo proxy (https://auth.expo.io/...)
  // which Google accepts. No custom scheme needed.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  const handleFirebaseUser = async (firebaseUser: any) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await authApi.firebaseSync(idToken);
      if (res.error) {
        Alert.alert('Error', res.message || 'Error al sincronizar con el servidor');
        return;
      }
      const backendToken = res.data?.access_token || '';
      const backendUser = res.data?.user;
      await setToken(backendToken);
      await setUser(backendUser);
      const role = backendUser?.role?.name;
      if (role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminScreen' }] });
      } else if (role === 'employee') {
        navigation.reset({ index: 0, routes: [{ name: 'EmployeeOrders' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'BranchesMap' }] });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al procesar la sesion');
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (!id_token) {
        Alert.alert('Error', 'No se pudo obtener el token de Google');
        return;
      }
      setLoading(true);
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => handleFirebaseUser(result.user))
        .catch((error) => {
          console.error('Firebase auth error:', error);
          Alert.alert('Error', error.message || 'Error con Google');
        })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      Alert.alert('Error', 'No se pudo completar la autenticacion con Google');
    }
  }, [response]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>Login con Google</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 32, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
          <Text style={{ fontSize: 56, marginBottom: 20 }}>{'\u{1F525}'}</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Inicia sesion con Google</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
            Usa tu cuenta de Google para acceder rapido a Catire Hot Dog
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#4285F4',
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 28,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              opacity: loading || !request ? 0.5 : 1,
            }}
            onPress={() => promptAsync()}
            disabled={loading || !request}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {!request ? 'Configurando...' : 'Continuar con Google'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, paddingVertical: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>Volver al login normal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
