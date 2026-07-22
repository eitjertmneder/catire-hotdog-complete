import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Order } from '../../../models/Order';
import { OrderStatusType } from '../../../../../shared/api/enums';
import { styles } from '../../../../../shared/styles/admin.styles';
import { useOrdersStore } from '../../../store/orders.store';

export const OrdersAdmin = () => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { orders, loading, actionLoading, fetchOrders, updateOrderStatus } = useOrdersStore();

  useEffect(() => {
    if (token) fetchOrders(token);
  }, [token]);

  const cycleStatus = async (id: string, currentStatus: OrderStatusType) => {
    if (!token) return;
    
    // No permitir cambiar estados terminales (CANCELLED, DELIVERED)
    if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') {
      return;
    }
    
    let nextStatus: OrderStatusType = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'PAID';
    else if (currentStatus === 'PAID') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'ON_THE_WAY';
    else if (currentStatus === 'ON_THE_WAY') nextStatus = 'DELIVERED';

    await updateOrderStatus(token, id, nextStatus);
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>Pedido #{item.id.slice(0, 8)}</Text>
        <Text style={styles.cardSub}>Cliente ID: {item.user_id} | Tipo: {item.is_delivery ? 'Delivery 🛵' : 'Local 🏪'}</Text>
        <Text style={[styles.cardSub, { fontWeight: 'bold', marginTop: 5 }]}>Estado: {item.status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.saveBtn, { padding: 10, minWidth: 100 }]} 
          onPress={() => cycleStatus(item.id, item.status)}
          disabled={actionLoading}
        >
          <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold' }}>Avanzar Estado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Pedidos Activos</Text>
      </View>
      
      {loading && orders.length === 0 ? (
        <ActivityIndicator size="large" color="#FFB800" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay pedidos actualmente.</Text>}
        />
      )}
    </SafeAreaView>
  );
};