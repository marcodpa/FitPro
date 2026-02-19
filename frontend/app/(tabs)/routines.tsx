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
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeRoutineService } from '@/lib/services';
import { COLORS } from '@/lib/theme';
import type { Routine } from '@/lib/types';
import {
  Search,
  Plus,
  Clock,
  Dumbbell,
  ChevronRight,
  Flame,
  Layers,
  Activity,
  Target,
  Play,
  X,
  SlidersHorizontal,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const AC = COLORS.accent.DEFAULT;

// ─── Config ───────────────────────────────────────────────────────────────────
const DIFFICULTY_CFG = {
  beginner: { label: 'Principiante', color: COLORS.beginner },
  intermediate: { label: 'Intermedio', color: COLORS.intermediate },
  advanced: { label: 'Avanzado', color: COLORS.advanced },
} as const;

type DiffKey = keyof typeof DIFFICULTY_CFG;

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Full Body', 'Core'] as const;

const CAT_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  Todos: Layers,
  Fuerza: Dumbbell,
  Cardio: Flame,
  'Full Body': Activity,
  Core: Target,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: COLORS.bg.secondary,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.bg.border,
      }}>
      <View style={{ width: '100%', height: 180, backgroundColor: COLORS.bg.tertiary }} />
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ height: 15, width: '55%', backgroundColor: COLORS.bg.elevated, borderRadius: 8 }} />
        <View style={{ height: 12, width: '85%', backgroundColor: COLORS.bg.elevated, borderRadius: 6 }} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <View style={{ height: 10, width: 64, backgroundColor: COLORS.bg.elevated, borderRadius: 5 }} />
          <View style={{ height: 10, width: 80, backgroundColor: COLORS.bg.elevated, borderRadius: 5 }} />
        </View>
      </View>
    </View>
  );
}

// ─── Routine Card ─────────────────────────────────────────────────────────────
function RoutineCard({ routine, onPress }: { routine: Routine; onPress: () => void }) {
  const diff = DIFFICULTY_CFG[routine.difficulty as DiffKey];
  const muscles = Array.from(new Set(routine.exercises.map((e) => e.exercise.muscle))).slice(0, 3);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        backgroundColor: COLORS.bg.secondary,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.bg.border,
      }}>

      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: routine.imageUrl }}
          style={{ width: '100%', height: 190 }}
          resizeMode="cover"
        />
        {/* Dark gradient */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            backgroundColor: 'rgba(0,0,0,0)',
            // Simulate gradient with two overlapping views
          }}
        />
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(8,8,8,0.35)',
          }}
        />

        {/* Top badges */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            flexDirection: 'row',
            gap: 7,
          }}>
          {/* Difficulty */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: 'rgba(8,8,8,0.7)',
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: diff.color + '40',
            }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: diff.color,
              }}
            />
            <Text
              style={{
                color: '#fff',
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.3,
              }}>
              {diff.label.toUpperCase()}
            </Text>
          </View>

          {/* Category */}
          <View
            style={{
              backgroundColor: COLORS.accent.dim,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: COLORS.accent.dimMid,
            }}>
            <Text
              style={{ color: AC, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
              {routine.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Play button */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: AC,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Play size={17} color={COLORS.text.inverse} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Bottom gradient name */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 14,
            paddingTop: 40,
            backgroundColor: 'rgba(8,8,8,0.6)',
          }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '800',
              fontSize: 18,
              letterSpacing: -0.5,
              lineHeight: 22,
            }}
            numberOfLines={1}>
            {routine.name}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 16, gap: 12 }}>
        {/* Description */}
        <Text
          style={{
            color: COLORS.text.secondary,
            fontSize: 13,
            lineHeight: 19,
            letterSpacing: -0.1,
          }}
          numberOfLines={2}>
          {routine.description}
        </Text>

        {/* Muscle tags */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {muscles.map((m) => (
            <View
              key={m}
              style={{
                backgroundColor: COLORS.bg.tertiary,
                borderRadius: 8,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: COLORS.bg.border,
              }}>
              <Text
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  fontWeight: '600',
                }}>
                {m}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: COLORS.bg.border }} />

        {/* Stats row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* Duration */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: COLORS.accent.dim,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Clock size={13} color={AC} strokeWidth={2.2} />
              </View>
              <Text style={{ color: COLORS.text.primary, fontSize: 13, fontWeight: '600' }}>
                {routine.duration} min
              </Text>
            </View>

            {/* Exercises */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: COLORS.accent.dim,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Dumbbell size={13} color={AC} strokeWidth={2.2} />
              </View>
              <Text style={{ color: COLORS.text.primary, fontSize: 13, fontWeight: '600' }}>
                {routine.exercises.length} ejercicios
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              backgroundColor: COLORS.bg.elevated,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.bg.borderStrong,
            }}>
            <ChevronRight size={15} color={COLORS.text.tertiary} strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isTrainer }: { isTrainer: boolean }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.bg.secondary,
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.bg.borderStrong,
        marginTop: 20,
      }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: COLORS.bg.elevated,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: COLORS.bg.border,
        }}>
        <Dumbbell size={28} color={COLORS.text.tertiary} strokeWidth={1.5} />
      </View>
      <Text
        style={{
          color: COLORS.text.primary,
          fontWeight: '800',
          fontSize: 17,
          letterSpacing: -0.4,
          marginBottom: 8,
        }}>
        Sin resultados
      </Text>
      <Text
        style={{
          color: COLORS.text.secondary,
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 19,
          maxWidth: 230,
        }}>
        {isTrainer
          ? 'Crea tu primera rutina con el botón Nueva.'
          : 'Tu entrenador aún no ha asignado rutinas para ti.'}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoutinesTab() {
  const { user, activeRole } = useAppStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filtered, setFiltered] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const router = useRouter();
  const isTrainer = activeRole === 'trainer';

  useEffect(() => {
    if (!user) return;
    const fn = isTrainer
      ? FakeRoutineService.getByTrainerId(user.id)
      : FakeRoutineService.getByUserId(user.id);
    fn.then((data) => {
      setRoutines(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, [user, activeRole]);

  useEffect(() => {
    let res = routines;
    if (activeCategory !== 'Todos')
      res = res.filter((r) => r.category === activeCategory);
    if (search.trim())
      res = res.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(res);
  }, [search, activeCategory, routines]);

  const clearSearch = () => setSearch('');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg.primary }}>
      <StatusBar barStyle="light-content" />

      {/* ── Fixed Header ────────────────────────────────── */}
      <View
        style={{
          backgroundColor: COLORS.bg.primary,
          paddingTop: 60,
          paddingBottom: 16,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.bg.border,
        }}>

        {/* Title row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 18,
          }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: COLORS.text.secondary, fontSize: 13, fontWeight: '500' }}>
              {isTrainer ? 'Tus programas' : 'Tu plan de entrenamiento'}
            </Text>
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 30,
                fontWeight: '800',
                letterSpacing: -1,
              }}>
              Rutinas
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            {/* Filter btn */}
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.bg.secondary,
                borderWidth: 1,
                borderColor: COLORS.bg.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SlidersHorizontal size={17} color={COLORS.text.secondary} strokeWidth={2} />
            </TouchableOpacity>

            {isTrainer && (
              <TouchableOpacity
                onPress={() => router.push('/routines/create' as any)}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: AC,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Plus size={16} color={COLORS.text.inverse} strokeWidth={2.8} />
                <Text
                  style={{
                    color: COLORS.text.inverse,
                    fontWeight: '800',
                    fontSize: 13,
                    letterSpacing: -0.2,
                  }}>
                  Nueva
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: COLORS.bg.secondary,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1.5,
            borderColor: searchFocused ? AC : COLORS.bg.border,
          }}>
          <Search
            size={16}
            color={searchFocused ? AC : COLORS.text.tertiary}
            strokeWidth={2}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar rutinas..."
            placeholderTextColor={COLORS.text.tertiary}
            style={{
              flex: 1,
              color: COLORS.text.primary,
              fontSize: 15,
              fontWeight: '500',
              padding: 0,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: COLORS.bg.elevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <X size={11} color={COLORS.text.secondary} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category Filter ─────────────────────────────── */}
      <View
        style={{
          backgroundColor: COLORS.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.bg.border,
        }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const CatIcon = CAT_ICONS[cat] ?? Layers;
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
                  paddingVertical: 9,
                  borderRadius: 11,
                  backgroundColor: active ? AC : COLORS.bg.secondary,
                  borderWidth: 1,
                  borderColor: active ? AC : COLORS.bg.border,
                }}>
                <CatIcon
                  size={13}
                  color={active ? COLORS.text.inverse : COLORS.text.secondary}
                  strokeWidth={2.2}
                />
                <Text
                  style={{
                    color: active ? COLORS.text.inverse : COLORS.text.secondary,
                    fontWeight: active ? '800' : '600',
                    fontSize: 13,
                    letterSpacing: active ? -0.1 : 0,
                  }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ────────────────────────────────────────── */}
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}>

          {/* Count + diff legend */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
            <Text
              style={{
                color: COLORS.text.tertiary,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}>
              {filtered.length} {filtered.length === 1 ? 'RUTINA' : 'RUTINAS'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {(
                [
                  { key: 'beginner', label: 'Fácil' },
                  { key: 'intermediate', label: 'Medio' },
                  { key: 'advanced', label: 'Difícil' },
                ] as { key: DiffKey; label: string }[]
              ).map(({ key, label }) => (
                <View
                  key={key}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: DIFFICULTY_CFG[key].color,
                    }}
                  />
                  <Text
                    style={{
                      color: COLORS.text.tertiary,
                      fontSize: 10,
                      fontWeight: '600',
                    }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState isTrainer={isTrainer} />
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
