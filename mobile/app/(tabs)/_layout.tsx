import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {

  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#2dd4bf',
        tabBarInactiveTintColor: '#2dd4bf44',
        // Glass Zen-HUD background
        tabBarBackground: () => (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 40,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <BlurView
              intensity={30}
              tint="dark"
              style={{ ...StyleSheet.absoluteFillObject, borderRadius: 40 }}
            />
          </View>
        ),

        // ===== ZEN-HUD TAB STYLE =====
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          backgroundColor: 'transparent',
          bottom: 30,
          left: 40,
          right: 40,
          paddingBottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },

        tabBarItemStyle: {
          flex: 1,
          height: 70,
        },

        tabBarContentContainerStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarLabelStyle: {
          display: 'none',
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              {focused && <View className="absolute bottom-[-10px] w-1.5 h-1.5 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_#2dd4bf]" />}
              <IconSymbol size={26} name="house.fill" color={color} />
              <Text className="text-[7px] font-black mt-1 uppercase tracking-widest" style={{ color }}>Status</Text>
            </View>
          ),
        }}
      />

      {/* Futuristic Center Piece (Visual only for now) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'REFLECT',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              {focused && <View className="absolute bottom-[-10px] w-1.5 h-1.5 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_#2dd4bf]" />}
              <IconSymbol size={26} name="book.fill" color={color} />
              <Text className="text-[7px] font-black mt-1 uppercase tracking-widest" style={{ color }}>Journal</Text>
            </View>
          ),
        }}
      />

    </Tabs>
  );
}