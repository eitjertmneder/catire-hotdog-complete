import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../../shared/store/cart.store';
import { useAppTheme } from '../../../shared/contexts/ThemeContext';

const CATEGORIES = [
  { id: 'perros', name: 'Perros Calientes', emoji: '\u{1F30D}', color: '#EF4444', bgColor: '#FEE2E2', description: 'Perros calientes con muchas opciones de salchicha', route: 'Menu' },
  { id: 'hamburguesas', name: 'Hamburguesas', emoji: '\u{1F354}', color: '#F59E0B', bgColor: '#FEF3C7', description: 'Hamburguesas sencillas y mixtas', route: 'Menu' },
  { id: 'salchipapas', name: 'Salchipapas', emoji: '\u{1F9C8}', color: '#10B981', bgColor: '#D1FAE5', description: 'Salchipapas junior y normales', route: 'Menu' },
  { id: 'bebidas', name: 'Bebidas', emoji: '\u{1F964}', color: '#3B82F6', bgColor: '#DBEAFE', description: 'Refrescos, jugos y mas', route: 'Menu' },
];

export default function HomeScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { setBranchId } = useCartStore();
  const { isDark, colors } = useAppTheme();
  const branchId = route.params?.branchId;
  const branchName = route.params?.branchName || 'Sucursal';

  useEffect(() => {
    if (branchId) {
      setBranchId(branchId);
    }
  }, [branchId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ 
        padding: 16, paddingBottom: 12, 
        backgroundColor: '#EC3137',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>
          {branchName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Hero card */}
        <View style={{ 
          backgroundColor: '#EC3137', 
          borderRadius: 20, 
          padding: 28, 
          alignItems: 'center', 
          marginBottom: 24,
          shadowColor: '#EC3137', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6
        }}>
          <Text style={{ fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: 2 }}>CATIRE</Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' }}>
            {'\u{1F32D}'} HOT DOG - Desde 2003 {'\u{1F32D}'}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
            El mejor perro caliente de la ciudad
          </Text>
          
          <TouchableOpacity
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              paddingVertical: 16, 
              paddingHorizontal: 32, 
              width: '100%', 
              alignItems: 'center',
              marginTop: 20,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
            }}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Menu', { branchId, branchName })}
          >
            <Text style={{ color: '#EC3137', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 }}>{'\u{1F6D2}'} ARMA TU PEDIDO</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 }}>
          {'\u{1F4CB}'} Nuestras Categorias
        </Text>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={{ 
              backgroundColor: colors.surface, 
              borderRadius: 18, 
              padding: 18, 
              marginBottom: 14,
              flexDirection: 'row', 
              alignItems: 'center',
              shadowColor: cat.color, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 3,
              borderLeftWidth: 5, borderLeftColor: cat.color,
              borderWidth: 1,
              borderColor: isDark ? colors.border : 'transparent',
            }}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Menu', { branchId, branchName, category: cat.id })}
          >
            <View style={{ 
              width: 56, height: 56, borderRadius: 16, 
              backgroundColor: cat.bgColor,
              justifyContent: 'center', alignItems: 'center',
              marginRight: 14
            }}>
              <Text style={{ fontSize: 28 }}>{cat.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{cat.name}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 3 }}>{cat.description}</Text>
            </View>
            <View style={{ 
              width: 34, height: 34, borderRadius: 17, 
              backgroundColor: cat.bgColor,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, color: cat.color, fontWeight: '700' }}>{'\u276F'}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Tip banner */}
        <View style={{ 
          backgroundColor: isDark ? colors.surface : '#FEF3C7', 
          borderRadius: 14, 
          padding: 16, 
          marginTop: 10,
          flexDirection: 'row', 
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDark ? colors.border : '#FCD34D',
        }}>
          <Text style={{ fontSize: 22, marginRight: 12, color: '#F59E0B', fontWeight: '900' }}>{'\u{1F4A1}'}</Text>
          <Text style={{ fontSize: 13, color: isDark ? colors.textSecondary : '#92400E', flex: 1, lineHeight: 18 }}>
            Puedes personalizar tu pedido en tiempo real segun tu sabor favorito
          </Text>
        </View>

        {/* Selected branch */}
        <View style={{ 
          backgroundColor: colors.surface, 
          borderRadius: 14, 
          padding: 16, 
          marginTop: 14,
          flexDirection: 'row', 
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: isDark ? colors.border : 'transparent',
        }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Text style={{ fontSize: 20 }}>{'\u{1F3EA}'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{branchName}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Sucursal seleccionada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
