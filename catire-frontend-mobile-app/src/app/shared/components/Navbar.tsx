import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useOrdersStore } from '../../modules/orders/store/orders.store';
import { useCatalogStore } from '../../modules/catalog/store/catalog.store';
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
  const { isDark, colors, toggleTheme } = useAppTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const { user, token, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { orders } = useOrdersStore(); 
  const { branches, fetchBranches } = useCatalogStore();
  
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

  useEffect(() => {
    if (role === 'client' && token) {
      fetchBranches(token);
    }
  }, [role, token]);

  return (
    <>
      {/* Header */}
      <View style={[styles.navContainer, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brandColumn}>
          <TouchableOpacity onPress={roleNavigation} style={styles.logoRow}>
            <Image source={require('@assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>Catire Hot Dog</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          {role === 'client' && (
            <>
              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Orders')}>
                <Text style={{ fontSize: 22 }}>{'\u{1F4CB}'}</Text>
                {pendingOrdersCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{pendingOrdersCount}</Text></View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                <Text style={{ fontSize: 22 }}>{'\u{1F6D2}'}</Text>
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

      {/* Branch count bar - centered below header */}
      {role === 'client' && (
        <TouchableOpacity
          style={styles.branchBar}
          onPress={() => handleNavigation('BranchesMap')}
          activeOpacity={0.85}
        >
          <View style={styles.branchBarInner}>
            <View style={styles.branchBarIconContainer}>
              <Text style={styles.branchBarIcon}>{'\u{1F4CD}'}</Text>
            </View>
            <View style={styles.branchBarTextContainer}>
              <Text style={styles.branchBarText}>
                {branches.length || 8} sucursales disponibles
              </Text>
              <Text style={styles.branchBarSubtext}>Toca para ver el mapa</Text>
            </View>
            <View style={styles.branchBarArrowContainer}>
              <Text style={styles.branchBarArrow}>{'\u203A'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

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
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Mis Órdenes</Text>
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
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Panel de Órdenes</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('ReportsScreen')}>
                    <Text style={styles.menuEmoji}>{'\u{1F4CA}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Reportes</Text>
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
              <SectionHeader title="NAVEGACIÓN" isDark={isDark} />

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
                </>
              )}

              <DrawerDivider isDark={isDark} />

              {/* Seccion: Configuracion - Solo admin */}
              {role === 'admin' && (
                <>
                  <SectionHeader title="CONFIGURACIÓN" isDark={isDark} />
                  <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => handleNavigation('Settings')}>
                    <Text style={styles.menuEmoji}>{'\u{2699}'}</Text>
                    <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Configuración</Text>
                    <Text style={styles.chevron}>{'\u276F'}</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={[styles.drawerItem, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]} onPress={() => { setIsMenuOpen(false); toggleTheme(!isDark); }}>
                <Text style={styles.menuEmoji}>{isDark ? '\u{2600}\uFE0F' : '\u{1F319}'}</Text>
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
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    backgroundColor: '#EC3137',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandColumn: {
    flex: 1,
    marginRight: 8,
  },
  branchBar: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  branchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchBarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  branchBarIcon: {
    fontSize: 22,
  },
  branchBarTextContainer: {
    flex: 1,
  },
  branchBarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  branchBarSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  branchBarArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  branchBarArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  branchMiniMenu: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  branchMiniIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  branchMiniText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  branchMiniArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 18,
    marginLeft: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#EC3137',
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
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  // Drawer Header
  drawerHeader: {
    backgroundColor: '#EC3137',
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
    color: '#FFFFFF',
  },
  drawerUserName: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    backgroundColor: '#EC3137',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  miniBadgeText: {
    color: '#FFFFFF',
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
