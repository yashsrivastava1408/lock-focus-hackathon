import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const BALLOON_COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
];

function Balloon({ id, color, onPop, active }: { id: number, color: any, onPop: (id: number, isRight: boolean) => void, active: boolean }) {
    const translateY = useSharedValue(height);
    const translateX = useSharedValue(Math.random() * (width - 60));

    useEffect(() => {
        // Float up animation
        translateY.value = withTiming(-100, {
            duration: 4000 + Math.random() * 2000,
            easing: Easing.linear
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
            position: 'absolute',
        };
    });

    if (!active) return null;

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={() => onPop(id, true)}
                className="w-16 h-20 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: color.hex }}
            >
                <View className="w-2 h-6 bg-white/30 rounded-full absolute top-3 left-3 rotate-12" />
                <View className="w-1 h-8 bg-slate-400 absolute top-full" />
            </Pressable>
        </Animated.View>
    );
}

export default function BalloonPopGame() {
    const router = useRouter();
    const [targetColor, setTargetColor] = useState(BALLOON_COLORS[0]);
    const [score, setScore] = useState(0);
    const [balloons, setBalloons] = useState<any[]>([]);

    // Spawn balloons loop
    useEffect(() => {
        const interval = setInterval(() => {
            const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            const newBalloon = { id: Date.now(), color, active: true };
            setBalloons(prev => [...prev.slice(-10), newBalloon]); // Keep last 10
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Change target color every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTargetColor(BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handlePop = (id: number, isRight: boolean) => {
        const balloon = balloons.find(b => b.id === id);
        if (!balloon) return;

        if (balloon.color.name === targetColor.name) {
            setScore(s => s + 10);
        } else {
            setScore(s => Math.max(0, s - 5));
        }

        setBalloons(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center z-50 bg-slate-900/80">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View className="items-center">
                    <Text className="text-slate-400 text-xs uppercase">Pop Only</Text>
                    <View className="flex-row items-center gap-2">
                        <View style={{ backgroundColor: targetColor.hex }} className="w-4 h-4 rounded-full" />
                        <Text className="text-white text-xl font-bold">{targetColor.name}</Text>
                    </View>
                </View>
                <View className="bg-slate-800 px-3 py-1 rounded-lg">
                    <Text className="text-blue-400 font-bold">{score} pts</Text>
                </View>
            </View>

            <View className="flex-1 relative">
                {balloons.map(b => (
                    <Balloon key={b.id} {...b} onPop={handlePop} />
                ))}
            </View>
        </SafeAreaView>
    );
}
