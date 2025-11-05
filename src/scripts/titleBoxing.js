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
    boxingEndPercent: 0.13,      // Complete boxing at 13% scroll (twice as fast - 12% range)
    moveStartPercent: 0.13,      // Start moving to top at 13% scroll
    moveEndPercent: 0.35,        // Complete move to top at 35% scroll (faster movement)
    makeScrollablePercent: 0.4,  // Make scrollable at 40% scroll (well before content panels)

    // Debug
    enableLogging: true
};

/**
 * Animation state
 */
let animationState = {
    isInitialized: false,
    titleBox: null,
    currentPhase: 'idle' // 'idle', 'boxing', 'boxed', 'moved', 'scrollable'
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
        // Idle phase - transparent box, fixed to viewport center
        animationState.titleBox.classList.remove('boxing', 'boxed', 'moved-to-top', 'scrollable');
        // Change to fixed positioning to prevent document scrolling
        animationState.titleBox.style.position = 'fixed';
        animationState.titleBox.style.top = '50%';
        animationState.titleBox.style.left = '50%';
        animationState.titleBox.style.transform = 'translate(-50%, -50%)';
        animationState.currentPhase = 'idle';
    }
    else if (scrollProgress >= TITLE_BOX_CONFIG.boxingStartPercent &&
        scrollProgress < TITLE_BOX_CONFIG.boxingEndPercent) {
        // Boxing phase - progressive white fill, FIXED TO VIEWPORT (NO SCROLLING)
        animationState.titleBox.classList.add('boxing');
        animationState.titleBox.classList.remove('boxed', 'moved-to-top', 'scrollable');

        // Calculate progressive fill opacity (0 to 1) over the boxing phase
        const boxingStart = TITLE_BOX_CONFIG.boxingStartPercent;
        const boxingEnd = TITLE_BOX_CONFIG.boxingEndPercent;
        const fillProgress = (scrollProgress - boxingStart) / (boxingEnd - boxingStart);
        const fillOpacity = Math.min(Math.max(fillProgress, 0), 1);

        // Set the progressive fill
        animationState.titleBox.style.setProperty('--fill-opacity', fillOpacity);

        // Keep fixed positioning - this prevents any scrolling movement
        animationState.titleBox.style.position = 'fixed';
        animationState.titleBox.style.top = '50%';
        animationState.titleBox.style.left = '50%';
        animationState.titleBox.style.transform = 'translate(-50%, -50%)';

        if (TITLE_BOX_CONFIG.enableLogging) {
            console.log(`📦 BOXING: Progress ${(scrollProgress * 100).toFixed(1)}%, Fill opacity: ${fillOpacity.toFixed(3)} - FIXED STATIONARY`);
        }
        animationState.currentPhase = 'boxing';
    }
    else if (scrollProgress >= TITLE_BOX_CONFIG.boxingEndPercent &&
        scrollProgress < TITLE_BOX_CONFIG.moveStartPercent) {
        // Fully boxed phase - complete white fill, still stationary
        animationState.titleBox.classList.add('boxed');
        animationState.titleBox.classList.remove('boxing', 'moved-to-top', 'scrollable');
        animationState.titleBox.style.setProperty('--fill-opacity', 1);

        // Keep fixed positioning
        animationState.titleBox.style.position = 'fixed';
        animationState.titleBox.style.top = '50%';
        animationState.titleBox.style.left = '50%';
        animationState.titleBox.style.transform = 'translate(-50%, -50%)';

        if (TITLE_BOX_CONFIG.enableLogging) {
            console.log(`📦 BOXED: Complete fill, still stationary`);
        }
        animationState.currentPhase = 'boxed';
    }
    else if (scrollProgress >= TITLE_BOX_CONFIG.moveStartPercent &&
        scrollProgress < TITLE_BOX_CONFIG.makeScrollablePercent) {
        // Movement phase - scroll-driven upward animation
        animationState.titleBox.classList.add('boxed');
        animationState.titleBox.classList.remove('moved-to-top', 'scrollable');

        // Calculate movement progress (0 to 1) within this phase
        const moveStart = TITLE_BOX_CONFIG.moveStartPercent;
        const moveEnd = TITLE_BOX_CONFIG.makeScrollablePercent;
        const moveProgress = (scrollProgress - moveStart) / (moveEnd - moveStart);

        // Transition from fixed position to final position
        if (animationState.currentPhase !== 'moved') {
            // First frame: switch to absolute positioning for document-relative movement
            animationState.titleBox.style.position = 'absolute';
            animationState.titleBox.style.top = '0';
            animationState.titleBox.style.left = '50%';
            // Disable CSS transitions during scroll-driven animation
            animationState.titleBox.style.transition = 'none';
        }

        // Interpolate from center (current viewport center) to top (2rem) based on scroll progress
        const currentScrollPos = window.pageYOffset;
        const viewportHeight = window.innerHeight;

        // Start position: where the element actually is right now (fixed at viewport center)
        // When position:fixed top:50% left:50% transform:translate(-50%,-50%), 
        // the element is at viewport center, which in document space is:
        const startYpx = currentScrollPos + (viewportHeight * 0.5) - (animationState.titleBox.offsetHeight * 0.5);
        // End position: 2rem from top of document  
        const endYpx = 32; // 2rem ≈ 32px

        const currentYpx = startYpx + (endYpx - startYpx) * moveProgress;
        const scale = 1 - (moveProgress * 0.3); // Scale from 1.0 to 0.7

        animationState.titleBox.style.transform = `translate(-50%, ${currentYpx}px) scale(${scale})`;

        if (TITLE_BOX_CONFIG.enableLogging) {
            console.log(`📦 MOVEMENT: Progress ${(moveProgress * 100).toFixed(1)}%, Y: ${currentYpx.toFixed(0)}px, Scale: ${scale.toFixed(2)}`);
        }

        animationState.currentPhase = 'moved';
    }
    else if (scrollProgress >= TITLE_BOX_CONFIG.makeScrollablePercent) {
        // Scrollable phase - natural document flow
        animationState.titleBox.classList.add('boxed', 'moved-to-top', 'scrollable');
        animationState.titleBox.style.transform = ''; // Let CSS handle it
        animationState.currentPhase = 'scrollable';
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
    animationState.titleBox.classList.remove('boxing', 'boxed', 'moved-to-top', 'scrollable');

    // Reset CSS custom properties
    animationState.titleBox.style.removeProperty('--fill-opacity');

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
