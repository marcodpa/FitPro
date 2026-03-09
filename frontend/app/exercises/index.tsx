import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeExerciseService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { Exercise } from '@/lib/types';
import {
  Search,
  X,
  ChevronLeft,
  Dumbbell,
  Zap,
  Heart,
  Target,
  LayoutGrid,
  ChevronRight,
  Play,
  Info,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Core'] as const;
const CAT_ICONS: Record<string, React.ComponentType<any>> = {
  Todos:  LayoutGrid,
  Fuerza: Dumbbell,
  Cardio: Heart,
  Core:   Target,
};

type DiffKey = 'beginner' | 'intermediate' | 'advanced';

function useDiff(t: ReturnType<typeof useTheme>) {
  return {
    beginner:     { color: t.success,      dim: t.successDim,  label: 'Principiante' },
    intermediate: { color: t.warning,      dim: t.warningDim,  label: 'Intermedio'   },
    advanced:     { color: t.danger,       dim: t.dangerDim,   label: 'Avanzado'     },
  } as const;
}

// ─── Exercise Detail ──────────────────────────────────────────────────────────
function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const t = useTheme();
  const diff = useDiff(t)[exercise.difficulty as DiffKey];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: exercise.imageUrl }} style={{ width: '100%', height: 300 }} resizeMode="cover" />
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />

          {/* Back btn */}
          <TouchableOpacity
            onPress={onBack}
            style={{ position: 'absolute', top: 56, left: 20, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Badges */}
          <View style={{ position: 'absolute', top: 60, right: 20, flexDirection: 'row', gap: 8 }}>
            <View style={{ backgroundColor: diff.dim, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: diff.color + '40' }}>
              <Text style={{ color: diff.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{diff.label.toUpperCase()}</Text>
            </View>
          </View>

          {/* Bottom info */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT.sm, fontWeight: '600', marginBottom: 4 }}>
              {exercise.category} • {exercise.muscle}
            </Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 26, letterSpacing: -0.8, lineHeight: 32 }}>
              {exercise.name}
            </Text>
          </View>
        </View>

        <View style={{ padding: SPACING.xxl, gap: SPACING.xxl }}>
          {/* Description */}
          <Text style={{ color: t.text.secondary, fontSize: FONT.md, lineHeight: 24 }}>
            {exercise.description}
          </Text>

          {/* Video mock */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ height: 180, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: RADIUS.full, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Play size={22} color={t.accentText} strokeWidth={2.5} />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT.sm, fontWeight: '500' }}>
                Video demostrativo
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Info size={15} color={t.accent} strokeWidth={2} />
              </View>
              <Text style={{ color: t.text.primary, fontSize: FONT.xl, fontWeight: '800', letterSpacing: -0.4 }}>
                Instrucciones
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {exercise.instructions.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 14, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
                  <View style={{ width: 30, height: 30, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ color: t.accent, fontSize: FONT.sm, fontWeight: '800' }}>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, color: t.text.secondary, fontSize: FONT.base, lineHeight: 22, paddingTop: 4 }}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const t = useTheme();
  const diff = useDiff(t)[exercise.difficulty as DiffKey];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        width: (width - SPACING.xl * 2 - 12) / 2,
        backgroundColor: t.bg.card,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: t.border.subtle,
      }}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: exercise.imageUrl }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />
        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: diff.dim, borderRadius: RADIUS.sm, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: diff.color + '40' }}>
          <Text style={{ color: diff.color, fontSize: 9, fontWeight: '800', letterSpacing: 0.3 }}>{diff.label.toUpperCase()}</Text>
        </View>
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base, letterSpacing: -0.2 }} numberOfLines={2}>
          {exercise.name}
        </Text>
        <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '500' }}>{exercise.muscle}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 12 }}>
        <View style={{ backgroundColor: t.bg.tertiary, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ color: t.text.secondary, fontSize: 10, fontWeight: '600' }}>{exercise.category}</Text>
        </View>
        <View style={{ width: 24, height: 24, borderRadius: RADIUS.sm, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border.default }}>
          <ChevronRight size={12} color={t.text.tertiary} strokeWidth={2.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExercisesScreen() {
  const t = useTheme();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selected, setSelected] = useState<Exercise | null>(null);

  useEffect(() => {
    FakeExerciseService.getAll()
      .then((data) => { setExercises(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = exercises;
    if (activeCategory !== 'Todos') res = res.filter((e) => e.category === activeCategory);
    if (search) res = res.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [search, activeCategory, exercises]);

  if (selected) return <ExerciseDetail exercise={selected} onBack={() => setSelected(null)} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.primary, paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>Explora y aprende</Text>
            <Text style={{ color: t.text.primary, fontSize: 30, fontWeight: '800', letterSpacing: -1 }}>Ejercicios</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 6, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.bg.input, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: searchFocused ? t.accent : t.border.default }}>
          <Search size={16} color={searchFocused ? t.accent : t.text.tertiary} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar ejercicio..."
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
            const CatIcon = CAT_ICONS[cat] ?? LayoutGrid;
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

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Count */}
          <Text style={{ color: t.text.tertiary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14 }}>
            {filtered.length} {filtered.length === 1 ? 'EJERCICIO' : 'EJERCICIOS'}
          </Text>

          {filtered.length === 0 ? (
            <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: 40, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong, marginTop: 20 }}>
              <View style={{ width: 56, height: 56, borderRadius: RADIUS.xl, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Dumbbell size={24} color={t.text.tertiary} strokeWidth={1.5} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>Sin resultados</Text>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center', marginTop: 6 }}>
                Prueba con otra búsqueda o categoría.
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {filtered.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} onPress={() => setSelected(ex)} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
