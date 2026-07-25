import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { Api } from '../../../shared/api/api';

const api = new Api();

const EMOJI = {
  inventory: '\u{1F4E6}',
  chart: '\u{1F4CA}',
  add: '\u{2795}',
  subtract: '\u{2796}',
  back: '\u{2190}',
  empty: '\u{1F4ED}',
} as const;

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 2, name: 'Carabobo' },
  { id: 3, name: 'El Malec\u00F3n' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

interface Ingredient {
  id: number;
  name: string;
  name_tag: string;
  category: string;
  stock: number;
  branch_id: number;
}

export const InventoryAdmin = () => {
  const navigation = useNavigation();
  const { token, user } = useAuthStore();

  const isCajero = user?.role?.name === 'employee';
  const userBranchId = user?.branch_id;

  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (isCajero && userBranchId) {
      return BRANCHES.find(b => b.id === userBranchId) || BRANCHES[0];
    }
    return BRANCHES[0];
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [restockValues, setRestockValues] = useState<Record<number, string>>({});
  const [deductValues, setDeductValues] = useState<Record<number, string>>({});

  const fetchIngredients = async () => {
    if (!token) return;
    setLoading(true);
    const res = await api.get<Ingredient[]>('catalog', 'ingredients', token);
    if (!res.error && res.data) {
      const filtered = (Array.isArray(res.data) ? res.data : []).filter(
        (i: Ingredient) => i.branch_id === selectedBranch.id
      );
      setIngredients(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, [selectedBranch]);

  const handleRestock = async (ingredientId: number) => {
    const value = parseInt(restockValues[ingredientId] || '0', 10);
    if (value <= 0) return;
    const res = await api.patch('catalog', `ingredients/${ingredientId}/restock`, { quantity: value }, token!);
    if (!res.error) {
      Alert.alert('\u00C9xito', `Stock repuesto: +${value}`);
      setRestockValues({ ...restockValues, [ingredientId]: '' });
      fetchIngredients();
    } else {
      const errorMsg = Array.isArray(res.message) ? res.message.join(', ') : String(res.message || 'Error al reponer');
      Alert.alert('Error', errorMsg);
    }
  };

  const handleDeduct = async (ingredientId: number, currentStock: number) => {
    const value = parseInt(deductValues[ingredientId] || '0', 10);
    if (value <= 0) return;
    if (value > currentStock) {
      Alert.alert('Error', `No puedes restar m\u00E1s de lo que hay en stock (${currentStock})`);
      return;
    }
    const res = await api.patch('catalog', `ingredients/${ingredientId}/deduct`, { quantity: value }, token!);
    if (!res.error) {
      Alert.alert('\u00C9xito', `Stock descontado: -${value}`);
      setDeductValues({ ...deductValues, [ingredientId]: '' });
      fetchIngredients();
    } else {
      const errorMsg = Array.isArray(res.message) ? res.message.join(', ') : String(res.message || 'Error al descontar');
      Alert.alert('Error', errorMsg);
    }
  };

  const categories = [...new Set(ingredients.map(i => i.category))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 20, color: '#fff', fontWeight: '600' }}>{EMOJI.back} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {isCajero ? `${EMOJI.chart} Reponer Inventario` : `${EMOJI.inventory} Inventario`}
        </Text>
      </View>

      {/* Branch Selector - Solo para admin */}
      {!isCajero && (
        <View style={{
          backgroundColor: '#fff',
          paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          >
            {BRANCHES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selectedBranch.id === item.id ? '#D32F2F' : '#F5F5F5',
                  borderWidth: 1,
                  borderColor: selectedBranch.id === item.id ? '#D32F2F' : '#E0E0E0',
                }}
                onPress={() => setSelectedBranch(item)}
              >
                <Text style={{
                  color: selectedBranch.id === item.id ? '#fff' : '#333',
                  fontWeight: '600', fontSize: 13
                }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info para cajero */}
      {isCajero && (
        <View style={{
          backgroundColor: '#E3F2FD',
          padding: 12,
          margin: 12,
          borderRadius: 10,
          borderLeftWidth: 4,
          borderLeftColor: '#2196F3',
        }}>
          <Text style={{ fontSize: 13, color: '#1565C0' }}>
            Solo puedes reponer stock de tu sucursal: {selectedBranch.name}
          </Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {categories.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>{EMOJI.empty}</Text>
              <Text style={{ fontSize: 16, color: '#9E9E9E' }}>No hay inventario para esta sucursal</Text>
            </View>
          ) : (
            categories.map(category => (
              <View key={category} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: 10 }}>
                  {EMOJI.chart} {category}
                </Text>
                {ingredients.filter(i => i.category === category).map(ingredient => (
                  <View key={ingredient.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 14, color: '#212121' }}>{ingredient.name}</Text>
                      <Text style={{
                        color: ingredient.stock > 10 ? '#10B981' : ingredient.stock > 0 ? '#F59E0B' : '#EF4444',
                        fontWeight: '700', fontSize: 13, marginTop: 2
                      }}>
                        Stock: {ingredient.stock}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {/* Boton de restar (solo admin) */}
                      {!isCajero && (
                        <>
                          <TextInput
                            style={{
                              borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
                              paddingHorizontal: 8, paddingVertical: 6, width: 50, textAlign: 'center',
                              fontSize: 13, backgroundColor: '#F5F5F5'
                            }}
                            placeholder="0"
                            keyboardType="numeric"
                            value={deductValues[ingredient.id] || ''}
                            onChangeText={(v) => setDeductValues({ ...deductValues, [ingredient.id]: v })}
                          />
                          <TouchableOpacity
                            style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                            onPress={() => handleDeduct(ingredient.id, ingredient.stock)}
                          >
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{EMOJI.subtract}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {/* Boton de sumar */}
                      <TextInput
                        style={{
                          borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
                          paddingHorizontal: 8, paddingVertical: 6, width: 50, textAlign: 'center',
                          fontSize: 13, backgroundColor: '#F5F5F5'
                        }}
                        placeholder="0"
                        keyboardType="numeric"
                        value={restockValues[ingredient.id] || ''}
                        onChangeText={(v) => setRestockValues({ ...restockValues, [ingredient.id]: v })}
                      />
                      <TouchableOpacity
                        style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                        onPress={() => handleRestock(ingredient.id)}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{EMOJI.add}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
