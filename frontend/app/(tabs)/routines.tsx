import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeRoutineService } from '@/lib/services';
import type { Routine } from '@/lib/types';
import {
  Search,
  Plus,
  Clock,
  Dumbbell,
  ChevronRight,
  Filter,
  TrendingUp,
  Flame,
  Star,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const EM = '#10b981';

// Difficulty config
const DIFF = {
  beginner: { label: 'Principiante', color: '#10b981', bg: '#d1fae5', dot: '#10b981' },
  intermediate: { label: 'Intermedio', color: '#f59e0b', bg: '#fef3c7', dot: '#f59e0b' },
  advanced: { label: 'Avanzado', color: '#ef4444', bg: '#fee2e2', dot: '#ef4444' },
};

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Full Body', 'Core'];

// Category icon mapping
const CAT_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  Todos: Filter,
  Fuerza: Dumbbell,
  Cardio: Flame,
  'Full Body': TrendingUp,
  Core: Star,
};

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      }}>
      <View style={{ width: '100%', height: 160, backgroundColor: '#f4f4f5' }} />
      <View style={{ padding: 16, gap: 8 }}>
        <View style={{ height: 16, width: '60%', backgroundColor: '#f4f4f5', borderRadius: 8 }} />
        <View style={{ height: 12, width: '90%', backgroundColor: '#f4f4f5', borderRadius: 6 }} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          <View style={{ height: 10, width: 60, backgroundColor: '#f4f4f5', borderRadius: 5 }} />
          <View style={{ height: 10, width: 80, backgroundColor: '#f4f4f5', borderRadius: 5 }} />
        </View>
      </View>
    </View>
  );
}

// ─── ROUTINE CARD ─────────────────────────────────────────────────────────────
function RoutineCard({ routine, onPress }: { routine: Routine; onPress: () => void }) {
  const diff = DIFF[routine.difficulty];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      }}>
      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: routine.imageUrl }}
          style={{ width: '100%', height: 162 }}
          resizeMode="cover"
        />
        {/* Dark gradient overlay bottom */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            backgroundColor: 'rgba(0,0,0,0.38)',
          }}
        />
        {/* Difficulty badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: diff.dot }} />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 }}>
            {diff.label}
          </Text>
        </View>
        {/* Category badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: EM,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
            {routine.category}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 16, gap: 10 }}>
        {/* Title row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            style={{
              color: '#0f0f0f',
              fontWeight: '800',
              fontSize: 16,
              flex: 1,
              letterSpacing: -0.4,
              lineHeight: 21,
            }}
            numberOfLines={2}>
            {routine.name}
          </Text>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: '#f4f4f5',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}>
            <ChevronRight size={16} color="#71717a" strokeWidth={2.5} />
          </View>
        </View>

        {/* Description */}
        <Text
          style={{ color: '#71717a', fontSize: 13, lineHeight: 18, letterSpacing: -0.1 }}
          numberOfLines={2}>
          {routine.description}
        </Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#f4f4f5' }} />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: '#f0fdf4',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Clock size={13} color={EM} strokeWidth={2.2} />
            </View>
            <Text style={{ color: '#3f3f46', fontSize: 12, fontWeight: '600' }}>
              {routine.duration} min
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: '#f0fdf4',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Dumbbell size={13} color={EM} strokeWidth={2.2} />
            </View>
            <Text style={{ color: '#3f3f46', fontSize: 12, fontWeight: '600' }}>
              {routine.exercises.length} ejercicios
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function RoutinesTab() {
  const { user, activeRole } = useAppStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filtered, setFiltered] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchFocused, setSearchFocused] = useState(false);
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
    if (search.trim())
      res = res.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, activeCategory, routines]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* ── Fixed Header ─────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#0a0a0a',
          paddingTop: 58,
          paddingBottom: 20,
          paddingHorizontal: 24,
        }}>
        {/* Title row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>
              {activeRole === 'trainer' ? 'Tus programas' : 'Tu plan de entrenamiento'}
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 26,
                fontWeight: '800',
                letterSpacing: -0.8,
                marginTop: 2,
              }}>
              Rutinas
            </Text>
          </View>
          {activeRole === 'trainer' && (
            <TouchableOpacity
              onPress={() => router.push('/routines/create' as any)}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: EM,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Nueva</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: searchFocused ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: searchFocused ? EM : 'rgba(255,255,255,0.08)',
          }}>
          <Search size={17} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar rutinas..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              flex: 1,
              color: '#fff',
              fontSize: 15,
              fontWeight: '500',
              padding: 0,
            }}
          />
        </View>
      </View>

      {/* ── Category Filter ───────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 12, gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const CatIcon = CAT_ICONS[cat] ?? Filter;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: active ? '#0a0a0a' : '#f4f4f5',
                }}>
                <CatIcon
                  size={13}
                  color={active ? '#fff' : '#71717a'}
                  strokeWidth={2.2}
                />
                <Text
                  style={{
                    color: active ? '#fff' : '#71717a',
                    fontWeight: active ? '700' : '500',
                    fontSize: 13,
                    letterSpacing: 0.1,
                  }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ─────────────────────────────────────────────── */}
      {loading ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          {/* Count info */}
          {!loading && (
            <Text
              style={{
                color: '#a1a1aa',
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 16,
                letterSpacing: 0.3,
              }}>
              {filtered.length} {filtered.length === 1 ? 'rutina' : 'rutinas'}
              {activeCategory !== 'Todos' ? ` en ${activeCategory}` : ''}
            </Text>
          )}

          {filtered.length === 0 ? (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 40,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#f0f0f0',
                marginTop: 20,
              }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: '#f4f4f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                <Dumbbell size={28} color="#d4d4d8" strokeWidth={1.8} />
              </View>
              <Text
                style={{
                  color: '#0f0f0f',
                  fontWeight: '800',
                  fontSize: 17,
                  letterSpacing: -0.4,
                  marginBottom: 6,
                }}>
                Sin resultados
              </Text>
              <Text
                style={{
                  color: '#a1a1aa',
                  fontSize: 13,
                  textAlign: 'center',
                  lineHeight: 18,
                  maxWidth: 220,
                }}>
                {activeRole === 'trainer'
                  ? 'Crea tu primera rutina con el boton Nueva'
                  : 'Tu entrenador aun no ha asignado rutinas'}
              </Text>
            </View>
          ) : (
            filtered.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onPress={() => router.push(`/routines/${routine.id}` as any)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
