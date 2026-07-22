import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../../shared/store/cart.store';

const CATEGORIES = [
  { id: 'perros', name: 'Perros Calientes', icon: 'P', color: '#EF4444', bgColor: '#FEE2E2', description: 'Perros calientes con muchas opciones de salchicha', route: 'Menu' },
  { id: 'hamburguesas', name: 'Hamburguesas', icon: 'H', color: '#F59E0B', bgColor: '#FEF3C7', description: 'Hamburguesas sencillas y mixtas', route: 'Menu' },
  { id: 'salchipapas', name: 'Salchipapas', icon: 'S', color: '#10B981', bgColor: '#D1FAE5', description: 'Salchipapas junior y normales', route: 'Menu' },
  { id: 'bebidas', name: 'Bebidas', icon: 'B', color: '#3B82F6', bgColor: '#DBEAFE', description: 'Refrescos, jugos y mas', route: 'Menu' },
];

export default function HomeScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { setBranchId } = useCartStore();
  const branchId = route.params?.branchId;
  const branchName = route.params?.branchName || 'Sucursal';

  useEffect(() => {
    if (branchId) {
      setBranchId(branchId);
    }
  }, [branchId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
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
        <View style={{ 
          backgroundColor: '#EC3137', 
          borderRadius: 16, 
          padding: 24, 
          alignItems: 'center', 
          marginBottom: 20,
          shadowColor: '#EC3137', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4
        }}>
          <Text style={{ fontSize: 48, color: '#fff', fontWeight: '900' }}>CATIRE</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            HOT DOG - Desde 2003
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
            El mejor perro caliente de la ciudad
          </Text>
          
          <TouchableOpacity
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 25, 
              paddingVertical: 14, 
              paddingHorizontal: 32, 
              width: '100%', 
              alignItems: 'center',
              marginTop: 16
            }}
            onPress={() => navigation.navigate('Menu', { branchId, branchName })}
          >
            <Text style={{ color: '#EC3137', fontWeight: '800', fontSize: 16 }}>ARMA TU PEDIDO</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 12 }}>
          Nuestras Categorias
        </Text>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              padding: 16, 
              marginBottom: 12,
              flexDirection: 'row', 
              alignItems: 'center',
              shadowColor: cat.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2,
              borderLeftWidth: 4, borderLeftColor: cat.color
            }}
            onPress={() => navigation.navigate('Menu', { branchId, branchName, category: cat.id })}
          >
            <View style={{ 
              width: 50, height: 50, borderRadius: 25, 
              backgroundColor: cat.bgColor,
              justifyContent: 'center', alignItems: 'center',
              marginRight: 14
            }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cat.color }}>{cat.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#212121' }}>{cat.name}</Text>
              <Text style={{ fontSize: 13, color: '#757575', marginTop: 2 }}>{cat.description}</Text>
            </View>
            <View style={{ 
              width: 32, height: 32, borderRadius: 16, 
              backgroundColor: cat.bgColor,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, color: cat.color, fontWeight: '700' }}>&gt;</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ 
          backgroundColor: '#FEF3C7', 
          borderRadius: 12, 
          padding: 16, 
          marginTop: 10,
          flexDirection: 'row', 
          alignItems: 'center' 
        }}>
          <Text style={{ fontSize: 20, marginRight: 12, color: '#F59E0B', fontWeight: '900' }}>!</Text>
          <Text style={{ fontSize: 13, color: '#92400E', flex: 1, lineHeight: 18 }}>
            Puedes personalizar tu pedido en tiempo real segun tu sabor favorito
          </Text>
        </View>

        <View style={{ 
          backgroundColor: '#fff', 
          borderRadius: 12, 
          padding: 16, 
          marginTop: 16,
          flexDirection: 'row', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Text style={{ fontSize: 16, color: '#EC3137', fontWeight: '900' }}>T</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#212121' }}>{branchName}</Text>
            <Text style={{ fontSize: 12, color: '#757575', marginTop: 2 }}>Sucursal seleccionada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}