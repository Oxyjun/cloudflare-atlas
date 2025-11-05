/**
 * TEXT ANIMATIONS
 * 
 * Handles all text-based animations including:
 * - SplitText word-by-word animations for panel paragraphs
 * - Staggered timing between different panels
 * - Looping text effects
 * 
 * Dependencies: anime.js (splitText, animate, stagger functions)
 */

import { animate, splitText, stagger } from "animejs";

/**
 * Configuration for text animations
 */
const TEXT_ANIMATION_CONFIG = {
	// Animation timing
	duration: 750,
	ease: "out(3)",
	staggerDelay: 50, // Delay between words in same paragraph
	paragraphDelay: 200, // Delay between different paragraphs

	// Loop settings
	loop: true,
	loopDelay: 100,
	holdDuration: 1500, // How long text stays visible before animating out

	// Animation keyframes
	keyframes: [
		{ to: ["100%", "0%"] }, // Slide in
		{ to: "-100%", delay: 1500, ease: "in(3)" } // Slide out after delay
	]
};

/**
 * General helper function to ensure all instances are processed
 * @param {string} selector - CSS selector for elements to animate
 * @param {function} callback - Function to call for each element
 * @returns {Array} Array of results from callback function
 */
function forAllInstances(selector, callback) {
	const elements = document.querySelectorAll(selector);
	console.log(`Found ${elements.length} elements for: ${selector}`);
	return Array.from(elements).map(callback);
}

/**
 * Animate text elements with splitText effect
 * Creates word-by-word animations for multiple text elements simultaneously
 * 
 * @param {string} selector - CSS selector for text elements to animate
 * @param {Object} splitOptions - Options for splitText function
 * @param {Object} animationConfig - Animation configuration object
 */
function animateAllText(selector, splitOptions, animationConfig) {
	const elements = document.querySelectorAll(selector);

	elements.forEach((element, index) => {
		const { words } = splitText(element, splitOptions);

		// Create independent animation for each paragraph
		// Add a base delay offset for each paragraph but keep same stagger direction
		const baseDelay = index * TEXT_ANIMATION_CONFIG.paragraphDelay;

		animate(words, {
			...animationConfig,
			delay: (el, i) => baseDelay + i * (animationConfig.delay?.stagger || TEXT_ANIMATION_CONFIG.staggerDelay),
		});
	});
}

/**
 * Initialize all text animations
 * Call this function when the page loads
 */
export function initializeTextAnimations() {
	// Initialize text animations silently

	// Animate all paragraphs in small, large, and menu content panels
	animateAllText(
		".content-panel-small p, .content-panel-large p, .content-menu p",
		{ words: { wrap: "clip" } },
		{
			y: TEXT_ANIMATION_CONFIG.keyframes,
			duration: TEXT_ANIMATION_CONFIG.duration,
			ease: TEXT_ANIMATION_CONFIG.ease,
			delay: { stagger: TEXT_ANIMATION_CONFIG.staggerDelay },
			loop: TEXT_ANIMATION_CONFIG.loop,
			loopDelay: TEXT_ANIMATION_CONFIG.loopDelay,
		}
	);

	// Text animations initialized
}

// Export configuration for external access if needed
export { TEXT_ANIMATION_CONFIG };
