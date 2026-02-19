import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FakeExerciseService } from '@/lib/services';
import type { Exercise } from '@/lib/types';

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Core'];
const MUSCLES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Abdomen', 'Cuerpo completo'];
const DIFFICULTY_STYLES = {
  beginner: { bg: '#dcfce7', color: '#16a34a', label: 'Principiante' },
  intermediate: { bg: '#fef3c7', color: '#d97706', label: 'Intermedio' },
  advanced: { bg: '#fee2e2', color: '#dc2626', label: 'Avanzado' },
};

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeMuscle, setActiveMuscle] = useState('Todos');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const router = useRouter();

  useEffect(() => {
    FakeExerciseService.getAll()
      .then((data) => {
        setExercises(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = exercises;
    if (activeCategory !== 'Todos') res = res.filter((e) => e.category === activeCategory);
    if (activeMuscle !== 'Todos') res = res.filter((e) => e.muscle === activeMuscle);
    if (search) res = res.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, activeCategory, activeMuscle, exercises]);

  if (selected) {
    const diff = DIFFICULTY_STYLES[selected.difficulty];
    return (
      <View className="flex-1 bg-background">
        <ScrollView>
          <Image source={{ uri: selected.imageUrl }} style={{ width: '100%', height: 260 }} />
          <View
            style={{
              position: 'absolute',
              top: 52,
              left: 16,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              padding: 10,
            }}>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
            </TouchableOpacity>
          </View>
          <View className="px-6 pt-5">
            <View className="flex-row items-center gap-3 mb-2">
              <View style={{ backgroundColor: diff.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: diff.color, fontSize: 12, fontWeight: '700' }}>{diff.label}</Text>
              </View>
              <Text className="text-muted-foreground text-sm">{selected.category} • {selected.muscle}</Text>
            </View>
            <Text className="text-foreground font-bold" style={{ fontSize: 26, marginBottom: 8 }}>{selected.name}</Text>
            <Text className="text-muted-foreground text-base leading-6 mb-6">{selected.description}</Text>

            {/* Video mock */}
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                height: 180,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>▶️</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                Video demostrativo
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                (Mock — conectar con API)
              </Text>
            </View>

            <Text className="text-foreground font-bold text-lg mb-3">Instrucciones</Text>
            {selected.instructions.map((step, i) => (
              <View key={i} className="flex-row gap-3 mb-3">
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#0d9e6e',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text className="text-foreground text-sm leading-5 flex-1">{step}</Text>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View
        style={{
          backgroundColor: '#ea580c',
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-white/80">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold" style={{ fontSize: 26 }}>
          Biblioteca 📚
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar ejercicio..."
          className="bg-white/20 text-white rounded-2xl px-4 py-3 mt-4"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeCategory === cat ? '#ea580c' : '#f1f5f9',
            }}>
            <Text style={{ color: activeCategory === cat ? '#fff' : '#64748b', fontWeight: '600', fontSize: 13 }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View className="flex-row flex-wrap gap-3">
            {filtered.map((ex) => {
              const diff = DIFFICULTY_STYLES[ex.difficulty];
              return (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => setSelected(ex)}
                  style={{
                    width: '47%',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#f1f5f9',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 3,
                  }}>
                  <Image source={{ uri: ex.imageUrl }} style={{ width: '100%', height: 110 }} />
                  <View style={{ padding: 12 }}>
                    <View style={{ backgroundColor: diff.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 }}>
                      <Text style={{ color: diff.color, fontSize: 10, fontWeight: '700' }}>{diff.label}</Text>
                    </View>
                    <Text className="text-foreground font-bold text-sm" numberOfLines={2}>{ex.name}</Text>
                    <Text className="text-muted-foreground text-xs mt-1">{ex.muscle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
