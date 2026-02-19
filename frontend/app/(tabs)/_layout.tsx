import { Tabs } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { View, Text } from 'react-native';
import {
  Home,
  Dumbbell,
  Users,
  MessageSquare,
  User,
} from 'lucide-react-native';

const PRIMARY = '#10b981';
const INACTIVE = '#a1a1aa';

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
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 6,
        gap: 3,
        minWidth: 56,
      }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -1,
            width: 28,
            height: 3,
            borderRadius: 2,
            backgroundColor: PRIMARY,
          }}
        />
      )}
      <IconComponent
        size={22}
        color={focused ? PRIMARY : INACTIVE}
        strokeWidth={focused ? 2.2 : 1.8}
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? PRIMARY : INACTIVE,
          letterSpacing: 0.2,
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
            backgroundColor: '#f59e0b',
            paddingTop: 52,
            paddingBottom: 10,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }}
          />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Sin conexion — datos sincronizados localmente
          </Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 76,
            paddingBottom: 10,
            paddingTop: 0,
            borderTopWidth: 1,
            borderTopColor: '#e4e4e7',
            backgroundColor: '#ffffff',
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.07,
            shadowRadius: 16,
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
