/**
 * ANIMATED TITLE BOX CONTROLLER
 * 
 * Controls the AnimatedTitleBox component animation:
 * 1. Starts with transparent box at center of screen
 * 2. As user scrolls, box gets white background (boxing effect)
 * 3. Box then moves to top center and scales down
 * 
 * Features:
 * - Component-based approach using AnimatedTitleBox.astro
 * - CSS class-based animations for smooth transitions
 * - Performance optimized with CSS transitions
 * - Responsive design support
 */

/**
 * Configuration for animated title box
 */
const TITLE_BOX_CONFIG = {
    // Animation phases and timing
    boxingStartPercent: 0.01,    // Start boxing immediately when scrolling starts
    boxingEndPercent: 0.1,       // Complete boxing at 10% scroll
    moveStartPercent: 0.1,       // Start moving to top at 10% scroll
    moveEndPercent: 0.25,        // Complete move to top at 25% scroll
    
    // Debug
    enableLogging: false
};

/**
 * Animation state
 */
let animationState = {
    isInitialized: false,
    titleBox: null,
    currentPhase: 'idle' // 'idle', 'boxed', 'moved'
};

/**
 * Initialize animated title box controller
 */
function initializeTitleBoxing() {
    if (TITLE_BOX_CONFIG.enableLogging) {
        console.log('📦 Initializing animated title box controller...');
    }
    
    // Find the animated title box component
    animationState.titleBox = document.getElementById('animated-title-box');
    
    if (!animationState.titleBox) {
        console.warn('⚠️ AnimatedTitleBox component not found');
        return;
    }
    
    animationState.isInitialized = true;
    
    if (TITLE_BOX_CONFIG.enableLogging) {
        console.log('✅ Animated title box controller initialized');
    }
}

/**
 * Calculate animation progress based on scroll position
 */
function calculateScrollProgress() {
    const scrollPosition = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    return Math.min(1, scrollPosition / (documentHeight - viewportHeight));
}

/**
 * Main update function for animated title box
 */
function updateTitleBoxing() {
    if (!animationState.isInitialized || !animationState.titleBox) return;
    
    const scrollProgress = calculateScrollProgress();
    
    // Determine which phase we're in
    if (scrollProgress < TITLE_BOX_CONFIG.boxingStartPercent) {
        // Idle phase - transparent box
        animationState.titleBox.classList.remove('boxed', 'moved-to-top');
        animationState.currentPhase = 'idle';
    } 
    else if (scrollProgress >= TITLE_BOX_CONFIG.boxingStartPercent && 
             scrollProgress < TITLE_BOX_CONFIG.moveStartPercent) {
        // Boxing phase - add white background
        animationState.titleBox.classList.add('boxed');
        animationState.titleBox.classList.remove('moved-to-top');
        animationState.currentPhase = 'boxed';
    } 
    else if (scrollProgress >= TITLE_BOX_CONFIG.moveStartPercent) {
        // Movement phase - move to top center
        animationState.titleBox.classList.add('boxed', 'moved-to-top');
        animationState.currentPhase = 'moved';
    }
    
    if (TITLE_BOX_CONFIG.enableLogging && scrollProgress > 0.01) {
        console.log(`📦 Title box phase: ${animationState.currentPhase}, progress: ${(scrollProgress * 100).toFixed(1)}%`);
    }
}

/**
 * Clean up animation controller
 */
function cleanupTitleBoxing() {
    if (!animationState.isInitialized || !animationState.titleBox) return;
    
    // Reset all classes
    animationState.titleBox.classList.remove('boxed', 'moved-to-top');
    
    animationState.isInitialized = false;
    animationState.currentPhase = 'idle';
    
    if (TITLE_BOX_CONFIG.enableLogging) {
        console.log('🧹 Animated title box controller cleaned up');
    }
}

/**
 * Export functions for external use
 */
export {
    initializeTitleBoxing,
    updateTitleBoxing,
    cleanupTitleBoxing,
    TITLE_BOX_CONFIG
};
