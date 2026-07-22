import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { theme } from '../styles/theme';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { orders } = useOrdersStore(); 
  
  const totalItems = getTotalItems();
  const pendingOrdersCount = orders?.filter((o: any) => o.status === 'PENDING').length || 0;

  const handleNavigation = (route: string) => {
    setIsMenuOpen(false);
    navigation.navigate(route);
  };

  const role = user?.role?.name;
  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';
  
  const roleNavigation = () => {
    if(role === 'client') handleNavigation('BranchesMap')
    if(role === 'employee') handleNavigation('EmployeeOrders')
    if(role === 'admin') handleNavigation('AdminScreen')
  }

  const roleLabel = role === 'admin' ? 'Administrador' : role === 'employee' ? 'Cajero' : 'Cliente';

  return (
    <>
      {/* Header ROJO con safe area */}
      <View style={[styles.navContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={roleNavigation} style={styles.logoRow}>
          <Image source={require('@assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>Catire Hot Dog</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {role === 'client' && (
            <>
              {/* Icono de mensajes/pedidos */}
              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Orders')}>
                <Text style={{ fontSize: 22 }}>📩</Text>
                {pendingOrdersCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{pendingOrdersCount}</Text></View>
                )}
              </TouchableOpacity>
              
              {/* Icono del carrito */}
              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                <Text style={{ fontSize: 22 }}>🛒</Text>
                {totalItems > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuOpen(true)}>
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer */}
      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeArea} activeOpacity={1} onPress={() => setIsMenuOpen(false)} />
          
          <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
            {/* Header del drawer */}
            <View style={styles.drawerHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.drawerUserName}>{user?.full_name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            </View>

            {/* Items del drawer */}
            <View style={styles.drawerBody}>
              <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('Profile')}>
                <Text style={styles.drawerItemIcon}>👤</Text>
                <Text style={styles.drawerItemText}>Mi Perfil</Text>
              </TouchableOpacity>

              {role === 'client' && (
                <>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('Orders')}>
                    <Text style={styles.drawerItemIcon}>📋</Text>
                    <Text style={styles.drawerItemText}>Mis Órdenes</Text>
                    {pendingOrdersCount > 0 && (
                      <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>{pendingOrdersCount}</Text></View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('BranchesMap')}>
                    <Text style={styles.drawerItemIcon}>🗺️</Text>
                    <Text style={styles.drawerItemText}>Mapa de Sucursales</Text>
                  </TouchableOpacity>
                </>
              )}

              {role === 'employee' && (
                <>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('Shift')}>
                    <Text style={styles.drawerItemIcon}>⏰</Text>
                    <Text style={styles.drawerItemText}>Mi Turno</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('EmployeeOrders')}>
                    <Text style={styles.drawerItemIcon}>📦</Text>
                    <Text style={styles.drawerItemText}>Panel de Órdenes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('InventoryAdmin')}>
                    <Text style={styles.drawerItemIcon}>📊</Text>
                    <Text style={styles.drawerItemText}>Inventario</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('MenuAdmin')}>
                    <Text style={styles.drawerItemIcon}>📋</Text>
                    <Text style={styles.drawerItemText}>Gestión de Menús</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('ProductsAdmin')}>
                    <Text style={styles.drawerItemIcon}>🍔</Text>
                    <Text style={styles.drawerItemText}>Gestión de Productos</Text>
                  </TouchableOpacity>
                </>
              )}

              {role === 'admin' && (
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('AdminScreen')}>
                  <Text style={styles.drawerItemIcon}>⚙️</Text>
                  <Text style={styles.drawerItemText}>Panel de Control</Text>
                </TouchableOpacity>
              )}

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* Logout */}
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => { setIsMenuOpen(false); logout?.(); }}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.primary, // ROJO
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white, // BLANCO
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  hamburger: {
    gap: 4,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: theme.colors.white, // BLANCO
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  closeArea: {
    flex: 1,
  },
  drawerContainer: {
    width: '78%',
    backgroundColor: theme.colors.white,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },

  // Drawer Header
  drawerHeader: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
  },
  drawerUserName: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Drawer Body
  drawerBody: {
    flex: 1,
    padding: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 2,
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  miniBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  miniBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    marginTop: 8,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.error,
  },
});
