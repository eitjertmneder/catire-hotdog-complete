import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDeliveryIntegrationStore } from '../store/delivery-integration.store';
import { theme } from '../styles/theme';

export const DeliveryPartnersScreen = () => {
  const navigation = useNavigation();
  const { partners, togglePartner, getPartnerStats } = useDeliveryIntegrationStore();

  const partnerIcons: Record<string, string> = {
    'ubereats': '🛵',
    'rappi': '🛵',
    'pedidosya': '🛵',
  };

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
          🛵 Apps de Delivery
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {partners.map((partner) => {
          const stats = getPartnerStats(partner.id);
          return (
            <View
              key={partner.id}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: partner.active ? '#10B981' : theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>
                    {partnerIcons[partner.id] || '🛵'}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
                      {partner.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>
                      Comisión: {(partner.commission_rate * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <Switch
                  value={partner.active}
                  onValueChange={() => togglePartner(partner.id)}
                  trackColor={{ false: '#E0E0E0', true: '#D1FAE5' }}
                  thumbColor={partner.active ? '#10B981' : '#f4f3f4'}
                />
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.primary }}>
                    {stats.orders}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Pedidos</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>
                    ${stats.revenue.toFixed(0)}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Ingresos</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#EF4444' }}>
                    ${stats.commission.toFixed(0)}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Comisión</Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  Tiempo estimado: {partner.estimated_delivery_time} min
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
