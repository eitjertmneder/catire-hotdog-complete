import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const GoogleMapsScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ padding: 16, backgroundColor: '#EC3137', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>Mapa de Sucursales</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 8 }}>Mapa de Sucursales</Text>
        <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 }}>
          Proximamente podras ver todas las sucursales en un mapa interactivo.
        </Text>
      </View>
    </SafeAreaView>
  );
};