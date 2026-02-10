const API_URL = 'http://localhost:8000';

export const api = {
    // 1. REGISTER
    register: async (email, password, fullName) => {
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            if (!response.ok) throw new Error('Registration failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // 2. LOGIN
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error('Login failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // 3. SUBMIT SCORE
    submitScore: async (userId, score, gameName = "FocusFlow", level = 0, attentionAvg = 0, details = {}) => {
        try {
            const response = await fetch(`${API_URL}/api/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    score_value: score,
                    game_name: gameName,
                    level_reached: level,
                    attention_avg: attentionAvg,
                    details: details
                }),
            });
            return await response.json();
        } catch (error) {
            console.error("Failed to submit score:", error);
            // Fallback: Don't crash the game if API fails
            return { status: 'offline', ai_feedback: 'Offline Mode: Good game!' };
        }
    },

    // 4. GET LEADERBOARD
    getLeaderboard: async () => {
        try {
            const response = await fetch(`${API_URL}/api/leaderboard`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            return [];
        }
    }
};
