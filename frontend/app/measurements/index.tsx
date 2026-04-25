import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Plus, Ruler, Weight, Activity, X, Save, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MeasurementEntry {
  id: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arm?: number;
  thigh?: number;
  notes?: string;
}

const FIELDS: { key: keyof MeasurementEntry; label: string; unit: string; icon: any }[] = [
  { key: 'weight', label: 'Peso',    unit: 'kg',  icon: Weight },
  { key: 'chest',  label: 'Pecho',   unit: 'cm',  icon: Ruler },
  { key: 'waist',  label: 'Cintura', unit: 'cm',  icon: Ruler },
  { key: 'hips',   label: 'Caderas', unit: 'cm',  icon: Ruler },
  { key: 'arm',    label: 'Brazo',   unit: 'cm',  icon: Activity },
  { key: 'thigh',  label: 'Muslo',   unit: 'cm',  icon: Activity },
];

const STORAGE_KEY = 'fitpro_measurements';

export default function MeasurementsScreen() {
  const router = useRouter();
  const t      = useTheme();
  const [entries,     setEntries]     = useState<MeasurementEntry[]>([]);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState<Partial<MeasurementEntry>>({ date: new Date().toISOString().split('T')[0] });
  const [focused,     setFocused]     = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setEntries(JSON.parse(raw));
    });
  }, []);

  const save = async (updated: MeasurementEntry[]) => {
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAdd = async () => {
    if (!form.date) { Alert.alert('Error', 'La fecha es requerida.'); return; }
    const entry: MeasurementEntry = {
      id: Date.now().toString(),
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      chest:  form.chest  ? Number(form.chest)  : undefined,
      waist:  form.waist  ? Number(form.waist)  : undefined,
      hips:   form.hips   ? Number(form.hips)   : undefined,
      arm:    form.arm    ? Number(form.arm)     : undefined,
      thigh:  form.thigh  ? Number(form.thigh)  : undefined,
      notes:  form.notes,
    };
    const updated = [entry, ...entries].sort((a, b) => b.date.localeCompare(a.date));
    await save(updated);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta medida?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => save(entries.filter((e) => e.id !== id)) },
    ]);
  };

  const getDelta = (key: keyof MeasurementEntry, current: MeasurementEntry) => {
    const idx = entries.indexOf(current);
    if (idx >= entries.length - 1) return null;
    const prev = entries[idx + 1];
    const a = current[key] as number | undefined;
    const b = prev[key] as number | undefined;
    if (a == null || b == null) return null;
    const d = a - b;
    return d;
  };

  const latest = entries[0];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Medidas Corporales</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Seguimiento de tu cuerpo</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
          <Plus size={14} color={t.accentText} />
          <Text style={{ color: t.accentText, fontWeight: '700', fontSize: FONT.sm }}>Añadir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
        {/* Latest snapshot */}
        {latest && (
          <View style={{ backgroundColor: t.accentDim, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.accent + '30' }}>
            <Text style={{ color: t.accent, fontWeight: '800', fontSize: FONT.sm, marginBottom: SPACING.md, letterSpacing: 0.3 }}>ÚLTIMA MEDICIÓN — {latest.date}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
              {FIELDS.map(({ key, label, unit }) => {
                const val = latest[key] as number | undefined;
                const delta = getDelta(key, latest);
                if (!val) return null;
                return (
                  <View key={key} style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.lg, padding: SPACING.md, minWidth: 80, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: t.border.subtle }}>
                    <Text style={{ color: t.text.primary, fontWeight: '900', fontSize: FONT.lg }}>{val}</Text>
                    <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>{unit}</Text>
                    <Text style={{ color: t.text.secondary, fontSize: 10 }}>{label}</Text>
                    {delta !== null && (
                      <Text style={{ color: delta > 0 ? t.danger : t.success, fontSize: 10, fontWeight: '700' }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* History */}
        {entries.length === 0 ? (
          <View style={{ backgroundColor: t.bg.elevated, borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong, marginTop: SPACING.xl }}>
            <Ruler size={40} color={t.text.tertiary} strokeWidth={1.5} />
            <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>Sin medidas</Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>Toca "Añadir" para registrar tus primeras medidas.</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{entry.date}</Text>
                <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                  <Trash2 size={16} color={t.danger} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
                {FIELDS.map(({ key, label, unit }) => {
                  const val = entry[key] as number | undefined;
                  if (!val) return null;
                  return (
                    <View key={key} style={{ backgroundColor: t.bg.elevated, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: 4, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <Text style={{ color: t.text.secondary, fontSize: FONT.xs }}>{label}:</Text>
                      <Text style={{ color: t.text.primary, fontSize: FONT.xs, fontWeight: '700' }}>{val} {unit}</Text>
                    </View>
                  );
                })}
              </View>
              {entry.notes ? <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, marginTop: SPACING.xs }}>{entry.notes}</Text> : null}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: t.bg.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.xl, paddingBottom: 40, gap: SPACING.md, maxHeight: '90%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Nueva medición</Text>
                <TouchableOpacity onPress={() => setShowForm(false)}><X size={22} color={t.text.secondary} /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {/* Date */}
                <View style={{ marginBottom: SPACING.md }}>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>Fecha</Text>
                  <TextInput value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
                    placeholder="YYYY-MM-DD" placeholderTextColor={t.text.tertiary}
                    onFocus={() => setFocused('date')} onBlur={() => setFocused(null)}
                    style={{ backgroundColor: t.bg.input, color: t.text.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg, fontSize: FONT.base, borderWidth: 1.5, borderColor: focused === 'date' ? t.accent : t.border.default }} />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                  {FIELDS.map(({ key, label, unit }) => (
                    <View key={key} style={{ width: '47%' }}>
                      <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>{label} ({unit})</Text>
                      <TextInput value={String(form[key] ?? '')} onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                        keyboardType="decimal-pad" placeholder="—" placeholderTextColor={t.text.tertiary}
                        onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                        style={{ backgroundColor: t.bg.input, color: t.text.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg, fontSize: FONT.base, borderWidth: 1.5, borderColor: focused === key ? t.accent : t.border.default, textAlign: 'center' }} />
                    </View>
                  ))}
                </View>

                <View style={{ marginTop: SPACING.md }}>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>Notas</Text>
                  <TextInput value={form.notes ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                    placeholder="Observaciones..." placeholderTextColor={t.text.tertiary} multiline numberOfLines={2}
                    style={{ backgroundColor: t.bg.input, color: t.text.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg, fontSize: FONT.sm, borderWidth: 1.5, borderColor: t.border.default, textAlignVertical: 'top' }} />
                </View>
              </ScrollView>

              <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Save size={16} color={t.accentText} />
                <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base }}>Guardar medición</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
