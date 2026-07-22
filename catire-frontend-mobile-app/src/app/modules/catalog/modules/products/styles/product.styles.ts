import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../../../../shared/styles/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 24;

export const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 130,
    marginBottom: 8,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
