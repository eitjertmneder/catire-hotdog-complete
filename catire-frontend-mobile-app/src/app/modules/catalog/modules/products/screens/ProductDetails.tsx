import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../styles/details.styles';
import { NameTag } from '../../../../../shared/api/enums';
import { FEATURE_CONFIG } from '../../../constants/features';
import { useCartStore } from '../../../../../shared/store/cart.store';
import { Product } from '../../../models/Product';

export default function ProductDetails({ route }: any) {
  const navigation = useNavigation();
  const params = route.params;
  const product = params.product as Product;
  
  const category = product.category.name; 
  const productFeatures = FEATURE_CONFIG[category] || [];

  const [quantity, setQuantity] = useState<number>(1);
  const [selections, setSelections] = useState<Partial<Record<NameTag, string[]>>>({});
  const { addItem } = useCartStore();

  useEffect(() => {
    const defaults: Partial<Record<NameTag, string[]>> = {};
    const isSalchipapa = category === 'Salchipapas';

    productFeatures.forEach((f) => {
      if (f.tag === 'TOPPINGS') {
        defaults[f.tag] = isSalchipapa ? [] : [...f.options];
      }
    });

    if (category === 'Perros') {
      defaults['SIZE'] = ['Pan mini'];
      defaults['TYPE_SAUSAGE'] = ['Mini Frankfurt'];
    } else if (category === 'Salchipapas') {
      defaults['SIZE'] = ['Junior'];
      defaults['TYPE_SAUSAGE'] = ['Chesse'];
    } else if (category === 'Hamburguesas') {
      defaults['SIZE'] = ['Sencilla'];
      defaults['TYPE_MEAT'] = ['Carne'];
    } else if (category === 'Bebidas') {
      defaults['SIZE'] = ['2L']; 
    }

    setSelections(defaults);
  }, [category]);

  const calculatePrice = (): number => {
    const currentSize = selections['SIZE']?.[0] || '';
    const selectedSausages = selections['TYPE_SAUSAGE'] || [];

    if (category === 'Perros') {
      const sausage = selectedSausages[0] || 'Mini Frankfurt';
      if (['Catirota', 'CatireHot', 'Chicken'].includes(sausage)) {
        return 5.0;
      }
      return 4.5;
    }
    
    if (category === 'Salchipapas') {
      if (currentSize === 'Porción de papas') return 1.5;
      return 5.0;
    }
    
    if (category === 'Hamburguesas') {
      if (currentSize === 'Mixta') return 5.0;
      return 4.5;
    }
    
    if (category === 'Bebidas') {
      if (currentSize === '2L') return 2.5;
      if (currentSize === '1L') return 2.0;
      if (currentSize === 'Personal') return 2.0;
      if (currentSize === 'Nestea') return 1.0;
    }

    return 0;
  };

  const currentPrice = calculatePrice();

  // 3. FILTRO DE OPCIONES VISIBLES
  const getVisibleOptions = (tag: NameTag, options: string[]) => {
    const currentSize = selections['SIZE']?.[0] || '';

    if (category === 'Salchipapas' && currentSize === 'Porción de papas' && tag !== 'SIZE') {
      return [];
    }
    if (category === 'Perros' && tag === 'TYPE_SAUSAGE' && currentSize === 'Pan mini') {
      return ['Mini Frankfurt'];
    }
    if (category === 'Salchipapas' && tag === 'TYPE_SAUSAGE' && currentSize === 'Junior') {
      return ['Chesse'];
    }
    return options; 
  };

  // 4. LÓGICA CONDICIONAL DE SELECCIÓN
  const handleToggleOption = (tag: NameTag, option: string, isMulti: boolean) => {
    setSelections((prev) => {
      const currentSize = prev['SIZE']?.[0] || '';
      const currentSelected = prev[tag] || [];
      const isSelected = currentSelected.includes(option);

      if (tag === 'SIZE') {
        const newSelections = { ...prev, SIZE: [option] };
        
        if (category === 'Perros') {
          if (option === 'Pan mini') {
            newSelections['TYPE_SAUSAGE'] = ['Mini Frankfurt'];
          } else if (option === 'Normal') {
            newSelections['TYPE_SAUSAGE'] = []; 
          }
        } 
        else if (category === 'Salchipapas') {
          if (option === 'Porción de papas') {
            newSelections['TYPE_SAUSAGE'] = [];
            newSelections['TOPPINGS'] = [];
            newSelections['SAUCE'] = [];
          } 
          else if (option === 'Junior') {
            newSelections['TYPE_SAUSAGE'] = ['Chesse'];
            const allSauces = productFeatures.find(f => f.tag === 'SAUCE')?.options || [];
            if (!prev['SAUCE'] || prev['SAUCE'].length === 0) newSelections['SAUCE'] = [...allSauces];
          } 
          else if (option === 'Normal') {
            newSelections['TYPE_SAUSAGE'] = ['Salchicatire']; 
            const allSauces = productFeatures.find(f => f.tag === 'SAUCE')?.options || [];
            if (!prev['SAUCE'] || prev['SAUCE'].length === 0) newSelections['SAUCE'] = [...allSauces];
          }
        } 
        else if (category === 'Hamburguesas') {
          if (option === 'Sencilla') {
            const meats = prev['TYPE_MEAT'] || [];
            newSelections['TYPE_MEAT'] = meats.length > 0 ? [meats[0]] : ['Carne'];
          }
        }
        return newSelections;
      }

      if (tag === 'TYPE_SAUSAGE') {
        if (category === 'Perros') {
          return { ...prev, [tag]: [option] };
        }
        if (category === 'Salchipapas' && currentSize === 'Normal') {
          if (isSelected) {
            if (option === 'Salchicatire') return prev; 
            return { ...prev, [tag]: currentSelected.filter(i => i !== option) };
          } else {
            if (currentSelected.length >= 2) return prev;
            return { ...prev, [tag]: [...currentSelected, option] };
          }
        }
      }

      if (tag === 'TYPE_MEAT' && category === 'Hamburguesas') {
        if (currentSize === 'Sencilla') {
          return { ...prev, [tag]: [option] };
        } else if (currentSize === 'Mixta') {
          if (isSelected) {
            if (currentSelected.length === 1) return prev; 
            return { ...prev, [tag]: currentSelected.filter(i => i !== option) };
          } else {
            if (currentSelected.length >= 2) return prev;
            return { ...prev, [tag]: [...currentSelected, option] };
          }
        }
      }

      if (!isMulti) {
        return { ...prev, [tag]: [option] };
      }

      if (isSelected) {
        return { ...prev, [tag]: currentSelected.filter((item) => item !== option) };
      } else {
        return { ...prev, [tag]: [...currentSelected, option] };
      }
    });
  };

  const handleAddToCart = () => {
    if (category === 'Perros' && (!selections['TYPE_SAUSAGE'] || selections['TYPE_SAUSAGE'].length === 0)) {
      return Alert.alert('Atención', 'Debes seleccionar un tipo de salchicha obligatoriamente.');
    }
    
    const featuresDTO = Object.entries(selections).map(([tag, values]) => ({
      name_tag: tag as NameTag,
      value: values.join(','),
    }));

    const featuresString = [...featuresDTO]
      .sort((a, b) => a.name_tag.localeCompare(b.name_tag))
      .map(f => `${f.name_tag}:${f.value}`)
      .join('|');
      
    const dynamicCartId = `${product.id}-${featuresString}`;

    addItem({
      cart_id: dynamicCartId,
      product_id: product.id,
      quantity: quantity,
      features: featuresDTO,
      name: product.name,
      base_price: currentPrice,
      img_src: product.img_src,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.img_src }} style={styles.image} />

        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {productFeatures.map((featureConf) => {
            const visibleOptions = getVisibleOptions(featureConf.tag, featureConf.options);
            if (visibleOptions.length === 0) return null;

            return (
              <View key={featureConf.tag} style={styles.featureSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{featureConf.icon}</Text>
                  <Text style={styles.featureTitle}>{featureConf.title}</Text>
                </View>

                <View style={styles.pillsContainer}>
                  {visibleOptions.map((option) => {
                    const isSelected = selections[featureConf.tag]?.includes(option);
                    return (
                      <TouchableOpacity
                        key={option}
                        activeOpacity={0.7}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                        onPress={() => handleToggleOption(featureConf.tag, option, featureConf.isMulti)}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={styles.quantitySection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🔢</Text>
              <Text style={styles.featureTitle}>CANTIDAD</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>
              {/* Ahora el total a mostrar se basa en el precio calculado dinámicamente */}
              Agregar {quantity} al carrito • $ {(currentPrice * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}