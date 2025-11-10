/**
 * PROGRESS SYSTEM
 * 
 * Manages the circular progress ring and compass rotation including:
 * - Progress calculation based on content panel positions
 * - Compass outer ring rotation synchronized with progress
 * - Dynamic progress ring fill animation
 * - Modular system that works with any number of content panels
 * 
 * The progress system provides visual feedback about user's journey through content
 */

/**
 * Configuration for progress system behavior
 */
const PROGRESS_CONFIG = {
	// Progress calculation
	scrollbarTopPosition: 0.05, // Scrollbar starts at 5vh (5% of viewport height)
	targetViewportPosition: 0.05, // Progress hits 100% when last panel top reaches scrollbar top

	// Animation settings
	circumference: 565.48, // Full circle circumference (2 * π * 90)
	rotationMultiplier: 360, // Degrees for full compass rotation

	// Easing and transitions
	updateEasing: "ease-out",
	transitionDuration: "0.3s",
	
	// Debug
	enableLogging: true // Set to true to enable progress logging
};

/**
 * Calculate smooth progress from hero section through all content panels
 * Progress reaches 100% when the final content panel bottom reaches viewport bottom (full page consumed)
 * 
 * @param {number} viewportHeight - Current viewport height
 * @returns {Object} Progress data including smoothProgress value and last panel reference
 */
function calculateContentProgress(viewportHeight) {
	const heroSection = document.querySelector("main");
	const smallPanels = document.querySelectorAll(".content-panel-small");
	const largePanels = document.querySelectorAll(".content-panel-large");
	const menuPanels = document.querySelectorAll(".content-menu");
	const allContentPanels = [...smallPanels, ...largePanels, ...menuPanels];
	let smoothProgress = 0;
	let lastPanel = null;

	// Find the visually lowest panel based on actual position (not DOM order)
	if (allContentPanels.length > 0) {
		let lowestBottom = -Infinity;
		allContentPanels.forEach(panel => {
			const rect = panel.getBoundingClientRect();
			const absoluteBottom = rect.bottom + window.pageYOffset;
			if (absoluteBottom > lowestBottom) {
				lowestBottom = absoluteBottom;
				lastPanel = panel;
			}
		});
		// Progress tracking initialized - found visually last panel
		if (PROGRESS_CONFIG.enableLogging) {
			console.log(`Progress: Found ${allContentPanels.length} panels, last panel:`, lastPanel.id || lastPanel.className, 'at bottom position:', lowestBottom);
		}
	}

	if (heroSection && lastPanel) {
		const heroRect = heroSection.getBoundingClientRect();
		const lastRect = lastPanel.getBoundingClientRect();

		// Journey starts when we begin scrolling away from hero (hero top reaches viewport top)  
		// Journey ends when LAST panel bottom reaches viewport bottom (full page consumed)
		const journeyStart = heroRect.top; // Hero top at viewport top = journey starts
		const journeyEnd = lastRect.bottom - viewportHeight; // Last panel bottom at viewport bottom = 100% complete

		// Progress from 0 to 1 based on this full content journey
		if (journeyStart >= 0) {
			smoothProgress = 0; // Still in hero section
		} else if (journeyEnd <= 0) {
			smoothProgress = 1; // Last panel bottom has reached viewport bottom - full page consumed
		} else {
			// Linear interpolation through the entire content journey  
			const totalJourneyDistance = Math.abs(journeyStart) + journeyEnd;
			const currentJourneyDistance = Math.abs(journeyStart);
			smoothProgress = Math.max(
				0,
				Math.min(1, currentJourneyDistance / totalJourneyDistance)
			);
		}
	}

	return {
		smoothProgress,
		lastPanel,
		totalPanels: smallPanels.length
	};
}

/**
 * Update the progress ring fill based on progress value
 * @param {number} progress - Progress value (0-1)
 */
function updateProgressRing(progress) {
	const progressCircle = document.getElementById("progress-circle");

	if (!progressCircle) {
		console.warn("Progress ring element not found");
		return;
	}

	// Calculate stroke dash offset based on progress
	const dashOffset = PROGRESS_CONFIG.circumference * (1 - progress);
	progressCircle.style.strokeDashoffset = dashOffset.toString();
}

/**
 * Update compass rotation based on progress value
 * @param {number} progress - Progress value (0-1)
 */
function updateCompassRotation(progress) {
	const compassOuter = document.querySelector(".compass-outer");

	if (!compassOuter) {
		console.warn("Compass outer element not found");
		return;
	}

	// Calculate rotation angle based on progress
	const rotationAngle = progress * PROGRESS_CONFIG.rotationMultiplier;
	compassOuter.style.transform = `rotate(${rotationAngle}deg)`;
}

/**
 * Update the entire progress system
 * Call this function on scroll events
 * 
 * @param {number} viewportHeight - Current viewport height
 * @returns {Object} Progress data for use by other systems
 */
export function updateProgressSystem(viewportHeight) {
	// Calculate progress based on content position
	const progressData = calculateContentProgress(viewportHeight);

	// Update visual elements
	updateProgressRing(progressData.smoothProgress);
	updateCompassRotation(progressData.smoothProgress);

	// Progress updated silently

	return progressData;
}

/**
 * Initialize the progress system
 * Call this function when the page loads
 */
export function initializeProgressSystem() {
	// Initialize progress system silently
	
	// Verify required elements exist (errors only)
	const progressCircle = document.getElementById("progress-circle");
	const compassOuter = document.querySelector(".compass-outer");

	if (!progressCircle) {
		console.error("Progress circle element not found - check HTML structure");
	}

	if (!compassOuter) {
		console.error("Compass outer element not found - check HTML structure");
	}
}

// Export configuration for external access if needed
export { PROGRESS_CONFIG };
