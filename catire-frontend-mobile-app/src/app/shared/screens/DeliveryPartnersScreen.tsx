import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/ThemeContext';

interface DeliveryPartner {
  id: string;
  name: string;
  commissionRate: number; // percentage
  estimatedDeliveryTime: number; // minutes
  active: boolean;
}

const initialPartners: DeliveryPartner[] = [
  {
    id: 'rappi',
    name: 'Rappi',
    commissionRate: 15,
    estimatedDeliveryTime: 30,
    active: true,
  },
  {
    id: 'pedidosya',
    name: 'PedidosYa',
    commissionRate: 12,
    estimatedDeliveryTime: 25,
    active: true,
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    commissionRate: 18,
    estimatedDeliveryTime: 35,
    active: true,
  },
  {
    id: 'didifood',
    name: 'Didi Food',
    commissionRate: 10,
    estimatedDeliveryTime: 40,
    active: false,
  },
];

export const DeliveryPartnersScreen = () => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [partners, setPartners] = useState<DeliveryPartner[]>(initialPartners);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);

  // Form state for editing
  const [serviceName, setServiceName] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [active, setActive] = useState(false);

  const openEditModal = (partner: DeliveryPartner) => {
    setEditingPartner(partner);
    setServiceName(partner.name);
    setCommissionRate(String(partner.commissionRate));
    setEstimatedDeliveryTime(String(partner.estimatedDeliveryTime));
    setActive(partner.active);
    setEditModalVisible(true);
  };

  const savePartner = () => {
    if (!editingPartner) return;

    const updatedPartners = partners.map((partner) => {
      if (partner.id === editingPartner.id) {
        return {
          ...partner,
          name: serviceName,
          commissionRate: parseFloat(commissionRate) || partner.commissionRate,
          estimatedDeliveryTime: parseInt(estimatedDeliveryTime, 10) || partner.estimatedDeliveryTime,
          active,
        };
      }
      return partner;
    });

    setPartners(updatedPartners);
    setEditModalVisible(false);
    setEditingPartner(null);
  };

  const togglePartnerActive = (id: string) => {
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === id ? { ...partner, active: !partner.active } : partner
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: colors.primary,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: '600' }}>
            {'\u2190'} Volver
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
            marginLeft: 12,
          }}
        >
          {'\uD83D\uDE95'} Apps de Delivery
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {partners.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 16, color: colors.textMuted }}>
              No hay apps de delivery configuradas.
            </Text>
          </View>
        ) : (
          partners.map((partner) => (
            <TouchableOpacity
              key={partner.id}
              onPress={() => openEditModal(partner)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: partner.active ? '#10B981' : colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: colors.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {partner.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Comisi\u00F3n: {partner.commissionRate}%
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Tiempo estimado: {partner.estimatedDeliveryTime} min
                  </Text>
                </View>
                <Switch
                  value={partner.active}
                  onValueChange={() => togglePartnerActive(partner.id)}
                  trackColor={{ false: colors.border, true: '#D1FAE5' }}
                  thumbColor={partner.active ? '#10B981' : colors.borderLight}
                  style={{ marginRight: 12 }}
                />
                <TouchableOpacity
                  onPress={() => openEditModal(partner)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {'\u270F\uFE0F'} Editar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              width: '85%',
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Editar {editingPartner?.name}
            </Text>

            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              Nombre del servicio
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginBottom: 12,
                color: colors.textPrimary,
                backgroundColor: colors.background,
              }}
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Nombre del servicio"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              Comisi\u00F3n (%)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginBottom: 12,
                color: colors.textPrimary,
                backgroundColor: colors.background,
              }}
              value={commissionRate}
              onChangeText={setCommissionRate}
              placeholder="15"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              Tiempo estimado (minutos)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginBottom: 12,
                color: colors.textPrimary,
                backgroundColor: colors.background,
              }}
              value={estimatedDeliveryTime}
              onChangeText={setEstimatedDeliveryTime}
              placeholder="30"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Activo</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: colors.border, true: '#D1FAE5' }}
                thumbColor={active ? '#10B981' : colors.borderLight}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.borderLight,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={savePartner}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '600' }}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
