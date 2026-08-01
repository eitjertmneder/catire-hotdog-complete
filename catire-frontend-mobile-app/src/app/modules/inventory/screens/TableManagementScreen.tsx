import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTableStore, Table } from '../../../shared/store/table.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

export const TableManagementScreen = () => {
  const navigation = useNavigation();
  const { tables, getTablesByBranch, updateTableStatus, getTableUtilization } = useTableStore();
  const { colors } = useAppTheme();
  const [selectedBranch] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [partySize, setPartySize] = useState('2');

  const branchTables = getTablesByBranch(selectedBranch);
  const utilization = getTableUtilization(selectedBranch);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'cleaning': return '#6B7280';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'cleaning': return 'Limpiando';
      default: return status;
    }
  };

  const handleSeat = (table: Table) => {
    setSelectedTable(table);
    setCustomerName('');
    setPartySize('2');
    setShowModal(true);
  };

  const confirmSeat = () => {
    if (!selectedTable || !customerName) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }

    updateTableStatus(selectedTable.id, 'occupied', undefined, customerName);
    setShowModal(false);
    Alert.alert('Exito', `Mesa ${selectedTable.number} ocupada por ${customerName}`);
  };

  const handleFree = (table: Table) => {
    Alert.alert(
      'Liberar Mesa',
      `Liberar la mesa ${table.number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          onPress: () => {
            updateTableStatus(table.id, 'cleaning');
            setTimeout(() => {
              updateTableStatus(table.id, 'available');
            }, 2000);
          },
        },
      ]
    );
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
          Gesti\u00f3n de Mesas
        </Text>
      </View>

      {/* Utilization Stats */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>
            {utilization.total}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Total Mesas</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#10B981' }}>
            {utilization.total - utilization.occupied}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Disponibles</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#EF4444' }}>
            {utilization.occupied}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Ocupadas</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#F59E0B' }}>
            {utilization.percentage.toFixed(0)}%
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Ocupacion</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 16,
      }}>
        {[
          { status: 'available', label: 'Disponible' },
          { status: 'occupied', label: 'Ocupada' },
          { status: 'reserved', label: 'Reservada' },
          { status: 'cleaning', label: 'Limpiando' },
        ].map((item) => (
          <View key={item.status} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(item.status), marginRight: 6 }} />
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Tables Grid */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {branchTables.map((table) => (
            <TouchableOpacity
              key={table.id}
              style={{
                width: '30%',
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: getStatusColor(table.status),
              }}
              onPress={() => {
                if (table.status === 'available') {
                  handleSeat(table);
                } else if (table.status === 'occupied') {
                  handleFree(table);
                }
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{'\u{1F37D}'}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                Mesa {table.number}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                {table.capacity} personas
              </Text>
              <View style={{
                marginTop: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: getStatusColor(table.status),
              }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>
                  {getStatusLabel(table.status)}
                </Text>
              </View>
              {table.customer_name && (
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                  {table.customer_name}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {branchTables.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>{'\u{1F5FA}'}</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted }}>
              No hay mesas configuradas
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Seat Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
              Sentar en Mesa {selectedTable?.number}
            </Text>

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>NOMBRE DEL CLIENTE</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                padding: 12, fontSize: 16, marginBottom: 16,
              }}
              placeholder="Nombre"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>TAMANO DEL GRUPO</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                padding: 12, fontSize: 16, marginBottom: 16,
              }}
              placeholder="2"
              keyboardType="numeric"
              value={partySize}
              onChangeText={setPartySize}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.borderLight }}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.primary }}
                onPress={confirmSeat}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

