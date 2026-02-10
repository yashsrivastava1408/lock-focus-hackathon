import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import { BlurView } from 'expo-blur';

const QUOTES = [
  "Focus is the art of knowing what to ignore.",
  "Your future is created by what you do today, not tomorrow.",
  "Starve your distractions, feed your focus.",
  "Energy flows where attention goes.",
  "Simplicity is the ultimate sophistication.",
];

const MOODS = [
  { label: 'Calm', icon: 'weather-sunny', color: '#facc15' },
  { label: 'Focused', icon: 'target', color: '#2dd4bf' },
  { label: 'Stressed', icon: 'weather-lightning', color: '#f87171' },
  { label: 'Tired', icon: 'battery-30', color: '#94a3b8' },
];

export default function ReflectScreen() {
  const [mood, setMood] = useState<string | null>(null);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <View className="flex-1 bg-[#020617]">
      <LinearGradient
        colors={['#020617', '#0f172a', '#020617']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <Animated.View entering={FadeInDown.delay(100)} className="mb-8">
              <Text className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Daily Reflection
              </Text>
              <Text className="text-white text-4xl font-black tracking-tight">
                Mindful<Text className="text-teal-400">.</Text>
              </Text>
            </Animated.View>

            {/* DAILY QUOTE */}
            <Animated.View entering={FadeInDown.delay(200)} className="mb-10">
              <View className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <MaterialCommunityIcons name="format-quote-open" size={40} color="rgba(45,212,191,0.2)" style={{ position: 'absolute', top: 10, left: 10 }} />
                <Text className="text-white text-xl font-medium leading-8 text-center px-4 py-2">
                  &quot;{quote}&quot;
                </Text>
              </View>
            </Animated.View>

            {/* CHECK-IN */}
            <Animated.View entering={FadeInDown.delay(300)} className="mb-10">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                How are you feeling?
              </Text>
              <View className="flex-row justify-between gap-3">
                {MOODS.map((m) => {
                  const isActive = mood === m.label;
                  return (
                    <Pressable
                      key={m.label}
                      onPress={() => setMood(m.label)}
                      className={`flex-1 items-center p-4 rounded-2xl border transition-all ${isActive
                        ? 'bg-white/10 border-teal-500/50'
                        : 'bg-white/5 border-white/5'
                        }`}
                    >
                      <MaterialCommunityIcons
                        name={m.icon as any}
                        size={24}
                        color={isActive ? m.color : '#64748b'}
                      />
                      <Text className={`text-xs font-bold mt-2 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* SCRATCHPAD */}
            <Animated.View entering={FadeInDown.delay(400)} className="mb-12">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                Brain Dump
              </Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl p-1 min-h-[180px]">
                <TextInput
                  className="flex-1 text-white text-base p-5 leading-relaxed"
                  placeholder="Write about what's on your mind..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  multiline
                  textAlignVertical="top"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}
                />
              </View>
            </Animated.View>

            {/* ABOUT / MISSION */}
            <Animated.View entering={FadeInDown.delay(500)} className="mb-8">
              <View className="items-center mb-6">
                <View className="h-[1px] w-12 bg-white/10 mb-6" />
                <MaterialCommunityIcons name="infinity" size={32} color="#2dd4bf" />
                <Text className="text-white text-lg font-bold mt-3">Lock In Focus</Text>
                <Text className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                  Version 1.0.0
                </Text>
              </View>

              <Text className="text-slate-400 text-center leading-6 mb-6">
                Designed to help neurodivergent minds find their flow.
                Whether you need strict focus, visual calmness, or just a moment to breathe,
                we&apos;re here to help you lock in.
              </Text>

              <View className="flex-row justify-center gap-6">
                <Pressable className="items-center">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <MaterialCommunityIcons name="web" size={20} color="white" />
                  </View>
                  <Text className="text-white/30 text-[10px] uppercase font-bold mt-2">Website</Text>
                </Pressable>
                <Pressable className="items-center">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <MaterialCommunityIcons name="twitter" size={20} color="white" />
                  </View>
                  <Text className="text-white/30 text-[10px] uppercase font-bold mt-2">Updates</Text>
                </Pressable>
                <Pressable className="items-center">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <MaterialCommunityIcons name="heart" size={20} color="#f9a8d4" />
                  </View>
                  <Text className="text-white/30 text-[10px] uppercase font-bold mt-2">Support</Text>
                </Pressable>
              </View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View >
  );
}
