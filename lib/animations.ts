/**
 * Shared Framer Motion animation variants
 * Use these for consistent animations across the application
 */

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

