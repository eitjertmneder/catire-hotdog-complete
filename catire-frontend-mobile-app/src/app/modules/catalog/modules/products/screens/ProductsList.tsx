import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProductCard } from '../components/ProductCard';

export const ProductsList = ({ products }: any) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.gridContainer}>
      {products.map((product: any) => (
        <ProductCard key={product.id.toString()} product={product} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  }
});