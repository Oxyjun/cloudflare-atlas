/**
 * DYNAMIC BACKGROUND TRANSITION
 * 
 * Manages scroll-responsive background color transitions
 * - Smoothly interpolates between three colors based on scroll position
 * - Updates background color in real-time as user scrolls
 * - Integrates with the main scroll coordination system
 */

/**
 * Configuration for background transitions
 */
const BACKGROUND_CONFIG = {
	// Color stops for the three-color gradient
	colors: [
		{ r: 0, g: 0, b: 0 },       // #000000 (black)
		{ r: 15, g: 0, b: 107 },    // #0F006B (dark blue)  
		{ r: 62, g: 116, b: 255 }   // #3E74FF (light blue)
	],
	
	// Scroll positions where each color should be fully visible (0 to 1)
	colorStops: [0, 0.4, 1],
	
	// Performance settings
	enableLogging: false,
	
	// Transition smoothing
	easingFunction: 'ease-out'
};

/**
 * Linear interpolation between two values
 */
function lerp(start, end, factor) {
	return start + (end - start) * factor;
}

/**
 * Interpolate between two colors
 */
function interpolateColor(color1, color2, factor) {
	return {
		r: Math.round(lerp(color1.r, color2.r, factor)),
		g: Math.round(lerp(color1.g, color2.g, factor)),
		b: Math.round(lerp(color1.b, color2.b, factor))
	};
}

/**
 * Convert RGB object to CSS color string
 */
function rgbToString(color) {
	return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Calculate background color based on scroll progress
 */
function calculateBackgroundColor(scrollProgress) {
	const { colors, colorStops } = BACKGROUND_CONFIG;
	
	// Clamp scroll progress between 0 and 1
	const progress = Math.max(0, Math.min(1, scrollProgress));
	
	// Find which color segment we're in
	let segmentIndex = 0;
	for (let i = 0; i < colorStops.length - 1; i++) {
		if (progress >= colorStops[i] && progress <= colorStops[i + 1]) {
			segmentIndex = i;
			break;
		}
	}
	
	// Calculate local progress within the current segment
	const segmentStart = colorStops[segmentIndex];
	const segmentEnd = colorStops[segmentIndex + 1];
	const segmentProgress = (progress - segmentStart) / (segmentEnd - segmentStart);
	
	// Interpolate between the two colors
	const startColor = colors[segmentIndex];
	const endColor = colors[segmentIndex + 1];
	const interpolatedColor = interpolateColor(startColor, endColor, segmentProgress);
	
	return rgbToString(interpolatedColor);
}

/**
 * Update the background color based on scroll position
 */
function updateBackgroundTransition(scrollProgress) {
	const backgroundColor = calculateBackgroundColor(scrollProgress);
	
	// Apply to the master background element with transparency to show globe
	const backgroundElement = document.querySelector('.master-background');
	if (backgroundElement) {
		// Make background semi-transparent to allow globe to show through
		const rgbMatch = backgroundColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
		if (rgbMatch) {
			const [, r, g, b] = rgbMatch;
			backgroundElement.style.background = `rgba(${r}, ${g}, ${b}, 0.3)`;
		} else {
			backgroundElement.style.background = backgroundColor;
		}
	}
	
	// Also update body fallback color
	document.body.style.backgroundColor = backgroundColor;
	
	if (BACKGROUND_CONFIG.enableLogging) {
		console.log(`Background updated: ${backgroundColor} (progress: ${scrollProgress.toFixed(3)})`);
	}
}

/**
 * Initialize background transition system
 */
function initializeBackgroundTransition() {
	if (BACKGROUND_CONFIG.enableLogging) {
		console.log('🎨 Initializing dynamic background transitions...');
	}
	
	// Set initial background color
	updateBackgroundTransition(0);
	
	if (BACKGROUND_CONFIG.enableLogging) {
		console.log('✅ Background transition system ready');
	}
}

/**
 * Export functions for use in main coordinator
 */
export {
	initializeBackgroundTransition,
	updateBackgroundTransition,
	BACKGROUND_CONFIG
};
