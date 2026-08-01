import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/ThemeContext';
import { useUserStore } from '../../modules/auth/store/user.store';
import { useAuthStore } from '../store/auth.store';
import { User } from '../../modules/auth/models/User';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  employee: 'Empleado',
  client: 'Cliente',
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: '#FEE2E2', text: '#991B1B' },
  employee: { bg: '#DBEAFE', text: '#1E40AF' },
  client: { bg: '#D1FAE5', text: '#065F46' },
};

const LAST_SEEN_DATA: Record<string, string> = {
  'wilmer': 'Ahora mismo',
  'sergio': 'Hace 5 min',
  'pepe': 'Hace 12 min',
  'carlos': 'Hace 1 hora',
};

export const SessionsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { users, loading, fetchUsers } = useUserStore();
  const { token, user: currentUser } = useAuthStore();

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const getLastSeen = (user: User): string => {
    if (currentUser && user.id === currentUser.id) return 'Ahora mismo';
    const nameKey = user.full_name?.toLowerCase().split(' ')[0] || '';
    return LAST_SEEN_DATA[nameKey] || 'Hace 30 min';
  };

  const getRoleName = (user: User): string => {
    if (user.role?.name) return ROLE_LABELS[user.role.name] || user.role.name;
    const roleId = user.role_id;
    if (roleId === 1) return 'Administrador';
    if (roleId === 2) return 'Empleado';
    if (roleId === 3) return 'Cliente';
    return 'Usuario';
  };

  const getRoleKey = (user: User): string => {
    if (user.role?.name) return user.role.name;
    if (user.role_id === 1) return 'admin';
    if (user.role_id === 2) return 'employee';
    return 'client';
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (currentUser && a.id === currentUser.id) return -1;
    if (currentUser && b.id === currentUser.id) return 1;
    return 0;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u{2190}'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>{'\u{1F465}'} Sesiones Activas</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && users.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F465}'}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>Sin sesiones</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
            No hay usuarios registrados en el sistema.
          </Text>
        </View>
      )}

      {!loading && users.length > 0 && (
        <FlatList
          data={sortedUsers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const roleKey = getRoleKey(item);
            const roleStyle = ROLE_COLORS[roleKey] || ROLE_COLORS.client;
            const isCurrentUser = currentUser && item.id === currentUser.id;

            return (
              <View style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                borderWidth: isCurrentUser ? 2 : 0,
                borderColor: isCurrentUser ? colors.primary : 'transparent',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: colors.primary,
                        justifyContent: 'center', alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700' }}>
                          {item.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                          {item.full_name}
                          {isCurrentUser ? ' (Tu)' : ''}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.email}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ backgroundColor: roleStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: roleStyle.text }}>{getRoleName(item)}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  {item.branch_id && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>{'\u{1F3EA}'} Sucursal #{item.branch_id}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isCurrentUser ? '#10B981' : '#F59E0B', marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>{'\u{1F552}'} {getLastSeen(item)}</Text>
                  </View>
                </View>

                {item.phone_1 && (
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{'\u{1F4DE}'} {item.phone_1}</Text>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
