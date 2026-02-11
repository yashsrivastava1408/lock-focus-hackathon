import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const INSIGHTS = [
  {
    title: "Peak Performance Detected",
    desc: "Your focus levels were highest between 10:00 AM - 11:30 AM today.",
    icon: "chart-timeline-variant",
    color: "#34d399"
  },
  {
    title: "Distraction Alert",
    desc: "Frequent gaze shifts detected during reading sessions. Try enabling 'Neuro-Pilot'.",
    icon: "alert-circle-outline",
    color: "#fbbf24"
  },
  {
    title: "Cognitive Load Optimized",
    desc: "Adaptive Reader reduced visual strain by 18% compared to standard PDF readers.",
    icon: "brain",
    color: "#60a5fa"
  }
];

export default function FocusIntelligenceScreen() {
  return (
    <View className="flex-1 bg-[#020617]">
      <LinearGradient
        colors={['#020617', '#0f172a', '#020617']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background Glows */}
      <View style={{ position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(45, 212, 191, 0.1)' }} />
      <View style={{ position: 'absolute', bottom: 100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(168, 85, 247, 0.1)' }} />

      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <Animated.View entering={FadeInDown.delay(100)} className="mb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                Focus Intelligence
              </Text>
              <Text className="text-white text-3xl font-black tracking-tight">
                Focus Insights
              </Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Live</Text>
            </View>
          </Animated.View>

          {/* MAIN SCORE CARD */}
          <Animated.View entering={FadeInDown.delay(200)} className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-[32px] p-8 items-center relative overflow-hidden">
              <LinearGradient
                colors={['rgba(45, 212, 191, 0.1)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Circular Guard Ring */}
              <View className="w-48 h-48 rounded-full border-8 border-white/5 items-center justify-center mb-6 relative">
                <View className="absolute w-full h-full rounded-full border-8 border-teal-500/30 border-t-teal-400 border-r-teal-400 rotate-45" />
                <Text className="text-6xl font-black text-white">87</Text>
                <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Score</Text>
              </View>

              <Text className="text-center text-slate-300 text-sm font-medium leading-6 max-w-[200px]">
                You are in the top <Text className="text-teal-400 font-bold">12%</Text> of focus users today. Excellent stability.
              </Text>
            </View>
          </Animated.View>

          {/* STATS GRID */}
          <Animated.View entering={FadeInDown.delay(300)} className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 items-center">
              <MaterialCommunityIcons name="clock-outline" size={24} color="#60a5fa" className="mb-2" />
              <Text className="text-2xl font-bold text-white mb-1">4h 20m</Text>
              <Text className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Deep Work</Text>
            </View>
            <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 items-center">
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#facc15" className="mb-2" />
              <Text className="text-2xl font-bold text-white mb-1">12</Text>
              <Text className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Flow States</Text>
            </View>
          </Animated.View>

          {/* AI INSIGHTS */}
          <Animated.View entering={FadeInDown.delay(400)} className="mb-8">
            <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 ml-1">
              AI Insights
            </Text>
            <View className="gap-3">
              {INSIGHTS.map((insight, index) => (
                <View key={index} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex-row gap-4 hover:bg-white/10 transition-colors">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10 shrink-0">
                    <MaterialCommunityIcons name={insight.icon as any} size={20} color={insight.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm mb-1">{insight.title}</Text>
                    <Text className="text-slate-400 text-xs leading-5">{insight.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* WEEKLY ACTIVITY GRAPH STUB */}
          <Animated.View entering={FadeInDown.delay(500)} className="mb-8">
            <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 ml-1">
              Weekly Activity
            </Text>
            <View className="h-48 bg-white/5 border border-white/10 rounded-3xl p-6 flex-row items-end justify-between gap-2 overflow-hidden relative">
              <LinearGradient
                colors={['transparent', 'rgba(45, 212, 191, 0.05)']}
                style={StyleSheet.absoluteFillObject}
              />
              {[40, 70, 30, 85, 60, 50, 90].map((h, i) => (
                <View key={i} className="flex-1 items-center gap-2">
                  <View className="w-full bg-teal-500/20 rounded-t-lg" style={{ height: `${h}%` }}>
                    <View className="w-full h-full bg-gradient-to-t from-teal-500/50 to-teal-400/80 opacity-60 rounded-t-lg" />
                  </View>
                  <Text className="text-[10px] text-white/30 font-bold">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
