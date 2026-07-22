import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Linking, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useOrdersStore } from '../../../store/orders.store';
import { OrderStatusType } from '../../../../../shared/api/enums';
import { theme } from '../../../../../shared/styles/theme';

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 3, name: 'Libertadores' },
  { id: 4, name: 'Prados del Este' },
  { id: 5, name: 'Barrio Obrero' },
  { id: 7, name: 'Centro' },
  { id: 8, name: 'La Concordia' },
  { id: 9, name: 'Sambil' },
  { id: 10, name: 'Mestizos' },
  { id: 11, name: 'Carabobo' },
];

const STATUS_MAP: Record<string, { text: string; color: string; bg: string; icon: string }> = {
  PENDING: { text: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7', icon: 'â³' },
  PAID: { text: 'Pagada', color: '#10B981', bg: '#D1FAE5', icon: 'ðŸ’°' },
  PREPARING: { text: 'Preparando', color: '#8B5CF6', bg: '#EDE9FE', icon: 'ðŸ‘¨â€ðŸ³' },
  READY: { text: 'Lista', color: '#3B82F6', bg: '#DBEAFE', icon: 'âœ…' },
  ON_THE_WAY: { text: 'En Camino', color: '#F97316', bg: '#FFEDD5', icon: 'ðŸšš' },
  DELIVERED: { text: 'Entregada', color: '#10B981', bg: '#D1FAE5', icon: 'ðŸ“¦' },
  CANCELLED: { text: 'Cancelada', color: '#EF4444', bg: '#FEE2E2', icon: 'âŒ' },
};

export const OrderDetails = ({ route }: any) => {
  const navigation = useNavigation();
  const { user, token } = useAuthStore();
  const { updateOrderStatus, actionLoading } = useOrdersStore();

  const [confirmModal, setConfirmModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [messageModal, setMessageModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');

  const order = route.params?.order;
  const isEmployee = user?.role?.name === 'employee';

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 16, color: theme.colors.primary }}>â† Volver</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 20, fontSize: 16, color: theme.colors.textSecondary }}>No se encontró la orden.</Text>
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
      case 'PAID': return 'Iniciar Preparación';
      case 'PREPARING': return 'Marcar Lista';
      case 'READY': return 'Enviar';
      case 'ON_THE_WAY': return 'Marcar Entregada';
      default: return '';
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatusType) => {
    if (!token) return;
    await updateOrderStatus(token, order.id, newStatus);
    setConfirmModal(false);
    setCancelModal(false);
    navigation.goBack();
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
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (!deliveryMessage.trim()) return;
    const phone = order.user?.phone_1 || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(deliveryMessage)}`;
    Linking.openURL(url);
    setMessageModal(false);
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', padding: 16, 
        backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.border 
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>â† Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', flex: 1, color: theme.colors.textPrimary }}>Detalle de Orden</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Status Card */}
        <View style={{ 
          backgroundColor: theme.colors.white, borderRadius: 16, padding: 20, marginBottom: 12,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary }}>
              #{String(order.id).substring(0, 8).toUpperCase()}
            </Text>
            <View style={{ backgroundColor: statusInfo.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
              <Text style={{ color: statusInfo.color, fontWeight: '600', fontSize: 13 }}>{statusInfo.icon} {statusInfo.text}</Text>
            </View>
          </View>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 4, fontSize: 13 }}>ðŸ“… {orderDate}</Text>
          {isEmployee && order.user && (
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 4, fontSize: 13 }}>ðŸ‘¤ {order.user.full_name}</Text>
          )}
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            ðŸšš {order.is_delivery ? 'Delivery' : 'Retiro en Local'}
          </Text>
          {order.branch_id && (
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              ðŸ“ Sucursal: {BRANCHES.find(b => b.id === order.branch_id)?.name || `Sucursal ${order.branch_id}`}
            </Text>
          )}
          {order.is_delivery && order.address && (
            <View style={{ marginTop: 10, padding: 12, backgroundColor: theme.colors.background, borderRadius: 10 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4, color: theme.colors.textPrimary }}>ðŸ“ Dirección:</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Calle {order.address.street}, Carrera {order.address.avenue}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Nro: {order.address.house_number}</Text>
              {order.address.reference && <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Ref: {order.address.reference}</Text>}
            </View>
          )}
          {order.notes && <Text style={{ color: theme.colors.textMuted, marginTop: 8, fontSize: 13 }}>ðŸ“ {order.notes}</Text>}
          {order.cancel_reason && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
              <Text style={{ fontWeight: '600', color: theme.colors.error, fontSize: 12 }}>Motivo de cancelación:</Text>
              <Text style={{ color: theme.colors.error, fontSize: 13, marginTop: 2 }}>{order.cancel_reason}</Text>
            </View>
          )}
          {order.payment_proof && order.payment_proof.startsWith('data:image') && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '600', color: theme.colors.textPrimary, fontSize: 13, marginBottom: 8 }}>Comprobante de Pago:</Text>
              <Image 
                source={{ uri: order.payment_proof }} 
                style={{ width: '100%', height: 200, borderRadius: 10, backgroundColor: theme.colors.borderLight }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Products */}
        <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 8, color: theme.colors.textPrimary }}>Productos</Text>
        {order.items?.map((item: any, index: number) => (
          <View key={item.id || index} style={{ 
            backgroundColor: theme.colors.white, borderRadius: 12, padding: 14, marginBottom: 8,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: theme.colors.textPrimary, flex: 1 }}>
                {item.quantity}x {item.product?.name || `Producto #${item.product_id}`}
              </Text>
              <Text style={{ fontWeight: '700', color: theme.colors.primary, fontSize: 14 }}>
                ${(item.base_price * item.quantity).toFixed(2)}
              </Text>
            </View>
            {item.features && item.features.length > 0 && (
              <View style={{ marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {item.features.map((feature: any, idx: number) => {
                  if (!feature.value) return null;
                  const options = feature.value.split(',');
                  return options.map((opt: string, oidx: number) => (
                    <View key={`${idx}-${oidx}`} style={{ backgroundColor: theme.colors.borderLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>{opt.trim()}</Text>
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
        backgroundColor: theme.colors.white, padding: 16, 
        borderTopWidth: 1, borderTopColor: theme.colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 5 
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary }}>Total:</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.primary }}>${totalOrderPrice.toFixed(2)}</Text>
        </View>

        {isEmployee && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: theme.colors.error, padding: 14, borderRadius: 10, alignItems: 'center' }}
              onPress={() => setCancelModal(true)}
              disabled={actionLoading}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
            </TouchableOpacity>
            {nextStatus && (
              <TouchableOpacity
                style={{ flex: 2, backgroundColor: theme.colors.success, padding: 14, borderRadius: 10, alignItems: 'center' }}
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
                <Text style={{ color: '#fff', fontSize: 16 }}>ðŸ“±</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Confirm Modal */}
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: theme.colors.textPrimary }}>
              {nextStatus ? `Cambiar a: ${STATUS_MAP[nextStatus]?.text}` : ''}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
              ¿Confirmar cambio de estado?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.colors.borderLight, alignItems: 'center' }} onPress={() => setConfirmModal(false)}>
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.colors.success, alignItems: 'center' }}
                onPress={() => nextStatus && handleUpdateStatus(nextStatus)}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal with Justification */}
      <Modal visible={cancelModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '88%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8, color: theme.colors.error, textAlign: 'center' }}>
              âŒ Cancelar Orden
            </Text>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16, fontSize: 13 }}>
              Debes indicar el motivo de la cancelación
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: cancelError ? theme.colors.error : theme.colors.border,
                borderRadius: 10,
                padding: 12,
                minHeight: 80,
                textAlignVertical: 'top',
                fontSize: 14,
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.background,
              }}
              placeholder="Escribe el motivo de la cancelación (mín. 10 caracteres)"
              value={cancelReason}
              onChangeText={(t) => { setCancelReason(t); setCancelError(''); }}
              multiline
            />
            {cancelError ? <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4, fontWeight: '600' }}>{cancelError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.colors.borderLight, alignItems: 'center' }} onPress={() => { setCancelModal(false); setCancelReason(''); setCancelError(''); }}>
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.colors.error, alignItems: 'center' }}
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
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: theme.colors.textPrimary }}>
              ðŸ“± Mensaje al Cliente
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 12, marginBottom: 16, minHeight: 80, textAlignVertical: 'top', fontSize: 14 }}
              placeholder="Ej: Su pedido va en camino, repartidor: Juan Tlf: 0412-1234567"
              value={deliveryMessage}
              onChangeText={setDeliveryMessage}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.colors.borderLight, alignItems: 'center' }} onPress={() => setMessageModal(false)}>
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
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
    </SafeAreaView>
  );
};
