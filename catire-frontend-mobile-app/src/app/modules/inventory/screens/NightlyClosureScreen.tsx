import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { Api } from '../../../shared/api/api';
import { theme } from '../../../shared/styles/theme';

const api = new Api();

const BRANCHES = [
  { id: 1, name: 'Barrio Sucre' },
  { id: 2, name: 'Carabobo' },
  { id: 3, name: 'El Malec�n' },
  { id: 4, name: 'Prados del Este' },
  { id: 11, name: 'Barrio Obrero' },
  { id: 12, name: 'La Asogata' },
  { id: 13, name: 'La Grita' },
  { id: 16, name: 'Sambil' },
  { id: 17, name: 'Mestizos' },
];

interface ClosureItem {
  ingredient_id: number;
  name: string;
  category: string;
  unit: string;
  opening_stock: number;
  theoretical: number;
  physical: string;
  notes: string;
}

export const NightlyClosureScreen = () => {
  const navigation = useNavigation();
  const { token, user } = useAuthStore();
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [items, setItems] = useState<ClosureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const fetchTheoreticalStock = async () => {
    if (!token) return;
    setLoading(true);
    const res = await api.get<any[]>('catalog', `nightly-closure/theoretical?branch_id=${selectedBranch.id}&date=${date}`, token);
    if (!res.error && res.data) {
      setItems((Array.isArray(res.data) ? res.data : []).map((item: any) => ({
        ingredient_id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit || 'unidades',
        opening_stock: item.opening_stock || item.stock,
        theoretical: item.theoretical || item.stock,
        physical: '',
        notes: '',
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTheoreticalStock();
  }, [selectedBranch]);

  const updatePhysical = (ingredientId: number, value: string) => {
    setItems(prev => prev.map(item => 
      item.ingredient_id === ingredientId ? { ...item, physical: value } : item
    ));
  };

  const updateNotes = (ingredientId: number, value: string) => {
    setItems(prev => prev.map(item => 
      item.ingredient_id === ingredientId ? { ...item, notes: value } : item
    ));
  };

  const handleSave = async () => {
    const incomplete = items.filter(i => !i.physical || i.physical.trim() === '');
    if (incomplete.length > 0) {
      Alert.alert('Faltan datos', `${incomplete.length} ingredientes no tienen conteo físico`);
      return;
    }

    setSaving(true);
    const closures = items.map(item => ({
      ingredient_id: item.ingredient_id,
      name: item.name,
      opening_stock: item.opening_stock,
      theoretical: item.theoretical,
      physical: parseFloat(item.physical),
      notes: item.notes || null,
    }));

    const res = await api.post('catalog', 'nightly-closure/save', {
      branch_id: selectedBranch.id,
      date,
      closures,
      closed_by: user?.id || 0,
    }, token || '');

    if (!res.error) {
      Alert.alert('Éxito', 'Cierre de noche guardado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', res.message || 'No se pudo guardar el cierre');
    }
    setSaving(false);
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 12 }}>
          🌙 Cierre de Noche
        </Text>
      </View>

      {/* Branch Selector */}
      <FlatList
        horizontal
        data={BRANCHES}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 48, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 6, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: selectedBranch.id === item.id ? theme.colors.primary : theme.colors.borderLight,
            }}
            onPress={() => setSelectedBranch(item)}
          >
            <Text style={{ color: selectedBranch.id === item.id ? '#fff' : theme.colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Date */}
      <View style={{ padding: 12, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' }}>
          📅 Fecha: {date}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {categories.map(category => (
            <View key={category} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, paddingHorizontal: 16, paddingVertical: 8 }}>
                {category}
              </Text>
              {items.filter(i => i.category === category).map(item => {
                const diff = item.physical ? parseFloat(item.physical) - item.theoretical : null;
                return (
                  <View key={item.ingredient_id} style={{ 
                    backgroundColor: theme.colors.white, 
                    marginHorizontal: 12, 
                    marginBottom: 6, 
                    borderRadius: 12, 
                    padding: 12,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontWeight: '600', color: theme.colors.textPrimary, flex: 1 }}>{item.name}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.unit}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Teórico:</Text>
                        <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{item.theoretical}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Físico:</Text>
                        <TextInput
                          style={{ 
                            borderWidth: 1, 
                            borderColor: diff !== null && diff !== 0 ? theme.colors.warning : theme.colors.border, 
                            borderRadius: 8, 
                            paddingHorizontal: 10, 
                            paddingVertical: 4, 
                            fontSize: 14,
                            fontWeight: '700',
                            color: theme.colors.textPrimary,
                            backgroundColor: theme.colors.background,
                          }}
                          placeholder="Conteo real"
                          keyboardType="numeric"
                          value={item.physical}
                          onChangeText={(v) => updatePhysical(item.ingredient_id, v)}
                        />
                      </View>
                      {diff !== null && diff !== 0 && (
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 11, color: theme.colors.textMuted }}>Diferencia:</Text>
                          <Text style={{ 
                            fontWeight: '700', 
                            color: diff > 0 ? theme.colors.success : theme.colors.error 
                          }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TextInput
                      style={{ 
                        borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, 
                        paddingHorizontal: 10, paddingVertical: 4, fontSize: 12,
                        color: theme.colors.textSecondary,
                        backgroundColor: theme.colors.background,
                      }}
                      placeholder="Notas (opcional)"
                      value={item.notes}
                      onChangeText={(v) => updateNotes(item.ingredient_id, v)}
                    />
                  </View>
                );
              })}
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Save Button */}
      <View style={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.white, padding: 16,
        borderTopWidth: 1, borderTopColor: theme.colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 5,
      }}>
        <TouchableOpacity
          style={{ 
            backgroundColor: theme.colors.primary, 
            paddingVertical: 14, 
            borderRadius: 10, 
            alignItems: 'center',
            opacity: saving ? 0.7 : 1,
          }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Guardar Cierre de Noche</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


