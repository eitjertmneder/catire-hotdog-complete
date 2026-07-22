import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  statusInfo: { text: string; color: string; bg: string };
}

export const StatusBadge = ({ statusInfo }: Props) => (
  <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
    <Text style={[styles.text, { color: statusInfo.color }]}>{statusInfo.text}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});