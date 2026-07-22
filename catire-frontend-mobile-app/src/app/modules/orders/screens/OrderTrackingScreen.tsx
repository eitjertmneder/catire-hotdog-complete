import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useETAStore } from '../../../shared/store/eta.store';
import { useChatStore } from '../../../shared/store/chat.store';
import { theme } from '../../../shared/styles/theme';

const statusSteps = [
  { key: 'PENDING', label: 'Pendiente', icon: '?', description: 'Esperando confirmación' },
  { key: 'PAID', label: 'Pagado', icon: '??', description: 'Pago confirmado' },
  { key: 'PREPARING', label: 'Preparando', icon: '?????', description: 'Tu pedido se está preparando' },
  { key: 'READY', label: 'Listo', icon: '?', description: 'Tu pedido está listo' },
  { key: 'ON_THE_WAY', label: 'En Camino', icon: '??', description: 'Tu pedido va en camino' },
  { key: 'DELIVERED', label: 'Entregado', icon: '??', description: 'Pedido entregado' },
];

export const OrderTrackingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { getETA } = useETAStore();
  const { getMessages } = useChatStore();
  
  const orderId = route.params?.orderId || '';
  const currentStatus = route.params?.status || 'PENDING';
  const isDelivery = route.params?.isDelivery || false;
  const itemCount = route.params?.itemCount || 1;

  const eta = getETA(orderId);
  const messages = getMessages(orderId);
  const unreadCount = messages.filter(m => !m.read).length;

  const currentStepIndex = statusSteps.findIndex(s => s.key === currentStatus);

  const getTimeRemaining = () => {
    if (!eta) return null;
    const now = new Date();
    const diff = eta.estimated_arrival.getTime() - now.getTime();
    const minutes = Math.max(0, Math.floor(diff / 60000));
    return minutes;
  };

  const timeRemaining = getTimeRemaining();

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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>? Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          ?? Seguimiento - #{orderId.slice(0, 8)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* ETA Card */}
        {eta && currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && (
          <View style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 4 }}>
              Tiempo Estimado
            </Text>
            <Text style={{ fontSize: 42, fontWeight: '800', color: '#fff' }}>
              {timeRemaining} min
            </Text>
            <Text style={{ fontSize: 13, color: '#fff', opacity: 0.8, marginTop: 4 }}>
              Llegada estimada: {eta.estimated_arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>Preparación</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{eta.preparation_time} min</Text>
              </View>
              {isDelivery && (
                <View>
                  <Text style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>Delivery</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{eta.delivery_time} min</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Status Progress */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 }}>
            Estado del Pedido
          </Text>

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <View key={step.key} style={{ flexDirection: 'row', marginBottom: 16 }}>
                {/* Left side - icon and line */}
                <View style={{ alignItems: 'center', width: 40 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: isCompleted ? '#10B981' : isFuture ? '#E5E7EB' : theme.colors.primary,
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: isCurrent ? '#D1FAE5' : 'transparent',
                  }}>
                    <Text style={{ fontSize: 16 }}>
                      {isCompleted ? '?' : step.icon}
                    </Text>
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={{
                      width: 2,
                      height: 30,
                      backgroundColor: isCompleted ? '#10B981' : '#E5E7EB',
                    }} />
                  )}
                </View>

                {/* Right side - content */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: isCurrent ? '700' : '600',
                    color: isCompleted ? '#10B981' : isFuture ? '#9CA3AF' : theme.colors.textPrimary,
                  }}>
                    {step.label}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: isCurrent ? theme.colors.textSecondary : '#9CA3AF',
                    marginTop: 2,
                  }}>
                    {step.description}
                  </Text>
                </View>

                {/* Time indicator */}
                {isCompleted && index < currentStepIndex && (
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>?</Text>
                )}
                {isCurrent && (
                  <View style={{
                    backgroundColor: '#FEF3C7',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#92400E' }}>Actual</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Cancelled Status */}
        {currentStatus === 'CANCELLED' && (
          <View style={{
            backgroundColor: '#FEE2E2',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>
              ? Este pedido fue cancelado
            </Text>
          </View>
        )}

        {/* Chat Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onPress={() => navigation.navigate('Chat' as any, { orderId })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>??</Text>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>
                Chat con {isDelivery ? 'Repartidor' : 'Trabajador'}
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>
                {unreadCount > 0 ? `${unreadCount} mensajes nuevos` : 'Mensajes'}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 20 }}>?</Text>
        </TouchableOpacity>

        {/* Rate Button (only for delivered orders) */}
        {currentStatus === 'DELIVERED' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
            }}
            onPress={() => navigation.navigate('Review' as any, { orderId })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>?</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#92400E' }}>
                  Calificar Pedido
                </Text>
                <Text style={{ fontSize: 13, color: '#78350F' }}>
                  Cuéntanos tu experiencia
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 20 }}>?</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};



