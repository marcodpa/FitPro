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
import { useAppStore, useTheme } from '@/lib/store';
import { FakeRoutineService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
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

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Full Body', 'Core'] as const;
const CAT_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  Todos:      Layers,
  Fuerza:     Dumbbell,
  Cardio:     Flame,
  'Full Body': Activity,
  Core:       Target,
};

type DiffKey = 'beginner' | 'intermediate' | 'advanced';
const DIFF_LABEL: Record<DiffKey, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: t.border.subtle }}>
      <View style={{ width: '100%', height: 180, backgroundColor: t.bg.tertiary }} />
      <View style={{ padding: SPACING.lg, gap: 10 }}>
        <View style={{ height: 15, width: '55%', backgroundColor: t.bg.elevated, borderRadius: 8 }} />
        <View style={{ height: 12, width: '85%', backgroundColor: t.bg.elevated, borderRadius: 6 }} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <View style={{ height: 10, width: 64, backgroundColor: t.bg.elevated, borderRadius: 5 }} />
          <View style={{ height: 10, width: 80, backgroundColor: t.bg.elevated, borderRadius: 5 }} />
        </View>
      </View>
    </View>
  );
}

// ─── Routine Card ─────────────────────────────────────────────────────────────
function RoutineCard({ routine, onPress }: { routine: Routine; onPress: () => void }) {
  const t = useTheme();
  const diffColor = { beginner: t.beginner, intermediate: t.intermediate, advanced: t.advanced }[routine.difficulty as DiffKey] ?? t.text.secondary;
  const diffLabel = DIFF_LABEL[routine.difficulty as DiffKey] ?? routine.difficulty;
  const muscles = Array.from(new Set(routine.exercises.map((e) => e.exercise.muscle))).slice(0, 3);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: t.border.subtle }}>

      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: routine.imageUrl }} style={{ width: '100%', height: 190 }} resizeMode="cover" />
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(8,8,8,0.38)' }} />

        {/* Top badges */}
        <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 7 }}>
          {/* Difficulty */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: diffColor + '40' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: diffColor }} />
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
              {diffLabel.toUpperCase()}
            </Text>
          </View>
          {/* Category */}
          <View style={{ backgroundColor: t.accentDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: t.accent + '40' }}>
            <Text style={{ color: t.accent, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
              {routine.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Play btn */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          style={{ position: 'absolute', top: 12, right: 12, width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Play size={17} color={t.accentText} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Bottom gradient name */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: -0.5, lineHeight: 22 }} numberOfLines={1}>
            {routine.name}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: SPACING.lg, gap: 12 }}>
        <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 19, letterSpacing: -0.1 }} numberOfLines={2}>
          {routine.description}
        </Text>

        {/* Muscle tags */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {muscles.map((m) => (
            <View key={m} style={{ backgroundColor: t.bg.tertiary, borderRadius: RADIUS.sm, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: t.border.default }}>
              <Text style={{ color: t.text.secondary, fontSize: 11, fontWeight: '600' }}>{m}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: t.border.subtle }} />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: RADIUS.sm, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={13} color={t.accent} strokeWidth={2.2} />
              </View>
              <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '600' }}>{routine.duration} min</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: RADIUS.sm, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={13} color={t.accent} strokeWidth={2.2} />
              </View>
              <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '600' }}>{routine.exercises.length} ejercicios</Text>
            </View>
          </View>
          <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border.strong }}>
            <ChevronRight size={15} color={t.text.tertiary} strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isTrainer }: { isTrainer: boolean }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: 40, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong, marginTop: 20 }}>
      <View style={{ width: 64, height: 64, borderRadius: RADIUS.xl, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: t.border.default }}>
        <Dumbbell size={28} color={t.text.tertiary} strokeWidth={1.5} />
      </View>
      <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.4, marginBottom: 8 }}>Sin resultados</Text>
      <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center', lineHeight: 19, maxWidth: 230 }}>
        {isTrainer ? 'Crea tu primera rutina con el boton Nueva.' : 'Tu entrenador aun no ha asignado rutinas para ti.'}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoutinesTab() {
  const { user, activeRole } = useAppStore();
  const t = useTheme();
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
    fn.then((data) => { setRoutines(data); setFiltered(data); }).finally(() => setLoading(false));
  }, [user, activeRole]);

  useEffect(() => {
    let res = routines;
    if (activeCategory !== 'Todos') res = res.filter((r) => r.category === activeCategory);
    if (search.trim()) res = res.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, activeCategory, routines]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.primary, paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>
              {isTrainer ? 'Tus programas' : 'Tu plan de entrenamiento'}
            </Text>
            <Text style={{ color: t.text.primary, fontSize: 30, fontWeight: '800', letterSpacing: -1 }}>Rutinas</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={17} color={t.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
            {isTrainer && (
              <TouchableOpacity
                onPress={() => router.push('/routines/create' as any)}
                activeOpacity={0.85}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.accent, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Plus size={16} color={t.accentText} strokeWidth={2.8} />
                <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.sm, letterSpacing: -0.2 }}>Nueva</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.bg.input, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: searchFocused ? t.accent : t.border.default }}>
          <Search size={16} color={searchFocused ? t.accent : t.text.tertiary} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar rutinas..."
            placeholderTextColor={t.text.tertiary}
            style={{ flex: 1, color: t.text.primary, fontSize: FONT.md, fontWeight: '500', padding: 0 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
                <X size={11} color={t.text.secondary} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <View style={{ backgroundColor: t.bg.primary, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingVertical: 12, gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const CatIcon = CAT_ICONS[cat] ?? Layers;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11, backgroundColor: active ? t.accent : t.bg.card, borderWidth: 1, borderColor: active ? t.accent : t.border.default }}>
                <CatIcon size={13} color={active ? t.accentText : t.text.secondary} strokeWidth={2.2} />
                <Text style={{ color: active ? t.accentText : t.text.secondary, fontWeight: active ? '800' : '600', fontSize: FONT.sm }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: 24 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Count + diff legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
              {filtered.length} {filtered.length === 1 ? 'RUTINA' : 'RUTINAS'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {([['beginner','Facil'], ['intermediate','Medio'], ['advanced','Dificil']] as [DiffKey, string][]).map(([key, label]) => {
                const c = { beginner: t.beginner, intermediate: t.intermediate, advanced: t.advanced }[key];
                return (
                  <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
                    <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState isTrainer={isTrainer} />
          ) : (
            filtered.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} onPress={() => router.push(`/routines/${routine.id}` as any)} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
