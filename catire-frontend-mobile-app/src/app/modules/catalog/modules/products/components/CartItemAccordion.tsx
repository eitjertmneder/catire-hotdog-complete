import React, { useState } from 'react';
import { styles } from '../styles/cart.styles';
import { Text, TouchableOpacity, View } from 'react-native';
import { FEATURE_TRANSLATION } from '../../../constants/features';

export const CartItemAccordion = ({ item, updateQuantity, removeItem }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.cartItemWrapper}>
      <View style={styles.cartItemHeader}>
        {/* Lado izquierdo: Info y botón de expandir */}
        <TouchableOpacity 
          style={styles.itemInfo} 
          activeOpacity={0.7} 
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.base_price}</Text>
          <Text style={styles.expandText}>
            {isExpanded ? 'Ocultar detalles ▲' : 'Ver detalles ▼'}
          </Text>
        </TouchableOpacity>

        {/* Lado derecho: Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.cart_id, Math.max(1, item.quantity - 1))}>
            <Text style={styles.actionBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.cart_id, item.quantity + 1)}>
            <Text style={styles.actionBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.cart_id)}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido expandible (Solo lectura) */}
      {isExpanded && item.features && item.features.length > 0 && (
        <View style={styles.accordionContent}>
          {item.features.map((feature: any) => {
            if (!feature.value) return null;
            
            const options = feature.value.split(',');
            
            return (
              <View key={feature.name_tag} style={styles.featureSection}>
                <Text style={styles.featureTitle}>
                  { FEATURE_TRANSLATION[feature.name_tag as string] }
                </Text>
                <View style={styles.pillsContainer}>
                  {options.map((opt: string) => (
                    <View key={opt} style={styles.readOnlyPill}>
                      <Text style={styles.readOnlyPillText}>{opt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};