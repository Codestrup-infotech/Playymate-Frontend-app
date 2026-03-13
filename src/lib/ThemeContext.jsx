"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => { } });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    // On mount, read saved preference (default to light)
    useEffect(() => {
        const saved = localStorage.getItem("playymate-theme");
        if (saved === "dark" || saved === "light") {
            setTheme(saved);
        }
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("playymate-theme", next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
