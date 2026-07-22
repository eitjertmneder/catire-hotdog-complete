import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface Props {
  label: string;
  badgeCount?: number;
  onPress: () => void;
  isLogout?: boolean;
}

export const DrawerItem = ({ label, badgeCount = 0, onPress, isLogout = false }: Props) => (
  <TouchableOpacity 
    style={[styles.item, isLogout && styles.logoutItem]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.label, isLogout && styles.logoutText]}>{label}</Text>
    {badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: { 
    fontSize: 15, 
    color: theme.colors.textPrimary, 
    flex: 1,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: { 
    color: theme.colors.white, 
    fontWeight: '700', 
    fontSize: 11,
  },
  logoutItem: { 
    borderBottomWidth: 0, 
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutText: { 
    color: theme.colors.error, 
    fontWeight: '600',
  },
});
