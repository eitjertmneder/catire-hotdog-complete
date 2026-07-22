import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { styles } from '../styles/auth.styles';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const { login, loading, error, clearAuthError, token } = useAuthStore();

  useEffect(() => {
    return () => clearAuthError();
  }, []);

  const onSubmit = async (data: FormValues) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    <View>
      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <Text style={styles.label}>CORREO ELECTRÓNICO:</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="cliente@ejemplo.com"
            value={value}
            onChangeText={(text) => { onChange(text); clearAuthError(); }}
            style={[styles.input, errors.email && styles.inputError]}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{String(errors.email.message)}</Text>}

      <Text style={styles.label}>CONTRASEÑA:</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="••••••••"
            value={value}
            onChangeText={(text) => { onChange(text); clearAuthError(); }}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{String(errors.password.message)}</Text>}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}