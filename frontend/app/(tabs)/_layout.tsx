import { Tabs } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { View, Text } from 'react-native';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View className="items-center justify-center" style={{ gap: 2, paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? '#0d9e6e' : '#94a3b8',
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
            paddingTop: 44,
            paddingBottom: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{ fontSize: 16 }}>📵</Text>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Modo Offline — Datos sincronizados localmente
          </Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 72,
            paddingBottom: 8,
            paddingTop: 0,
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            backgroundColor: '#ffffff',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" label="Inicio" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏋️" label="Rutinas" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🔥" label="Social" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="💬" label="Chat" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👤" label="Perfil" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
