/**
 * Utility Functions
 */

class Utils {
    /**
     * Format large numbers (1.2M, 890K)
     */
    static formatViews(count) {
        if (!count) return '0';
        const num = parseInt(count);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * Get difficulty badge color
     */
    static getDifficultyColor(difficulty) {
        const colors = {
            easy: '#10b981',
            medium: '#f59e0b',
            hard: '#ef4444'
        };
        return colors[difficulty] || '#6b7280';
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Animate element
     */
    static animate(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease`;
    }

    /**
     * Get pluralized text
     */
    static plural(count, singular, plural) {
        return count === 1 ? singular : plural;
    }
}
