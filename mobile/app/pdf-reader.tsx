import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown, Layout, SlideInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type ReaderMode = 'dyslexia' | 'adhd' | 'vision';

const MODES: Record<ReaderMode, {
    label: string,
    desc: string,
    bg: string,
    text: string,
    font: string, // Simplified for React Native (system fonts)
    spacing: number, // Line height multiplier
    letterSpacing: number,
    icon: string
}> = {
    dyslexia: {
        label: 'Dyslexia Friendly',
        desc: 'Cream bg, heavy bottom font',
        bg: '#FAF3E0', // Cream
        text: '#000000',
        font: 'System', // iOS/Android default sans-serif is usually good
        spacing: 32, // Relaxed line height
        letterSpacing: 1.5,
        icon: 'format-letter-case'
    },
    adhd: {
        label: 'ADHD Focus',
        desc: 'Structured, high contrast',
        bg: '#F0F4F8',
        text: '#111827',
        font: 'System',
        spacing: 28,
        letterSpacing: 0.5,
        icon: 'lightning-bolt'
    },
    vision: {
        label: 'Vision Stress',
        desc: 'Soft, low contrast',
        bg: '#E3F2ED', // Muted mint
        text: '#2D3748',
        font: 'System',
        spacing: 30,
        letterSpacing: 0.2,
        icon: 'eye'
    }
};

const DEMO_TEXT = `This is a demonstration of the Adaptive PDF Reader. 

In a full implementation, this tool would extract text from your uploaded PDF documents and reflow it according to your accessibility needs.

For Dyslexia: We use warm background colors to reduce visual stress, and generous spacing to prevent "river effects" in the text.

For ADHD: We break content into manageable chunks (simulated here) and use clear, high-contrast typography to maintain focus.

For Vision Stress: We use soft, muted colors (like mint or pastel blue) to reduce glare and eye strain.

Upload a file to see how we handle different document types. Even without full text extraction in this demo, you can experience the comfort of the adaptive reading environment.`;

export default function PdfReaderScreen() {
    const router = useRouter();
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [mode, setMode] = useState<ReaderMode>('dyslexia');
    const [isProcessing, setIsProcessing] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            setFile(asset);
            setIsProcessing(true);

            // Simulate processing delay
            setTimeout(() => {
                setIsProcessing(false);
                // In a real app with a native PDF extraction library, we would parse `asset.uri` here.
                // For this Expo Go demo, we use the demo text to showcase the UI transformation.
                setContent(DEMO_TEXT + "\n\n" + `(Filename: ${asset.name}, Size: ${(asset.size ? asset.size / 1024 : 0).toFixed(1)} KB)`);
            }, 1500);

        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const currentTheme = MODES[mode];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
            <Stack.Screen options={{ headerShown: false }} />

            {!content && (
                <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]}>
                    <LinearGradient
                        colors={['#020617', '#0f172a', '#020617']}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>
            )}

            {/* HEADER (Only show if not reading, or overlay if reading?) */}
            {!content && (
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.title}>Adaptive Reader</Text>
                    <View style={{ width: 40 }} />
                </View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  LANDING / UPLOAD                          */}
            {/* ═══════════════════════════════════════════ */}
            {!content && !isProcessing && (
                <Animated.View entering={FadeInDown.delay(100)} style={styles.centerContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="file-document-outline" size={48} color="#2dd4bf" />
                    </View>
                    <Text style={styles.landingTitle}>Transform your PDFs</Text>
                    <Text style={styles.landingSubtitle}>
                        Upload a document to read it in a format optimized for Dyslexia, ADHD, or Vision Stress.
                    </Text>

                    <Pressable onPress={pickDocument} style={styles.uploadBtn}>
                        <MaterialCommunityIcons name="upload" size={24} color="white" />
                        <Text style={styles.uploadBtnText}>Select PDF File</Text>
                    </Pressable>
                </Animated.View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  PROCESSING                                */}
            {/* ═══════════════════════════════════════════ */}
            {isProcessing && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2dd4bf" />
                    <Text style={[styles.landingSubtitle, { marginTop: 20 }]}>
                        Optimizing layout...
                    </Text>
                </View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*  READING VIEW                              */}
            {/* ═══════════════════════════════════════════ */}
            {content && (
                <View style={{ flex: 1, backgroundColor: currentTheme.bg }}>
                    {/* Reading Header */}
                    <View style={[styles.readerHeader, { borderBottomColor: currentTheme.text + '10' }]}>
                        <Pressable onPress={() => setContent(null)} style={{ padding: 8 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={currentTheme.text} />
                        </Pressable>
                        <Text style={[styles.fileName, { color: currentTheme.text }]}>
                            {file?.name || 'Document'}
                        </Text>
                        <Pressable onPress={() => setShowSettings(true)} style={{ padding: 8 }}>
                            <MaterialCommunityIcons name="cog" size={24} color={currentTheme.text} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                        <Text style={{
                            color: currentTheme.text,
                            fontSize: 18,
                            lineHeight: currentTheme.spacing,
                            letterSpacing: currentTheme.letterSpacing,
                            fontFamily: currentTheme.font, // System font for now
                        }}>
                            {content}
                        </Text>
                    </ScrollView>

                    {/* SETTINGS SHEET */}
                    {showSettings && (
                        <Pressable onPress={() => setShowSettings(false)} style={StyleSheet.absoluteFill}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                        </Pressable>
                    )}

                    {showSettings && (
                        <Animated.View
                            entering={SlideInDown}
                            style={styles.settingsSheet}
                        >
                            <Text style={styles.sheetTitle}>Reading Mode</Text>
                            <View style={{ gap: 12 }}>
                                {(Object.keys(MODES) as ReaderMode[]).map(m => {
                                    const isActive = mode === m;
                                    const theme = MODES[m];
                                    return (
                                        <Pressable
                                            key={m}
                                            onPress={() => setMode(m)}
                                            style={[
                                                styles.modeOption,
                                                isActive ? { borderColor: '#2dd4bf', backgroundColor: '#f0fdfa' } : { borderColor: '#e2e8f0' }
                                            ]}
                                        >
                                            <View style={[styles.modeIcon, { backgroundColor: theme.bg }]}>
                                                <MaterialCommunityIcons name={theme.icon as any} size={20} color={theme.text} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.modeLabel, isActive && { color: '#0f766e' }]}>{theme.label}</Text>
                                                <Text style={styles.modeDesc}>{theme.desc}</Text>
                                            </View>
                                            {isActive && <MaterialCommunityIcons name="check-circle" size={20} color="#0d9488" />}
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <Pressable onPress={() => setShowSettings(false)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Done</Text>
                            </Pressable>
                        </Animated.View>
                    )}
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    title: {
        color: 'white', fontSize: 18, fontWeight: '700',
    },
    centerContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
    },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(45,212,191,0.1)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    landingTitle: {
        color: 'white', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12,
    },
    landingSubtitle: {
        color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40,
    },
    uploadBtn: {
        backgroundColor: '#2dd4bf', paddingVertical: 16, paddingHorizontal: 32,
        borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    uploadBtnText: {
        color: '#0f172a', fontSize: 18, fontWeight: '700',
    },
    readerHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    },
    fileName: {
        fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 16,
    },
    settingsSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
        shadowOffset: { width: 0, height: -5 },
    },
    sheetTitle: {
        fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20,
    },
    modeOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: 16, borderWidth: 2,
    },
    modeIcon: {
        width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
    modeLabel: {
        fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2,
    },
    modeDesc: {
        fontSize: 12, color: '#64748b',
    },
    closeBtn: {
        backgroundColor: '#0f172a', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24,
    },
    closeBtnText: {
        color: 'white', fontSize: 16, fontWeight: '700',
    },
});
