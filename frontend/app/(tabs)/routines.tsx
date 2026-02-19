import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeRoutineService } from '@/lib/services';
import type { Routine } from '@/lib/types';

const DIFFICULTIES = {
  beginner: { label: 'Principiante', color: '#16a34a', bg: '#dcfce7' },
  intermediate: { label: 'Intermedio', color: '#d97706', bg: '#fef3c7' },
  advanced: { label: 'Avanzado', color: '#dc2626', bg: '#fee2e2' },
};

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Full Body', 'Core'];

export default function RoutinesTab() {
  const { user, activeRole } = useAppStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filtered, setFiltered] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fn =
      activeRole === 'trainer'
        ? FakeRoutineService.getByTrainerId(user.id)
        : FakeRoutineService.getByUserId(user.id);
    fn.then((data) => {
      setRoutines(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, [user, activeRole]);

  useEffect(() => {
    let res = routines;
    if (activeCategory !== 'Todos') res = res.filter((r) => r.category === activeCategory);
    if (search) res = res.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, activeCategory, routines]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold" style={{ fontSize: 26 }}>
            Mis Rutinas
          </Text>
          {activeRole === 'trainer' && (
            <TouchableOpacity
              onPress={() => router.push('/routines/create')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}>
              <Text className="text-white font-bold text-sm">+ Nueva</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar rutinas..."
          className="bg-white/20 text-white rounded-2xl px-4 py-3"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeCategory === cat ? '#0d9e6e' : '#f1f5f9',
              borderWidth: 1,
              borderColor: activeCategory === cat ? '#0d9e6e' : 'transparent',
            }}>
            <Text
              style={{
                color: activeCategory === cat ? '#fff' : '#64748b',
                fontWeight: '600',
                fontSize: 13,
              }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0d9e6e" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="items-center mt-16">
              <Text style={{ fontSize: 60 }}>🏋️</Text>
              <Text className="text-foreground font-bold text-lg mt-4">Sin rutinas</Text>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                {activeRole === 'trainer'
                  ? 'Crea tu primera rutina'
                  : 'Tu entrenador aún no asignó rutinas'}
              </Text>
            </View>
          ) : (
            filtered.map((routine) => {
              const diff = DIFFICULTIES[routine.difficulty];
              return (
                <TouchableOpacity
                  key={routine.id}
                  onPress={() => router.push(`/routines/${routine.id}` as any)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    overflow: 'hidden',
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 4,
                  }}>
                  <Image
                    source={{ uri: routine.imageUrl }}
                    style={{ width: '100%', height: 150 }}
                  />
                  <View style={{ padding: 16 }}>
                    <View className="flex-row justify-between items-start">
                      <Text
                        className="text-foreground font-bold"
                        style={{ fontSize: 17, flex: 1 }}>
                        {routine.name}
                      </Text>
                      <View
                        style={{
                          backgroundColor: diff.bg,
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginLeft: 8,
                        }}>
                        <Text
                          style={{ color: diff.color, fontSize: 11, fontWeight: '700' }}>
                          {diff.label}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-muted-foreground text-sm mt-1"
                      numberOfLines={2}>
                      {routine.description}
                    </Text>
                    <View className="flex-row gap-4 mt-3">
                      <Text className="text-muted-foreground text-xs">
                        ⏱ {routine.duration} min
                      </Text>
                      <Text className="text-muted-foreground text-xs">
                        💪 {routine.exercises.length} ejercicios
                      </Text>
                      <Text className="text-muted-foreground text-xs">
                        🏷 {routine.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
