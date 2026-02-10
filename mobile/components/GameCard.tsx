import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface GameCardProps {
    title: string;
    description: string;
    icon: string;
    color: string;
    route: string;
    badge?: string;
    variant?: 'poster' | 'landscape' | 'compact' | 'list';
    style?: any;
    horizontal?: boolean; // Backward compatibility
}

const { width } = Dimensions.get('window');

// 📡 Internal HUD Scanline
const HUDScanline = ({ height: scanHeight = 80 }: { height?: number }) => {
    const translateY = useSharedValue(-scanHeight);

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(scanHeight + 20, { duration: 3000 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: '#00f5ff', opacity: 0.15, zIndex: 10 },
                animatedStyle
            ]}
        />
    );
};

export function GameCard({ title, description, icon, color, route, badge, variant = 'list', style, horizontal }: GameCardProps) {
    const router = useRouter();

    // Handle backward compatibility
    const activeVariant = horizontal ? 'poster' : variant;

    // Extract just the color name for the icon (e.g., 'bg-blue-500' -> 'blue')
    const iconColor = color.includes('amber') ? '#f59e0b'
        : color.includes('blue') ? '#3b82f6'
            : color.includes('purple') ? '#a855f7'
                : color.includes('green') ? '#22c55e'
                    : color.includes('pink') ? '#ec4899'
                        : color.includes('teal') ? '#14b8a6'
                            : '#f97316';

    const glowColor = color.replace('bg-', 'bg-');

    let gradientColors = ['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)'];
    if (color.includes('amber')) gradientColors = ['rgba(245, 158, 11, 0.15)', 'rgba(30, 41, 59, 0.4)'];
    if (color.includes('blue')) gradientColors = ['rgba(59, 130, 246, 0.15)', 'rgba(30, 41, 59, 0.4)'];
    if (color.includes('purple')) gradientColors = ['rgba(168, 85, 247, 0.15)', 'rgba(30, 41, 59, 0.4)'];
    if (color.includes('pink')) gradientColors = ['rgba(236, 72, 153, 0.15)', 'rgba(30, 41, 59, 0.4)'];

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(route as any);
    };

    // --- VARIANTS ---

    // 1. LANDSCAPE (Full Width Feature)
    if (activeVariant === 'landscape') {
        // const hudGradient = ['rgba(5, 12, 10, 0.95)', 'rgba(10, 26, 22, 0.85)']; // REMOVED
        return (
            <Pressable onPress={handlePress} style={style} className="w-full h-44 rounded-none overflow-hidden active:scale-[0.98] transition-all mb-8">
                <BlurView intensity={10} tint="dark" className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <Text className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">Featured Module</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold tracking-tight mb-2">{title}</Text>
                        <Text className="text-white/40 text-[11px] font-medium leading-4" numberOfLines={2}>{description}</Text>
                    </View>

                    <View className="w-16 h-16 bg-teal-400/10 items-center justify-center rounded-3xl border border-teal-400/20">
                        <MaterialCommunityIcons name={icon as any} size={32} color="#2dd4bf" />
                    </View>
                </BlurView>
            </Pressable>
        );
    }

    // 2. COMPACT (Grid Item)
    if (activeVariant === 'compact') {
        // const hudGradient = ['rgba(5, 12, 10, 0.95)', 'rgba(10, 26, 22, 0.85)']; // REMOVED
        return (
            <Pressable onPress={handlePress} style={style} className="flex-1 aspect-square rounded-none overflow-hidden active:scale-[0.96] transition-all mb-4">
                <BlurView intensity={10} tint="dark" className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-5 justify-between">
                    <View className="w-12 h-12 bg-teal-400/10 items-center justify-center rounded-2xl border border-teal-400/20">
                        <MaterialCommunityIcons name={icon as any} size={24} color="#2dd4bf" />
                    </View>

                    <View>
                        <Text className="text-white text-[15px] font-bold tracking-tight mb-1" numberOfLines={2}>{title}</Text>
                        <View className="h-[2px] w-6 bg-teal-400/30 rounded-full" />
                    </View>
                </BlurView>
            </Pressable>
        );
    }

    // 3. POSTER (Scrolling Row)
    if (activeVariant === 'poster') {
        return (
            <Pressable onPress={handlePress} style={style} className="mr-5 w-48 h-64 rounded-none overflow-hidden active:scale-[0.96] transition-all">
                <BlurView intensity={10} tint="dark" className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 justify-between">
                    <View className="w-12 h-12 bg-teal-400/10 items-center justify-center rounded-2xl border border-teal-400/20">
                        <MaterialCommunityIcons name={icon as any} size={24} color="#2dd4bf" />
                    </View>

                    <View>
                        <Text className="text-white text-xl font-bold tracking-tight mb-2" numberOfLines={2}>
                            {title}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-teal-400/50" />
                            <Text className="text-teal-400/40 text-[10px] font-black uppercase tracking-widest">Ready</Text>
                        </View>
                    </View>
                </BlurView>
            </Pressable>
        );
    }

    // 4. LIST (Default fallback)
    return (
        <Pressable onPress={handlePress} style={style} className="w-full h-20 rounded-none overflow-hidden active:scale-[0.98] transition-all mb-4">
            <BlurView intensity={10} tint="dark" className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] p-4 flex-row items-center">
                <View className="w-12 h-12 bg-teal-400/10 items-center justify-center rounded-xl border border-teal-400/20 mr-4">
                    <MaterialCommunityIcons name={icon as any} size={24} color="#2dd4bf" />
                </View>
                <View>
                    <Text className="text-white font-bold">{title}</Text>
                    <Text className="text-white/40 text-[10px] uppercase tracking-widest">{description}</Text>
                </View>
            </BlurView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
});
