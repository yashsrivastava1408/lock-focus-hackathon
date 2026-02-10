import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    FadeIn,
    Easing,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const ARENA_MARGIN = 16;
const ARENA_WIDTH = width - ARENA_MARGIN * 2;
const LANE_COUNT = 3;
const LANE_WIDTH = ARENA_WIDTH / LANE_COUNT;
const GAME_HEIGHT = height * 0.58;
const PLAYER_SIZE = 42;
const ITEM_SIZE = 36;
const PLAYER_Y = GAME_HEIGHT - 80;

// ─── LEVEL CONFIG ────────────────────────────────────────
const LEVEL_CONFIG = [
    { id: 1, name: 'Beginner', speed: 1.5, duration: 15, desc: 'Mental Warm-up', colors: ['#10b981', '#14b8a6'] as const },
    { id: 2, name: 'Easy', speed: 4, duration: 15, desc: 'Focus Stability', colors: ['#06b6d4', '#3b82f6'] as const },
    { id: 3, name: 'Medium', speed: 7, duration: 18, desc: 'Deep Attention', colors: ['#3b82f6', '#6366f1'] as const },
    { id: 4, name: 'Hard', speed: 11, duration: 20, desc: 'Cognitive Endurance', colors: ['#6366f1', '#a855f7'] as const },
    { id: 5, name: 'Master', speed: 16, duration: 20, desc: 'Flow State Master', colors: ['#a855f7', '#ec4899'] as const },
];

type GameState = 'level-select' | 'intro' | 'playing' | 'gameover';
type ItemType = 'obstacle' | 'orb';

interface GameItem {
    id: number;
    lane: number;
    type: ItemType;
    y: number;
}

// ─── ANIMATED SCANLINE ───────────────────────────────────
function Scanline() {
    const ty = useSharedValue(-10);
    useEffect(() => {
        ty.value = withRepeat(
            withTiming(GAME_HEIGHT, { duration: 2800, easing: Easing.linear }),
            -1, false
        );
    }, []);
    const s = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
    return (
        <Animated.View style={[{
            position: 'absolute', left: 0, right: 0, height: 1.5,
            backgroundColor: '#22d3ee', opacity: 0.1, zIndex: 5,
        }, s]} />
    );
}

// ─── TAP FLASH COMPONENT ─────────────────────────────────
function TapFlash({ side }: { side: 'left' | 'right' }) {
    const opacity = useSharedValue(0);
    useEffect(() => {
        opacity.value = withSequence(
            withTiming(0.25, { duration: 60 }),
            withTiming(0, { duration: 200 })
        );
    }, []);
    const s = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[{
            position: 'absolute', top: 0, bottom: 0,
            [side]: 0, width: width * 0.3,
            backgroundColor: '#22d3ee',
        }, s]} pointerEvents="none" />
    );
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function FocusFlowGame() {
    const router = useRouter();

    // ─── UI STATE ────────────────────────────────────────
    const [gameState, setGameState] = useState<GameState>('level-select');
    const [score, setScore] = useState(0);
    const [lane, setLane] = useState(1);
    const [items, setItems] = useState<GameItem[]>([]);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentLevel, setCurrentLevel] = useState<typeof LEVEL_CONFIG[0] | null>(null);
    const [levelStatus, setLevelStatus] = useState<'completed' | 'failed' | null>(null);
    const [unlockedLevels, setUnlockedLevels] = useState(1);
    const [showLeftFlash, setShowLeftFlash] = useState(0);
    const [showRightFlash, setShowRightFlash] = useState(0);

    // ─── REFS (game loop source of truth) ────────────────
    const laneRef = useRef(1);
    const itemsRef = useRef<GameItem[]>([]);
    const speedRef = useRef(5);
    const streakRef = useRef(0);
    const scoreRef = useRef(0);
    const gameTimeRef = useRef(0);
    const gameStateRef = useRef<GameState>('level-select');
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const currentLevelRef = useRef<typeof LEVEL_CONFIG[0] | null>(null);
    const frameCountRef = useRef(0);

    // Reanimated shared values
    const playerX = useSharedValue(LANE_WIDTH * 1 + LANE_WIDTH / 2 - PLAYER_SIZE / 2);
    const playerScale = useSharedValue(1);
    const playerGlow = useSharedValue(0);
    const scoreFlash = useSharedValue(0);

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // ─── LANE CHANGE (tap-based) ─────────────────────────
    const changeLane = useCallback((direction: 'left' | 'right') => {
        if (gameStateRef.current !== 'playing') return;

        const current = laneRef.current;
        const newLane = direction === 'left'
            ? Math.max(0, current - 1)
            : Math.min(2, current + 1);

        if (newLane === current) return; // already at edge

        laneRef.current = newLane;
        setLane(newLane);

        // Smooth spring animation for player
        playerX.value = withSpring(
            LANE_WIDTH * newLane + LANE_WIDTH / 2 - PLAYER_SIZE / 2,
            { damping: 14, stiffness: 280, mass: 0.6 }
        );

        // Tap feedback: slight scale pulse
        playerScale.value = withSequence(
            withTiming(1.15, { duration: 60 }),
            withSpring(1, { damping: 8 })
        );

        // Haptic
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Visual flash
        if (direction === 'left') setShowLeftFlash(Date.now());
        else setShowRightFlash(Date.now());
    }, []);

    // ─── START GAME ──────────────────────────────────────
    const startGame = useCallback(() => {
        const lvl = currentLevelRef.current;
        if (!lvl) return;

        scoreRef.current = 0;
        streakRef.current = 0;
        itemsRef.current = [];
        laneRef.current = 1;
        speedRef.current = lvl.speed;
        gameTimeRef.current = 0;
        spawnTimerRef.current = 0;
        frameCountRef.current = 0;

        setScore(0);
        setStreak(0);
        setItems([]);
        setLane(1);
        setTimeLeft(lvl.duration);
        setLevelStatus(null);
        setGameState('playing');

        playerX.value = withSpring(LANE_WIDTH + LANE_WIDTH / 2 - PLAYER_SIZE / 2);
        playerGlow.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1200 }),
                withTiming(0, { duration: 1200 })
            ),
            -1, true
        );

        lastTimeRef.current = 0;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);
    }, []);

    // ─── GAME OVER ───────────────────────────────────────
    const endGame = useCallback((success: boolean) => {
        gameStateRef.current = 'gameover';
        setGameState('gameover');
        setLevelStatus(success ? 'completed' : 'failed');
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        Haptics.notificationAsync(
            success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
        );

        if (success && currentLevelRef.current) {
            const lvlId = currentLevelRef.current.id;
            setUnlockedLevels(prev => Math.max(prev, lvlId + 1));
        }
    }, []);

    // ─── GAME LOOP ───────────────────────────────────────
    const gameLoop = useCallback((time: number) => {
        if (gameStateRef.current !== 'playing') return;

        if (lastTimeRef.current === 0) {
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const dt = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Cap delta to avoid huge jumps when tabbing back
        const deltaTime = Math.min(dt, 50);
        gameTimeRef.current += deltaTime;
        frameCountRef.current += 1;

        const currentLane = laneRef.current;
        const currentSpeed = speedRef.current;
        const lvl = currentLevelRef.current;
        if (!lvl) return;

        // ── Physics & Collision ──
        const nextItems: GameItem[] = [];
        let hit = false;
        let collected = false;

        for (const item of itemsRef.current) {
            const newY = item.y + currentSpeed * (deltaTime / 16);

            // Collision zone
            const inCollisionY = newY > PLAYER_Y - ITEM_SIZE * 0.6 && newY < PLAYER_Y + PLAYER_SIZE * 0.6;
            const inCollisionX = item.lane === currentLane;

            if (inCollisionY && inCollisionX) {
                if (item.type === 'obstacle') {
                    hit = true;
                    break;
                } else {
                    collected = true;
                    // don't push — consumed
                }
            } else if (newY < GAME_HEIGHT + 30) {
                nextItems.push({ ...item, y: newY });
            }
        }

        if (hit) {
            endGame(false);
            return;
        }

        if (collected) {
            scoreRef.current += 50;
            streakRef.current = Math.min(100, streakRef.current + 12);
            setScore(scoreRef.current);
            setStreak(streakRef.current);

            // Score flash
            scoreFlash.value = withSequence(
                withTiming(1, { duration: 50 }),
                withTiming(0, { duration: 250 })
            );

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        itemsRef.current = nextItems;

        // ── Spawning ──
        spawnTimerRef.current += deltaTime;
        const spawnInterval = Math.max(450, 1200 / (currentSpeed * 0.8));
        if (spawnTimerRef.current > spawnInterval) {
            const spawnLane = Math.floor(Math.random() * 3);
            const type: ItemType = Math.random() > 0.35 ? 'obstacle' : 'orb';
            itemsRef.current.push({ id: time + Math.random(), lane: spawnLane, type, y: -ITEM_SIZE });
            spawnTimerRef.current = 0;

            streakRef.current = Math.max(0, streakRef.current - 0.8);
            setStreak(Math.round(streakRef.current));
        }

        // ── Timer ──
        const totalTime = lvl.duration * 1000;
        const remaining = Math.max(0, (totalTime - gameTimeRef.current) / 1000);
        setTimeLeft(Math.ceil(remaining));

        if (gameTimeRef.current >= totalTime) {
            endGame(true);
            return;
        }

        // ── Difficulty ramp ──
        speedRef.current = lvl.speed + gameTimeRef.current / 25000;

        // ── Sync items to UI (every 2nd frame for perf) ──
        if (frameCountRef.current % 2 === 0) {
            setItems([...itemsRef.current]);
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [endGame]);

    // cleanup
    useEffect(() => {
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, []);

    // ─── ANIMATED STYLES ─────────────────────────────────
    const playerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: playerX.value },
            { scale: playerScale.value },
        ],
    }));

    const playerGlowStyle = useAnimatedStyle(() => ({
        opacity: 0.2 + playerGlow.value * 0.3,
        transform: [{ scale: 1 + playerGlow.value * 0.15 }],
    }));

    const scoreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + scoreFlash.value * 0.2 }],
    }));

    // ═════════════════════════════════════════════════════
    //  RENDER
    // ═════════════════════════════════════════════════════

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#020617', '#0f172a', '#020617']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* ─── HEADER ─────────────────────────────── */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => {
                        if (requestRef.current) cancelAnimationFrame(requestRef.current);
                        if (gameState === 'playing') {
                            gameStateRef.current = 'level-select';
                            setGameState('level-select');
                        } else {
                            router.back();
                        }
                    }}
                    style={styles.backBtn}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
                </Pressable>
                <Text style={styles.title}>Focus Flow</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ═══════════════════════════════════════════ */}
            {/*  LEVEL SELECT                              */}
            {/* ═══════════════════════════════════════════ */}
            {gameState === 'level-select' && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.screenContainer}>
                    <View style={{ alignItems: 'center', marginBottom: 28 }}>
                        <MaterialCommunityIcons name="trophy" size={44} color="#facc15" />
                        <Text style={styles.screenTitle}>Progression</Text>
                        <Text style={styles.screenSubtitle}>Select your focus level</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        {LEVEL_CONFIG.map(lvl => {
                            const isLocked = lvl.id > unlockedLevels;
                            const isCompleted = lvl.id < unlockedLevels;
                            return (
                                <Pressable
                                    key={lvl.id}
                                    disabled={isLocked}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setCurrentLevel(lvl);
                                        currentLevelRef.current = lvl;
                                        setGameState('intro');
                                    }}
                                    style={[styles.levelCard, isLocked && { opacity: 0.35 }]}
                                >
                                    <LinearGradient
                                        colors={lvl.colors as unknown as [string, string, ...string[]]}
                                        style={styles.levelBadge}
                                    >
                                        {isLocked ? (
                                            <MaterialCommunityIcons name="lock" size={18} color="rgba(255,255,255,0.5)" />
                                        ) : (
                                            <Text style={styles.levelBadgeText}>{lvl.id}</Text>
                                        )}
                                    </LinearGradient>

                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.levelName}>{lvl.name}</Text>
                                            {isCompleted && <MaterialCommunityIcons name="check-circle" size={14} color="#10b981" />}
                                        </View>
                                        <Text style={styles.levelDesc}>{lvl.desc}</Text>
                                    </View>

                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.labelMicro}>Speed</Text>
                                        <Text style={styles.levelSpeed}>{lvl.speed}x</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  INTRO                                     */}
            {/* ═══════════════════════════════════════════ */}
            {gameState === 'intro' && currentLevel && (
                <Animated.View entering={FadeIn.duration(300)} style={[styles.screenContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                    <LinearGradient
                        colors={currentLevel.colors as unknown as [string, string, ...string[]]}
                        style={styles.introIcon}
                    >
                        <MaterialCommunityIcons name="lightning-bolt" size={44} color="white" />
                    </LinearGradient>

                    <Text style={[styles.screenTitle, { marginTop: 16 }]}>{currentLevel.name}</Text>
                    <Text style={styles.introSubtext}>
                        Survive for{' '}
                        <Text style={{ color: 'white', fontWeight: '800' }}>{currentLevel.duration}s</Text>
                        {' '}to unlock the next level.
                    </Text>

                    <View style={styles.introHint}>
                        <MaterialCommunityIcons name="gesture-tap" size={28} color="#22d3ee" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Tap to Move</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Tap left or right side of the screen</Text>
                        </View>
                    </View>

                    <Pressable onPress={startGame} style={styles.startBtn}>
                        <MaterialCommunityIcons name="play" size={24} color="black" />
                        <Text style={styles.startBtnText}>START</Text>
                    </Pressable>

                    <Pressable onPress={() => setGameState('level-select')} style={{ marginTop: 16 }}>
                        <Text style={styles.linkText}>Back to Levels</Text>
                    </Pressable>
                </Animated.View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  PLAYING                                   */}
            {/* ═══════════════════════════════════════════ */}
            {gameState === 'playing' && (
                <View style={{ flex: 1 }}>
                    {/* HUD */}
                    <View style={styles.hud}>
                        <View>
                            <Text style={styles.labelMicro}>Score</Text>
                            <Animated.Text style={[styles.hudValue, scoreStyle]}>
                                {score.toString().padStart(5, '0')}
                            </Animated.Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.labelMicro}>Time</Text>
                            <Text style={[styles.hudValue, timeLeft <= 5 && { color: '#f87171' }]}>
                                {timeLeft}s
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.labelMicro}>Streak</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                <MaterialCommunityIcons name="fire" size={14} color={streak > 40 ? '#f59e0b' : '#475569'} />
                                <Text style={styles.hudValue}>{Math.round(streak)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Streak Bar */}
                    <View style={styles.streakBarBg}>
                        <LinearGradient
                            colors={['#f59e0b', '#ef4444']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.streakBarFill, { width: `${Math.min(100, streak)}%` as any }]}
                        />
                    </View>

                    {/* GAME ARENA */}
                    <View style={styles.arena}>
                        {/* Lane highlight + dividers */}
                        {[0, 1, 2].map(l => (
                            <View key={l} style={[
                                styles.lane,
                                { left: l * LANE_WIDTH, width: LANE_WIDTH },
                                l === lane && styles.laneActive,
                                l < 2 && styles.laneDivider,
                            ]} />
                        ))}

                        <Scanline />

                        {/* Falling Items */}
                        {items.map(item => (
                            <View
                                key={item.id}
                                style={[styles.itemWrap, {
                                    top: item.y,
                                    left: item.lane * LANE_WIDTH + LANE_WIDTH / 2 - ITEM_SIZE / 2,
                                }]}
                            >
                                {item.type === 'obstacle' ? (
                                    <View style={styles.obstacle} />
                                ) : (
                                    <View style={styles.orb}>
                                        <View style={styles.orbInner} />
                                    </View>
                                )}
                            </View>
                        ))}

                        {/* Player Ship */}
                        <Animated.View style={[styles.playerWrap, playerStyle]}>
                            <Animated.View style={[styles.playerGlow, playerGlowStyle]} />
                            <LinearGradient
                                colors={['#22d3ee', '#6366f1']}
                                style={styles.playerShip}
                            >
                                <MaterialCommunityIcons name="eye" size={18} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
                            </LinearGradient>
                        </Animated.View>

                        {/* TAP ZONES — invisible, full-height */}
                        <Pressable
                            onPress={() => changeLane('left')}
                            style={[styles.tapZone, { left: 0 }]}
                        />
                        <Pressable
                            onPress={() => changeLane('right')}
                            style={[styles.tapZone, { right: 0 }]}
                        />
                    </View>

                    {/* Controls hint */}
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <Text style={styles.hintText}>Tap left / right to dodge</Text>
                    </View>
                </View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  GAME OVER                                 */}
            {/* ═══════════════════════════════════════════ */}
            {gameState === 'gameover' && (
                <Animated.View entering={FadeIn.duration(400)} style={[styles.screenContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                    {/* Status pill */}
                    <View style={[
                        styles.statusPill,
                        {
                            backgroundColor: levelStatus === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            borderColor: levelStatus === 'completed' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
                        },
                    ]}>
                        <Text style={[styles.statusText, { color: levelStatus === 'completed' ? '#34d399' : '#f87171' }]}>
                            {levelStatus === 'completed' ? 'Level Complete' : 'Game Over'}
                        </Text>
                    </View>

                    <Text style={styles.labelMicro}>Final Score</Text>
                    <Text style={styles.bigScore}>{score}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="timer" size={18} color="#64748b" />
                            <Text style={[styles.labelMicro, { marginTop: 4 }]}>Level</Text>
                            <Text style={styles.statValue}>{currentLevel?.name}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="fire" size={18} color="#64748b" />
                            <Text style={[styles.labelMicro, { marginTop: 4 }]}>Streak</Text>
                            <Text style={styles.statValue}>{Math.round(streak)}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
                        {levelStatus === 'completed' ? (
                            <Pressable onPress={() => setGameState('level-select')} style={styles.primaryBtn}>
                                <Text style={styles.primaryBtnText}>NEXT LEVEL</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="black" />
                            </Pressable>
                        ) : (
                            <Pressable onPress={startGame} style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]}>
                                <MaterialCommunityIcons name="restart" size={20} color="white" />
                                <Text style={[styles.primaryBtnText, { color: 'white' }]}>RETRY</Text>
                            </Pressable>
                        )}
                        <Pressable onPress={() => setGameState('level-select')} style={styles.secondaryBtn}>
                            <Text style={styles.linkText}>Return to Hub</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    title: {
        color: 'white', fontSize: 19, fontWeight: '800', letterSpacing: -0.3,
    },

    // Screens
    screenContainer: {
        flex: 1, paddingHorizontal: 20, justifyContent: 'center',
    },
    screenTitle: {
        color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 8,
    },
    screenSubtitle: {
        color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 2, marginTop: 4,
    },

    // Level Select
    levelCard: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    levelBadge: {
        width: 46, height: 46, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center',
    },
    levelBadgeText: {
        color: 'white', fontSize: 18, fontWeight: '900',
    },
    levelName: {
        color: 'white', fontSize: 16, fontWeight: '700',
    },
    levelDesc: {
        color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 1,
    },
    levelSpeed: {
        color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '700', fontFamily: 'monospace',
    },
    labelMicro: {
        color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: 1.5,
    },

    // Intro
    introIcon: {
        width: 88, height: 88, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    introSubtext: {
        color: 'rgba(255,255,255,0.45)', textAlign: 'center',
        marginTop: 8, marginBottom: 28, paddingHorizontal: 32, lineHeight: 20,
    },
    introHint: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 14, width: '100%', marginBottom: 16,
    },
    startBtn: {
        backgroundColor: '#22d3ee', borderRadius: 18, paddingVertical: 18,
        width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    startBtnText: {
        color: 'black', fontSize: 20, fontWeight: '900',
    },
    linkText: {
        color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 2,
    },

    // HUD
    hud: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingHorizontal: 20, marginBottom: 8,
    },
    hudValue: {
        color: 'white', fontSize: 22, fontWeight: '900', fontFamily: 'monospace',
    },
    streakBarBg: {
        height: 3, backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 99, marginHorizontal: 20, marginBottom: 10, overflow: 'hidden',
    },
    streakBarFill: {
        height: '100%', borderRadius: 99,
    },

    // Arena
    arena: {
        height: GAME_HEIGHT, marginHorizontal: ARENA_MARGIN,
        borderRadius: 24, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(15,23,42,0.6)',
    },
    lane: {
        position: 'absolute', top: 0, bottom: 0,
    },
    laneActive: {
        backgroundColor: 'rgba(34,211,238,0.04)',
    },
    laneDivider: {
        borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.03)',
    },

    // Items
    itemWrap: {
        position: 'absolute', width: ITEM_SIZE, height: ITEM_SIZE, zIndex: 10,
    },
    obstacle: {
        width: ITEM_SIZE - 4, height: ITEM_SIZE - 4, margin: 2,
        backgroundColor: '#ef4444', borderRadius: 6,
        transform: [{ rotate: '45deg' }],
        borderWidth: 1, borderColor: 'rgba(252,165,165,0.5)',
        shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    orb: {
        width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: ITEM_SIZE / 2,
        backgroundColor: '#22d3ee', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#22d3ee', shadowOpacity: 0.7, shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
    },
    orbInner: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: 'white', opacity: 0.8,
    },

    // Player
    playerWrap: {
        position: 'absolute', top: PLAYER_Y, width: PLAYER_SIZE, height: PLAYER_SIZE, zIndex: 20,
    },
    playerGlow: {
        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
        borderRadius: 24, borderWidth: 2, borderColor: 'rgba(34,211,238,0.3)',
    },
    playerShip: {
        width: PLAYER_SIZE, height: PLAYER_SIZE, borderRadius: 14,
        transform: [{ rotate: '45deg' }],
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)',
        shadowColor: '#22d3ee', shadowOpacity: 0.4, shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
    },

    // Tap zones
    tapZone: {
        position: 'absolute', top: 0, bottom: 0, width: '50%', zIndex: 30,
    },

    hintText: {
        color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 2,
    },

    // Game Over
    statusPill: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99,
        borderWidth: 1, marginBottom: 20,
    },
    statusText: {
        fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2,
    },
    bigScore: {
        color: 'white', fontSize: 64, fontWeight: '900', fontFamily: 'monospace', marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row', gap: 10, width: '100%', marginBottom: 24,
    },
    statCard: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 16, alignItems: 'center',
    },
    statValue: {
        color: 'white', fontSize: 20, fontWeight: '700', marginTop: 2,
    },
    primaryBtn: {
        backgroundColor: 'white', borderRadius: 18, paddingVertical: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    primaryBtnText: {
        color: 'black', fontSize: 17, fontWeight: '900',
    },
    secondaryBtn: {
        paddingVertical: 12, alignItems: 'center',
    },
});
