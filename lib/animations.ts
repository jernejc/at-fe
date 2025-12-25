/**
 * Shared Framer Motion animation variants
 * Use these for consistent animations across the application
 */

// Stagger container for list animations
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Fast stagger for quicker list reveals
export const staggerContainerFast = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

// Fade in and slide up from bottom
export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Slide in from left (for list items)
export const slideInFromLeft = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
};

// Simple fade in
export const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
};
