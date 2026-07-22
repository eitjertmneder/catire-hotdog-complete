import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

export const AdminScreen = () => {
  const navigation = useNavigation<any>();

  const modules = [
    { title: 'Dashboard', icon: '??', route: 'Dashboard' },
    { title: 'Analytics', icon: '??', route: 'Analytics' },
    { title: 'Feedback', icon: '?', route: 'FeedbackAnalytics' },
    { title: 'Cocina', icon: '??', route: 'KitchenDisplay' },
    { title: 'Mesas', icon: '??', route: 'TableManagement' },
    { title: 'Delivery', icon: '??', route: 'DeliveryPartners' },
    { title: 'Proveedores', icon: '??', route: 'Suppliers' },
    { title: 'Gamificación', icon: '??', route: 'Gamification' },
    { title: 'Usuarios', icon: '??', route: 'UsersAdmin' },
    { title: 'Cajeros', icon: '?????', route: 'CreateCajero' },
    { title: 'Sucursales', icon: '??', route: 'BranchAdmin' },
    { title: 'Menús', icon: '??', route: 'MenuAdmin' },
    { title: 'Productos', icon: '??', route: 'ProductsAdmin' },
    { title: 'Recetas', icon: '??', route: 'Recipes' },
    { title: 'Pedidos', icon: '??', route: 'OrdersAdmin' },
    { title: 'Historial', icon: '??', route: 'OrderHistory' },
    { title: 'Turnos', icon: '?', route: 'EmployeeShift' },
    { title: 'Inventario', icon: '??', route: 'InventoryAdmin' },
    { title: 'Transferencias', icon: '??', route: 'Transfers' },
    { title: 'Promociones', icon: '??', route: 'Promotions' },
    { title: 'Referidos', icon: '??', route: 'Referrals' },
    { title: 'Reportes', icon: '??', route: 'ReportsScreen' },
    { title: 'Reportes+', icon: '??', route: 'AdvancedReports' },
    { title: 'Tasas de Cambio', icon: '??', route: 'CurrencyRates' },
    { title: 'Pago Móvil', icon: '??', route: 'PaymentConfig' },
    { title: 'Fidelidad', icon: '?', route: 'Loyalty' },
    { title: 'Configuración', icon: '??', route: 'Settings' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ 
        alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20,
        backgroundColor: '#EC3137',
      }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
          Panel de Administración
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {modules.map((mod, index) => (
            <TouchableOpacity 
              key={index} 
              style={{
                width: '48%',
                backgroundColor: theme.colors.white,
                paddingVertical: 24,
                paddingHorizontal: 16,
                borderRadius: 16,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 2,
                borderColor: theme.colors.border,
              }}
              onPress={() => navigation.navigate(mod.route)}
            >
              <Text style={{ fontSize: 36, marginBottom: 10 }}>{mod.icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'center' }}>
                {mod.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};









