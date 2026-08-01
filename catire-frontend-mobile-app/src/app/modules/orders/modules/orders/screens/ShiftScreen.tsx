import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

export const ShiftScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const { orders, fetchOrders } = useOrdersStore();
  
  const [shiftActive, setShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [shiftStartOrders, setShiftStartOrders] = useState(0);

  // Calcular estadísticas del turno
  const getShiftStats = () => {
    if (!shiftStartTime) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
    
    const shiftOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      return orderDate >= shiftStartTime && o.status !== 'CANCELLED';
    });
    
    const totalRevenue = shiftOrders.reduce((sum: number, o: any) => {
      const orderTotal = o.items?.reduce((itemSum: number, item: any) => 
        itemSum + (item.base_price * item.quantity), 0) || 0;
      return sum + orderTotal;
    }, 0);
    
    return {
      totalOrders: shiftOrders.length,
      totalRevenue,
      pendingOrders: shiftOrders.filter((o: any) => o.status === 'PENDING').length,
    };
  };

  const handleStartShift = () => {
    setShiftActive(true);
    setShiftStartTime(new Date());
    setShiftStartOrders(orders.length);
    Alert.alert('Turno Iniciado', 'Tu turno ha comenzado. ¡Buen trabajo!');
  };

  const handleEndShift = () => {
    const stats = getShiftStats();
    
    Alert.alert(
      'Finalizar Turno',
      `Resumen del turno:\n\n` +
      `Pedidos atendidos: ${stats.totalOrders}\n` +
      `Ingresos totales: $${stats.totalRevenue.toFixed(2)}\n` +
      `Pedidos pendientes: ${stats.pendingOrders}\n\n` +
      `¿Deseas finalizar tu turno?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          onPress: () => {
            setShiftActive(false);
            setShiftStartTime(null);
            Alert.alert('Turno Finalizado', 'Tu turno ha terminado. ¡Descansa!');
            navigation.goBack();
          }
        },
      ]
    );
  };

  const stats = getShiftStats();

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
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          Mi Turno
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Info del Cajero */}
        <View style={{ 
          backgroundColor: colors.white, 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
            {user?.full_name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Cajero - Sucursal asignada
          </Text>
        </View>

        {/* Estado del Turno */}
        <View style={{ 
          backgroundColor: shiftActive ? '#E8F5E9' : '#FFF3E0',
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: shiftActive ? '#4CAF50' : '#FF9800',
        }}>
          <Text style={{ 
            fontSize: 16, fontWeight: '700', 
            color: shiftActive ? '#2E7D32' : '#E65100',
            marginBottom: 8 
          }}>
            {shiftActive ? 'Turno Activo' : 'Turno Inactivo'}
          </Text>
          {shiftStartTime && (
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Inicio: {shiftStartTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {/* Estadísticas del Turno */}
        {shiftActive && (
          <View style={{ 
            backgroundColor: colors.white, 
            borderRadius: 16, 
            padding: 20, 
            marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>
              Resumen del Turno
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary }}>Pedidos atendidos:</Text>
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{stats.totalOrders}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary }}>Ingresos totales:</Text>
              <Text style={{ fontWeight: '700', color: colors.success }}>${stats.totalRevenue.toFixed(2)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Pedidos pendientes:</Text>
              <Text style={{ fontWeight: '700', color: stats.pendingOrders > 0 ? colors.warning : colors.textPrimary }}>
                {stats.pendingOrders}
              </Text>
            </View>
          </View>
        )}

        {/* Botón de Acción */}
        {!shiftActive ? (
          <TouchableOpacity
            style={{ 
              backgroundColor: '#4CAF50', 
              paddingVertical: 16, 
              borderRadius: 14, 
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={handleStartShift}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Iniciar Turno
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ 
              backgroundColor: '#F44336', 
              paddingVertical: 16, 
              borderRadius: 14, 
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={handleEndShift}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Finalizar Día
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
