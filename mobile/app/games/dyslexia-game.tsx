import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LETTERS = [
    { target: 'b', distractions: ['d', 'p', 'q', 'h'] },
    { target: 'd', distractions: ['b', 'q', 'p', 'g'] },
    { target: 'p', distractions: ['q', 'b', 'd', '9'] },
    { target: 'q', distractions: ['p', 'd', 'b', 'g'] },
    { target: 'm', distractions: ['w', 'n', 'u', 'v'] },
    { target: 'w', distractions: ['m', 'v', 'u', 'n'] },
];

export default function DyslexiaGame() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [target, setTarget] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<number | null>(null); // Index of clicked item

    const newRound = () => {
        const set = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        setTarget(set.target);

        const correct = set.target;
        // Create 3 distractions
        const dists = set.distractions.sort(() => 0.5 - Math.random()).slice(0, 3);
        const opts = [correct, ...dists].sort(() => 0.5 - Math.random());
        setOptions(opts);
        setFeedback(null);
    };

    useEffect(() => {
        newRound();
    }, []);

    const handlePress = (char: string, index: number) => {
        if (feedback !== null) return;
        setFeedback(index);

        if (char === target) {
            setScore(s => s + 10);
            setTimeout(newRound, 500);
        } else {
            setScore(s => Math.max(0, s - 5));
            setTimeout(newRound, 800);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center bg-slate-900">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Letter Fix</Text>
                <View className="bg-slate-800 px-3 py-1 rounded-lg">
                    <Text className="text-indigo-400 font-bold">{score} pts</Text>
                </View>
            </View>

            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-slate-400 uppercase tracking-widest mb-4">Find this letter</Text>
                <View className="bg-slate-800 w-32 h-32 rounded-3xl items-center justify-center mb-12 border border-slate-700 shadow-lg">
                    <Text className="text-8xl text-white font-bold">{target}</Text>
                </View>

                <View className="flex-row flex-wrap gap-4 justify-center">
                    {options.map((char, i) => {
                        const isSelected = feedback === i;
                        const isCorrect = char === target;
                        let bg = 'bg-slate-800';
                        if (isSelected) {
                            bg = isCorrect ? 'bg-green-600' : 'bg-red-600';
                        }

                        return (
                            <Pressable
                                key={i}
                                onPress={() => handlePress(char, i)}
                                className={`w-36 h-36 rounded-3xl items-center justify-center border border-slate-700 active:scale-95 transition-transform ${bg}`}
                            >
                                <Text className="text-6xl text-white font-bold">{char}</Text>
                                {isSelected && (
                                    <View className="absolute top-2 right-2">
                                        <MaterialCommunityIcons
                                            name={isCorrect ? "check-circle" : "close-circle"}
                                            size={24}
                                            color="white"
                                        />
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}
