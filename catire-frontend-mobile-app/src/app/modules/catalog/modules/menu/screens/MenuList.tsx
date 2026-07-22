import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from '../styles/menu.styles';
import { useCatalogStore } from '../../../store/catalog.store';
import { ProductsList } from '../../products/screens/ProductsList';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { theme } from '../../../../../shared/styles/theme';

const MenuAccordion = ({ item }: { item: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity 
        style={{
          ...styles.accordionHeader,
          borderBottomLeftRadius: isExpanded ? 0 : 12,
          borderBottomRightRadius: isExpanded ? 0 : 12,
          borderBottomWidth: isExpanded ? 0 : 3,
        }} 
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.menuTitle}>{item.name}</Text>
        <Text style={styles.accordionIcon}>{isExpanded ? '−' : '+'}</Text> 
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          <ProductsList products={item.products || []} />
        </View>
      )}
    </View>
  );
};

export const MenuList = () => {
  const { token } = useAuthStore();
  const { menus = [], fetchMenus, loading } = useCatalogStore();

  useEffect(() => {
    if(token) {
      fetchMenus(token);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Lista de Menús</Text>
        <Text style={styles.headerSubtitle}>Selecciona tu menú de preferencia, y ve pensando qué vas a comer.</Text>
        
        {loading && menus.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {menus.map((item) => (
              <MenuAccordion key={item.id.toString()} item={item} />
            ))}

            <View style={{ height: 50 }} /> 
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};