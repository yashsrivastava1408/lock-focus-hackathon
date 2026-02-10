import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GAMES, CATEGORIES } from '../../constants/games';
import { GameCard } from '../../components/GameCard';
import Animated, {
  FadeInDown,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

function BackgroundBlob({ className, style, delay = 0 }: any) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 5000 + delay }),
        withTiming(0.3, { duration: 5000 + delay })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 7000 + delay }),
        withTiming(1, { duration: 7000 + delay })
      ),
      -1,
      true
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 10000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 10000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 12000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 12000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
  }));

  return <Animated.View className={className} style={[animatedStyle, style]} />;
}

export default function DashboardScreen() {

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-1 bg-[#020617]">

      <LinearGradient
        colors={['#020617', '#0f172a', '#020617']}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left - Teal */}
        <BackgroundBlob delay={0} className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px]" />

        {/* Top Right - Indigo */}
        <BackgroundBlob delay={1000} className="absolute top-10 -right-20 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[100px]" />

        {/* Bottom Left - Purple */}
        <BackgroundBlob delay={2000} className="absolute top-[40%] -left-32 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[100px]" />

        {/* Bottom Right - Cyan */}
        <BackgroundBlob delay={3000} className="absolute bottom-0 -right-10 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px]" />
      </View>

      <SafeAreaView className="flex-1">

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >

          {/* HEADER */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-row items-center mt-8 mb-10">

            <View className="relative">
              <View className="w-16 h-16 rounded-3xl bg-teal-400/10 items-center justify-center border border-teal-400/20 overflow-hidden">
                <BlurView intensity={20} tint="light" style={styles.absoluteFill} />
                <MaterialCommunityIcons name="account" size={32} color="#2dd4bf" />
              </View>
            </View>

            <View className="ml-5">
              <Text className="text-teal-400/60 text-xs font-bold uppercase tracking-[0.15em] mb-0.5">
                {getGreeting()}
              </Text>
              <Text className="text-white text-3xl font-extrabold tracking-tight">
                Explorer
              </Text>
            </View>

          </Animated.View>

          {/* PERFORMANCE HUB */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-10">

            <View className="flex-row gap-4 mb-5">

              <BlurView intensity={10} tint="dark" className="flex-1 rounded-[2.5rem] p-5 border border-white/5 bg-white/5">
                <Text className="text-white text-3xl font-bold">04 Days</Text>
              </BlurView>

              <BlurView intensity={10} tint="dark" className="flex-1 rounded-[2.5rem] p-5 border border-white/5 bg-white/5">
                <Text className="text-white text-3xl font-bold">92%</Text>
              </BlurView>

            </View>

            {/* Mindful */}
            <View className="rounded-[2.5rem] bg-teal-500/5 p-6 border border-teal-500/10">
              <MaterialCommunityIcons name="star" size={14} color="#2dd4bf" />
              <Text className="text-white/80 text-base mt-2">
                &quot;One conscious breath in and out is a meditation.&quot;
              </Text>
            </View>

          </Animated.View>

          {/* GRID */}
          <View className="gap-10">
            {['ADHD', 'DYSLEXIA', 'STRESS'].map((cat, idx) => {
              const catInfo = CATEGORIES[cat];
              const catGames = GAMES.filter(g => g.category === cat);
              if (!catInfo || catGames.length === 0) return null;
              return (
                <Animated.View key={cat} entering={FadeInDown.delay(300 + idx * 100).springify()}>
                  {/* Category Header */}
                  <View className="flex-row items-center mb-4 gap-3">
                    <View style={{ backgroundColor: catInfo.accent, borderColor: catInfo.color + '33' }} className="w-10 h-10 rounded-2xl items-center justify-center border">
                      <MaterialCommunityIcons name={catInfo.icon as any} size={20} color={catInfo.color} />
                    </View>
                    <View>
                      <Text style={{ color: catInfo.color }} className="text-lg font-bold tracking-tight">{catInfo.label}</Text>
                      <Text className="text-white/30 text-[10px] font-semibold uppercase tracking-widest">{catGames.length} exercises</Text>
                    </View>
                    <View style={{ backgroundColor: catInfo.color + '20' }} className="h-[1px] flex-1 ml-2" />
                  </View>

                  {/* Cards */}
                  <View className="flex-row flex-wrap gap-4">
                    {catGames.map(game => (
                      <GameCard key={game.id} {...game} variant="compact" />
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});