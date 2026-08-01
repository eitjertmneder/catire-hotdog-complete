import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/ThemeContext';

const MODULE_GROUPS = [
  {
    title: 'Principal',
    subtitle: 'Vista general del negocio',
    accent: '#EC3137',
    modules: [
      { title: 'Dashboard', icon: '\uD83D\uDCCA', route: 'Dashboard', color: '#EC3137' },
      { title: 'Pedidos', icon: '\uD83D\uDEF5', route: 'OrdersAdmin', color: '#2563EB' },
      { title: 'Historial', icon: '\uD83D\uDCDC', route: 'OrderHistory', color: '#7C3AED' },
    ],
  },
  {
    title: 'Gestion del Negocio',
    subtitle: 'Administra tu equipo y productos',
    accent: '#2563EB',
    modules: [
      { title: 'Usuarios', icon: '\uD83D\uDC65', route: 'UsersAdmin', color: '#059669' },
      { title: 'Cajeros', icon: '\uD83E\uDDD1\u200D\uD83D\uDCBC', route: 'CreateCajero', color: '#D97706' },
      { title: 'Sucursales', icon: '\uD83C\uDFEA', route: 'BranchAdmin', color: '#DC2626' },
      { title: 'Menus', icon: '\uD83D\uDCCB', route: 'MenuAdmin', color: '#7C3AED' },
      { title: 'Productos', icon: '\uD83C\uDF54', route: 'ProductsAdmin', color: '#EA580C' },
    ],
  },
  {
    title: 'Operaciones Diarias',
    subtitle: 'Control de flujo de trabajo',
    accent: '#059669',
    modules: [
      { title: 'Inventario', icon: '\uD83D\uDCE6', route: 'InventoryAdmin', color: '#4F46E5' },
      { title: 'Transferencias', icon: '\uD83D\uDD04', route: 'Transfers', color: '#9333EA' },
      { title: 'Delivery', icon: '\uD83D\uDE97', route: 'DeliveryPartners', color: '#2563EB' },
    ],
  },
  {
    title: 'Finanzas y Pagos',
    subtitle: 'Control economico completo',
    accent: '#D97706',
    modules: [
      { title: 'Tasas de Cambio', icon: '\uD83D\uDCB1', route: 'CurrencyRates', color: '#059669' },
      { title: 'Pagos', icon: '\uD83D\uDCB0', route: 'Payments', color: '#DC2626' },
      { title: 'Pago Movil', icon: '\uD83D\uDCB3', route: 'PaymentConfig', color: '#2563EB' },
      { title: 'Reportes', icon: '\uD83D\uDCC8', route: 'AdvancedReports', color: '#7C3AED' },
    ],
  },
  {
    title: 'Marketing y Fidelizacion',
    subtitle: 'Atrae y retiene clientes',
    accent: '#7C3AED',
    modules: [
      { title: 'Promociones', icon: '\uD83C\uDF81', route: 'Promotions', color: '#EA580C' },
      { title: 'Gamificacion', icon: '\uD83C\uDFC6', route: 'Gamification', color: '#EC3137' },
    ],
  },
  {
    title: 'Analisis e Inteligencia',
    subtitle: 'Datos para tomar decisiones',
    accent: '#0891B2',
    modules: [
      { title: 'Analisis', icon: '\uD83D\uDCC9', route: 'Analytics', color: '#2563EB' },
      { title: 'Feedback', icon: '\uD83D\uDCAC', route: 'FeedbackAnalytics', color: '#7C3AED' },
      { title: 'Proveedores', icon: '\uD83C\uDFED', route: 'Suppliers', color: '#059669' },
    ],
  },
  {
    title: 'Seguridad y Config',
    subtitle: 'Protege tu sistema',
    accent: '#DC2626',
    modules: [
      { title: '2FA Seguridad', icon: '\uD83D\uDD10', route: 'TwoFA', color: '#B91C1C' },
      { title: 'Sesiones', icon: '\uD83D\uDD11', route: 'Sessions', color: '#4F46E5' },
      { title: 'Auditoria', icon: '\uD83D\uDD0D', route: 'AuditLogs', color: '#1D4ED8' },
      { title: 'Emails', icon: '\u2709\uFE0F', route: 'EmailTemplates', color: '#0891B2' },
      { title: 'Mapa', icon: '\uD83D\uDDFA\uFE0F', route: 'GoogleMaps', color: '#059669' },
      { title: 'Configuracion', icon: '\u2699\uFE0F', route: 'Settings', color: '#6B7280' },
    ],
  },
];

export const AdminScreen = () => {
  const navigation = useNavigation<any>();
  const { isDark, colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header premium amplio */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 28,
        backgroundColor: '#EC3137',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#EC3137',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
      }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 0.5 }}>
          Panel de Administracion
        </Text>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
          gap: 8,
        }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' }} />
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 1.5 }}>
            CATIRE HOT DOG
          </Text>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {MODULE_GROUPS.map((group, gIdx) => (
          <View key={gIdx} style={{ marginBottom: 28 }}>
            {/* Section header amplio */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <View style={{
                width: 5,
                height: 28,
                borderRadius: 3,
                backgroundColor: group.accent,
                marginRight: 14,
              }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.3 }}>
                  {group.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' }}>
                  {group.subtitle}
                </Text>
              </View>
              <View style={{
                backgroundColor: group.accent + '18',
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 14,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: group.accent }}>
                  {group.modules.length}
                </Text>
              </View>
            </View>

            {/* Grid 2 columnas amplias */}
            <View style={{ gap: 12 }}>
              {/* Row by row */}
              {Array.from({ length: Math.ceil(group.modules.length / 2) }).map((_, rowIdx) => {
                const rowModules = group.modules.slice(rowIdx * 2, rowIdx * 2 + 2);
                return (
                  <View key={rowIdx} style={{ flexDirection: 'row', gap: 12 }}>
                    {rowModules.map((mod, mIdx) => (
                      <TouchableOpacity
                        key={mIdx}
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 20,
                          paddingVertical: 22,
                          paddingHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          shadowColor: mod.color,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.12,
                          shadowRadius: 12,
                          elevation: 4,
                          borderWidth: 1,
                          borderColor: colors.border,
                          minHeight: 76,
                        }}
                        onPress={() => navigation.navigate(mod.route)}
                        activeOpacity={0.7}
                      >
                        {/* Icono grande */}
                        <View style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          backgroundColor: mod.color + '14',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 14,
                        }}>
                          <Text style={{ fontSize: 28 }}>{mod.icon}</Text>
                        </View>
                        {/* Texto */}
                        <Text style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: '700',
                          color: colors.textPrimary,
                          letterSpacing: 0.2,
                        }}>
                          {mod.title}
                        </Text>
                        {/* Flecha */}
                        <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>{'>'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Footer info amplio */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          marginTop: 8,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>
            Catire Hot Dog
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Sistema de Gestion v2.0 | 32 Modulos
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6 }}>
            Soporte: +584247038001
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};