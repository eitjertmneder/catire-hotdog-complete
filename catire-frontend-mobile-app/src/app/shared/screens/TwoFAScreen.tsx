import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useTwoFAStore } from '../store/two-fa.store';
import { useAppTheme } from '../contexts/ThemeContext';

export const TwoFAScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { enable2FA, disable2FA, is2FAEnabled, getBackupCodes } = useTwoFAStore();
  const { colors } = useAppTheme();

  const [isEnabled, setIsEnabled] = useState(is2FAEnabled(user?.id || 0));
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable = () => {
    setShowSetupModal(true);
  };

  const handleDisable = () => {
    Alert.alert(
      'Desactivar 2FA',
      '¿Estás seguro de que quieres desactivar la autenticación de dos factores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => {
            disable2FA(user?.id || 0);
            setIsEnabled(false);
            Alert.alert('Éxito', '2FA desactivado');
          },
        },
      ]
    );
  };

  const handleActivate = () => {
    enable2FA(user?.id || 0, 'authenticator', '');
    setIsEnabled(true);
    setShowSetupModal(false);
    setShowVerifyModal(true);
    setBackupCodes(getBackupCodes(user?.id || 0));
    Alert.alert('Éxito', '2FA con Google Authenticator activado correctamente');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 }}>
          Autenticación de Dos Factores
        </Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: colors.textPrimary, marginBottom: 10 }}>
            Estado: {isEnabled ? 'Activado' : 'Desactivado'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
            Método: Google Authenticator (TOTP)
          </Text>

          {isEnabled ? (
            <TouchableOpacity
              onPress={handleDisable}
              style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Desactivar 2FA</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleEnable}
              style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Activar 2FA</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Setup Modal - Google Authenticator */}
        <Modal visible={showSetupModal} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
            <ScrollView>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 }}>
                Configurar Google Authenticator
              </Text>

              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
                  Paso 1: Descarga la app
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
                  Descarga Google Authenticator desde la App Store o Google Play Store en tu teléfono.
                </Text>
              </View>

              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
                  Paso 2: Escanea el código QR
                </Text>
                <View style={{
                  width: 200, height: 200, backgroundColor: colors.borderLight, borderRadius: 12,
                  alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
                  borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
                }}>
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>{'\uD83D\uDD10'}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
                    Código QR{'\n'}(Próximamente)
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
                  Abre Google Authenticator y escanea este código QR
                </Text>
              </View>

              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
                  Paso 3: Verifica tu código
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
                  Ingresa el código de 6 dígitos que aparece en tu app de Google Authenticator para verificar la configuración.
                </Text>
              </View>

              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 20 }}>
                  Nota: Los métodos SMS y Gmail ya no están disponibles. Solo se utiliza Google Authenticator para mayor seguridad.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleActivate}
                style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Activar Google Authenticator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSetupModal(false)}
                style={{ padding: 15, alignItems: 'center' }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Backup Codes Modal */}
        <Modal visible={showVerifyModal} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 }}>
              Códigos de respaldo
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Guarda estos códigos en un lugar seguro. Podrás usarlos si pierdes acceso a Google Authenticator.
            </Text>

            {backupCodes.map((code, index) => (
              <View key={index} style={{ backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'monospace', fontSize: 16, color: colors.textPrimary }}>{code}</Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => { setShowVerifyModal(false); navigation.goBack(); }}
              style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Entendido</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
