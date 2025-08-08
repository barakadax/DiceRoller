

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <StatusBar style="auto" hidden={false} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ff8c00',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 48,
            paddingTop: 0,
            paddingBottom: 0,
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            backgroundColor: '#171717',
          },
          tabBarIconStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            display: 'flex',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons name="dice-5" color={color} size={size} />
            ),
            tabBarItemStyle: {
              borderRightWidth: 1,
              borderRightColor: '#ff8c00',
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name="settings-sharp" color={color} size={size} />
            ),
            tabBarItemStyle: {
              borderLeftWidth: 0,
            },
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
