import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { useCatalogStore } from '../../../store/catalog.store';
import { Branch } from '../../../models/Branch';
import { getStyles } from '../styles/branch.styles';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

export default function BranchList() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token);
  const { branches, loading, fetchBranches, error } = useCatalogStore();
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    if (token) {
      fetchBranches(token);
    }
  }, [token]);

  const handleRefresh = () => {
    if (token) fetchBranches(token);
  };

  const renderBranch = ({ item }: { item: Branch }) => (
    <View style={styles.card}>
      <Text style={styles.branchName}>{item.name}</Text>
      <Text style={styles.branchInfo}>Coordenadas: {item.coordinates_lat}, {item.coordinates_long}</Text>
      
      <TouchableOpacity 
        style={styles.buttonPrimary}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('MenuList')}
      >
        <Text style={styles.buttonTextPrimary}>VER MENÚS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Nuestras Sucursales</Text>
        <Text style={styles.headerSubtitle}>Elige dónde quieres comer hoy.</Text>

        <TouchableOpacity 
          style={[styles.buttonSecondary, { marginBottom: 20 }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BranchesMap')}
        >
          <Text style={styles.buttonTextSecondary}>UBICAR EN EL MAPA</Text>
        </TouchableOpacity>

        {loading && !branches.length ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBranch}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.branchInfo}>No hay sucursales disponibles por el momento.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}