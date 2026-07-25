import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface EmailTemplate {
  id: string;
  title: string;
  description: string;
  preview: string;
  icon: string;
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    title: 'Bienvenida',
    description: 'Enviado cuando el usuario se registra',
    preview: '¡Bienvenido a Catire! Tu cuenta ha sido creada exitosamente.',
    icon: '\u{1F44B}',
  },
  {
    id: 'order_confirmed',
    title: 'Pedido Confirmado',
    description: 'Enviado cuando se crea un pedido',
    preview: 'Tu pedido #1234 ha sido confirmado y está en preparación.',
    icon: '\u{1F6D2}',
  },
  {
    id: 'order_ready',
    title: 'Pedido Listo',
    description: 'Enviado cuando el pedido está listo para recoger',
    preview: '¡Tu pedido #1234 está listo para recoger!',
    icon: '\u{2705}',
  },
  {
    id: 'promotion',
    title: 'Promoción',
    description: 'Correos de promociones y ofertas especiales',
    preview: '¡No te pierdas nuestro 20% de descuento en todo el menú!',
    icon: '\u{1F3F7}\uFE0F',
  },
  {
    id: 'reminder',
    title: 'Recordatorio',
    description: 'Correos de recordatorio para pedidos pendientes',
    preview: 'Tienes un pedido pendiente. ¿Deseas completarlo ahora?',
    icon: '\u{23F0}',
  },
];

export const EmailTemplatesScreen = () => {
  const navigation = useNavigation();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    welcome: true,
    order_confirmed: true,
    order_ready: true,
    promotion: false,
    reminder: true,
  });

  const toggleSwitch = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        backgroundColor: '#EC3137',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{'\u{2190}'} Volver</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 }}>
          {'\u{2709}\uFE0F'} Plantillas de Email
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {TEMPLATES.map((template) => (
          <View
            key={template.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{template.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{template.title}</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{template.description}</Text>
              </View>
              <Switch
                value={toggles[template.id]}
                onValueChange={() => toggleSwitch(template.id)}
                trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                thumbColor={toggles[template.id] ? '#059669' : '#F1F5F9'}
              />
            </View>
            <View style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              padding: 12,
              borderLeftWidth: 3,
              borderLeftColor: toggles[template.id] ? '#059669' : '#CBD5E1',
            }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4 }}>VISTA PREVIA</Text>
              <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>{template.preview}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
