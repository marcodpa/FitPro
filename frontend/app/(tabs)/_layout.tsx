import { Tabs, useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import {
  Home,
  Dumbbell,
  Users,
  MessageSquare,
  User,
} from 'lucide-react-native';

function TabIcon({
  IconComponent,
  label,
  focused,
}: {
  IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  focused: boolean;
}) {
  const t = useTheme();
  const inactiveColor = t.isDark ? '#484848' : '#aaaaaa';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 6, minWidth: 52 }}>
      {focused ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: t.accentDim,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: t.accent + '30',
          }}>
          <IconComponent size={21} color={t.accent} strokeWidth={2.2} />
        </View>
      ) : (
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent size={21} color={inactiveColor} strokeWidth={1.7} />
        </View>
      )}
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? t.accent : inactiveColor,
          letterSpacing: 0.1,
        }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isOffline } = useAppStore();
  const t = useTheme();
  const router = useRouter();

  return (
    <>
      {isOffline && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/offline' as any)}
          style={{
            backgroundColor: '#fbbf24',
            paddingTop: 52,
            paddingBottom: 10,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#000' }} />
          <Text style={{ color: '#000', fontWeight: '700', fontSize: 12, letterSpacing: 0.2, flex: 1 }}>
            SIN CONEXIÓN — toca para ver opciones
          </Text>
          <Text style={{ color: '#00000080', fontWeight: '600', fontSize: 11 }}>Ver opciones →</Text>
        </TouchableOpacity>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: t.border.default,
            backgroundColor: t.bg.secondary,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon IconComponent={Home} label="Inicio" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon IconComponent={Dumbbell} label="Rutinas" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon IconComponent={Users} label="Social" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon IconComponent={MessageSquare} label="Chat" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon IconComponent={User} label="Perfil" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
