import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

const CATEGORIES = [
  { id: 'perros', name: 'Perros', icon: 'P' },
  { id: 'hamburguesas', name: 'Hamburguesas', icon: 'H' },
  { id: 'salchipapas', name: 'Salchipapas', icon: 'S' },
  { id: 'bebidas', name: 'Bebidas', icon: 'B' },
];

// Sucursales que NO tienen hamburguesa
const NO_HAMBURGUESA = [11, 16];

// Sucursales que TIENEN Nestea: Barrio Obrero, Sambil, Colombia (Prados del Este)
const HAS_NESTEA = [11, 16, 4];

const PRODUCTS_BY_CATEGORY: Record<string, any[]> = {
  perros: [
    { id: 'perro_normal', name: 'Perro Caliente Normal', price: 'Desde $2.50', image: 'https://pbs.twimg.com/media/DPQ0_B8XcAAiEMw.jpg' },
    { id: 'perro_mini', name: 'Perro Caliente Mini', price: 'Desde $2.50', image: 'https://www.arepazo.cl/wp-content/uploads/2026/02/Perro-Calientes.png' },
  ],
  hamburguesas: [
    { id: 'hamb_sencilla', name: 'Hamburguesa Sencilla', price: '$4.50', image: 'https://pikapizza.wordpress.com/wp-content/uploads/2013/03/hamburguesa-tocineta.jpg' },
    { id: 'hamb_mixta', name: 'Hamburguesa Mixta', price: '$5.00', image: 'https://storage.googleapis.com/aur-sitemap-img/restaurants/moa-cafe/757161fc1396.jpg' },
  ],
  salchipapas: [
    { id: 'salchi_junior', name: 'Salchipapa Junior', price: '$3.00', image: 'https://livornos.com/wp-content/uploads/2023/12/salchipapas.png' },
    { id: 'salchi_normal', name: 'Salchipapa Normal', price: '$5.00', image: 'https://livornos.com/wp-content/uploads/2023/12/salchipapas.png' },
  ],
  bebidas: [
    { id: 'coca_personal', name: 'Coca Cola Personal', price: '$2.00', image: 'https://www.coca-cola.com/content/dam/onexp/bo/es/brands/coca-cola/new/coca_cola_190ml.jpg/width1960.jpg' },
    { id: 'coca_1l', name: 'Coca Cola 1L', price: '$2.00', image: 'https://despensallena.com/wp-content/uploads/2023/09/Cocacola-1lt.jpg' },
    { id: 'coca_2l', name: 'Coca Cola 2L', price: '$2.50', image: 'https://www.viaappia.com.ve/uploads/productos/20230803124559m.jpeg' },
    { id: 'agua', name: 'Agua Mineral', price: '$1.00', image: 'https://www.titaniccenter.com/cdn/shop/files/AGUAMINERAL600MLMINALBA.png?v=1754400625&width=4000' },
    { id: 'nestea', name: 'Nestea', price: '$1.00', image: 'https://cdn.elimpulso.com/media/2020/09/Nestea-696x467.jpg' },
  ],
};

// Funcion para filtrar productos por sucursal
const getProductsForBranch = (category: string, branchId: number) => {
  const products = PRODUCTS_BY_CATEGORY[category] || [];
  
  return products.filter((product: any) => {
    // Filtrar hamburguesas para Barrio Obrero y Sambil
    if (category === 'hamburguesas' && NO_HAMBURGUESA.includes(branchId)) {
      return false;
    }
    // Filtrar Nestea para sucursales que no lo tienen
    if (product.id === 'nestea' && !HAS_NESTEA.includes(branchId)) {
      return false;
    }
    return true;
  });
};

// Funcion para filtrar categorias por sucursal
const getCategoriesForBranch = (branchId: number) => {
  return CATEGORIES.filter(cat => {
    // Filtrar categoria hamburguesas para Barrio Obrero y Sambil
    if (cat.id === 'hamburguesas' && NO_HAMBURGUESA.includes(branchId)) {
      return false;
    }
    return true;
  });
};

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const branchId = route.params?.branchId;
  const branchName = route.params?.branchName || 'Sucursal';
  const initialCategory = route.params?.category || 'perros';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { isDark, colors } = useAppTheme();

  // Filtrar categorias y productos por sucursal
  const categories = getCategoriesForBranch(branchId);
  const products = getProductsForBranch(selectedCategory, branchId);

  const handleProductPress = (product: any) => {
    navigation.navigate('BuildOrder', { branchId, branchName, product, category: selectedCategory });
  };

  const getCategoryTitle = () => {
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? `${cat.icon} ${cat.name}` : 'Productos';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back + Title centrado */}
      <View style={{ 
        padding: 16, paddingBottom: 12, 
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 14, color: '#D32F2F', fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 8 }}>
          {getCategoryTitle()}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
          📍 {branchName}
        </Text>
      </View>

      {/* Tabs de Categorias */}
      <View style={{ backgroundColor: colors.surface, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === cat.id ? '#D32F2F' : colors.background,
                borderWidth: 1, borderColor: selectedCategory === cat.id ? '#D32F2F' : colors.border,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={{ 
                width: 24, height: 24, borderRadius: 12, 
                backgroundColor: selectedCategory === cat.id ? '#fff' : '#D32F2F',
                justifyContent: 'center', alignItems: 'center' 
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: selectedCategory === cat.id ? '#D32F2F' : '#fff' }}>
                  {cat.icon}
                </Text>
              </View>
              <Text style={{ fontWeight: '600', fontSize: 13, color: selectedCategory === cat.id ? '#fff' : '#212121' }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid de Productos */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {products.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={{
                  width: '47%', backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
                }}
                onPress={() => handleProductPress(product)}
              >
                <Image source={{ uri: product.image }} style={{ width: '100%', height: 120 }} resizeMode="contain" />
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{product.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#D32F2F', marginTop: 4 }}>{product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
            <Text style={{ fontSize: 15, color: '#9E9E9E', textAlign: 'center' }}>
              No hay productos disponibles{'\n'}en esta categoría
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
