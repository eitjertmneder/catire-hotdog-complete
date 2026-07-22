import { StyleSheet } from "react-native";
import { theme } from "../../../../../shared/styles/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: theme.colors.primary,
    paddingBottom: 36,
  },
  logoPlaceholder: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
    flex: 1,
    minHeight: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.error,
    padding: 12,
    borderRadius: 10,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 13,
  },

  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  toggleContainer: {
    alignItems: 'center',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 20,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
