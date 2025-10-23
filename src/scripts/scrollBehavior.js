/**
 * SCROLL BEHAVIOR
 * 
 * Manages scroll-triggered behaviors including:
 * - Logo and background movement after progress completion
 * - Synchronized movement of hero image and master background
 * - Scroll position calculations and document height tracking
 * - Integration with progress system for timing
 * 
 * The scroll behavior creates the final transition effect when users complete
 * their journey through the content panels
 */

/**
 * Configuration for scroll behavior
 */
const SCROLL_BEHAVIOR_CONFIG = {
	// Movement triggers
	progressCompleteThreshold: 1, // Progress must be 100% before movement starts
	movementStartThreshold: 0, // Panel position threshold for movement start
	
	// Animation settings
	movementMultiplier: 1, // Multiplier for scroll offset calculation
	
	// Elements to move
	elementsToMove: [
		'.hero-image',      // Compass logo and image
		'.master-background' // Background gradient
	],
	
	// Reset position
	resetPosition: 'translateY(0px)'
};

/**
 * Calculate current scroll progress
 * @returns {Object} Scroll data including position and progress
 */
function calculateScrollData() {
	const scrollPosition = window.pageYOffset;
	const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrollProgress = Math.min(1, Math.max(0, scrollPosition / documentHeight));
	const viewportHeight = window.innerHeight;
	
	return {
		scrollPosition,
		documentHeight,
		scrollProgress,
		viewportHeight
	};
}

/**
 * Handle logo and background movement based on progress and panel position
 * @param {Object} progressData - Progress data from progress system
 * @param {number} viewportHeight - Current viewport height
 */
function handleLogoMovement(progressData, viewportHeight) {
	// Get elements to move
	const heroImage = document.querySelector(".hero-image");
	const masterBackground = document.querySelector(".master-background");
	
	if (!progressData.lastPanel || !heroImage || !masterBackground) {
		return;
	}
	
	const rect = progressData.lastPanel.getBoundingClientRect();
	const panelTop = rect.top;
	
	// Logo only starts moving AFTER progress ring reaches 100% (last panel at target position)
	if (progressData.smoothProgress >= SCROLL_BEHAVIOR_CONFIG.progressCompleteThreshold && 
		panelTop <= SCROLL_BEHAVIOR_CONFIG.movementStartThreshold) {
		
		// Progress ring is complete AND last panel has started moving past viewport top
		const scrollOffset = Math.abs(panelTop) * SCROLL_BEHAVIOR_CONFIG.movementMultiplier;
		
		// Move both hero image and background together as one unit
		heroImage.style.transform = `translateY(-${scrollOffset}px)`;
		masterBackground.style.transform = `translateY(-${scrollOffset}px)`;
		
		console.log(`Logo movement active: offset ${scrollOffset}px`);
		
	} else {
		// Keep logo fixed until progress ring is complete
		heroImage.style.transform = SCROLL_BEHAVIOR_CONFIG.resetPosition;
		masterBackground.style.transform = SCROLL_BEHAVIOR_CONFIG.resetPosition;
	}
}

/**
 * Main scroll update function
 * Coordinates all scroll-based behaviors
 * 
 * @param {Object} progressData - Progress data from progress system
 */
export function updateScrollBehavior(progressData) {
	const scrollData = calculateScrollData();
	
	// Handle logo movement based on progress completion
	handleLogoMovement(progressData, scrollData.viewportHeight);
	
	return scrollData;
}

/**
 * Initialize scroll behavior system
 * Call this function when the page loads
 */
export function initializeScrollBehavior() {
	console.log("Initializing scroll behavior...");
	
	// Verify required elements exist
	const heroImage = document.querySelector(".hero-image");
	const masterBackground = document.querySelector(".master-background");
	
	if (!heroImage) {
		console.error("Hero image element not found - check HTML structure");
	}
	
	if (!masterBackground) {
		console.error("Master background element not found - check HTML structure");
	}
	
	console.log("Scroll behavior initialized successfully");
}

/**
 * Get current scroll data for external use
 * @returns {Object} Current scroll position and progress data
 */
export function getCurrentScrollData() {
	return calculateScrollData();
}

// Export configuration for external access if needed
export { SCROLL_BEHAVIOR_CONFIG };
