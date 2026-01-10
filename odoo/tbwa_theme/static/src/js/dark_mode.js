/** @odoo-module **/

/**
 * TBWA Theme - Theme & Dark Mode Toggle
 *
 * This module provides:
 * - Dark mode toggle functionality
 * - Theme mode switching (TBWA Brand vs System/Minimal)
 *
 * Theme Modes:
 * - "tbwa": Vibrant TBWA brand colors (Yellow, Turquoise)
 * - "system": Muted, professional colors (like Claude/ChatGPT)
 */

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const DARK_MODE_KEY = "tbwa_dark_mode";
const THEME_MODE_KEY = "tbwa_theme_mode";
const DARK_MODE_CLASS = "dark";
const THEME_MODES = {
    TBWA: "tbwa",
    SYSTEM: "system"
};

/**
 * Get the current dark mode preference
 * @returns {boolean} - True if dark mode is enabled
 */
function getDarkModePreference() {
    // Check localStorage first
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
        return stored === "true";
    }

    // Fall back to system preference
    if (window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    return false;
}

/**
 * Set the dark mode preference
 * @param {boolean} enabled - Whether dark mode should be enabled
 */
function setDarkModePreference(enabled) {
    localStorage.setItem(DARK_MODE_KEY, String(enabled));
}

/**
 * Get the current theme mode
 * @returns {string} - "tbwa" or "system"
 */
function getThemeMode() {
    return localStorage.getItem(THEME_MODE_KEY) || THEME_MODES.TBWA;
}

/**
 * Set the theme mode
 * @param {string} mode - "tbwa" or "system"
 */
function setThemeMode(mode) {
    localStorage.setItem(THEME_MODE_KEY, mode);
}

/**
 * Apply theme mode to the document
 * @param {string} mode - "tbwa" or "system"
 */
function applyThemeMode(mode) {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    body.classList.remove("theme-tbwa", "theme-system");
    root.classList.remove("theme-tbwa", "theme-system");

    // Apply new theme
    const themeClass = `theme-${mode}`;
    body.classList.add(themeClass);
    root.classList.add(themeClass);
    root.setAttribute("data-theme-mode", mode);
}

/**
 * Toggle between TBWA and System theme modes
 * @returns {string} - The new theme mode
 */
function toggleThemeMode() {
    const currentMode = getThemeMode();
    const newMode = currentMode === THEME_MODES.TBWA ? THEME_MODES.SYSTEM : THEME_MODES.TBWA;
    setThemeMode(newMode);
    applyThemeMode(newMode);
    return newMode;
}

/**
 * Apply dark mode to the document
 * @param {boolean} enabled - Whether dark mode should be enabled
 */
function applyDarkMode(enabled) {
    const root = document.documentElement;
    const body = document.body;

    if (enabled) {
        root.classList.add(DARK_MODE_CLASS);
        body.classList.add(DARK_MODE_CLASS);
        root.setAttribute("data-theme", "dark");
    } else {
        root.classList.remove(DARK_MODE_CLASS);
        body.classList.remove(DARK_MODE_CLASS);
        root.setAttribute("data-theme", "light");
    }
}

/**
 * Toggle dark mode
 * @returns {boolean} - The new dark mode state
 */
function toggleDarkMode() {
    const currentState = getDarkModePreference();
    const newState = !currentState;
    setDarkModePreference(newState);
    applyDarkMode(newState);
    return newState;
}

// Initialize theme and dark mode on page load
document.addEventListener("DOMContentLoaded", () => {
    // Apply theme mode
    const themeMode = getThemeMode();
    applyThemeMode(themeMode);

    // Apply dark mode
    const darkEnabled = getDarkModePreference();
    applyDarkMode(darkEnabled);
});

// Listen for system preference changes
if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        // Only apply if user hasn't set a manual preference
        if (localStorage.getItem(DARK_MODE_KEY) === null) {
            applyDarkMode(e.matches);
        }
    });
}

// Handle click on dark mode toggle in navbar
document.addEventListener("click", (e) => {
    // Dark mode toggle
    const darkTarget = e.target.closest(".o_toggle_dark_mode");
    if (darkTarget) {
        e.preventDefault();
        const newState = toggleDarkMode();

        // Update the icon
        const icon = darkTarget.querySelector("i");
        if (icon) {
            icon.className = newState ? "fa fa-fw fa-sun-o me-1" : "fa fa-fw fa-moon-o me-1";
        }

        // Update the text
        const textNode = darkTarget.childNodes[darkTarget.childNodes.length - 1];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = newState ? " Light Mode" : " Dark Mode";
        }
    }

    // Theme mode toggle (TBWA vs System)
    const themeTarget = e.target.closest(".o_toggle_theme_mode");
    if (themeTarget) {
        e.preventDefault();
        const newMode = toggleThemeMode();

        // Update the icon
        const icon = themeTarget.querySelector("i");
        if (icon) {
            icon.className = newMode === THEME_MODES.SYSTEM
                ? "fa fa-fw fa-paint-brush me-1"
                : "fa fa-fw fa-adjust me-1";
        }

        // Update the text
        const textNode = themeTarget.childNodes[themeTarget.childNodes.length - 1];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = newMode === THEME_MODES.SYSTEM
                ? " Brand Mode"
                : " System Mode";
        }
    }
});

/**
 * Dark Mode Systray Component (OWL)
 * Alternative implementation using OWL component for the systray
 */
class DarkModeToggle extends Component {
    static template = "tbwa_theme.DarkModeToggle";

    setup() {
        this.state = useState({
            isDark: getDarkModePreference()
        });

        onMounted(() => {
            applyDarkMode(this.state.isDark);
        });
    }

    toggleDarkMode() {
        this.state.isDark = toggleDarkMode();
    }

    get icon() {
        return this.state.isDark ? "fa-sun-o" : "fa-moon-o";
    }

    get label() {
        return this.state.isDark ? "Light Mode" : "Dark Mode";
    }
}

// Register the component (optional - can be used in systray)
registry.category("systray").add("tbwa_theme.DarkModeToggle", {
    Component: DarkModeToggle,
    sequence: 1,
});

// Export for use in other modules
export {
    // Dark mode
    getDarkModePreference,
    setDarkModePreference,
    applyDarkMode,
    toggleDarkMode,
    // Theme mode
    getThemeMode,
    setThemeMode,
    applyThemeMode,
    toggleThemeMode,
    THEME_MODES,
    // Components
    DarkModeToggle
};
