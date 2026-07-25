import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../../shared/config/firebase';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '778480594998-ga8lqtkt5hlr5ndgfqte3sc6vsgrevfb.apps.googleusercontent.com';

export const FirebaseLoginScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: '778480594998-ga8lqtkt5hlr5ndgfqte3sc6vsgrevfb.apps.googleusercontent.com',
    iosClientId: '778480594998-ga8lqtkt5hlr5ndgfqte3sc6vsgrevfb.apps.googleusercontent.com',
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then((result) => {
          Alert.alert(
            'Login exitoso',
            'UID: ' + result.user.uid,
            [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'BranchesMap' }] }) }]
          );
        })
        .catch((error) => {
          Alert.alert('Error', error.message || 'Error con Google');
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa email y contrasena');
      return;
    }
    setLoading(true);
    try {
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert(
        'Login exitoso',
        'UID: ' + userCredential.user.uid,
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'BranchesMap' }] }) }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error al iniciar sesion');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>Login con Firebase</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Email/Password */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Email y Contrasena</Text>
          <TextInput style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 10, borderWidth: 1, borderColor: colors.border }} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 12, borderWidth: 1, borderColor: colors.border }} placeholder="Contrasena" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={{ backgroundColor: '#EC3137', borderRadius: 12, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }} onPress={handleEmailLogin} disabled={loading}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{loading ? 'Iniciando...' : 'Iniciar Sesion'}</Text>
          </TouchableOpacity>
        </View>

        {/* Google */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Google</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#1A73E8', borderRadius: 12, padding: 14, alignItems: 'center', opacity: loading || !request ? 0.6 : 1 }}
            onPress={() => promptAsync()}
            disabled={loading || !request}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {!request ? 'Configurando Google...' : loading ? 'Iniciando...' : 'Continuar con Google'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>Telefono</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>Login por telefono requiere build nativo. Usa Email o Google en Expo Go.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};