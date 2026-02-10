import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PlaceholderGame() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { title, reason } = params;

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-6 py-4">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
            </View>

            <View className="flex-1 items-center justify-center px-8 text-center pb-20">
                <View className="w-24 h-24 bg-slate-800 rounded-3xl items-center justify-center mb-6 border border-slate-700">
                    <MaterialCommunityIcons name="tools" size={48} color="#64748b" />
                </View>
                <Text className="text-white text-3xl font-bold mb-4">{title || 'Coming Soon'}</Text>
                <Text className="text-slate-400 text-center text-lg leading-relaxed mb-8">
                    This module requires advanced hardware access ({reason || 'Camera/Sensors'}) which is currently being ported to mobile.
                </Text>

                <View className="bg-blue-600/10 px-6 py-3 rounded-xl border border-blue-500/20">
                    <Text className="text-blue-400 font-bold">Stay tuned for updates!</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
