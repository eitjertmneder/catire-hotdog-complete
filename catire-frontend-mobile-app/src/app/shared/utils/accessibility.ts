import React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
};

// Announce to screen reader
export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Set accessibility focus
export const setAccessibilityFocus = (reactTag: number) => {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }
};

// Check if reduce motion is enabled
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
};

// Font sizes for accessibility
export const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  extraLarge: 24,
  header: 32,
};

// Minimum touch target size (44x44 points)
export const minTouchTarget = 44;

// High contrast colors
export const highContrastColors = {
  text: '#000000',
  background: '#FFFFFF',
  primary: '#0000FF',
  error: '#FF0000',
  success: '#008000',
  border: '#000000',
};

// Accessibility props for common components
export const getAccessibilityProps = (label: string, hint?: string) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
});

// Button accessibility
export const getButtonAccessibility = (label: string, disabled: boolean = false) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'button' as const,
  accessibilityState: { disabled },
});

// Image accessibility
export const getImageAccessibility = (alt: string) => ({
  accessible: true,
  accessibilityLabel: alt,
  accessibilityRole: 'image' as const,
});

// Header accessibility
export const getHeaderAccessibility = (level: number = 1) => ({
  accessible: true,
  accessibilityRole: 'header' as const,
  accessibilityLevel: level,
});

// List accessibility
export const getListAccessibility = (itemCount: number) => ({
  accessible: true,
  accessibilityRole: 'list' as const,
  accessibilityState: { multiline: true },
});

// Form field accessibility
export const getFormFieldAccessibility = (label: string, error?: string) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: error || undefined,
  accessibilityState: { error: !!error },
});

// Toggle accessibility
export const getToggleAccessibility = (label: string, checked: boolean) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'toggle' as const,
  accessibilityState: { checked },
});

// Tab accessibility
export const getTabAccessibility = (label: string, selected: boolean) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'tab' as const,
  accessibilityState: { selected },
});

// Modal accessibility
export const getModalAccessibility = (title: string) => ({
  accessible: true,
  accessibilityLabel: title,
  accessibilityRole: 'dialog' as const,
});

// Swipeable accessibility
export const getSwipeableAccessibility = (label: string) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: 'Desliza para ver más opciones',
});
