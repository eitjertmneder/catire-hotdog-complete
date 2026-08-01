import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useAppTheme } from '../contexts/ThemeContext';
import { Api } from '../api/api';

const api = new Api();

type FilterType = 'all' | 'access' | 'orders' | 'inventory' | 'system';

const FILTERS: { key: FilterType; label: string; icon: string; matchTypes: string[] }[] = [
  { key: 'all', label: 'Todos', icon: '📋', matchTypes: [] },
  { key: 'access', label: 'Accesos', icon: '🔑', matchTypes: ['login_success', 'login_fail'] },
  { key: 'orders', label: 'Ordenes', icon: '📦', matchTypes: ['order_change'] },
  { key: 'inventory', label: 'Inventario', icon: '📊', matchTypes: ['inventory'] },
  { key: 'system', label: 'Sistema', icon: '⚙️', matchTypes: ['system'] },
];

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  info: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'Info' },
  success: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', label: 'Exito' },
  warning: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Advertencia' },
  error: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: 'Error' },
};

const TYPE_ICONS: Record<string, string> = {
  login_success: '✅',
  login_fail: '❌',
  order_change: '📝',
  inventory: '📦',
  system: '⚙️',
};

export const AuditDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { colors } = useAppTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({ total: 0, byType: [] as any[] });

  const fetchAuditLogs = async () => {
    if (!token) return;
    try {
      const res = await api.get<any[]>('orders', 'audit', token);
      if (!res.error && res.data) {
        setEvents(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.warn('Error fetching audit logs:', e);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await api.get<any>('orders', 'audit/stats', token);
      if (!res.error && res.data) {
        setStats({
          total: res.data.total || 0,
          byType: res.data.byType || [],
        });
      }
    } catch (e) {
      console.warn('Error fetching audit stats:', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAuditLogs(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [token]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    const filter = FILTERS.find(f => f.key === activeFilter);
    if (!filter || filter.matchTypes.length === 0) return events;
    return events.filter(e => filter.matchTypes.includes(e.type));
  }, [events, activeFilter]);

  const getCountByType = (type: string) => {
    const found = stats.byType.find((t: any) => t.type === type);
    return found?._count || 0;
  };

  const getFilterCount = (filter: typeof FILTERS[number]) => {
    if (filter.key === 'all') return events.length;
    return events.filter(e => filter.matchTypes.includes(e.type)).length;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: '#DC2626',
    },
    headerBack: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#fff',
      marginLeft: 12,
      letterSpacing: 0.3,
    },
    headerCount: {
      marginLeft: 'auto',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    headerCountText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      gap: 5,
    },
    filterChipText: {
      fontWeight: '600',
      fontSize: 12,
    },
    filterCount: {
      fontSize: 10,
      fontWeight: '700',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 8,
      overflow: 'hidden',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 40,
    },
    eventCard: {
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    eventIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 3,
      letterSpacing: 0.2,
    },
    eventDesc: {
      fontSize: 12,
      lineHeight: 17,
      marginBottom: 8,
    },
    eventMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventUser: {
      fontSize: 11,
      fontWeight: '500',
    },
    severityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      gap: 4,
    },
    severityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    severityText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    eventTime: {
      fontSize: 11,
      fontWeight: '500',
    },
    emptyWrap: {
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
    },
    divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: 8,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
    },
  });

  const activeFilterObj = FILTERS.find(f => f.key === activeFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBack}>{'<-'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛡️ Panel de Auditoria</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{events.length} eventos</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={[styles.statNumber, { color: '#1D4ED8' }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: '#3B82F6' }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.statNumber, { color: '#16A34A' }]}>{getCountByType('login_success')}</Text>
          <Text style={[styles.statLabel, { color: '#22C55E' }]}>Accesos OK</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.statNumber, { color: '#DC2626' }]}>{getCountByType('login_fail')}</Text>
          <Text style={[styles.statLabel, { color: '#EF4444' }]}>Fallos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.statNumber, { color: '#D97706' }]}>{getCountByType('order_change')}</Text>
          <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Ordenes</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter.key;
          const count = getFilterCount(filter);
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? '#DC2626' : colors.surface,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                {filter.icon} {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6' },
              ]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: isActive ? '#fff' : colors.textMuted }}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Section label */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {activeFilterObj?.label === 'Todos' ? 'Todos los eventos' : activeFilterObj?.label}
        {' · '}{filteredEvents.length}
      </Text>

      {/* Events List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" colors={['#DC2626']} />
          }
        >
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>{activeFilter === 'all' ? '📋' : '🔍'}</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin eventos</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {activeFilter === 'all'
                  ? 'No hay eventos de auditoria registrados aun'
                  : `No hay eventos de tipo "${activeFilterObj?.label}"`}
              </Text>
            </View>
          ) : (
            filteredEvents.map((event, index) => {
              const severity = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.info;
              const typeIcon = TYPE_ICONS[event.type] || '📋';
              return (
                <View
                  key={event.id || index}
                  style={[
                    styles.eventCard,
                    {
                      backgroundColor: colors.surface,
                      borderLeftWidth: 3,
                      borderLeftColor: severity.text,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[styles.eventIconWrap, { backgroundColor: severity.bg }]}>
                      <Text style={{ fontSize: 20 }}>{typeIcon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                        {event.title || event.action}
                      </Text>
                      <Text style={[styles.eventDesc, { color: colors.textSecondary }]}>
                        {event.description}
                      </Text>
                      <View style={styles.eventMetaRow}>
                        <Text style={[styles.eventUser, { color: colors.textMuted }]}>
                          {event.user_email || 'Sistema'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={[styles.severityBadge, { backgroundColor: severity.bg, borderColor: severity.border }]}>
                            <View style={[styles.severityDot, { backgroundColor: severity.text }]} />
                            <Text style={[styles.severityText, { color: severity.text }]}>
                              {severity.label}
                            </Text>
                          </View>
                          <Text style={[styles.eventTime, { color: colors.textMuted }]}>
                            {formatDate(event.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
