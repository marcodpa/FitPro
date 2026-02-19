import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';

const ROLE_OPTIONS: { label: string; value: UserRole; icon: string; color: string }[] = [
  { label: 'Cliente', value: 'client', icon: '🏃', color: '#0d9e6e' },
  { label: 'Entrenador', value: 'trainer', icon: '🏋️', color: '#2563eb' },
  { label: 'Admin', value: 'admin', icon: '👑', color: '#7c3aed' },
  { label: 'Usuario', value: 'user', icon: '🙋', color: '#64748b' },
];

export default function ProfileTab() {
  const {
    user,
    logout,
    activeRole,
    setRole,
    isOffline,
    toggleOffline,
    isDarkMode,
    toggleDarkMode,
    voiceEnabled,
    toggleVoice,
  } = useAppStore();
  const router = useRouter();
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 56,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          alignItems: 'center',
        }}>
        <Image
          source={{ uri: user?.avatar }}
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            borderWidth: 4,
            borderColor: '#fff',
            marginBottom: 12,
          }}
        />
        <Text className="text-white font-bold" style={{ fontSize: 22 }}>
          {user?.name}
        </Text>
        <Text className="text-white/70 text-sm">{user?.email}</Text>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginTop: 8,
          }}>
          <Text className="text-white font-semibold text-sm capitalize">{activeRole}</Text>
        </View>
      </View>

      <View className="px-6 pt-6">
        {/* Stats */}
        <View
          className="flex-row gap-3 mb-6">
          {[
            { label: 'Sesiones', value: '14', icon: '🏋️' },
            { label: 'Rutinas', value: '4', icon: '📋' },
            { label: 'Seguidores', value: '28', icon: '👥' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#f1f5f9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
              <Text className="text-foreground font-bold text-xl mt-1">{stat.value}</Text>
              <Text className="text-muted-foreground text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit profile */}
        <TouchableOpacity
          onPress={() => router.push('/profile/edit' as any)}
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#e2f8f0',
            shadowColor: '#0d9e6e',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#e2f8f0',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 22 }}>✏️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">Editar Perfil</Text>
            <Text className="text-muted-foreground text-xs">Nombre, bio, peso, altura, objetivo</Text>
          </View>
          <Text className="text-muted-foreground">›</Text>
        </TouchableOpacity>

        {/* Settings section */}
        <Text className="text-foreground font-bold text-base mb-3">Configuración</Text>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#f1f5f9',
            marginBottom: 20,
          }}>
          {[
            {
              icon: '🌙',
              label: 'Modo Oscuro',
              value: isDarkMode,
              toggle: toggleDarkMode,
            },
            {
              icon: '📵',
              label: 'Modo Offline',
              value: isOffline,
              toggle: toggleOffline,
            },
            {
              icon: '🎤',
              label: 'Comandos de Voz',
              value: voiceEnabled,
              toggle: toggleVoice,
            },
          ].map((item, i) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: i < 2 ? 1 : 0,
                borderBottomColor: '#f8fafc',
              }}>
              <Text style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{item.icon}</Text>
              <Text className="text-foreground font-medium text-sm flex-1">{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.toggle}
                trackColor={{ false: '#e2e8f0', true: '#86efac' }}
                thumbColor={item.value ? '#0d9e6e' : '#94a3b8'}
              />
            </View>
          ))}
        </View>

        {/* Role switcher (demo) */}
        <Text className="text-foreground font-bold text-base mb-3">Cambiar Rol (Demo)</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {ROLE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r.value}
              onPress={() => setRole(r.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 14,
                backgroundColor: activeRole === r.value ? r.color : '#f1f5f9',
                borderWidth: 2,
                borderColor: activeRole === r.value ? r.color : 'transparent',
              }}>
              <Text style={{ fontSize: 18 }}>{r.icon}</Text>
              <Text
                style={{
                  color: activeRole === r.value ? '#fff' : '#64748b',
                  fontWeight: '600',
                  fontSize: 13,
                }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu items */}
        <Text className="text-foreground font-bold text-base mb-3">Más opciones</Text>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#f1f5f9',
            marginBottom: 20,
          }}>
          {[
            { icon: '📅', label: 'Calendario', route: '/calendar' },
            { icon: '💳', label: 'Planes y Pagos', route: '/payments' },
            { icon: '📚', label: 'Biblioteca Ejercicios', route: '/exercises' },
            { icon: '🔒', label: 'Privacidad', route: null },
            { icon: '🆘', label: 'Ayuda y Soporte', route: null },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => item.route && router.push(item.route as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: i < 4 ? 1 : 0,
                borderBottomColor: '#f8fafc',
              }}>
              <Text style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{item.icon}</Text>
              <Text className="text-foreground font-medium text-sm flex-1">{item.label}</Text>
              <Text className="text-muted-foreground">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User info */}
        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}>
          <Text className="text-muted-foreground text-xs font-medium mb-3 uppercase tracking-wider">
            Información Personal
          </Text>
          {[
            { label: 'Objetivo', value: user?.goal },
            { label: 'Peso', value: `${user?.weight} kg` },
            { label: 'Altura', value: `${user?.height} cm` },
            { label: 'Miembro desde', value: user?.joinedAt },
          ].map((info) => (
            <View key={info.label} className="flex-row justify-between py-1.5">
              <Text className="text-muted-foreground text-sm">{info.label}</Text>
              <Text className="text-foreground text-sm font-medium">{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#fee2e2',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 40,
            borderWidth: 1,
            borderColor: '#fecaca',
          }}>
          <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 15 }}>
            🚪 Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
