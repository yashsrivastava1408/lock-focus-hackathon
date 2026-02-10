import { View, Text, Pressable, Dimensions, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
import { useState, useRef, useMemo, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Helper to calculate distance between points
const dist = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

interface Point { x: number; y: number; }

export default function ZenDriveDraw() {
    const router = useRouter();

    // Game State
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0); // Total distance driven
    const [showIntro, setShowIntro] = useState(true);

    // Car Animation
    const progress = useSharedValue(0); // 0 to 1 along current path
    const carX = useSharedValue(0);
    const carY = useSharedValue(0);
    const carAngle = useSharedValue(0);

    // Drawing Logic (PanResponder)
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !isPlaying,
        onMoveShouldSetPanResponder: () => !isPlaying,
        onPanResponderGrant: (evt) => {
            if (isPlaying) return;
            const { pageX, pageY } = evt.nativeEvent;
            setPoints([{ x: pageX, y: pageY }]);
            setIsDrawing(true);
            setShowIntro(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (evt) => {
            if (isPlaying) return;
            const { pageX, pageY } = evt.nativeEvent;
            setPoints(prev => {
                const last = prev[prev.length - 1];
                if (!last) return [{ x: pageX, y: pageY }];

                // Only add point if moved enough (smoothing)
                if (dist(last, { x: pageX, y: pageY }) > 5) {
                    return [...prev, { x: pageX, y: pageY }];
                }
                return prev;
            });
        },
        onPanResponderRelease: () => {
            setIsDrawing(false);
            // Auto-start if path is long enough
            if (points.length > 5) {
                startCar();
            } else {
                setPoints([]); // Too short, clear
            }
        }
    }), [isPlaying, points]);

    // Construct SVG Path string
    const pathD = useMemo(() => {
        if (points.length < 2) return '';
        // Simple line connection for now. bezier smoothing could be added but pencil style is fine being rough.
        return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }, [points]);

    // Start Car Animation
    const startCar = () => {
        setIsPlaying(true);
        progress.value = 0;

        // Calculate total path length approximation
        let totalLen = 0;
        for (let i = 0; i < points.length - 1; i++) totalLen += dist(points[i], points[i + 1]);

        // Duration based on length (constant speed)
        const duration = totalLen * 15; // ms per pixel roughly? adjust speed

        // We need to animate progress 0 -> 1 using reanimated
        // But we need to update car position on every frame based on that progress
        // Custom animation loop in JS or Reanimated?
        // Reanimated `withTiming` on progress, then `useDerivedValue` or `useAnimatedReaction` to update x/y?
        // Updating x/y from points array (JS side) in UI thread is tricky without passing points to UI thread.
        // EASIER: Run animation loop in JS for position update, use Animated.View for car.

        // Let's use a JS intervals/frames for simplicity of path interpolation logic
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const p = Math.min(elapsed / duration, 1);

            // value update
            progress.value = p;

            // Find position
            // This is O(N) every frame, optimization: pre-calculate cumulative lengths
            // For < 1000 points it's fine.

            // 1. Find target length
            const targetLen = p * totalLen;

            // 2. Walk points
            let currentLen = 0;
            let found = false;

            for (let i = 0; i < points.length - 1; i++) {
                const segLen = dist(points[i], points[i + 1]);
                if (currentLen + segLen >= targetLen) {
                    // It's in this segment
                    const segProgress = (targetLen - currentLen) / segLen;
                    carX.value = points[i].x + (points[i + 1].x - points[i].x) * segProgress;
                    carY.value = points[i].y + (points[i + 1].y - points[i].y) * segProgress;

                    // Angle
                    const angle = Math.atan2(points[i + 1].y - points[i].y, points[i + 1].x - points[i].x);
                    carAngle.value = angle + Math.PI / 2; // Sprite is facing up? depends.

                    found = true;
                    break;
                }
                currentLen += segLen;
            }

            if (!found && points.length > 0) {
                // End
                const last = points[points.length - 1];
                carX.value = last.x;
                carY.value = last.y;
            }

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                finishRun(Math.round(totalLen / 10)); // Score = dist / 10
            }
        };
        requestAnimationFrame(animate);
    };

    const finishRun = (runScore: number) => {
        setIsPlaying(false);
        setScore(s => s + runScore);
        setPoints([]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // Animated Style for Car
    const carStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: carX.value - 15 }, // Centered width 30
            { translateY: carY.value - 15 }, // Centered height 30
            { rotate: `${carAngle.value}rad` }
        ]
    }));

    return (
        <SafeAreaView style={styles.container}>
            {/* BACKGROUND TEXTURE */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={{ flex: 1, backgroundColor: '#fdfcf0' }}>
                    {/* Grid Lines */}
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                        <SvgLine x1="0" y1="0" x2="0" y2="0" stroke="#eab308" strokeWidth="1" />
                        {/* We can just use a repeating pattern image or simple loops if needed, 
                             or strictly CSS-like views. For now just the color. */}
                    </Svg>
                </View>
            </View>

            {/* GRID LINES (View based for simple repeat) */}
            <View style={styles.gridContainer} pointerEvents="none">
                {/* Just a few lines to simulate paper */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLine, { top: i * 40 }]} />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                    <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 40 }]} />
                ))}
            </View>

            {/* HEADER */}
            <View style={styles.header} pointerEvents="none">
                <Text style={styles.scoreTitle}>Masterpieces Created</Text>
                <Text style={styles.scoreVal}>{score}m</Text>
            </View>

            <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#57534e" />
            </Pressable>

            {/* DRAWING SURFACE */}
            <View style={styles.surface} {...panResponder.panHandlers}>
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Path
                        d={pathD}
                        stroke="#5c4033" // Pencil brown
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={0.8}
                    />
                    {/* Dashed inner line */}
                    <Path
                        d={pathD}
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeDasharray="10, 10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={0.6}
                    />
                </Svg>

                {/* CAR */}
                {/* Only show car if playing or if we have points (start pos)? */}
                {/* Actually we just position it at 0,0 default, so hide if no points */}
                <Animated.View style={[styles.car, carStyle, { opacity: (isDrawing || isPlaying || points.length > 0) ? 1 : 0 }]}>
                    {/* Simple Car Shape */}
                    <View style={{ width: 30, height: 16, backgroundColor: '#3b82f6', borderRadius: 4 }} />
                    <View style={{ position: 'absolute', top: 2, left: 6, width: 14, height: 12, backgroundColor: '#2563eb', borderRadius: 2 }} />
                    {/* WHeels */}
                    <View style={{ position: 'absolute', top: -4, left: 4, width: 6, height: 4, backgroundColor: '#000' }} />
                    <View style={{ position: 'absolute', top: 16, left: 4, width: 6, height: 4, backgroundColor: '#000' }} />
                    <View style={{ position: 'absolute', top: -4, left: 20, width: 6, height: 4, backgroundColor: '#000' }} />
                    <View style={{ position: 'absolute', top: 16, left: 20, width: 6, height: 4, backgroundColor: '#000' }} />
                </Animated.View>
            </View>

            {/* INTRO INSTRUCTION */}
            {showIntro && (
                <View style={styles.introOverlay} pointerEvents="none">
                    <View style={styles.introCard}>
                        <MaterialCommunityIcons name="pencil" size={32} color="#3b82f6" />
                        <Text style={styles.introTitle}>Doodle Your Road</Text>
                        <Text style={styles.introText}>Draw a path from start to finish.{"\n"}The car will follow your imagination.</Text>
                    </View>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#fdfcf0',
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLine: {
        position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#e5e7eb',
    },
    gridLineV: {
        position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#e5e7eb',
    },
    header: {
        position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', zIndex: 10,
    },
    scoreTitle: {
        fontSize: 10, fontWeight: '700', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: 2,
    },
    scoreVal: {
        fontSize: 32, fontWeight: '900', color: '#44403c',
    },
    backBtn: {
        position: 'absolute', top: 60, left: 20, zIndex: 20,
        width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20,
    },
    surface: {
        flex: 1,
    },
    car: {
        position: 'absolute', top: 0, left: 0,
        width: 30, height: 30, // container size
        alignItems: 'center', justifyContent: 'center',
    },
    introOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
    },
    introCard: {
        backgroundColor: 'white', padding: 24, borderRadius: 24,
        alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
        borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed',
    },
    introTitle: {
        fontSize: 18, fontWeight: '800', color: '#1f2937', textTransform: 'uppercase', letterSpacing: 1,
    },
    introText: {
        fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20,
    }
});
