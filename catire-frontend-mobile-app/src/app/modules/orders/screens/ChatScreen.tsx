import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useChatStore, ChatMessage } from '../../../shared/store/chat.store';
import { theme } from '../../../shared/styles/theme';

export const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { getMessages, sendMessage, markAsRead } = useChatStore();
  
  const orderId = route.params?.orderId || '';
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const messages = getMessages(orderId);

  useEffect(() => {
    markAsRead(orderId);
  }, []);

  const handleSend = () => {
    if (!message.trim() || !user) return;
    
    sendMessage(orderId, user.id, user.full_name, message.trim());
    setMessage('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === user?.id;
    
    return (
      <View style={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        backgroundColor: isMe ? theme.colors.primary : theme.colors.white,
        borderRadius: 16,
        borderBottomRightRadius: isMe ? 4 : 16,
        borderBottomLeftRadius: isMe ? 16 : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '75%',
        marginBottom: 8,
      }}>
        {!isMe && (
          <Text style={{ fontSize: 11, color: isMe ? '#FFCDD2' : theme.colors.textMuted, marginBottom: 2 }}>
            {item.sender_name}
          </Text>
        )}
        <Text style={{ fontSize: 15, color: isMe ? '#fff' : theme.colors.textPrimary }}>
          {item.message}
        </Text>
        <Text style={{ fontSize: 10, color: isMe ? '#FFCDD2' : theme.colors.textMuted, textAlign: 'right', marginTop: 4 }}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
            Chat - Pedido #{orderId.slice(0, 8)}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
            {user?.role?.name === 'employee' ? 'Comun�cate con el cliente' : 'Comun�cate con el trabajador'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 100 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4AC}'}</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: 'center' }}>
              Inicia una conversaci�n sobre este pedido
            </Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              backgroundColor: theme.colors.background,
            }}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: message.trim() ? theme.colors.primary : theme.colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Text style={{ fontSize: 18 }}>{'\u{27A4}'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



