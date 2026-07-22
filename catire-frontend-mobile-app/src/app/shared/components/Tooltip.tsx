import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setVisible(!visible)}
      onLongPress={() => setVisible(true)}
      onPressOut={() => setVisible(false)}
    >
      {children}
      {visible && (
        <View style={[styles.tooltip, position === 'bottom' && styles.tooltipBottom]}>
          <Text style={styles.text}>{content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 200,
    zIndex: 1000,
  },
  tooltipBottom: { bottom: 'auto', top: '100%', marginBottom: 0, marginTop: 8 },
  text: { color: '#fff', fontSize: 12, lineHeight: 16 },
});
