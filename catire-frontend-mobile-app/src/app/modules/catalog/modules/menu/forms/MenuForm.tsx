import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Menu, MenuDTO } from '../../../models/Menu';
import { styles } from '../../../../../shared/styles/admin.styles';

export const MenuForm = ({ route }: any) => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  
  const { branches, fetchBranches, addMenu, editMenu, loading, actionLoading } = useCatalogStore();
  
  const menuToEdit: Menu | undefined = route.params?.menu;
  const isEditing = !!menuToEdit;

  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState<number | string | null>(null);

  useEffect(() => {
    if (token && branches.length === 0) {
      fetchBranches(token);
    }
  }, [token, branches.length]);

  useEffect(() => {
    if (isEditing && menuToEdit) {
      setName(menuToEdit.name);
      setBranchId(menuToEdit.branch_id);
    } else if (branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [isEditing, menuToEdit, branches]);

  const handleSave = async () => {
    if (!token || !name || !branchId) return;

    const payload: MenuDTO = { 
      name, 
      branch_id: Number(branchId)
    };

    if (isEditing && menuToEdit) {
      await editMenu(token, menuToEdit.id, payload);
    } else {
      await addMenu(token, payload);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Menú' : 'Nuevo Menú'}</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Nombre del menú</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Ej: Menú Fin de Semana" 
        />

        <Text style={styles.label}>Asignar a Sucursal</Text>
        {loading && branches.length === 0 ? (
          <ActivityIndicator size="small" color="#FFB800" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.categoryRow}>
            {branches.map((branch) => (
              <TouchableOpacity 
                key={branch.id} 
                style={[styles.categoryPill, branchId === branch.id && styles.categoryPillSelected]}
                onPress={() => setBranchId(branch.id)}
              >
                <Text style={[styles.categoryPillText, branchId === branch.id && styles.categoryPillTextSelected]}>
                  {branch.name}
                </Text>
              </TouchableOpacity>
            ))}
            {branches.length === 0 && (
              <Text style={styles.emptyText}>No hay sucursales disponibles. Crea una primero.</Text>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.saveBtn, (actionLoading || !branchId) && styles.saveBtnDisabled]} 
          onPress={handleSave} 
          disabled={actionLoading || !branchId}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Menú</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};