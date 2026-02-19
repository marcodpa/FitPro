import { Tabs } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { View, Text, Platform } from 'react-native';
import { COLORS } from '@/lib/theme';
import {
  Home,
  Dumbbell,
  Users,
  MessageSquare,
  User,
} from 'lucide-react-native';

const AC = COLORS.accent.DEFAULT;
const INACTIVE = '#484848';

function TabIcon({
  IconComponent,
  label,
  focused,
}: {
  IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 6, minWidth: 52 }}>
      {focused ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: COLORS.accent.dim,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.accent.dimMid,
          }}>
          <IconComponent size={21} color={AC} strokeWidth={2.2} />
        </View>
      ) : (
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent size={21} color={INACTIVE} strokeWidth={1.7} />
        </View>
      )}
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? AC : INACTIVE,
          letterSpacing: 0.1,
        }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isOffline } = useAppStore();

  return (
    <>
      {isOffline && (
        <View
          style={{
            backgroundColor: COLORS.warning,
            paddingTop: 52,
            paddingBottom: 10,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#000' }} />
          <Text style={{ color: '#000', fontWeight: '700', fontSize: 12, letterSpacing: 0.2 }}>
            SIN CONEXION — modo offline activo
          </Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: COLORS.bg.border,
            backgroundColor: COLORS.bg.secondary,
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
