import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { styles } from '../styles/auth.styles';

const schema = z.object({
  full_name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Correo electrónico inválido'),
  dni: z.string().min(7, 'La cédula debe tener al menos 7 dígitos').max(8, 'Máximo 8 dígitos'),
  phone_1: z.string().regex(/^04(12|22|14|24|16|26)\d{7}$/, 'Número no válido (Ej: 04141234567)'),
  phone_2: z.string().regex(/^04(12|22|14|24|16|26)\d{7}$/, 'Número no válido').optional().or(z.literal('')),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', dni: '', phone_1: '', phone_2: '' },
  });

  const { register, login, actionLoading, error, clearAuthError } = useAuthStore();

  useEffect(() => {
    return () => clearAuthError();
  }, []);

  const onSubmit = async (data: FormValues) => {
    const success = await register({ 
      full_name: data.full_name, 
      email: data.email, 
      password: data.password,
      dni: Number(data.dni),
      phone_1: data.phone_1,
      phone_2: data.phone_2 || undefined,
    });
    
    if (success) {
      await login({ email: data.email, password: data.password });
    }
  };

  return (
    <View>
      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <Text style={styles.label}>NOMBRE COMPLETO:</Text>
      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Juan Pérez" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} style={[styles.input, errors.full_name && styles.inputError]} />
        )}
      />
      {errors.full_name && <Text style={styles.errorText}>{String(errors.full_name.message)}</Text>}

      <Text style={styles.label}>CÉDULA DE IDENTIDAD:</Text>
      <Controller
        control={control}
        name="dni"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="12345678" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} keyboardType="numeric" style={[styles.input, errors.dni && styles.inputError]} />
        )}
      />
      {errors.dni && <Text style={styles.errorText}>{String(errors.dni.message)}</Text>}

      <Text style={styles.label}>TELÉFONO PRINCIPAL:</Text>
      <Controller
        control={control}
        name="phone_1"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="04141234567" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} keyboardType="phone-pad" style={[styles.input, errors.phone_1 && styles.inputError]} />
        )}
      />
      {errors.phone_1 && <Text style={styles.errorText}>{String(errors.phone_1.message)}</Text>}

      <Text style={styles.label}>TELÉFONO SECUNDARIO (OPCIONAL):</Text>
      <Controller
        control={control}
        name="phone_2"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="04121234567" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} keyboardType="phone-pad" style={[styles.input, errors.phone_2 && styles.inputError]} />
        )}
      />
      {errors.phone_2 && <Text style={styles.errorText}>{String(errors.phone_2.message)}</Text>}

      <Text style={styles.label}>CORREO ELECTRÓNICO:</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="cliente@ejemplo.com" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} autoCapitalize="none" keyboardType="email-address" style={[styles.input, errors.email && styles.inputError]} />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{String(errors.email.message)}</Text>}

      <Text style={styles.label}>CONTRASEÑA:</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="••••••••" value={value} onChangeText={(t) => { onChange(t); clearAuthError(); }} secureTextEntry style={[styles.input, errors.password && styles.inputError]} />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{String(errors.password.message)}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={actionLoading} activeOpacity={0.8}>
        {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>CREAR CUENTA</Text>}
      </TouchableOpacity>
    </View>
  );
}