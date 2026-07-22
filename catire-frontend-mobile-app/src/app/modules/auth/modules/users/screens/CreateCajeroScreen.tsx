import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Api } from '../../../../../shared/api/api';
import { theme } from '../../../../../shared/styles/theme';

const api = new Api();

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 2, name: 'Carabobo' },
  { id: 3, name: 'El Malec�n' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

interface User {
  id: number;
  full_name: string;
  email: string;
  role: { name: string };
  branch_id?: number | null;
}

export const CreateCajeroScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    const res = await api.get<User[]>('auth', 'users', token);
    if (!res.error && res.data) {
      setUsers(Array.isArray(res.data) ? res.data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const cajeros = users.filter(u => u.role?.name === 'employee');
  const clients = users.filter(u => u.role?.name === 'client');

  const getBranchName = (branchId?: number | null) => {
    if (!branchId) return 'Sin asignar';
    return BRANCHES.find(b => b.id === branchId)?.name || `Sucursal ${branchId}`;
  };

  const handleConvertToCajero = async () => {
    if (!selectedUser || !token) return;
    setActionLoading(true);
    
    const res = await api.put('auth', `users/${selectedUser.id}`, {
      role_id: 2, // employee role
      branch_id: selectedBranch.id,
    }, token);

    if (!res.error) {
      Alert.alert('Éxito', `${selectedUser.full_name} ahora es cajero de ${selectedBranch.name}`);
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
    } else {
      const errorMsg = Array.isArray(res.message) ? res.message.join(', ') : String(res.message || 'No se pudo actualizar el usuario');
      Alert.alert('Error', errorMsg);
    }
    setActionLoading(false);
  };

  const handleReasignBranch = async (userId: number, newBranchId: number) => {
    if (!token) return;
    const res = await api.put('auth', `users/${userId}`, {
      branch_id: newBranchId,
    }, token);
    if (!res.error) {
      Alert.alert('Éxito', 'Sucursal actualizada');
      fetchUsers();
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
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          🧑‍💼 Gestionar Cajeros
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              {/* Cajeros Actuales */}
              <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
                  Cajeros Actuales ({cajeros.length})
                </Text>
                {cajeros.length === 0 ? (
                  <Text style={{ color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>
                    No hay cajeros registrados
                  </Text>
                ) : (
                  cajeros.map(cajero => (
                    <View key={cajero.id} style={{
                      backgroundColor: theme.colors.white,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 4,
                      elevation: 1,
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary }}>
                            {cajero.full_name}
                          </Text>
                          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                            {cajero.email}
                          </Text>
                        </View>
                        <View style={{ 
                          backgroundColor: '#D1FAE5', 
                          paddingHorizontal: 10, paddingVertical: 4, 
                          borderRadius: 8 
                        }}>
                          <Text style={{ color: theme.colors.success, fontWeight: '600', fontSize: 11 }}>
                            {getBranchName(cajero.branch_id)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Convertir Usuarios */}
              <View style={{ padding: 16, paddingTop: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 }}>
                  Convertir Usuario en Cajero ({clients.length})
                </Text>
              </View>
            </>
          }
          data={clients}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
              onPress={() => {
                setSelectedUser(item);
                setShowModal(true);
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary }}>
                    {item.full_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    {item.email}
                  </Text>
                </View>
                <View style={{ 
                  backgroundColor: '#DBEAFE', 
                  paddingHorizontal: 10, paddingVertical: 4, 
                  borderRadius: 8 
                }}>
                  <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 11 }}>Convertir</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
              <Text style={{ color: theme.colors.textMuted }}>No hay usuarios disponibles</Text>
            </View>
          }
        />
      )}

      {/* Modal para seleccionar sucursal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '88%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: theme.colors.textPrimary }}>
              Asignar Sucursal
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
              {selectedUser?.full_name}
            </Text>

            <FlatList
              data={BRANCHES}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 280 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: selectedBranch.id === item.id ? '#FEE2E2' : theme.colors.borderLight,
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: selectedBranch.id === item.id ? theme.colors.primary : 'transparent',
                  }}
                  onPress={() => setSelectedBranch(item)}
                >
                  <Text style={{ 
                    fontWeight: selectedBranch.id === item.id ? '700' : '500',
                    color: selectedBranch.id === item.id ? theme.colors.primary : theme.colors.textPrimary,
                    fontSize: 14,
                  }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity 
                style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.borderLight, alignItems: 'center' }} 
                onPress={() => { setShowModal(false); setSelectedUser(null); }}
              >
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center' }}
                onPress={handleConvertToCajero}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


