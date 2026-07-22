import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../styles/product.styles';
import { Product } from '../../../models/Product';
import { useNavigation } from '@react-navigation/core';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigation = useNavigation<any>();

  const onPress = () => navigation.navigate('ProductDetails', { product })

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
    >
      <Image source={{ uri: product.img_src }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
    </TouchableOpacity>
  );
};