import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useVoiceStore } from '../../../shared/store/voice.store';
import { useCartStore } from '../../../shared/store/cart.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

export const VoiceOrderScreen = () => {
  const navigation = useNavigation<any>();
  const { isListening, startListening, stopListening, speak, parseOrder, setTranscript, transcript } = useVoiceStore();
  const { colors } = useAppTheme();
  const { addItem } = useCartStore();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [lastOrder, setLastOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      // Simulate voice recognition result
      const mockResult = 'Quiero 2 perros calientes';
      setTranscript(mockResult);
      processOrder(mockResult);
    } else {
      startListening();
      speak('Que quieres ordenar?');
    }
  };

  const processOrder = (text: string) => {
    const parsed = parseOrder(text);
    
    if (parsed) {
      const message = `Entendido: ${parsed.quantity} ${parsed.product}`;
      setLastOrder(message);
      speak(message);
      
      Alert.alert(
        'Pedido Detectado',
        `${parsed.quantity}x ${parsed.product}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Agregar al Carrito',
            onPress: () => {
              addItem({
                cart_id: `voice_${Date.now()}`,
                product_id: 0,
                name: parsed.product,
                quantity: parsed.quantity,
                base_price: 0,
                features: [],
              });
              speak('Agregado al carrito');
              Alert.alert('Exito', 'Producto agregado al carrito');
            }
          },
        ]
      );
    } else {
      speak('No entendi el producto. Por favor, intenta de nuevo.');
      Alert.alert('No entendi', 'No pude identificar el producto. Intenta con: "Quiero 2 perros calientes"');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 }}>
          Pedido por Voz
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {/* Mic Button */}
        <TouchableOpacity
          onPress={handleVoiceInput}
          style={{ marginBottom: 30 }}
        >
          <Animated.View style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: isListening ? '#EF4444' : colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ scale: pulseAnim }],
            shadowColor: isListening ? '#EF4444' : colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 60 }}>{'\u{1F3A4}'}</Text>
          </Animated.View>
        </TouchableOpacity>

        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: isListening ? '#EF4444' : colors.textPrimary,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          {isListening ? 'Escuchando...' : 'Toca para hablar'}
        </Text>

        {/* Transcript */}
        {transcript ? (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            width: '100%',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>LO QUE DIJISTE:</Text>
            <Text style={{ fontSize: 16, color: colors.textPrimary }}>{transcript}</Text>
          </View>
        ) : null}

        {/* Last Order */}
        {lastOrder ? (
          <View style={{
            backgroundColor: '#D1FAE5',
            borderRadius: 12,
            padding: 16,
            width: '100%',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#6EE7B7',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46' }}>
              {'\u2714'} {lastOrder}
            </Text>
          </View>
        ) : null}

        {/* Instructions */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          width: '100%',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
            Ejemplos de pedidos:
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
            {'\u2022'} "Quiero 2 perros calientes"
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
            {'\u2022'} "Una hamburguesa sencilla"
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
            {'\u2022'} "3 salchipapas normales"
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {'\u2022'} "Una coca cola 2 litros"
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
            onPress={() => speak('Que quieres ordenar?')}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>{'\u{1F50A}'}</Text>
            <Text style={{ fontSize: 12, color: colors.textPrimary }}>Repetir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('Cart' as any)}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>{'\u{1F6D2}'}</Text>
            <Text style={{ fontSize: 12, color: colors.textPrimary }}>Ver Carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};



