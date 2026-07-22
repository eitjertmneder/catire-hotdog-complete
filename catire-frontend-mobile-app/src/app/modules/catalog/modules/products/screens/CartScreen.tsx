import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Switch, Alert, Modal, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCartStore } from '../../../../../shared/store/cart.store';
import { useOrdersStore } from '../../../../orders/store/orders.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useExchangeRateStore } from '../../../../../shared/store/exchange-rate.store';
import financeApi from '../../../../finance/api/finance.api';
import { styles } from '../styles/cart.styles';
import { CartItemAccordion } from '../components/CartItemAccordion';

export const CartScreen = () => {
  const navigation = useNavigation<any>();

  const { items, updateQuantity, removeItem, getTotalPrice, clearCart, branchId } = useCartStore();
  const { addOrder, actionLoading, clearOrdersError } = useOrdersStore();
  const { token } = useAuthStore();
  const { rates, fetchRates, convert, formatCurrency, lastUpdated, isLoading } = useExchangeRateStore();

  const [isDelivery, setIsDelivery] = useState(false);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState({
    street: '', avenue: '', house_number: '', reference: ''
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'efectivo' | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchRates(); // Fetch real-time exchange rates
    loadPaymentConfig();
  }, []);

  const loadPaymentConfig = async () => {
    const res = await financeApi.getActivePaymentConfig();
    if (!res.error && res.data) {
      setPaymentConfig(res.data);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.15,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = result.assets[0].base64;
      if (base64) {
        setPaymentProof(`data:image/jpeg;base64,${base64}`);
      }
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.15,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = result.assets[0].base64;
      if (base64) {
        setPaymentProof(`data:image/jpeg;base64,${base64}`);
      }
    }
  };

  const handleConfirmOrder = async () => {
    if (!token) return Alert.alert('Error', 'Sesión expirada o no iniciada');
    if (items.length === 0) return Alert.alert('Error', 'El carrito está vacío');

    // Validar método de pago
    if (!paymentMethod) {
      return Alert.alert('Error', 'Selecciona un método de pago');
    }

    // Validar comprobante para Pago Móvil
    if (paymentMethod === 'pago_movil' && !paymentProof) {
      return Alert.alert('Error', 'Debes adjuntar una foto del comprobante de pago para Pago Móvil');
    }

    if (isDelivery) {
      if (!address.street || !address.avenue || !address.house_number) {
        return Alert.alert('Error', 'Faltan campos obligatorios en la dirección');
      }
      const streetNum = Number(address.street);
      const avenueNum = Number(address.avenue);
      const houseNum = Number(address.house_number);
      if (isNaN(streetNum) || isNaN(avenueNum) || isNaN(houseNum)) {
        return Alert.alert('Error', 'Los campos de dirección deben ser números válidos');
      }
    }

    const orderPayload: any = {
      is_delivery: isDelivery,
      branch_id: branchId,
      payment_method: paymentMethod,
      payment_proof: paymentProof || undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        base_price: item.base_price,
        features: item.features
      })),
      ...(isDelivery && {
        address: {
          street: Number(address.street),
          avenue: Number(address.avenue),
          house_number: Number(address.house_number),
          reference: address.reference || undefined,
        }
      })
    };

    await addOrder(token, orderPayload);
    const currentError = useOrdersStore.getState().error;

    if (currentError) {
      const errorMsg = Array.isArray(currentError) ? currentError.join(', ') : String(currentError);
      Alert.alert('Error al crear orden', errorMsg);
      clearOrdersError();
    } else {
      clearCart();
      setShowSuccessModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigation.navigate('Orders');
  };

  const totalPrice = getTotalPrice();
  
  // Convertir precios a otras monedas usando tasas en tiempo real
  const priceVES = convert(totalPrice, 'USD', 'VES');
  const priceCOP = convert(totalPrice, 'USD', 'COP');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tu Carrito</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.cart_id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemAccordion 
            item={item} 
            updateQuantity={updateQuantity} 
            removeItem={removeItem} 
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay productos en el carrito</Text>}
      />

      {items.length > 0 && (
        <ScrollView style={styles.checkoutSection}>
          {/* Total en 3 monedas con tasas en tiempo real */}
          <View style={{
            backgroundColor: '#F0F9FF', borderRadius: 12, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: '#BAE6FD',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0369A1' }}>💰 Total a Pagar</Text>
              {isLoading && <ActivityIndicator size="small" color="#0369A1" />}
            </View>
            
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#0C4A6E' }}>
              {formatCurrency(totalPrice, 'USD')}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 14, color: '#0369A1' }}>
                🇻🇪 Bs. {formatCurrency(priceVES, 'VES').replace('$', '')}
              </Text>
              <Text style={{ fontSize: 14, color: '#0369A1' }}>
                🇨🇴 {formatCurrency(priceCOP, 'COP')} COP
              </Text>
            </View>
            
            {lastUpdated && (
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                📅 Tasas actualizadas: {new Date(lastUpdated).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>¿Es para Delivery?</Text>
            <Switch value={isDelivery} onValueChange={setIsDelivery} />
          </View>

          {isDelivery && (
            <View style={styles.addressForm}>
              <TextInput style={styles.input} placeholder="Calle (Solo números)" keyboardType="numeric" value={address.street} onChangeText={(t) => setAddress({ ...address, street: t })} />
              <TextInput style={styles.input} placeholder="Carrera (Solo números)" keyboardType="numeric" value={address.avenue} onChangeText={(t) => setAddress({ ...address, avenue: t })} />
              <TextInput style={styles.input} placeholder="Nro de casa (Solo números)" keyboardType="numeric" value={address.house_number} onChangeText={(t) => setAddress({ ...address, house_number: t })} />
              <TextInput style={styles.input} placeholder="Referencia (Opcional)" value={address.reference} onChangeText={(t) => setAddress({ ...address, reference: t })} />
            </View>
          )}

          <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Notas del pedido (Opcional)" value={notes} onChangeText={setNotes} />

          {/* Método de Pago */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 10 }}>💳 Método de Pago</Text>
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                  backgroundColor: paymentMethod === 'pago_movil' ? '#D32F2F' : '#fff',
                  borderWidth: 2, borderColor: paymentMethod === 'pago_movil' ? '#D32F2F' : '#E0E0E0',
                }}
                onPress={() => setPaymentMethod('pago_movil')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📱</Text>
                <Text style={{ fontWeight: '700', color: paymentMethod === 'pago_movil' ? '#fff' : '#212121' }}>Pago Móvil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                  backgroundColor: paymentMethod === 'efectivo' ? '#10B981' : '#fff',
                  borderWidth: 2, borderColor: paymentMethod === 'efectivo' ? '#10B981' : '#E0E0E0',
                }}
                onPress={() => setPaymentMethod('efectivo')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>💵</Text>
                <Text style={{ fontWeight: '700', color: paymentMethod === 'efectivo' ? '#fff' : '#212121' }}>Efectivo</Text>
              </TouchableOpacity>
            </View>

            {/* Pago Móvil - Datos bancarios y comprobante */}
            {paymentMethod === 'pago_movil' && (
              <View style={{
                backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: '#FCD34D',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 10 }}>
                  📋 Datos para Transferencia
                </Text>
                {paymentConfig ? (
                  <>
                    <Text style={{ fontSize: 14, color: '#78350F' }}>👤 Titular: {paymentConfig.holder_name}</Text>
                    <Text style={{ fontSize: 14, color: '#78350F' }}>🪪 Cédula: {paymentConfig.holder_dni}</Text>
                    <Text style={{ fontSize: 14, color: '#78350F' }}>📞 Teléfono: {paymentConfig.phone}</Text>
                    <Text style={{ fontSize: 14, color: '#78350F' }}>🏦 Banco: {paymentConfig.bank}</Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 14, color: '#78350F' }}>Cargando datos de pago...</Text>
                )}

                <View style={{ marginTop: 12, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
                  <Text style={{ fontSize: 13, color: '#991B1B', fontWeight: '600' }}>
                    💰 Monto: {formatCurrency(totalPrice, 'USD')} | Bs. {formatCurrency(priceVES, 'VES').replace('$', '')}
                  </Text>
                </View>

                {/* Comprobante de pago */}
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 8 }}>
                    📸 Comprobante de Pago (Obligatorio)
                  </Text>
                  
                  {paymentProof ? (
                    <View style={{ alignItems: 'center' }}>
                      <Image source={{ uri: paymentProof }} style={{ width: 200, height: 150, borderRadius: 8, marginBottom: 8 }} />
                      <TouchableOpacity onPress={() => setPaymentProof(null)}>
                        <Text style={{ color: '#D32F2F', fontWeight: '600' }}>❌ Eliminar foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={{ flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' }}
                        onPress={takePhoto}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#212121' }}>📷 Tomar Foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' }}
                        onPress={pickImage}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#212121' }}>🖼️ Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Efectivo - Mensaje */}
            {paymentMethod === 'efectivo' && (
              <View style={{
                backgroundColor: '#D1FAE5', borderRadius: 12, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: '#6EE7B7',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 4 }}>
                  💵 Pago en Efectivo
                </Text>
                <Text style={{ fontSize: 14, color: '#047857' }}>
                  Pagarás en efectivo al recoger tu pedido en la sucursal.
                </Text>
                <Text style={{ fontSize: 13, color: '#047857', marginTop: 8, fontWeight: '600' }}>
                  💰 Monto: {formatCurrency(totalPrice, 'USD')} | Bs. {formatCurrency(priceVES, 'VES').replace('$', '')} | {formatCurrency(priceCOP, 'COP')} COP
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, actionLoading && styles.confirmBtnDisabled]}
            onPress={handleConfirmOrder}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmBtnText}>
                {!paymentMethod ? 'Selecciona Método de Pago' :
                 paymentMethod === 'pago_movil' && !paymentProof ? 'Adjunta Comprobante' :
                 'Confirmar Orden'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* MODAL DE ÉXITO */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.modalTitle}>¡Orden Creada!</Text>
            <Text style={styles.modalMessage}>
              {paymentMethod === 'pago_movil' 
                ? 'Tu orden fue creada. Un empleado verificará el pago y actualizará el estado.'
                : 'Tu orden fue creada. Pasa a recoger tu pedido y paga en efectivo.'}
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleCloseModal}>
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
