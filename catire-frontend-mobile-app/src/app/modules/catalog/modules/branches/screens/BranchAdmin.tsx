import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Branch } from '../../../models/Branch';
import { styles } from '../../../../../shared/styles/admin.styles';
import { ConfirmDeleteModal } from '../../../../../shared/components/ConfirmDeleteModal';

export const BranchAdmin = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { branches, loading, fetchBranches, removeBranch } = useCatalogStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (token) fetchBranches(token);
  }, [token]);

  const handleDeletePress = (id: number) => {
    setBranchToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (branchToDelete !== null && token) {
      await removeBranch(token, branchToDelete);
      setDeleteModalVisible(false);
      setBranchToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setBranchToDelete(null);
  };

  const renderItem = ({ item }: { item: Branch }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>Lat: {item.coordinates_lat} | Lon: {item.coordinates_long}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('BranchForm', { branch: item })}>
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePress(item.id)}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Sucursales</Text>
      </View>
      
      {loading && branches.length === 0 ? (
        <ActivityIndicator size="large" color="#FFB800" />
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay sucursales.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('BranchForm')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmDeleteModal
        visible={deleteModalVisible}
        title="Eliminar Sucursal"
        message="¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </SafeAreaView>
  );
};