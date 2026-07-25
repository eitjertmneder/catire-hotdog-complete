import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Challenge {
  id: string;
  name: string;
  description: string;
  points: number;
  branches: string[];
  expiryDate: string;
  status: 'active' | 'completed';
}

const BRANCH_OPTIONS = [
  'Barrio Sucre',
  'Carabobo',
  'El Malecon',
  'Prados del Este',
  'Barrio Obrero',
  'La Asogata',
  'La Grita',
  'Sambil',
  'Mestizos',
];

export const GamificationScreen = () => {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [expiryDate, setExpiryDate] = useState('');

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleCreate = () => {
    if (!name.trim() || !description.trim() || !points.trim() || selectedBranches.length === 0 || !expiryDate.trim()) {
      return;
    }
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      points: parseInt(points, 10),
      branches: [...selectedBranches],
      expiryDate: expiryDate.trim(),
      status: 'active',
    };
    setChallenges((prev) => [...prev, newChallenge]);
    setName('');
    setDescription('');
    setPoints('');
    setSelectedBranches([]);
    setExpiryDate('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#EC3137',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 20, color: '#FFFFFF' }}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>
          {'\uD83C\uDCAF'} Retos
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Create Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: '#EC3137',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            {'\u2795'} Crear Reto
          </Text>
        </TouchableOpacity>

        {/* Challenges List */}
        {challenges.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48 }}>{'\uD83C\uDFAF'}</Text>
            <Text style={{ fontSize: 15, color: '#999999', marginTop: 12 }}>
              No hay retos creados
            </Text>
          </View>
        ) : (
          challenges.map((challenge) => (
            <View
              key={challenge.id}
              style={{
                backgroundColor: challenge.status === 'completed' ? '#E8F5E9' : '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: challenge.status === 'completed' ? '#4CAF50' : '#E0E0E0',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#333333', flex: 1 }}>
                  {challenge.name}
                </Text>
                <View
                  style={{
                    backgroundColor: challenge.status === 'active' ? '#4CAF50' : '#9E9E9E',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '600' }}>
                    {challenge.status === 'active' ? 'Activo' : 'Completado'}
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 13, color: '#666666', marginBottom: 10, lineHeight: 18 }}>
                {challenge.description}
              </Text>

              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#EC3137', fontWeight: '700' }}>
                  {'\u2B50'} {challenge.points} pts
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {challenge.branches.map((branch) => (
                  <View
                    key={branch}
                    style={{
                      backgroundColor: '#FFF3E0',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#E65100' }}>{branch}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: 12, color: '#999999' }}>
                {'\u23F0'} Expira: {challenge.expiryDate}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 36,
              maxHeight: '90%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 19, fontWeight: '700', color: '#333333' }}>
                {'\uD83C\uDFAF'} Crear Reto
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 24, color: '#999999' }}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 6 }}>
                Nombre del reto
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej: Venta del mes"
                placeholderTextColor="#BBBBBB"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 16,
                  color: '#333333',
                }}
              />

              {/* Description */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 6 }}>
                Descripcion
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Descripcion del reto..."
                placeholderTextColor="#BBBBBB"
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 16,
                  color: '#333333',
                  textAlignVertical: 'top',
                  minHeight: 80,
                }}
              />

              {/* Points */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 6 }}>
                Puntos de recompensa
              </Text>
              <TextInput
                value={points}
                onChangeText={setPoints}
                placeholder="Ej: 100"
                placeholderTextColor="#BBBBBB"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 16,
                  color: '#333333',
                }}
              />

              {/* Branches */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 8 }}>
                Sedes participantes
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {BRANCH_OPTIONS.map((branch) => {
                  const isSelected = selectedBranches.includes(branch);
                  return (
                    <TouchableOpacity
                      key={branch}
                      onPress={() => toggleBranch(branch)}
                      style={{
                        backgroundColor: isSelected ? '#EC3137' : '#F5F5F5',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginRight: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? '#EC3137' : '#E0E0E0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: isSelected ? '#FFFFFF' : '#555555',
                          fontWeight: isSelected ? '700' : '400',
                        }}
                      >
                        {isSelected ? '\u2713 ' : ''}{branch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Expiry Date */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 6 }}>
                Fecha de expiracion
              </Text>
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#BBBBBB"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 20,
                  color: '#333333',
                }}
              />

              {/* Submit */}
              <TouchableOpacity
                onPress={handleCreate}
                style={{
                  backgroundColor: '#EC3137',
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  Crear Reto
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
