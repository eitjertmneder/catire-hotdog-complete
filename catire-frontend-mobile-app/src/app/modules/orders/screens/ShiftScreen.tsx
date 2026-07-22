import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useShiftStore, Shift } from '../../../shared/store/shift.store';
import { theme } from '../../../shared/styles/theme';

export const ShiftScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { currentShift, startShift, endShift, getShifts, getTotalHoursThisWeek } = useShiftStore();
  const [selectedBranch] = useState({ id: user?.branch_id || 1, name: 'Sucursal Actual' });

  const handleStartShift = () => {
    Alert.alert(
      'Iniciar Turno',
      `¿Iniciar turno en ${selectedBranch.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: () => {
            startShift(selectedBranch.id, selectedBranch.name, user?.id || 0, user?.full_name || '');
            Alert.alert('Éxito', 'Turno iniciado');
          },
        },
      ]
    );
  };

  const handleEndShift = () => {
    Alert.alert(
      'Finalizar Turno',
      '¿Estás seguro de finalizar tu turno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            endShift();
            Alert.alert('Éxito', 'Turno finalizado');
          },
        },
      ]
    );
  };

  const myShifts = getShifts(user?.id);
  const totalHours = getTotalHoursThisWeek(user?.id || 0);

  const renderShift = ({ item }: { item: Shift }) => (
    <View style={{
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary }}>
          {item.branch_name}
        </Text>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: item.status === 'active' ? '#D1FAE5' : '#F3F4F6',
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '600',
            color: item.status === 'active' ? '#065F46' : '#6B7280',
          }}>
            {item.status === 'active' ? 'Activo' : 'Completado'}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
        Inicio: {new Date(item.start_time).toLocaleString()}
      </Text>
      {item.end_time && (
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
          Fin: {new Date(item.end_time).toLocaleString()}
        </Text>
      )}
      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 4 }}>
        Horas: {item.hours_worked.toFixed(2)}h
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          ⏰ Mi Turno
        </Text>
      </View>

      <FlatList
        data={myShifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Current Shift Status */}
            <View style={{
              backgroundColor: currentShift ? '#D1FAE5' : theme.colors.white,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 2,
              borderColor: currentShift ? '#10B981' : theme.colors.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                  Estado del Turno
                </Text>
                <View style={{
                  width: 12, height: 12, borderRadius: 6,
                  backgroundColor: currentShift ? '#10B981' : '#9E9E9E',
                }} />
              </View>
              
              {currentShift ? (
                <>
                  <Text style={{ fontSize: 14, color: '#065F46', marginBottom: 4 }}>
                    🟢 Turno Activo
                  </Text>
                  <Text style={{ fontSize: 13, color: '#047857', marginBottom: 8 }}>
                    Inicio: {new Date(currentShift.start_time).toLocaleTimeString()}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                    onPress={handleEndShift}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>⏹ Finalizar Turno</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12 }}>
                    No tienes un turno activo
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: 10,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                    onPress={handleStartShift}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>▶ Iniciar Turno</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Weekly Stats */}
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 }}>
                📊 Esta Semana
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.primary }}>
                {totalHours.toFixed(1)}h
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>Horas trabajadas</Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
              Historial de Turnos
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>Sin turnos registrados</Text>
          </View>
        }
        renderItem={renderShift}
      />
    </SafeAreaView>
  );
};
