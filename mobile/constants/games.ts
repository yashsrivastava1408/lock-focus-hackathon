export interface Game {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    route: string;
    category: 'ADHD' | 'DYSLEXIA' | 'STRESS';
    badge?: string;
}

export const GAMES: Game[] = [
    // --- ADHD (Focus) ---
    {
        id: 'focus-flow',
        title: 'Focus Flow',
        description: 'Track objects with your eyes',
        icon: 'eye',
        color: 'bg-amber-500',
        route: '/games/focus-flow',
        category: 'ADHD',
        badge: 'Hardware'
    },
    {
        id: 'time-blindness',
        title: 'Time Blindness',
        description: 'Estimate time passing',
        icon: 'timer',
        color: 'bg-amber-600',
        route: '/games/time-blindness',
        category: 'ADHD'
    },

    // --- DYSLEXIA (Accessibility) ---
    {
        id: 'syllable-slasher',
        title: 'Syllable Slasher',
        description: 'Slash words into syllables',
        icon: 'content-cut',
        color: 'bg-orange-500',
        route: '/games/syllable-slasher',
        category: 'DYSLEXIA'
    },
    {
        id: 'dyslexia-game',
        title: 'Letter Fix',
        description: 'Fix inverted letters',
        icon: 'format-letter-case',
        color: 'bg-blue-500',
        route: '/games/dyslexia-game',
        category: 'DYSLEXIA'
    },
    {
        id: 'pdf-reader',
        title: 'Adaptive PDF',
        description: 'Accessible PDF Reader',
        icon: 'file-document-outline',
        color: 'bg-teal-500',
        route: '/pdf-reader',
        category: 'DYSLEXIA',
        badge: 'Utility'
    },

    // --- STRESS (Calm) ---
    {
        id: 'color-match',
        title: 'Color Match',
        description: 'Match the target hue',
        icon: 'palette',
        color: 'bg-pink-500',
        route: '/games/color-match',
        category: 'STRESS'
    },
    {
        id: 'balloon-pop',
        title: 'Balloon Pop',
        description: 'Pop specific colors',
        icon: 'balloon',
        color: 'bg-pink-400',
        route: '/games/balloon-pop',
        category: 'STRESS'
    },
    {
        id: 'zen-drive',
        title: 'Zen Drive',
        description: 'Focus steering',
        icon: 'steering',
        color: 'bg-teal-500',
        route: '/games/zen-drive',
        category: 'STRESS',
        badge: '3D'
    }
];

export const CATEGORIES: Record<string, { label: string; icon: string; color: string; accent: string }> = {
    ADHD: {
        label: 'ADHD',
        icon: 'brain',
        color: '#f59e0b',
        accent: 'rgba(245, 158, 11, 0.1)'
    },
    DYSLEXIA: {
        label: 'Dyslexia',
        icon: 'book-open-variant',
        color: '#3b82f6',
        accent: 'rgba(59, 130, 246, 0.1)'
    },
    STRESS: {
        label: 'Stress',
        icon: 'meditation',
        color: '#ec4899',
        accent: 'rgba(236, 72, 153, 0.1)'
    }
};
