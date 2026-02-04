import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Core Theme (Light/Dark)
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    // Accessibility Mode (ADHD, Dyslexia, etc.)
    const [accessibilityMode, setAccessibilityMode] = useState('none');

    // Color Blind Mode
    const [colorBlindMode, setColorBlindMode] = useState('none');

    // Apply Effects
    useEffect(() => {
        const root = window.document.documentElement;

        // Reset classes
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Accessibility Classes
        root.classList.remove('mode-adhd', 'mode-dyslexia', 'mode-vision-stress', 'mode-royal-blue');
        if (accessibilityMode !== 'none') {
            root.classList.add(`mode-${accessibilityMode}`);
        }

        // Color Blind Classes
        root.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
        if (colorBlindMode !== 'none') {
            root.classList.add(`cb-${colorBlindMode}`);
        }

        localStorage.setItem('theme', theme);
        localStorage.setItem('accessibilityMode', accessibilityMode);
        localStorage.setItem('colorBlindMode', colorBlindMode);

    }, [theme, accessibilityMode, colorBlindMode]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme, setTheme,
            accessibilityMode, setAccessibilityMode,
            colorBlindMode, setColorBlindMode
        }}>
            {children}

            {/* SVG Filters for Color Blindness - Invisible but functional */}
            <svg style={{ display: 'none' }}>
                <defs>
                    <filter id="protanopia-filter">
                        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="deuteranopia-filter">
                        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="tritanopia-filter">
                        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0" />
                    </filter>
                </defs>
            </svg>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
