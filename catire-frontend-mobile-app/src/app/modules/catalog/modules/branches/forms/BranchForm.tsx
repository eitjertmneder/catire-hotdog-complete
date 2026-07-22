import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Branch, BranchDTO } from '../../../models/Branch';
import { styles } from '../../../../../shared/styles/admin.styles';

export const BranchForm = ({ route }: any) => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { addBranch, editBranch, actionLoading } = useCatalogStore();
  
  const branchToEdit: Branch | undefined = route.params?.branch;
  const isEditing = !!branchToEdit;

  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');

  useEffect(() => {
    if (isEditing && branchToEdit) {
      setName(branchToEdit.name);
      setLat(branchToEdit.coordinates_lat.toString());
      setLong(branchToEdit.coordinates_long.toString());
    }
  }, [isEditing, branchToEdit]);

  const handleSave = async () => {
    if (!token || !name || !lat || !long) return;

    const payload: BranchDTO = {
      name,
      coordinates_lat: parseFloat(lat),
      coordinates_long: parseFloat(long)
    };

    if (isEditing && branchToEdit) {
      await editBranch(token, branchToEdit.id, payload);
    } else {
      await addBranch(token, payload);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Sede Central" />

        <Text style={styles.label}>Latitud</Text>
        <TextInput style={styles.input} value={lat} onChangeText={setLat} keyboardType="numeric" placeholder="Ej: 7.7689" />

        <Text style={styles.label}>Longitud</Text>
        <TextInput style={styles.input} value={long} onChangeText={setLong} keyboardType="numeric" placeholder="Ej: -72.2250" />

        <TouchableOpacity style={[styles.saveBtn, actionLoading && styles.saveBtnDisabled]} onPress={handleSave} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};