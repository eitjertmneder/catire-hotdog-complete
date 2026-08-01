import { StyleSheet, Dimensions } from 'react-native';
import { lightTheme } from '../../../../../shared/styles/theme';

export const getStyles = (colors: typeof lightTheme.colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  containerLoading: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerLoading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  branchInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonTextPrimary: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonTextSecondary: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  mapOverlayCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});
