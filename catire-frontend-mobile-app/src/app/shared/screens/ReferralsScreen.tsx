import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useSocialStore } from '../store/social.store';
import { useAppTheme } from '../contexts/ThemeContext';

export const ReferralsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { referralCode, generateReferralCode, shareApp, applyReferralCode, getReferralStats } = useSocialStore();
  const { colors } = useAppTheme();
  const [inputCode, setInputCode] = useState('');
  const stats = getReferralStats();

  React.useEffect(() => {
    if (user && !referralCode) {
      generateReferralCode(user.id);
    }
  }, [user]);

  const handleApplyCode = () => {
    if (!inputCode.trim()) {
      Alert.alert('Error', 'Ingresa un código de referido');
      return;
    }
    
    const success = applyReferralCode(inputCode.trim());
    if (success) {
      Alert.alert('Éxito', '¡Código aplicado! Ganaste 100 puntos');
      setInputCode('');
    } else {
      Alert.alert('Error', 'Código inválido o ya utilizado');
    }
  };

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
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          Referidos
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            {/* My Referral Code */}
            <View style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 }}>
                Tu Código de Referido
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 2 }}>
                {referralCode || 'Generando...'}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginTop: 16,
                }}
                onPress={shareApp}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                  {'\u{1F4E4}'} Compartir App
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
                Tus Estadísticas
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>{stats.total}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Total</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#10B981' }}>{stats.completed}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Completados</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>{stats.pending}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Pendientes</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#8B5CF6' }}>{stats.points}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Puntos</Text>
                </View>
              </View>
            </View>

            {/* Apply Code */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
                Tener un Código
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 16,
                  marginBottom: 12,
                  backgroundColor: colors.background,
                }}
                placeholder="Ingresa código de referido"
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                onPress={handleApplyCode}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Aplicar Código</Text>
              </TouchableOpacity>
            </View>

            {/* How it works */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
                ¿Cómo funciona?
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>1.</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                  Comparte tu código con amigos
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>2.</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                  Ellos usan tu código al registrarse
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>3.</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                  ¡Ambos ganan 100 puntos de fidelidad!
                </Text>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

