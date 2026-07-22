import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useBranchSyncStore, TransferRequest } from '../../../shared/store/branch-sync.store';
import { theme } from '../../../shared/styles/theme';

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 2, name: 'Carabobo' },
  { id: 3, name: 'El Malecón' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

export const TransferScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { transferRequests, createTransferRequest, approveTransfer, completeTransfer, rejectTransfer, getTransferRequests } = useBranchSyncStore();
  
  const [showModal, setShowModal] = useState(false);
  const [fromBranch, setFromBranch] = useState(BRANCHES[0]);
  const [toBranch, setToBranch] = useState(BRANCHES[1]);
  const [items, setItems] = useState([{ name: '', quantity: '' }]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const filteredRequests = getTransferRequests(
    user?.branch_id || undefined,
    filter === 'all' ? undefined : filter
  );

  const handleCreate = () => {
    if (!items.some(i => i.name && i.quantity)) {
      Alert.alert('Error', 'Agrega al menos un ingrediente');
      return;
    }

    createTransferRequest(
      fromBranch.id,
      toBranch.id,
      items.filter(i => i.name && i.quantity).map(i => ({
        ingredient_id: Date.now(),
        quantity: parseInt(i.quantity),
      })),
      user?.id || 0
    );

    setShowModal(false);
    setItems([{ name: '', quantity: '' }]);
    Alert.alert('Éxito', 'Solicitud de transferencia creada');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '? Pendiente';
      case 'approved': return '? Aprobado';
      case 'completed': return '?? Completado';
      case 'rejected': return '? Rechazado';
      default: return status;
    }
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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>? Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          ?? Transferencias
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {(['all', 'pending', 'approved', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: filter === f ? theme.colors.primary : theme.colors.white,
            }}
            onPress={() => setFilter(f)}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: filter === f ? '#fff' : theme.colors.textSecondary,
            }}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Completadas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          marginHorizontal: 16,
          marginBottom: 16,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Nueva Transferencia</Text>
      </TouchableOpacity>

      {/* Transfer Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>??</Text>
            <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>No hay transferencias</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>
                #{item.id.slice(-6)}
              </Text>
              <View style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: getStatusColor(item.status),
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 }}>
              De: {BRANCHES.find(b => b.id === item.from_branch_id)?.name || `Sucursal ${item.from_branch_id}`}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 }}>
              Hacia: {BRANCHES.find(b => b.id === item.to_branch_id)?.name || `Sucursal ${item.to_branch_id}`}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
              {item.items.length} items • {new Date(item.created_at).toLocaleDateString()}
            </Text>
            
            {item.status === 'pending' && user?.role?.name === 'admin' && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#D1FAE5', alignItems: 'center' }}
                  onPress={() => approveTransfer(item.id, user?.id || 0)}
                >
                  <Text style={{ color: '#065F46', fontWeight: '600', fontSize: 13 }}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center' }}
                  onPress={() => rejectTransfer(item.id)}
                >
                  <Text style={{ color: '#991B1B', fontWeight: '600', fontSize: 13 }}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {item.status === 'approved' && (
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: '#3B82F6',
                  alignItems: 'center',
                }}
                onPress={() => completeTransfer(item.id)}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Marcar Completado</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Create Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Nueva Transferencia</Text>
            
            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 }}>DESDE SUCURSAL</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {BRANCHES.slice(0, 5).map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: fromBranch.id === b.id ? theme.colors.primary : theme.colors.background,
                  }}
                  onPress={() => setFromBranch(b)}
                >
                  <Text style={{ fontSize: 12, color: fromBranch.id === b.id ? '#fff' : theme.colors.textPrimary }}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 }}>HACIA SUCURSAL</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {BRANCHES.filter(b => b.id !== fromBranch.id).slice(0, 5).map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: toBranch.id === b.id ? theme.colors.primary : theme.colors.background,
                  }}
                  onPress={() => setToBranch(b)}
                >
                  <Text style={{ fontSize: 12, color: toBranch.id === b.id ? '#fff' : theme.colors.textPrimary }}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>ITEMS</Text>
              <TouchableOpacity onPress={() => setItems([...items, { name: '', quantity: '' }])}>
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>+ Agregar</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  style={{ flex: 2, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, padding: 10, fontSize: 14 }}
                  placeholder="Ingrediente"
                  value={item.name}
                  onChangeText={(v) => {
                    const newItems = [...items];
                    newItems[index].name = v;
                    setItems(newItems);
                  }}
                />
                <TextInput
                  style={{ flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, padding: 10, fontSize: 14, textAlign: 'center' }}
                  placeholder="Cant."
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={(v) => {
                    const newItems = [...items];
                    newItems[index].quantity = v;
                    setItems(newItems);
                  }}
                />
                {items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setItems(items.filter((_, i) => i !== index))}
                  >
                    <Text style={{ fontSize: 18 }}>?</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.borderLight }}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}
                onPress={handleCreate}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Crear Solicitud</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

