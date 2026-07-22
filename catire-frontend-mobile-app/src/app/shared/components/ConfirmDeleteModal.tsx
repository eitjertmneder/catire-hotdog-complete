import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal = ({
  visible,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26, 26, 46, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#FFF', width: '80%', padding: 20, borderRadius: 15, elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  message: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#F0F0F0' },
  confirmBtn: { backgroundColor: theme.colors.primary },
  cancelText: { color: '#333', fontWeight: 'bold' },
  confirmText: { color: '#FFF', fontWeight: 'bold' },
});