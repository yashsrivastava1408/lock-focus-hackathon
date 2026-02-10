import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ColorMatchGame() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [targetColor, setTargetColor] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Generate a random HSL color
    const generateColor = () => {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.floor(Math.random() * 20); // Vibrant
        const l = 45 + Math.floor(Math.random() * 10); // Readable
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const startNewRound = () => {
        const correct = generateColor();
        const wrong1 = generateColor();
        const wrong2 = generateColor();
        const wrong3 = generateColor();

        setTargetColor(correct);
        // Shuffle options
        setOptions([correct, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5));
    };

    useEffect(() => {
        startNewRound();
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver]);

    const handleGuess = (color: string) => {
        if (gameOver) return;

        if (color === targetColor) {
            setScore(s => s + 10);
            startNewRound();
        } else {
            setScore(s => Math.max(0, s - 5)); // Penalty
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Color Match</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center px-6">
                {/* Score & Timer */}
                <View className="flex-row w-full justify-between mb-8">
                    <View className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <Text className="text-slate-400 text-xs uppercase tracking-wider">Score</Text>
                        <Text className="text-white text-2xl font-bold">{score}</Text>
                    </View>
                    <View className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <Text className="text-slate-400 text-xs uppercase tracking-wider">Time</Text>
                        <Text className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</Text>
                    </View>
                </View>

                {/* Game Area */}
                {!gameOver ? (
                    <>
                        <View className="w-full aspect-square bg-slate-800 rounded-3xl mb-8 border-4 border-slate-700 overflow-hidden items-center justify-center">
                            <View
                                className="w-3/4 h-3/4 rounded-full shadow-2xl"
                                style={{ backgroundColor: targetColor, shadowColor: targetColor, shadowOpacity: 0.5, shadowRadius: 30 }}
                            />
                            <Text className="text-slate-500 mt-4 font-medium">Match this color</Text>
                        </View>

                        <View className="w-full gap-4">
                            <View className="flex-row gap-4">
                                {options.slice(0, 2).map((color, i) => (
                                    <Pressable
                                        key={i}
                                        onPress={() => handleGuess(color)}
                                        className="flex-1 h-24 rounded-2xl active:opacity-80 border-2 border-white/10"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </View>
                            <View className="flex-row gap-4">
                                {options.slice(2, 4).map((color, i) => (
                                    <Pressable
                                        key={i + 2}
                                        onPress={() => handleGuess(color)}
                                        className="flex-1 h-24 rounded-2xl active:opacity-80 border-2 border-white/10"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </View>
                        </View>
                    </>
                ) : (
                    <View className="items-center">
                        <Text className="text-white text-4xl font-bold mb-2">Game Over!</Text>
                        <Text className="text-slate-400 text-lg mb-8">Final Score: {score}</Text>

                        <Pressable
                            onPress={() => {
                                setScore(0);
                                setTimeLeft(30);
                                setGameOver(false);
                                startNewRound();
                            }}
                            className="bg-green-500 px-8 py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                        >
                            <Text className="text-white font-bold text-lg">Play Again</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
