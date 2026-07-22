import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../../store/user.store';
import { User, UserDTO } from '../../../models/User';
import { styles } from '../../../../../shared/styles/admin.styles';

export const UserForm = ({ route }: any) => {
  const navigation = useNavigation();
  const { createUser, updateUser, loading } = useUserStore();
  
  const userToEdit: User | undefined = route.params?.userToEdit;
  const isEditing = !!userToEdit;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [password, setPassword] = useState(''); // Solo requerido en creación

  useEffect(() => {
    if (isEditing && userToEdit) {
      setFullName(userToEdit.full_name);
      setEmail(userToEdit.email);
      setDni(userToEdit.dni.toString());
      setPhone1(userToEdit.phone_1);
      setPhone2(userToEdit.phone_2 || '');
    }
  }, [isEditing, userToEdit]);

  const handleSave = async () => {
    if (!fullName || !email || !dni || !phone1) return;

    if (isEditing && userToEdit) {
      // Partial<User>
      await updateUser(userToEdit.id, {
        full_name: fullName,
        email,
        dni: parseInt(dni, 10),
        phone_1: phone1,
        phone_2: phone2 || undefined,
        ...(password ? { password } : {}) // Enviar password solo si lo escribió
      });
    } else {
      // UserDTO
      if (!password) return; // Validación extra para creación
      await createUser({
        full_name: fullName,
        email,
        dni: parseInt(dni, 10),
        phone_1: phone1,
        phone_2: phone2,
        password
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>DNI / Cédula</Text>
        <TextInput style={styles.input} value={dni} onChangeText={setDni} keyboardType="numeric" />

        <Text style={styles.label}>Teléfono 1</Text>
        <TextInput style={styles.input} value={phone1} onChangeText={setPhone1} keyboardType="phone-pad" />

        <Text style={styles.label}>Teléfono 2 (Opcional)</Text>
        <TextInput style={styles.input} value={phone2} onChangeText={setPhone2} keyboardType="phone-pad" />

        <Text style={styles.label}>{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};