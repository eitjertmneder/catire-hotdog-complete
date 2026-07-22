import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface UserCardProps {
  user: {
    id: number;
    full_name: string;
    email: string;
    dni: number;
    role?: { name: string };
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const roleName = user.role?.name === 'admin' ? 'Administrador' : user.role?.name === 'employee' ? 'Cajero' : 'Cliente';

  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#212121' }}>{user.full_name}</Text>
          <Text style={{ fontSize: 14, color: '#757575', marginTop: 4 }}>{user.email}</Text>
          <Text style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>DNI: {user.dni} | {roleName}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={{ padding: 8 }}>
              <Text>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={{ padding: 8 }}>
              <Text>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
