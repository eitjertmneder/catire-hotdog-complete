import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Linking, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { OrderStatusType } from '../../../../../shared/api/enums';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';
import { IP } from '../../../../../shared/constants/IP';
import { generateAndSharePDF, buildInvoiceHTML } from '../../../../../shared/utils/pdf';
import { getProductName } from '../../../../../shared/constants/product-map';

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 3, name: 'El Malecón' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

const STATUS_MAP: Record<string, { text: string; color: string; bg: string; icon: string }> = {
  PENDING: { text: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7', icon: '\u23F3' },
  PAID: { text: 'Pagada', color: '#10B981', bg: '#D1FAE5', icon: '\uD83D\uDCB0' },
  PREPARING: { text: 'Preparando', color: '#8B5CF6', bg: '#EDE9FE', icon: '\uD83D\uDC68\u200D\uD83C\uDF73' },
  READY: { text: 'Lista', color: '#3B82F6', bg: '#DBEAFE', icon: '\u2705' },
  ON_THE_WAY: { text: 'En Camino', color: '#F97316', bg: '#FFEDD5', icon: '\uD83D\uDE9A' },
  DELIVERED: { text: 'Entregada', color: '#10B981', bg: '#D1FAE5', icon: '\uD83D\uDCE6' },
  CANCELLED: { text: 'Cancelada', color: '#EF4444', bg: '#FEE2E2', icon: '\u274C' },
};

const CURRENCY_OPTIONS = [
  { key: 'USD', label: 'Dolares (USD)', symbol: '$', color: '#10B981', bg: '#D1FAE5', icon: '\uD83C\uDDFA\uD83C\uDDF8' },
  { key: 'COP', label: 'Pesos Colombianos (COP)', symbol: '$', color: '#2563EB', bg: '#DBEAFE', icon: '\uD83C\uDDE8\uD83C\uDDF4' },
  { key: 'PAGO_MOVIL', label: 'Pago Movil', symbol: 'Bs.', color: '#8B5CF6', bg: '#EDE9FE', icon: '\uD83D\uDCF1' },
];

export const OrderDetails = ({ route }: any) => {
  const navigation = useNavigation();
  const { user, token } = useAuthStore();
  const { updateOrderStatus, editOrder, actionLoading } = useOrdersStore();

  const [confirmModal, setConfirmModal] = useState(false);
  const { isDark, colors } = useAppTheme();
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [messageModal, setMessageModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [currencyModal, setCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Local order state that updates after status changes
  const [localOrder, setLocalOrder] = useState(route.params?.order);
  const order = localOrder;
  const isEmployee = user?.role?.name === 'employee';

  // Sync with route params if they change
  useEffect(() => {
    if (route.params?.order) {
      setLocalOrder(route.params.order);
    }
  }, [route.params?.order]);

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 16, color: colors.primary }}>{'<-'} Volver</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 20, fontSize: 16, color: colors.textSecondary }}>No se encontro la orden.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
  const orderDate = new Date(order.created_at).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const totalOrderPrice = order.items?.reduce((total: number, item: any) => {
    return total + (item.base_price * item.quantity);
  }, 0) || 0;

  const getNextStatus = (current: OrderStatusType): OrderStatusType | null => {
    switch (current) {
      case 'PENDING': return 'PAID';
      case 'PAID': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'ON_THE_WAY';
      case 'ON_THE_WAY': return 'DELIVERED';
      default: return null;
    }
  };

  const getNextStatusLabel = (current: OrderStatusType): string => {
    switch (current) {
      case 'PENDING': return 'Marcar Pagada';
      case 'PAID': return 'Iniciar Preparacion';
      case 'PREPARING': return 'Marcar Lista';
      case 'READY': return 'Enviar';
      case 'ON_THE_WAY': return 'Marcar Entregada';
      default: return '';
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatusType) => {
    if (!token) return;
    const result = await updateOrderStatus(token, order.id, newStatus);
    setConfirmModal(false);
    setCancelModal(false);
    
    // Update local order state immediately for instant UI feedback
    setLocalOrder((prev: any) => ({
      ...prev,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }));
  };

  const handleConfirmStatusChange = () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    if (nextStatus === 'PAID') {
      setConfirmModal(false);
      setSelectedCurrency(null);
      setCurrencyModal(true);
    } else {
      handleUpdateStatus(nextStatus);
    }
  };

  const handleConfirmWithCurrency = async () => {
    if (!selectedCurrency || !token) return;
    const currencyLabel = CURRENCY_OPTIONS.find(c => c.key === selectedCurrency)?.label || selectedCurrency;
    const notesUpdate = order.notes
      ? `${order.notes}\nMoneda de pago: ${currencyLabel}`
      : `Moneda de pago: ${currencyLabel}`;

    await editOrder(token, order.id, { notes: notesUpdate });
    await handleUpdateStatus('PAID');
    setCurrencyModal(false);
    setSelectedCurrency(null);
  };

  const handleCancel = async () => {
    if (cancelReason.trim().length < 10) {
      setCancelError('El motivo debe tener al menos 10 caracteres');
      return;
    }
    if (!token) return;
    await updateOrderStatus(token, order.id, 'CANCELLED', cancelReason.trim());
    setCancelModal(false);
    setCancelReason('');
    setCancelError('');
    
    // Update local order state immediately
    setLocalOrder((prev: any) => ({
      ...prev,
      status: 'CANCELLED',
      cancel_reason: cancelReason.trim(),
      updated_at: new Date().toISOString(),
    }));
  };

  const handleSendMessage = () => {
    if (!deliveryMessage.trim()) return;
    const phone = order.user?.phone_1 || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(deliveryMessage)}`;
    Linking.openURL(url);
    setMessageModal(false);
  };

  const nextStatus = getNextStatus(order.status);

  const handleDownloadInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const branchName = BRANCHES.find(b => b.id === order.branch_id)?.name || `Sucursal ${order.branch_id}`;
      const clientName = order.user?.full_name || 'Cliente';
      const orderDate = new Date(order.created_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const items = (order.items || []).map((item: any) => ({
        name: item.product?.name || getProductName(item.product_id) || `Producto #${item.product_id}`,
        quantity: item.quantity,
        price: item.base_price,
        subtotal: item.base_price * item.quantity,
      }));

      const paymentLabel = order.notes?.includes('Moneda de pago:')
        ? order.notes.split('Moneda de pago:')[1]?.trim() || 'Efectivo'
        : 'Efectivo';

      const html = buildInvoiceHTML({
        orderId: order.id,
        branchName,
        clientName,
        orderDate,
        items,
        total: totalOrderPrice,
        paymentMethod: paymentLabel,
      });

      await generateAndSharePDF(`Factura #${String(order.id).substring(0, 8).toUpperCase()}`, html);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginRight: 12,
            backgroundColor: colors.background,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>{'<-'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', flex: 1, color: colors.textPrimary }}>Detalle de Orden</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Status Card */}
        <View style={{
          backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 12,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
              #{String(order.id).substring(0, 8).toUpperCase()}
            </Text>
            <View style={{ backgroundColor: statusInfo.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
              <Text style={{ color: statusInfo.color, fontWeight: '600', fontSize: 13 }}>{statusInfo.icon} {statusInfo.text}</Text>
            </View>
          </View>
          <Text style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 13 }}>{'\uD83D\uDCC5'} {orderDate}</Text>
          {isEmployee && order.user && (
            <Text style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 13 }}>{'\uD83D\uDC64'} {order.user.full_name}</Text>
          )}
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {order.is_delivery ? '\uD83D\uDE9A Delivery' : '\uD83C\uDFEA Retiro en local'}
          </Text>
          {order.branch_id && (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {'\uD83D\uDCCD'} Sucursal: {BRANCHES.find(b => b.id === order.branch_id)?.name || `Sucursal ${order.branch_id}`}
            </Text>
          )}
          {order.is_delivery && order.address && (
            <View style={{ marginTop: 10, padding: 12, backgroundColor: colors.background, borderRadius: 10 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4, color: colors.textPrimary }}>{'\uD83D\uDCCD'} Direccion:</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Calle {order.address.street}, Carrera {order.address.avenue}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Nro: {order.address.house_number}</Text>
              {order.address.reference && <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Ref: {order.address.reference}</Text>}
            </View>
          )}
          {order.notes && <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>{'\uD83D\uDCDD'} {order.notes}</Text>}
          {order.cancel_reason && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
              <Text style={{ fontWeight: '600', color: colors.error, fontSize: 12 }}>Motivo de cancelacion:</Text>
              <Text style={{ color: colors.error, fontSize: 13, marginTop: 2 }}>{order.cancel_reason}</Text>
            </View>
          )}
          {order.payment_proof && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 13, marginBottom: 8 }}>Comprobante de Pago:</Text>
              <TouchableOpacity onPress={() => setImageModal(true)}>
                <Image
                  source={{ 
                    uri: order.payment_proof.startsWith('data:image') 
                      ? order.payment_proof 
                      : `http://${Platform.OS === 'web' ? 'localhost' : IP}${order.payment_proof}`
                  }}
                  style={{ width: '100%', height: 200, borderRadius: 10, backgroundColor: colors.border }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 11, color: colors.primary, textAlign: 'center', marginTop: 4 }}>Toca para ampliar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Products */}
        <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 8, color: colors.textPrimary }}>Productos</Text>
        {order.items?.map((item: any, index: number) => (
          <View key={item.id || index} style={{
            backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: colors.textPrimary, flex: 1 }}>
                {item.quantity}x {item.product?.name || getProductName(item.product_id) || `Producto #${item.product_id}`}
              </Text>
              <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 14 }}>
                ${(item.base_price * item.quantity).toFixed(2)}
              </Text>
            </View>
            {item.features && item.features.length > 0 && (
              <View style={{ marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {item.features.map((feature: any, idx: number) => {
                  if (!feature.value) return null;
                  const options = feature.value.split(',');
                  return options.map((opt: string, oidx: number) => (
                    <View key={`${idx}-${oidx}`} style={{ backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>{opt.trim()}</Text>
                    </View>
                  ));
                })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: colors.surface, padding: 16,
        borderTopWidth: 1, borderTopColor: colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 5
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Total:</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>${totalOrderPrice.toFixed(2)}</Text>
        </View>

        {isEmployee && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: colors.error, padding: 14, borderRadius: 10, alignItems: 'center' }}
              onPress={() => setCancelModal(true)}
              disabled={actionLoading}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
            </TouchableOpacity>
            {nextStatus && (
              <TouchableOpacity
                style={{ flex: 2, backgroundColor: colors.success, padding: 14, borderRadius: 10, alignItems: 'center' }}
                onPress={() => setConfirmModal(true)}
                disabled={actionLoading}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{getNextStatusLabel(order.status)}</Text>
              </TouchableOpacity>
            )}
            {order.status === 'ON_THE_WAY' && (
              <TouchableOpacity
                style={{ backgroundColor: '#25D366', paddingHorizontal: 16, padding: 14, borderRadius: 10, alignItems: 'center' }}
                onPress={() => setMessageModal(true)}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>{'\uD83D\uDCF1'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {order.status === 'DELIVERED' && (
          <TouchableOpacity
            style={{ backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            onPress={handleDownloadInvoice}
            disabled={generatingInvoice}
          >
            {generatingInvoice ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontSize: 16 }}>{'\uD83D\uDCC4'}</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Descargar Factura</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: colors.textPrimary }}>
              {nextStatus ? `Cambiar a: ${STATUS_MAP[nextStatus]?.text}` : ''}
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
              Confirmar cambio de estado?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center' }} onPress={() => setConfirmModal(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.success, alignItems: 'center' }}
                onPress={handleConfirmStatusChange}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal visible={currencyModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '88%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: colors.textPrimary }}>
              {'\uD83D\uDCB0'} Seleccionar Moneda
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
              En que moneda pago el cliente?
            </Text>

            <View style={{ gap: 10, marginBottom: 20 }}>
              {CURRENCY_OPTIONS.map((currency) => (
                <TouchableOpacity
                  key={currency.key}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedCurrency === currency.key ? currency.color : colors.border,
                    backgroundColor: selectedCurrency === currency.key ? currency.bg : colors.background,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => setSelectedCurrency(currency.key)}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: currency.bg,
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 24 }}>{currency.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.textPrimary }}>{currency.label}</Text>
                  </View>
                  {selectedCurrency === currency.key && (
                    <Text style={{ fontSize: 20 }}>{'\u2705'}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center' }}
                onPress={() => { setCurrencyModal(false); setSelectedCurrency(null); }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  backgroundColor: selectedCurrency ? colors.success : colors.border,
                  alignItems: 'center',
                }}
                onPress={handleConfirmWithCurrency}
                disabled={!selectedCurrency || actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: selectedCurrency ? '#fff' : colors.textSecondary, fontWeight: '700' }}>Confirmar Pago</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal with Justification */}
      <Modal visible={cancelModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '88%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8, color: colors.error, textAlign: 'center' }}>
              {'\u274C'} Cancelar Orden
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16, fontSize: 13 }}>
              Debes indicar el motivo de la cancelacion
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: cancelError ? colors.error : colors.border,
                borderRadius: 10,
                padding: 12,
                minHeight: 80,
                textAlignVertical: 'top',
                fontSize: 14,
                color: colors.textPrimary,
                backgroundColor: colors.background,
              }}
              placeholder="Escribe el motivo de la cancelacion (min. 10 caracteres)"
              value={cancelReason}
              onChangeText={(t) => { setCancelReason(t); setCancelError(''); }}
              multiline
            />
            {cancelError ? <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, fontWeight: '600' }}>{cancelError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center' }} onPress={() => { setCancelModal(false); setCancelReason(''); setCancelError(''); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.error, alignItems: 'center' }}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar Orden</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* WhatsApp Message Modal */}
      <Modal visible={messageModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: colors.textPrimary }}>
              {'\uD83D\uDCF1'} Mensaje al Cliente
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 16, minHeight: 80, textAlignVertical: 'top', fontSize: 14 }}
              placeholder="Ej: Su pedido va en camino, repartidor: Juan Tlf: 0412-1234567"
              value={deliveryMessage}
              onChangeText={setDeliveryMessage}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center' }} onPress={() => setMessageModal(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#25D366', alignItems: 'center' }}
                onPress={handleSendMessage}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Enviar WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal - Full screen preview */}
      <Modal visible={imageModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10 }}
            onPress={() => setImageModal(false)}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕ Cerrar</Text>
          </TouchableOpacity>
          <Image
            source={{ 
              uri: order.payment_proof?.startsWith('data:image') 
                ? order.payment_proof 
                : `http://${Platform.OS === 'web' ? 'localhost' : IP}${order.payment_proof || ''}`
            }}
            style={{ width: '90%', height: '70%', borderRadius: 10 }}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};
