/**
 * MAIN SCRIPT COORDINATOR
 * 
 * Central coordination script that:
 * - Imports and initializes all component scripts
 * - Sets up the main scroll event handler
 * - Coordinates updates between different systems
 * - Provides centralized configuration and logging
 * 
 * This is the main entry point for all JavaScript functionality
 */

// Import all component modules
import { initializeTextAnimations } from './textAnimations.js';
import { initializeScrollbar, updateScrollbar } from './customScrollbar.js';
import { initializeProgressSystem, updateProgressSystem } from './progressSystem.js';
import { initializePanelAnimations, updatePanelAnimations } from './panelAnimations.js';
import { initializeScrollBehavior, updateScrollBehavior } from './scrollBehavior.js';
import { initializeTitleBoxing, updateTitleBoxing } from './titleBoxing.js';

/**
 * Main application configuration
 */
const APP_CONFIG = {
	// Performance settings
	scrollThrottleDelay: 16, // ~60fps scroll updates
	initializationDelay: 100, // Delay before starting animations

	// Debug settings
	enableLogging: true, // Set to false in production
	enablePerformanceLogging: false, // Set to true for performance debugging

	// App metadata
	version: '1.0.0',
	name: 'Cloudflare Atlas'
};

/**
 * Performance monitoring
 */
let lastScrollTime = 0;
let frameCount = 0;

/**
 * Main scroll update function
 * Coordinates all scroll-based updates across different systems
 */
function updateScrollEffects() {
	const startTime = performance.now();

	// Get viewport dimensions
	const viewportHeight = window.innerHeight;

	// Update progress system and get progress data (tracks content panel journey)
	const progressData = updateProgressSystem(viewportHeight);

	// Calculate actual scroll progress for scrollbar (entire document including all content)
	const scrollPosition = window.pageYOffset;
	const documentHeight = document.documentElement.scrollHeight - viewportHeight;
	const actualScrollProgress = Math.min(1, Math.max(0, scrollPosition / documentHeight));

	// Update scrollbar with document scroll progress (different from content panel progress)
	updateScrollbar(actualScrollProgress);

	// Update panel animations
	updatePanelAnimations(viewportHeight);

	// Update scroll behavior (logo movement, etc.)
	const scrollData = updateScrollBehavior(progressData);

	// Update title boxing animation
	updateTitleBoxing();

	// Performance logging
	if (APP_CONFIG.enablePerformanceLogging) {
		const endTime = performance.now();
		const updateTime = endTime - startTime;

		frameCount++;
		if (frameCount % 60 === 0) { // Log every 60 frames
			console.log(`Scroll update performance: ${updateTime.toFixed(2)}ms`);
		}
	}
}

/**
 * Throttled scroll handler for better performance
 */
let scrollTimeout;
function handleScroll() {
	// Cancel previous timeout
	if (scrollTimeout) {
		cancelAnimationFrame(scrollTimeout);
	}

	// Schedule next update
	scrollTimeout = requestAnimationFrame(updateScrollEffects);
}

/**
 * Initialize all systems
 */
function initializeApp() {
	if (APP_CONFIG.enableLogging) {
		console.log(`🚀 Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
		console.log('Components loading...');
	}

	try {
		// Initialize all component systems
		initializeTextAnimations();
		initializeScrollbar();
		initializeProgressSystem();
		initializePanelAnimations();
		initializeScrollBehavior();
		initializeTitleBoxing();

		// Set up scroll event listener
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Initial update to set proper states
		setTimeout(() => {
			updateScrollEffects();

			if (APP_CONFIG.enableLogging) {
				console.log('✅ All systems initialized successfully');
				console.log('🎯 Scroll effects active');
			}
		}, APP_CONFIG.initializationDelay);

	} catch (error) {
		console.error('❌ Failed to initialize application:', error);
	}
}

/**
 * App startup
 * Wait for page load before initializing
 */
window.addEventListener("load", function () {
	if (APP_CONFIG.enableLogging) {
		console.log("📄 Page loaded, starting initialization...");
	}

	initializeApp();
});

/**
 * Export main functions for external access if needed
 */
export {
	updateScrollEffects,
	initializeApp,
	APP_CONFIG
};
