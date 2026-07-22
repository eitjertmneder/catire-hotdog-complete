import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useFinanceStore } from '../../../store/finance.store';

export default function PurchasesList() {
  const { token } = useAuthStore();
  const { purchases, loading, fetchPurchases } = useFinanceStore();

  React.useEffect(() => {
    if (token) fetchPurchases(token);
  }, [token]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>Compras</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EC3137" />
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>#{item.id.slice(0, 8)}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>Total: ${item.purchase_total?.toFixed(2) || '0.00'}</Text>
              {item.notes && <Text style={{ color: '#999', marginTop: 2 }}>{item.notes}</Text>}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
              <Text style={{ fontSize: 16, color: '#999' }}>No hay compras registradas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
