import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function CustomSplashScreen() {
    const spin = useSharedValue(0);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        spin.value = withRepeat(
            withTiming(360, { duration: 1000, easing: Easing.linear }),
            -1
        );

        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const spinStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spin.value}deg` }]
        };
    });

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value
        };
    });

    return (
        <View className="flex-1 bg-[#050a1a] items-center justify-center">
            {/* Spinner Ring */}
            <View className="relative w-20 h-20 mb-8 items-center justify-center">
                <Animated.View style={[styles.spinner, spinStyle]} />
                <MaterialCommunityIcons name="brain" size={32} color="#3b82f6" style={{ opacity: 0.8 }} />
            </View>

            {/* Text */}
            {/* Text */}
            <Animated.Text style={textStyle} className="text-white font-black tracking-[6px] uppercase text-3xl mt-4">
                LOCK FOCUS
            </Animated.Text>
            <Animated.Text style={textStyle} className="text-blue-400 font-bold tracking-[2px] uppercase text-[10px] mt-2 opacity-60">
                Neural Interface Loading...
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    spinner: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'rgba(59, 130, 246, 0.2)', // blue-500/20
        borderTopColor: '#3b82f6', // blue-500
    }
});
