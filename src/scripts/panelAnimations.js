/**
 * PANEL ANIMATIONS
 * 
 * Manages all content panel animations including:
 * - Panel opacity based on viewport visibility
 * - Horizontal divider line animations
 * - Staggered link animations when panels become visible
 * - Reset animations when panels go off-screen
 * 
 * Works dynamically with any number of content-panel-small and content-panel-large elements
 */

/**
 * Configuration for panel animations
 */
const PANEL_ANIMATION_CONFIG = {
	// Opacity settings
	minOpacity: 0.2, // Minimum panel opacity
	maxOpacity: 1.0, // Maximum panel opacity when fully visible
	opacityRange: 0.8, // Difference between min and max (maxOpacity - minOpacity)

	// Link animation settings
	linkStaggerDelay: 150, // Delay between each link animation (ms)
	linkAnimationClass: "animate-in", // CSS class added to animate links

	// Animation timing
	dividerAnimationSpeed: 100, // Speed multiplier for divider width animation

	// Visibility thresholds
	visibilityThreshold: 0, // Minimum visibility required to trigger animations
	resetThreshold: 0 // Threshold for resetting animations when off-screen
};

/**
 * Calculate animation progress for a panel based on its viewport position
 * @param {DOMRect} rect - Panel's bounding rectangle
 * @param {number} viewportHeight - Current viewport height
 * @returns {Object} Animation data including progress and visibility flags
 */
function calculatePanelAnimation(rect, viewportHeight) {
	const panelTop = rect.top;
	const panelBottom = rect.bottom;
	const panelHeight = rect.height;
	const viewportMidpoint = viewportHeight / 2;

	let animationProgress = 0;
	let isFullyVisible = false;
	let isVisible = false;

	// Check if panel is at least partially visible
	if (panelBottom > PANEL_ANIMATION_CONFIG.visibilityThreshold &&
		panelTop < viewportHeight) {

		isVisible = true;

		// Calculate how close the panel center is to viewport midpoint
		const panelCenter = panelTop + panelHeight / 2;

		if (panelCenter > viewportMidpoint) {
			// Panel center is below midpoint - gradual fade based on distance
			const distanceFromMid = panelCenter - viewportMidpoint;
			const maxDistance = viewportHeight - viewportMidpoint;
			animationProgress = Math.max(
				0,
				1 - distanceFromMid / maxDistance
			);
		} else {
			// Panel center is above midpoint - fully visible
			animationProgress = 1;
			isFullyVisible = true;
		}
	}

	return {
		animationProgress,
		isFullyVisible,
		isVisible,
		isOffScreen: panelTop > viewportHeight || panelBottom < PANEL_ANIMATION_CONFIG.resetThreshold
	};
}

/**
 * Update panel opacity based on animation progress
 * @param {Element} panel - Panel element to update
 * @param {number} animationProgress - Animation progress (0-1)
 */
function updatePanelOpacity(panel, animationProgress) {
	const opacity = PANEL_ANIMATION_CONFIG.minOpacity +
		(animationProgress * PANEL_ANIMATION_CONFIG.opacityRange);
	panel.style.opacity = opacity.toString();
}

/**
 * Update panel divider animation
 * @param {Element} panel - Panel element containing the divider
 * @param {number} animationProgress - Animation progress (0-1)
 */
function updatePanelDivider(panel, animationProgress) {
	const divider = panel.querySelector(".panel-divider");

	if (divider) {
		const lineWidth = animationProgress * PANEL_ANIMATION_CONFIG.dividerAnimationSpeed;
		divider.style.width = `${lineWidth}%`;
	}
}

/**
 * Handle link animations for a panel
 * @param {Element} panel - Panel element containing links
 * @param {boolean} isFullyVisible - Whether panel is fully visible
 * @param {boolean} isOffScreen - Whether panel is off screen
 */
function updatePanelLinks(panel, isFullyVisible, isOffScreen) {
	const links = panel.querySelectorAll("a");

	// Reset animation when panel is off screen
	if (isOffScreen) {
		panel.dataset.linksAnimated = "false";
		links.forEach((link) => {
			link.classList.remove(PANEL_ANIMATION_CONFIG.linkAnimationClass);
		});
		return;
	}

	// Trigger staggered link animation when panel is fully visible
	if (isFullyVisible && panel.dataset.linksAnimated !== "true") {
		panel.dataset.linksAnimated = "true";

		links.forEach((link, index) => {
			setTimeout(() => {
				link.classList.add(PANEL_ANIMATION_CONFIG.linkAnimationClass);
			}, index * PANEL_ANIMATION_CONFIG.linkStaggerDelay);
		});

		console.log(`Animated ${links.length} links in panel:`, panel.id || 'unnamed');
	}
}

/**
 * Update animations for all content panels
 * Call this function on scroll events
 * 
 * @param {number} viewportHeight - Current viewport height
 */
export function updatePanelAnimations(viewportHeight) {
	// Get all content panels (both small and large)
	const smallPanels = document.querySelectorAll(".content-panel-small");
	const largePanels = document.querySelectorAll(".content-panel-large");
	const allPanels = [...smallPanels, ...largePanels];

	// Update animations for each panel
	allPanels.forEach((panel, index) => {
		const rect = panel.getBoundingClientRect();
		const animationData = calculatePanelAnimation(rect, viewportHeight);

		// Update all panel animations
		updatePanelOpacity(panel, animationData.animationProgress);
		updatePanelDivider(panel, animationData.animationProgress);
		updatePanelLinks(panel, animationData.isFullyVisible, animationData.isOffScreen);
	});
}

/**
 * Initialize panel animations
 * Call this function when the page loads
 */
export function initializePanelAnimations() {
	console.log("Initializing panel animations...");

	// Get panel counts for logging
	const smallPanels = document.querySelectorAll(".content-panel-small");
	const largePanels = document.querySelectorAll(".content-panel-large");

	console.log(`Panel animations initialized for ${smallPanels.length} small panels and ${largePanels.length} large panels`);

	// Initial animation update to set proper states
	setTimeout(() => {
		updatePanelAnimations(window.innerHeight);
	}, 100);
}

// Export configuration for external access if needed
export { PANEL_ANIMATION_CONFIG };
