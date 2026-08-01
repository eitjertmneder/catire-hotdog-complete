import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useKitchenStore, KitchenOrder } from '../../../shared/store/kitchen.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const EMOJI = {
  kitchen: '\u{1F373}',
  delivery: '\u{1F695}',
  takeout: '\u{1F4E6}',
  done: '\u{2705}',
  clock: '\u{23F0}',
  rush: '\u{1F525}',
  back: '\u{2190}',
  chart: '\u{1F4CA}',
  note: '\u{1F4DD}',
  empty: '\u{1F4ED}',
  waiting: '\u{23F3}',
  check: '\u{2705}',
  fire: '\u{1F525}',
} as const;

export const KitchenDisplayScreen = () => {
  const navigation = useNavigation();
  const { orders, updateItemStatus, completeOrder, setPriority, getBacklogCount, getAveragePrepTime } = useKitchenStore();
  const { colors } = useAppTheme();
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(o => {
        if (selectedTab === 'pending') return o.items.some(i => i.status === 'pending');
        if (selectedTab === 'preparing') return o.items.some(i => i.status === 'preparing');
        if (selectedTab === 'ready') return o.items.every(i => i.status === 'ready');
        return true;
      });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'rush': return '#EF4444';
      case 'vip': return '#8B5CF6';
      default: return colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'preparing': return '#3B82F6';
      case 'ready': return '#10B981';
      default: return '#9E9E9E';
    }
  };

  const getTimeElapsed = (createdAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 20, color: '#fff', fontWeight: '600' }}>{EMOJI.back} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {EMOJI.kitchen} Pantalla de Cocina
        </Text>
      </View>

      {/* Stats Bar */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#F59E0B' }}>{getBacklogCount()}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>{EMOJI.clock} Pendientes</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>{orders.length}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>{EMOJI.chart} En Cola</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#10B981' }}>{getAveragePrepTime()}m</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>{EMOJI.clock} Promedio</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 8,
      }}>
        {(['all', 'pending', 'preparing', 'ready'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: selectedTab === tab ? colors.primary : colors.background,
              alignItems: 'center',
            }}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: selectedTab === tab ? '#fff' : colors.textSecondary,
            }}>
              {tab === 'all' ? 'Todos' : tab === 'pending' ? 'Nuevos' : tab === 'preparing' ? 'Preparando' : 'Listos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders Grid */}
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {filteredOrders.map((order) => (
            <View
              key={order.id}
              style={{
                width: (width - 36) / 2,
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: 'hidden',
                borderLeftWidth: 4,
                borderLeftColor: getPriorityColor(order.priority),
              }}
            >
              {/* Order Header */}
              <View style={{
                backgroundColor: getStatusColor(order.items[0]?.status || 'pending'),
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>
                  #{order.order_number}
                </Text>
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                  {EMOJI.clock} {getTimeElapsed(order.created_at)}m
                </Text>
              </View>

              {/* Order Info */}
              <View style={{ padding: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {order.order_type === 'dine_in'
                      ? `Mesa ${order.table_number}`
                      : order.order_type === 'delivery'
                        ? `${EMOJI.delivery} Delivery`
                        : `${EMOJI.takeout} Para llevar`}
                  </Text>
                  {order.priority !== 'normal' && (
                    <Text style={{ fontSize: 10, color: getPriorityColor(order.priority), fontWeight: '700' }}>
                      {order.priority === 'rush' ? `${EMOJI.rush} ` : ''}{order.priority.toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* Items */}
                {order.items.slice(0, 4).map((item, index) => (
                  <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.textPrimary, flex: 1 }}>
                      {item.quantity}x {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const nextStatus = item.status === 'pending' ? 'preparing' : 'ready';
                        updateItemStatus(order.id, index, nextStatus);
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>
                        {item.status === 'pending' ? EMOJI.waiting : item.status === 'preparing' ? EMOJI.kitchen : EMOJI.done}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {order.items.length > 4 && (
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    +{order.items.length - 4} más...
                  </Text>
                )}

                {/* Notes */}
                {order.items.some(i => i.notes) && (
                  <View style={{ marginTop: 8, padding: 6, backgroundColor: '#FEF3C7', borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, color: '#92400E' }}>
                      {EMOJI.note} {order.items.find(i => i.notes)?.notes}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 6,
                      backgroundColor: order.items.every(i => i.status === 'ready') ? '#10B981' : colors.background,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      if (order.items.every(i => i.status === 'ready')) {
                        completeOrder(order.id);
                      }
                    }}
                  >
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: order.items.every(i => i.status === 'ready') ? '#fff' : colors.textMuted,
                    }}>
                      {order.items.every(i => i.status === 'ready') ? `${EMOJI.done} Entregar` : 'Esperando...'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                      backgroundColor: colors.background,
                    }}
                    onPress={() => {
                      const newPriority = order.priority === 'rush' ? 'normal' : 'rush';
                      setPriority(order.id, newPriority);
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{EMOJI.rush}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredOrders.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>{EMOJI.empty}</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted }}>
              No hay pedidos en cola
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
