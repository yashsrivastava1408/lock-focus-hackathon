/**
 * Persistent Storage Utility for Lock Focus
 * Uses localStorage to maintain a "Privacy-First" local database.
 */

const STORAGE_KEY = 'lock_focus_data';

// Initial state structure
const initialState = {
    user: {
        name: 'Explorer',
        level: 4,
        xp: 12450,
        streak: 3,
        lastActive: new Date().toISOString()
    },
    sessions: [
        // { id, type, score, timestamp, details }
    ],
    stats: {
        avgReactionTime: 280,
        focusScore: 92,
        totalTrainingTime: '5h 32m',
        sessionsThisMonth: 22
    }
};

const getStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialState;
};

const saveStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const storage = {
    // Save a new game session
    saveSession: (type, score, details = {}) => {
        const data = getStorage();
        const newSession = {
            id: Date.now(),
            type, // 'time-blindness', 'syllable-slasher', 'letter-match', 'focus-scan'
            score,
            timestamp: new Date().toISOString(),
            details
        };

        data.sessions.push(newSession);

        // Update XP (simple logic: score * 10)
        const xpGained = Math.round(score * 10);
        data.user.xp += xpGained;

        // Update Stats (Rolling average for reaction if applicable)
        if (type === 'focus-scan' || type === 'letter-match') {
            const reactionSessions = data.sessions.filter(s => s.type === type && s.details.reactionTime);
            if (reactionSessions.length > 0) {
                const totalRT = reactionSessions.reduce((acc, s) => acc + s.details.reactionTime, 0);
                data.stats.avgReactionTime = Math.round(totalRT / reactionSessions.length);
            }
        }

        // Update focus score (average of last 5 sessions)
        const recentSessions = data.sessions.slice(-5);
        const avgScore = recentSessions.reduce((acc, s) => acc + s.score, 0) / recentSessions.length;
        data.stats.focusScore = Math.round(avgScore);

        data.user.lastActive = new Date().toISOString();
        saveStorage(data);
        return newSession;
    },

    // Get all sessions
    getSessions: () => getStorage().sessions,

    // Get stats
    getStats: () => getStorage().stats,

    // Get user info
    getUser: () => getStorage().user,

    // Format data for charts
    getChartData: () => {
        const data = getStorage();
        // Group by week or type as needed by ProgressCharts.jsx
        return data.sessions;
    },

    // Reset data (for testing)
    reset: () => {
        saveStorage(initialState);
    }
};
