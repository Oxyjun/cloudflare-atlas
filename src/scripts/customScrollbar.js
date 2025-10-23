/**
 * CUSTOM SCROLLBAR
 * 
 * Manages the custom scrollbar on the left side of the page including:
 * - Dynamic ruler markings generation
 * - Scroll indicator position updates
 * - Visual styling and positioning
 * 
 * The scrollbar provides visual feedback about scroll position and page sections
 */

/**
 * Configuration for scrollbar appearance and behavior
 */
const SCROLLBAR_CONFIG = {
	// Ruler markings
	totalMarks: 49, // Total number of ruler marks
	markSpacing: 2, // Percentage spacing between marks
	majorMarkInterval: 5, // Every Nth mark is longer/major
	
	// Mark styling
	markColor: "#ffffff",
	shortMarkWidth: "12px",
	shortMarkHeight: "1.5px",
	longMarkWidth: "20px", 
	longMarkHeight: "3px",
	
	// Scroll indicator positioning
	indicatorMinPosition: 2, // Minimum position (% from top)
	indicatorMaxPosition: 96, // Maximum position (% from top)
	indicatorRange: 94, // Total range (max - min)
	
	// Timing
	initDelay: 100, // Delay before creating markings (ms)
	updateEasing: 0.1 // Scroll indicator easing speed
};

/**
 * Create ruler markings for the scrollbar
 * Generates visual marks at regular intervals with major/minor distinction
 */
function createScrollbarMarkings() {
	const rulerMarkings = document.querySelector(".ruler-markings");
	console.log("Creating scrollbar markings...");
	
	if (!rulerMarkings) {
		console.error("Could not find .ruler-markings element");
		return;
	}
	
	// Clear any existing marks
	rulerMarkings.innerHTML = '';
	
	// Generate ruler marks dynamically
	for (let i = 1; i <= SCROLLBAR_CONFIG.totalMarks; i++) {
		const mark = document.createElement("div");
		const isMajorMark = i % SCROLLBAR_CONFIG.majorMarkInterval === 0;
		
		// Set mark class and position
		mark.className = isMajorMark ? "ruler-mark long" : "ruler-mark short";
		mark.style.top = `${i * SCROLLBAR_CONFIG.markSpacing}%`;
		
		// Apply consistent styling
		mark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
		mark.style.position = "absolute";
		mark.style.left = "50%";
		mark.style.transform = "translateX(-50%)";
		
		// Different sizes for major vs minor marks
		mark.style.height = isMajorMark ? SCROLLBAR_CONFIG.longMarkHeight : SCROLLBAR_CONFIG.shortMarkHeight;
		mark.style.width = isMajorMark ? SCROLLBAR_CONFIG.longMarkWidth : SCROLLBAR_CONFIG.shortMarkWidth;
		
		console.log(`Created ${isMajorMark ? 'major' : 'minor'} mark ${i} at ${i * SCROLLBAR_CONFIG.markSpacing}%`);
		rulerMarkings.appendChild(mark);
	}
	
	console.log(`Scrollbar markings created: ${rulerMarkings.children.length} total marks`);
}

/**
 * Update scroll indicator position based on current scroll progress
 * @param {number} scrollProgress - Current scroll progress (0-1)
 */
function updateScrollIndicator(scrollProgress) {
	const indicator = document.querySelector(".scroll-indicator");
	
	if (!indicator) {
		return;
	}
	
	// Calculate position between min and max bounds
	const indicatorPosition = SCROLLBAR_CONFIG.indicatorMinPosition + 
		(scrollProgress * SCROLLBAR_CONFIG.indicatorRange);
	
	// Apply position with bounds checking
	const clampedPosition = Math.max(
		SCROLLBAR_CONFIG.indicatorMinPosition,
		Math.min(SCROLLBAR_CONFIG.indicatorMaxPosition, indicatorPosition)
	);
	
	indicator.style.top = `${clampedPosition}%`;
}

/**
 * Initialize the custom scrollbar
 * Call this function when the page loads
 */
export function initializeScrollbar() {
	console.log("Initializing custom scrollbar...");
	
	// Add a small delay to ensure DOM is ready
	setTimeout(() => {
		createScrollbarMarkings();
		console.log("Custom scrollbar initialized successfully");
	}, SCROLLBAR_CONFIG.initDelay);
}

/**
 * Update scrollbar based on scroll position
 * Call this function on scroll events
 * @param {number} scrollProgress - Current scroll progress (0-1)
 */
export function updateScrollbar(scrollProgress) {
	updateScrollIndicator(scrollProgress);
}

// Export configuration for external access if needed
export { SCROLLBAR_CONFIG };
