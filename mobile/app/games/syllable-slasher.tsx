import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SYLLABLE_DATA = [
    { word: 'FANTASTIC', syllables: ['FAN', 'TAS', 'TIC'], correctBreaks: [3, 6] },
    { word: 'WONDERFUL', syllables: ['WON', 'DER', 'FUL'], correctBreaks: [3, 6] },
    { word: 'COMPUTER', syllables: ['COM', 'PU', 'TER'], correctBreaks: [3, 5] },
    { word: 'GARDEN', syllables: ['GAR', 'DEN'], correctBreaks: [3] },
    { word: 'BUTTERFLY', syllables: ['BUT', 'TER', 'FLY'], correctBreaks: [3, 6] },
    { word: 'DINOSAUR', syllables: ['DI', 'NO', 'SAUR'], correctBreaks: [2, 4] },
    { word: 'REALLY', syllables: ['RE', 'ALLY'], correctBreaks: [2] },
    { word: 'UMBRELLA', syllables: ['UM', 'BREL', 'LA'], correctBreaks: [2, 6] },
    { word: 'HAPPINESS', syllables: ['HAP', 'PI', 'NESS'], correctBreaks: [3, 5] },
    { word: 'ORANGE', syllables: ['OR', 'ANGE'], correctBreaks: [2] },
];

export default function SyllableSlasherGame() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [activeWord, setActiveWord] = useState<any>(null);
    const [gameActive, setGameActive] = useState(true);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const spawnWord = () => {
        const randomItem = SYLLABLE_DATA[Math.floor(Math.random() * SYLLABLE_DATA.length)];
        setActiveWord({ ...randomItem, id: Date.now() });
        setFeedback(null);
    };

    useEffect(() => {
        spawnWord();
    }, []);

    const handleSlash = (index: number) => {
        if (feedback) return;

        // Check if index matches any correct break point (index corresponds to character index)
        // Mobile tweak: index is the gap AFTER the character at 'index'
        const splitPoint = index + 1;
        const isCorrect = activeWord.correctBreaks.includes(splitPoint);

        if (isCorrect) {
            setScore(s => s + 10);
            setFeedback('correct');
            setTimeout(spawnWord, 800);
        } else {
            setScore(s => Math.max(0, s - 5));
            setFeedback('wrong');
            setTimeout(spawnWord, 800);
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
                <Text className="text-white text-xl font-bold">Syllable Slasher</Text>
                <View className="bg-slate-800 px-3 py-1 rounded-lg">
                    <Text className="text-orange-400 font-bold">{score} pts</Text>
                </View>
            </View>

            <View className="flex-1 items-center justify-center px-4">
                <View className="mb-12">
                    <Text className="text-slate-400 text-center uppercase tracking-widest mb-2">Instructions</Text>
                    <Text className="text-white text-center">Tap between letters to split the word!</Text>
                </View>

                {activeWord && (
                    <View className="flex-row items-center justify-center flex-wrap bg-slate-800 p-8 rounded-3xl border-2 border-slate-700">
                        {activeWord.word.split('').map((char: string, i: number) => (
                            <View key={i} className="flex-row items-center relative">
                                <Text className={`text-4xl font-black ${feedback === 'wrong' ? 'text-red-500' : feedback === 'correct' ? 'text-green-500' : 'text-white'}`}>
                                    {char}
                                </Text>

                                {/* Render Slash Button Between Letters */}
                                {i < activeWord.word.length - 1 && (
                                    <Pressable
                                        onPress={() => handleSlash(i)}
                                        className="w-8 h-12 items-center justify-center -mx-1 z-10"
                                        hitSlop={10}
                                    >
                                        <View className="w-1 h-full bg-slate-700/30 rounded-full hover:bg-orange-500/50" />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {feedback === 'correct' && (
                    <Text className="text-green-400 text-2xl font-bold mt-8 uppercase tracking-widest">SPLIT!</Text>
                )}
                {feedback === 'wrong' && (
                    <Text className="text-red-400 text-2xl font-bold mt-8 uppercase tracking-widest">MISS!</Text>
                )}
            </View>
        </SafeAreaView>
    );
}
