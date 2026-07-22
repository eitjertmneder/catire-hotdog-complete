import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCartStore } from '../../../shared/store/cart.store';
import { NameTag } from '../../../shared/api/enums';

// Precios de salchichas
const SAUSAGE_PRICES: Record<string, number> = {
  'Mini Frankfurt': 2.50,
  'Catirota': 5.00,
  'CatireHot': 5.00,
  'Chicken': 5.00,
  'Chesse': 4.50,
  'Salchicatire': 4.50,
  'Chistorra': 4.50,
  'Uruguayo': 4.50,
  'Antioqueño': 4.50,
  'Choricatire': 4.50,
  'Chori Frito': 4.50,
};

// Precios de carnes
const MEAT_PRICES: Record<string, number> = {
  'Carne': 4.50,
  'Croqueta de pollo': 4.50,
  'Croqueta de chuleta': 4.50,
};

// Precios de salchipapas
const SALCHIPAPA_PRICES: Record<string, number> = {
  'Junior': 3.00,
  'Normal': 5.00,
};

// Precios de bebidas
const DRINK_PRICES: Record<string, number> = {
  'Coca Cola Personal': 2.00,
  'Coca Cola 1L': 2.00,
  'Coca Cola 2L': 2.50,
  'Agua Mineral': 1.00,
  'Nestea': 1.00,
};

// Precios de hamburguesas
const HAMBURGUESA_PRICES: Record<string, number> = {
  'Hamburguesa Sencilla': 4.50,
  'Hamburguesa Mixta': 5.00,
};

// Mapeo de producto + sucursal a product_id real en la DB
const PRODUCT_ID_MAP: Record<string, Record<number, number>> = {
  'perro_normal': { 1: 256, 3: 257, 4: 258, 5: 259, 9: 260, 10: 261 },
  'perro_mini': { 1: 256, 3: 257, 4: 258, 5: 259, 9: 260, 10: 261 },
  'hamb_sencilla': { 1: 268, 3: 269, 4: 270, 10: 271 },
  'hamb_mixta': { 1: 268, 3: 269, 4: 270, 10: 271 },
  'salchi_junior': { 1: 262, 3: 263, 4: 264, 5: 265, 9: 266, 10: 267 },
  'salchi_normal': { 1: 262, 3: 263, 4: 264, 5: 265, 9: 266, 10: 267 },
  'coca_personal': { 1: 272, 3: 273, 4: 274, 5: 275, 9: 276, 10: 277 },
  'coca_1l': { 1: 278, 3: 279, 4: 280, 5: 281, 9: 282, 10: 283 },
  'coca_2l': { 1: 284, 3: 285, 4: 286, 5: 287, 9: 288, 10: 289 },
  'agua': { 1: 290, 3: 291, 4: 292, 5: 293, 9: 294, 10: 295 },
  'nestea': { 3: 296, 4: 297, 5: 298, 9: 299 },
};

// Productos con sus opciones completas
const PRODUCTS: Record<string, any> = {
  perro_normal: {
    id: 'perro_normal',
    name: 'Perro Caliente Normal',
    category: 'Perros',
    extrasLabel: 'Tipo de Salchicha',
    sizes: ['Normal'],
    toppings: ['Queso', 'Papita', 'Zanahoria', 'Cebolla'],
    extras: ['Catirota', 'CatireHot', 'Chicken', 'Chesse', 'Salchicatire', 'Chistorra', 'Uruguayo', 'Antioqueño', 'Choricatire', 'Chori Frito'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 1, extraMode: 'radio' },
  },
  perro_mini: {
    id: 'perro_mini',
    name: 'Perro Caliente Mini',
    category: 'Perros',
    extrasLabel: 'Tipo de Salchicha',
    sizes: ['Pan mini'],
    toppings: ['Queso', 'Papita', 'Zanahoria', 'Cebolla'],
    extras: ['Mini Frankfurt'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 1, extraMode: 'radio' },
  },
  hamb_sencilla: {
    id: 'hamb_sencilla',
    name: 'Hamburguesa Sencilla',
    category: 'Hamburguesas',
    extrasLabel: 'Tipo de Carne',
    sizes: ['Sencilla'],
    toppings: ['Lechuga', 'Tomate', 'Cebolla', 'Papita', 'Queso gouda', 'Queso rallado', 'Tocineta', 'Huevo frito'],
    extras: ['Carne', 'Croqueta de pollo', 'Croqueta de chuleta'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 1 },
  },
  hamb_mixta: {
    id: 'hamb_mixta',
    name: 'Hamburguesa Mixta',
    category: 'Hamburguesas',
    extrasLabel: 'Tipo de Carne',
    sizes: ['Mixta'],
    toppings: ['Lechuga', 'Tomate', 'Cebolla', 'Papita', 'Queso gouda', 'Queso rallado', 'Tocineta', 'Huevo frito'],
    extras: ['Carne', 'Croqueta de pollo', 'Croqueta de chuleta'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 2 },
  },
  salchi_junior: {
    id: 'salchi_junior',
    name: 'Salchipapa Junior',
    category: 'Salchipapas',
    extrasLabel: 'Tipo de Salchicha',
    sizes: ['Junior'],
    toppings: ['Queso gouda'],
    extras: ['Chesse'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 1, forcedExtras: { 'Junior': ['Chesse'] } },
  },
  salchi_normal: {
    id: 'salchi_normal',
    name: 'Salchipapa Normal',
    category: 'Salchipapas',
    extrasLabel: 'Tipo de Salchicha',
    sizes: ['Normal'],
    toppings: ['Queso gouda'],
    extras: ['Catirota', 'CatireHot', 'Chicken', 'Chesse', 'Salchicatire', 'Chistorra', 'Uruguayo', 'Antioqueño', 'Choricatire', 'Chori Frito'],
    sauces: ['Ketchup', 'Mostaza', 'Mayonesa', 'Salsa de Ajo'],
    rules: { maxExtras: 2, lockedExtras: { 'Normal': ['Salchicatire'] }, lockedNote: 'Salchicatire incluida + elige 1 más' },
  },
  coca_2l: { id: 'coca_2l', name: 'Coca Cola 2L', category: 'Bebidas', sizes: ['2L'], toppings: [], extras: [], sauces: [], rules: {} },
  coca_1l: { id: 'coca_1l', name: 'Coca Cola 1L', category: 'Bebidas', sizes: ['1L'], toppings: [], extras: [], sauces: [], rules: {} },
  agua: { id: 'agua', name: 'Agua Mineral', category: 'Bebidas', sizes: ['Personal'], toppings: [], extras: [], sauces: [], rules: {} },
  nestea: { id: 'nestea', name: 'Nestea', category: 'Bebidas', sizes: ['Personal'], toppings: [], extras: [], sauces: [], rules: {} },
};

// Sucursales que NO tienen hamburguesa
const NO_HAMBURGUESA = [5, 9];

// Sucursales que TIENEN Nestea
const HAS_NESTEA = [3, 4, 5, 9];

// Funcion para filtrar productos por sucursal
const getProductsForBranch = (branchId: number) => {
  return Object.values(PRODUCTS).filter((product: any) => {
    // Filtrar hamburguesas para Barrio Obrero y Sambil
    if (product.category === 'Hamburguesas' && NO_HAMBURGUESA.includes(branchId)) {
      return false;
    }
    // Filtrar Nestea para sucursales que no lo tienen
    if (product.id === 'nestea' && !HAS_NESTEA.includes(branchId)) {
      return false;
    }
    return true;
  });
};

// Card wrapper component
const SectionCard = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <View style={{ 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  }}>
    <Text style={{ fontSize: 14, fontWeight: '700', color: '#212121', marginBottom: 10 }}>{title}</Text>
    {children}
  </View>
);

export default function BuildOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addItem } = useCartStore();

  const branchId = route.params?.branchId;
  const branchName = route.params?.branchName || 'Sucursal';
  const initialProduct = route.params?.product;

  const [selectedProduct, setSelectedProduct] = useState<any>(
    initialProduct ? PRODUCTS[initialProduct.id] || PRODUCTS.perro_normal : PRODUCTS.perro_normal
  );
  const [selectedSize, setSelectedSize] = useState(selectedProduct.sizes[0] || '');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const selectProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || '');
    setSelectedToppings([]);
    setSelectedExtras([]);
    setSelectedSauces([]);
    setQuantity(1);
    setNotes('');
    if (product.rules?.forcedExtras?.[product.sizes[0]]) {
      setSelectedExtras(product.rules.forcedExtras[product.sizes[0]]);
    }
  };

  const toggleTopping = (item: string) => {
    setSelectedToppings(prev => prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]);
  };

  const toggleSauce = (item: string) => {
    setSelectedSauces(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]);
  };

  const toggleExtra = (extra: string) => {
    const rules = selectedProduct.rules;
    if (rules.extraMode === 'radio') {
      setSelectedExtras(prev => prev.includes(extra) ? [] : [extra]);
      return;
    }
    if (rules.lockedExtras?.[selectedSize]) {
      const locked = rules.lockedExtras[selectedSize];
      if (locked.includes(extra)) return;
      setSelectedExtras(prev => prev.includes(extra) ? [...locked] : [...locked, extra]);
      return;
    }
    const maxExtras = rules.maxExtras || 1;
    setSelectedExtras(prev => {
      if (prev.includes(extra)) return prev.filter(e => e !== extra);
      if (prev.length >= maxExtras) return prev;
      return [...prev, extra];
    });
  };

  const changeSize = (size: string) => {
    setSelectedSize(size);
    setSelectedExtras([]);
    if (selectedProduct.rules?.forcedExtras?.[size]) {
      setSelectedExtras(selectedProduct.rules.forcedExtras[size]);
    }
  };

  const addToCart = () => {
    // Validaciones segun tipo de producto
    if (selectedProduct.category === 'Perros' && selectedExtras.length === 0) {
      Alert.alert('Seleccion requerida', 'Debes seleccionar el tipo de salchicha antes de agregar al carrito');
      return;
    }
    if (selectedProduct.category === 'Hamburguesas' && selectedExtras.length === 0) {
      Alert.alert('Seleccion requerida', 'Debes seleccionar el tipo de carne antes de agregar al carrito');
      return;
    }
    if (selectedProduct.category === 'Salchipapas' && selectedExtras.length === 0) {
      Alert.alert('Seleccion requerida', 'Debes seleccionar el tipo de salchicha antes de agregar al carrito');
      return;
    }

    const features: { name_tag: NameTag; value: string }[] = [];
    if (selectedSize) features.push({ name_tag: 'SIZE' as NameTag, value: selectedSize });
    if (selectedExtras.length > 0) features.push({ name_tag: (selectedProduct.extrasLabel === 'Tipo de Salchicha' ? 'TYPE_SAUSAGE' : 'TYPE_MEAT') as NameTag, value: selectedExtras.join(',') });
    if (selectedToppings.length > 0) features.push({ name_tag: 'TOPPINGS' as NameTag, value: selectedToppings.join(',') });
    if (selectedSauces.length > 0) features.push({ name_tag: 'SAUCE' as NameTag, value: selectedSauces.join(',') });
    
    // Para bebidas, agregar feature SODA con el nombre del producto
    if (selectedProduct.category === 'Bebidas') {
      features.push({ name_tag: 'SODA' as NameTag, value: selectedProduct.name });
    }

    // Calcular precio segun tipo de producto
    let price = 0;
    if (selectedProduct.category === 'Perros') {
      // Precio de la salchicha seleccionada
      if (selectedExtras.length > 0) {
        price = SAUSAGE_PRICES[selectedExtras[0]] || 0;
      }
    } else if (selectedProduct.category === 'Salchipapas') {
      price = SALCHIPAPA_PRICES[selectedSize] || 5.00;
    } else if (selectedProduct.category === 'Hamburguesas') {
      price = HAMBURGUESA_PRICES[selectedProduct.name] || 4.50;
    } else if (selectedProduct.category === 'Bebidas') {
      price = DRINK_PRICES[selectedProduct.name] || 1.00;
    }

    const cartId = `${selectedProduct.id}_${Date.now()}`;
    const productId = PRODUCT_ID_MAP[selectedProduct.id]?.[branchId] || 256; // Default to 256 if not found
    addItem({ cart_id: cartId, product_id: productId, name: selectedProduct.name, quantity, base_price: price, features });

    Alert.alert('Agregado', `${selectedProduct.name} agregado al carrito`, [
      { text: 'Seguir pidiendo', onPress: () => selectProduct(selectedProduct) },
      { text: 'Ver carrito', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header limpio */}
      <View style={{ 
        padding: 16, paddingBottom: 12, 
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 14, color: '#D32F2F', fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#212121', textAlign: 'center' }}>
            {selectedProduct.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#757575', marginTop: 4 }}>
            {branchName}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Tamano - Card */}
        {selectedProduct.sizes.length > 0 && (
          <SectionCard title="Tamano">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selectedProduct.sizes.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: selectedSize === size ? '#D32F2F' : '#F5F5F5',
                    borderWidth: 1, borderColor: selectedSize === size ? '#D32F2F' : '#E0E0E0',
                  }}
                  onPress={() => changeSize(size)}
                >
                  <Text style={{ fontWeight: '600', fontSize: 14, color: selectedSize === size ? '#fff' : '#212121' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>
        )}

        {/* Tipo de Salchicha/Carne - Card */}
        {selectedProduct.extras && selectedProduct.extras.length > 0 && (
          <SectionCard title={selectedProduct.extrasLabel}>
            {selectedProduct.rules?.lockedNote && (
              <Text style={{ fontSize: 12, color: '#757575', marginBottom: 8 }}>{selectedProduct.rules.lockedNote}</Text>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selectedProduct.extras.map((extra: string) => {
                const isLocked = selectedProduct.rules?.lockedExtras?.[selectedSize]?.includes(extra);
                const isSelected = selectedExtras.includes(extra);
                const price = SAUSAGE_PRICES[extra] || MEAT_PRICES[extra] || null;
                return (
                  <TouchableOpacity
                    key={extra}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                      backgroundColor: isLocked ? '#D1FAE5' : isSelected ? '#D32F2F' : '#F5F5F5',
                      borderWidth: 1, borderColor: isLocked ? '#10B981' : isSelected ? '#D32F2F' : '#E0E0E0',
                    }}
                    onPress={() => toggleExtra(extra)}
                    disabled={isLocked}
                  >
                    <Text style={{ fontWeight: '600', fontSize: 13, color: isLocked ? '#10B981' : isSelected ? '#fff' : '#212121' }}>
                      {isLocked ? 'V ' : ''}{extra}
                    </Text>
                    {price && (
                      <Text style={{ fontSize: 11, color: isLocked ? '#10B981' : isSelected ? 'rgba(255,255,255,0.8)' : '#757575', marginTop: 2 }}>
                        ${price.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        )}

        {/* Toppings - Card */}
        {selectedProduct.toppings && selectedProduct.toppings.length > 0 && (
          <SectionCard title="Toppings">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selectedProduct.toppings.map((topping: string) => {
                const isSelected = selectedToppings.includes(topping);
                return (
                  <TouchableOpacity
                    key={topping}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                      backgroundColor: isSelected ? '#D32F2F' : '#F5F5F5',
                      borderWidth: 1, borderColor: isSelected ? '#D32F2F' : '#E0E0E0',
                    }}
                    onPress={() => toggleTopping(topping)}
                  >
                    <Text style={{ fontWeight: '600', fontSize: 13, color: isSelected ? '#fff' : '#212121' }}>{topping}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        )}

        {/* Salsas - Card */}
        {selectedProduct.sauces && selectedProduct.sauces.length > 0 && (
          <SectionCard title="Salsas">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selectedProduct.sauces.map((sauce: string) => {
                const isSelected = selectedSauces.includes(sauce);
                return (
                  <TouchableOpacity
                    key={sauce}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                      backgroundColor: isSelected ? '#D32F2F' : '#F5F5F5',
                      borderWidth: 1, borderColor: isSelected ? '#D32F2F' : '#E0E0E0',
                    }}
                    onPress={() => toggleSauce(sauce)}
                  >
                    <Text style={{ fontWeight: '600', fontSize: 13, color: isSelected ? '#fff' : '#212121' }}>{sauce}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        )}

        {/* Cantidad - Card */}
        <SectionCard title="Cantidad">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' }}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#333' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: '800', minWidth: 50, textAlign: 'center', color: '#212121' }}>{quantity}</Text>
            <TouchableOpacity
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>+</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Notas - Card */}
        <SectionCard title="Notas">
          <TextInput
            style={{
              borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 14,
              fontSize: 14, backgroundColor: '#F5F5F5', minHeight: 60, textAlignVertical: 'top',
            }}
            placeholder="Ejemplo: sin cebolla, poco pan..."
            placeholderTextColor="#9E9E9E"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </SectionCard>
      </ScrollView>

      {/* Boton Agregar */}
      <View style={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 16,
        borderTopWidth: 1, borderTopColor: '#E0E0E0',
      }}>
        <TouchableOpacity
          style={{ backgroundColor: '#D32F2F', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
          onPress={addToCart}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>AGREGAR AL CARRITO !!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
