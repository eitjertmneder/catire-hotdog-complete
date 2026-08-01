import { StyleSheet } from 'react-native';
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
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginVertical: 2,
  },
  menuSection: {
    marginBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionIcon: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
  },
  accordionContent: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});
