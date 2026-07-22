import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Product, ProductDTO } from '../../../models/Product';
import { styles } from '../../../../../shared/styles/admin.styles';

const STATIC_CATEGORIES = [
  { id: 1, name: 'Perros' },
  { id: 2, name: 'Hamburguesas' },
  { id: 3, name: 'Salchipapas' },
  { id: 4, name: 'Bebidas' }
];

export const ProductForm = ({ route }: any) => {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { menus, addProduct, editProduct, fetchMenus, loading, actionLoading } = useCatalogStore();
  
  const productToEdit: Product | undefined = route.params?.product; 
  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [menuId, setMenuId] = useState<number | string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (token && menus.length === 0) {
      fetchMenus(token);
    }
  }, [token, menus.length]);

  useEffect(() => {
    if (isEditing && productToEdit) {
      setName(productToEdit.name);
      setImgSrc(productToEdit.img_src || '');
      setMenuId(productToEdit.menu_id);
      setCategoryId(productToEdit.category_id);
    } else {
      if (menus.length > 0) setMenuId(menus[0].id);
      setCategoryId(STATIC_CATEGORIES[0].id);
    }
  }, [isEditing, productToEdit, menus]);

  const handleSave = async () => {
    if (!token || !name || !menuId || !categoryId) return;

    const payload: ProductDTO = {
      name,
      img_src: imgSrc,
      menu_id: Number(menuId),
      category_id: categoryId
    };

    if (isEditing && productToEdit) {
      await editProduct(token, productToEdit.id, payload);
    } else {
      await addProduct(token, payload);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Nombre del Producto</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Ej: Perro Caliente Especial" 
        />

        <Text style={styles.label}>URL de la Imagen</Text>
        <TextInput 
          style={styles.input} 
          value={imgSrc} 
          onChangeText={setImgSrc} 
          placeholder="https://tu-almacenamiento.com/imagen.jpg" 
        />

        <Text style={styles.label}>Menú de pertenencia</Text>
        {loading && menus.length === 0 ? (
          <ActivityIndicator size="small" color="#FFB800" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.categoryRow}>
            {menus.map((m) => (
              <TouchableOpacity 
                key={m.id} 
                style={[styles.categoryPill, menuId === m.id && styles.categoryPillSelected]}
                onPress={() => setMenuId(m.id)}
              >
                <Text style={[styles.categoryPillText, menuId === m.id && styles.categoryPillTextSelected]}>
                  {m.name}
                </Text>
              </TouchableOpacity>
            ))}
            {menus.length === 0 && (
              <Text style={styles.emptyText}>No hay menús guardados. Crea uno primero.</Text>
            )}
          </View>
        )}

        <Text style={styles.label}>Categoría Estática</Text>
        <View style={styles.categoryRow}>
          {STATIC_CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.categoryPill, categoryId === cat.id && styles.categoryPillSelected]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.categoryPillText, categoryId === cat.id && styles.categoryPillTextSelected]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, (actionLoading || !menuId) && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={actionLoading || !menuId}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Producto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};