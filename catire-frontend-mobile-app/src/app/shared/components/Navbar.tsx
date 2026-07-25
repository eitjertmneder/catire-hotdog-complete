import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { theme } from '../styles/theme';
import { useAppTheme } from '../contexts/ThemeContext';

const SECTION_HEADER_HEIGHT = 32;

const SectionHeader = ({ title, isDark }: { title: string; isDark: boolean }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionHeaderText, { color: isDark ? '#888' : '#9CA3AF' }]}>{title}</Text>
  </View>
);

const DrawerDivider = ({ isDark }: { isDark: boolean }) => (
  <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]} />
);

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, colors } = useAppTheme();
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
  const roleColor = role === 'admin' ? '#8B5CF6' : role === 'employee' ? '#F59E0B' : '#3B82F6';

  return (
    <>
      {/* Header */}
      <View style={[styles.navContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={roleNavigation} style={styles.logoRow}>
          <Image source={require('@assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>Catire Hot Dog</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {role === 'client' && (
            <>
              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Orders')}>
                <Text style={{ fontSize: 22 }}>P</Text>
                {pendingOrdersCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{pendingOrdersCount}</Text></View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                <Text style={{ fontSize: 22 }}>C</Text>
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
          
          <View style={[styles.drawerContainer, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
            {/* Header with gradient */}
            <View style={styles.drawerHeader}>
              {/* Avatar with gradient */}
              <View style={[styles.avatarOuterRing, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </View>
              <Text style={styles.drawerUserName}>{user?.full_name || 'Usuario'}</Text>
              <Text style={styles.drawerUserEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            </View>

            {/* Drawer Body */}
            <ScrollView style={styles.drawerBody} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Seccion: Mi Cuenta */}
              <SectionHeader title="MI CUENTA" isDark={isDark} />
              <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Profile')}>
                <Text style={styles.menuEmoji}>{'\u{1F464}'}</Text>
                <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Mi Perfil</Text>
                <Text style={styles.chevron}>{'\u276F'}</Text>
              </TouchableOpacity>

              {role === 'client' && (
                <>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Orders')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4CB}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Mis \u00D3rdenes</Text>
                    {pendingOrdersCount > 0 && (
                      <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>{pendingOrdersCount}</Text></View>
                    )}
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}

              {role === 'employee' && (
                <>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Shift')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4C5}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Mi Turno</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('EmployeeOrders')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4E6}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Panel de \u00D3rdenes</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}

              {role === 'admin' && (
                <>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('AdminScreen')}>
                    <Text style={styles.menuEmoji}>{'\u{1F6E0}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Panel de Control</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}

              <DrawerDivider isDark={isDark} />

              {/* Seccion: Navegacion */}
              <SectionHeader title="NAVEGACI\u00D3N" isDark={isDark} />

              {role === 'client' && (
                <>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('BranchesMap')}>
                    <Text style={styles.menuEmoji}>{'\u{1F30D}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Mapa de Sucursales</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}

              {role === 'employee' && (
                <>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('InventoryAdmin')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4E8}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Inventario</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('MenuAdmin')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4DD}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Gesti\u00F3n de Men\u00FAs</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('ProductsAdmin')}>
                    <Text style={styles.menuEmoji}>{'\u{1F32E}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Gesti\u00F3n de Productos</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}

              <DrawerDivider isDark={isDark} />

              {/* Seccion: Configuracion */}
              <SectionHeader title="CONFIGURACI\u00D3N" isDark={isDark} />
              <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Settings')}>
                <Text style={styles.menuEmoji}>{'\u{2699}'}</Text>
                <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Configuraci\u00F3n</Text>
                <Text style={styles.chevron}>{'\u276F'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Settings')}>
                <Text style={styles.menuEmoji}>{isDark ? '\u{1F319}' : '\u{2600}'}</Text>
                <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</Text>
                <Text style={styles.chevron}>{'\u276F'}</Text>
              </TouchableOpacity>

              {/* Logout */}
              <View style={{ marginTop: 16 }}>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={() => { setIsMenuOpen(false); logout?.(); }}
                >
                  <Text style={styles.logoutEmoji}>{'\u{1F6AA}'}</Text>
                  <Text style={styles.logoutText}>Cerrar Sesi\u00F3n</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.white,
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
    backgroundColor: theme.colors.white,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeArea: {
    flex: 1,
  },
  drawerContainer: {
    width: '80%',
    backgroundColor: theme.colors.white,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  // Drawer Header
  drawerHeader: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  avatarOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 2,
  },
  drawerUserEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Drawer Body
  drawerBody: {
    flex: 1,
    paddingTop: 4,
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 4,
  },

  // Menu items
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 10,
    marginBottom: 3,
  },
  menuEmoji: {
    fontSize: 18,
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#C0C0C0',
    marginLeft: 8,
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
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    marginTop: 4,
  },
  logoutEmoji: {
    fontSize: 18,
    marginRight: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
