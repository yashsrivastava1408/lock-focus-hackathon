import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const DISTRACTIONS = [
    "Did I lock the door?",
    "New Message: 'Hey!'",
    "Low Battery: 10%",
    "Look at that bird!",
    "Focus...",
    "What's for dinner?"
];

export default function TimeBlindnessGame() {
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'counting' | 'playing' | 'result'>('idle');
    const [targetTime, setTargetTime] = useState(0);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [distraction, setDistraction] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = (range: [number, number]) => {
        const target = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        setTargetTime(target);
        setGameState('counting');

        // Fake count in
        setTimeout(() => {
            setGameState('playing');
            setStartTime(Date.now());
            startDistractions();
        }, 3000);
    };

    const startDistractions = () => {
        timerRef.current = setInterval(() => {
            if (Math.random() > 0.5) {
                setDistraction(DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]);
                setTimeout(() => setDistraction(null), 2000);
            }
        }, 2500);
    };

    const stopGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const end = Date.now();
        const time = (end - startTime) / 1000;
        setElapsed(time);

        const diff = Math.abs(time - targetTime);
        const pct = Math.max(0, 100 - (diff / targetTime) * 100);
        setScore(Math.round(pct));
        setGameState('result');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center bg-slate-900/80">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Time Blindness</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center px-6">
                {gameState === 'idle' && (
                    <View className="w-full gap-4">
                        <Text className="text-slate-400 text-center mb-8">Estimate the time passing without a clock.</Text>
                        <Pressable onPress={() => startGame([5, 10])} className="bg-green-600 p-6 rounded-2xl items-center active:scale-95 transition-transform">
                            <Text className="text-white font-bold text-xl">Easy (5-10s)</Text>
                        </Pressable>
                        <Pressable onPress={() => startGame([10, 20])} className="bg-yellow-600 p-6 rounded-2xl items-center active:scale-95 transition-transform">
                            <Text className="text-white font-bold text-xl">Medium (10-20s)</Text>
                        </Pressable>
                        <Pressable onPress={() => startGame([20, 30])} className="bg-red-600 p-6 rounded-2xl items-center active:scale-95 transition-transform">
                            <Text className="text-white font-bold text-xl">Hard (20-30s)</Text>
                        </Pressable>
                    </View>
                )}

                {gameState === 'counting' && (
                    <Text className="text-6xl text-white font-bold animate-pulse">Ready...</Text>
                )}

                {gameState === 'playing' && (
                    <View className="items-center justify-center w-full h-full">
                        <Text className="text-slate-400 uppercase tracking-widest mb-4">Target Est.</Text>
                        <Text className="text-6xl text-white font-bold mb-12">{targetTime}s</Text>

                        <Pressable
                            onPress={stopGame}
                            className="w-64 h-64 rounded-full bg-blue-600 items-center justify-center shadow-2xl shadow-blue-500/30 active:scale-95 transition-transform border-4 border-blue-400"
                        >
                            <Text className="text-white font-bold text-2xl">STOP</Text>
                            <Text className="text-blue-200 text-sm mt-1">When time matches</Text>
                        </Pressable>

                        {distraction && (
                            <Animated.View
                                entering={FadeInDown}
                                className="absolute top-20 bg-slate-800 border border-slate-600 px-6 py-3 rounded-xl shadow-xl"
                            >
                                <Text className="text-white font-bold">{distraction}</Text>
                            </Animated.View>
                        )}
                    </View>
                )}

                {gameState === 'result' && (
                    <View className="items-center w-full">
                        <Text className="text-slate-400 uppercase tracking-widest mb-2">Accuracy</Text>
                        <Text className="text-8xl text-white font-bold mb-8">{score}%</Text>

                        <View className="flex-row gap-4 mb-12 w-full">
                            <View className="flex-1 bg-slate-800 p-4 rounded-xl items-center">
                                <Text className="text-slate-500 text-xs uppercase">Target</Text>
                                <Text className="text-white text-2xl font-bold">{targetTime}s</Text>
                            </View>
                            <View className="flex-1 bg-slate-800 p-4 rounded-xl items-center">
                                <Text className="text-slate-500 text-xs uppercase">Actual</Text>
                                <Text className="text-white text-2xl font-bold">{elapsed.toFixed(2)}s</Text>
                            </View>
                        </View>

                        <Pressable onPress={() => setGameState('idle')} className="bg-slate-700 w-full py-4 rounded-xl items-center">
                            <Text className="text-white font-bold">Try Again</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
