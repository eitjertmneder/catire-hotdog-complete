import { StyleSheet } from "react-native";
import { theme } from "../../../../../shared/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 16,
    paddingTop: 0,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: theme.colors.textMuted,
    marginTop: 40,
  },
  
  cartItemWrapper: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  expandText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  accordionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  featureSection: {
    marginTop: 8,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  readOnlyPill: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  readOnlyPillText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  itemPrice: {
    color: theme.colors.success,
    marginTop: 2,
    fontWeight: '600',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    width: 32,
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  quantity: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  checkoutSection: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'right',
    color: theme.colors.textPrimary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  addressForm: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: theme.colors.errorBg,
  },
  confirmBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 28,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtn: {
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  }
});
