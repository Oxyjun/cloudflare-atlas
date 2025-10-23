/**
 * SECTION-BASED SCROLLBAR WITH H1 NAVIGATION
 * 
 * Completely rewritten scrollbar system that:
 * - Scans all HTML sections on the page automatically
 * - Creates major marks at equidistant intervals (one per section)
 * - Makes major marks clickable to navigate to section H1s at 20% viewport position
 * - Fills remaining space with minor marks for visual reference
 * - Updates scroll indicator based on entire document scroll
 * - Provides hover/click visual feedback
 * 
 * LOGIC:
 * 1. Creates a "scroll to top" major mark at the very beginning (at 2%)
 * 2. Counts all <section> elements on page
 * 3. Calculates where scroll indicator will be when each H1 is at 20% viewport
 * 4. Positions section major marks at those calculated scroll indicator positions
 * 5. When clicked, scrolls to position H1 at 20% viewport (red indicator aligns with major mark)
 * 6. Minor marks at regular intervals for visual reference (avoiding major mark overlap)
 * 
 * This ensures major marks align with the red scroll indicator when their section is active.
 */

/**
 * Configuration for scrollbar appearance and behavior
 */
const SCROLLBAR_CONFIG = {
	// Section detection
	sectionSelector: 'section', // Selector for sections to create major marks
	targetViewportPosition: 0.2, // Position H1s at 20% of viewport when clicked (near top)
	
	// Mark styling
	markColor: "#ffffff",
	shortMarkWidth: "12px",
	shortMarkHeight: "1.5px",
	longMarkWidth: "20px",
	longMarkHeight: "3px",
	
	// Major marks (sections) styling
	majorMarkHoverColor: "#ff6b6b", // Red on hover
	majorMarkActiveColor: "#4ecdc4", // Teal when clicked
	
	// Scroll indicator positioning
	indicatorMinPosition: 2, // Minimum position (% from top)
	indicatorMaxPosition: 96, // Maximum position (% from top)
	indicatorRange: 94, // Total range (max - min)
	
	// Minor marks
	minorMarkDensity: 3, // Minor marks between each major mark
	
	// Timing
	initDelay: 100, // Delay before creating markings (ms)
	updateEasing: 0.1 // Scroll indicator easing speed
};

/**
 * Get all sections and their H1 elements for major marks
 * @returns {Array} Array of section data with H1 titles and scroll positions
 */
function getSectionData() {
	const sections = document.querySelectorAll(SCROLLBAR_CONFIG.sectionSelector);
	console.log(`Found ${sections.length} sections on page`);
	
	return Array.from(sections).map((section, index) => {
		const h1 = section.querySelector('h1');
		const title = h1 ? h1.textContent.trim() : `Section ${index + 1}`;
		
		// Calculate absolute positions when page is at top for accuracy
		const sectionRect = section.getBoundingClientRect();
		const sectionAbsoluteTop = sectionRect.top + window.pageYOffset;
		
		let h1AbsoluteTop = sectionAbsoluteTop; // Default to section top
		if (h1) {
			const h1Rect = h1.getBoundingClientRect();
			h1AbsoluteTop = h1Rect.top + window.pageYOffset;
		}
		
		console.log(`Section "${title}": section at ${sectionAbsoluteTop}px, H1 at ${h1AbsoluteTop}px`);
		
		return {
			element: section,
			h1Element: h1,
			title,
			sectionAbsoluteTop,
			h1AbsoluteTop, // Store calculated absolute position
			index
		};
	});
}

/**
 * Smooth scroll to position H1 at target viewport position
 * @param {number} h1Position - Absolute position of H1 element
 */
function scrollToH1AtViewportPosition(h1Position) {
	const viewportHeight = window.innerHeight;
	const targetViewportOffset = viewportHeight * SCROLLBAR_CONFIG.targetViewportPosition;
	const targetScrollPosition = Math.max(0, h1Position - targetViewportOffset);
	
	console.log(`Scroll calculation:
		- H1 absolute position: ${h1Position}px
		- Viewport height: ${viewportHeight}px
		- Target viewport position (20%): ${targetViewportOffset}px
		- Final scroll position: ${targetScrollPosition}px`);
	
	window.scrollTo({
		top: targetScrollPosition,
		behavior: 'smooth'
	});
}

/**
 * Create ruler markings for the scrollbar
 * Creates major marks for each section (equidistant) and fills with minor marks
 */
function createScrollbarMarkings() {
	const rulerMarkings = document.querySelector(".ruler-markings");
	console.log("Creating section-based scrollbar markings...");

	if (!rulerMarkings) {
		console.error("Could not find .ruler-markings element");
		return;
	}

	// Clear any existing marks
	rulerMarkings.innerHTML = '';

	// Get all sections
	const sections = getSectionData();
	
	if (sections.length === 0) {
		console.warn("No sections found - creating basic scrollbar");
		return;
	}

	// Calculate where scroll indicator will be when each H1 is at 80% viewport
	const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
	const viewportHeight = window.innerHeight;
	const targetViewportOffset = viewportHeight * SCROLLBAR_CONFIG.targetViewportPosition;
	
	console.log(`Document height: ${documentHeight}px, Viewport: ${viewportHeight}px`);

	// Create "scroll to top" major mark at the very beginning
	const topMark = document.createElement("div");
	topMark.className = "ruler-mark long clickable-mark";
	topMark.style.top = `${SCROLLBAR_CONFIG.indicatorMinPosition}%`;
	
	// Apply styling
	topMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
	topMark.style.position = "absolute";
	topMark.style.left = "50%";
	topMark.style.transform = "translateX(-50%)";
	topMark.style.height = SCROLLBAR_CONFIG.longMarkHeight;
	topMark.style.width = SCROLLBAR_CONFIG.longMarkWidth;
	topMark.style.zIndex = "10";
	
	// Force enable pointer events and add debugging
	topMark.style.pointerEvents = 'auto';
	topMark.style.cursor = 'pointer';
	
	console.log(`Adding event listeners to "Scroll to Top" mark`);
	
	// Add hover effects
	topMark.addEventListener('mouseenter', (e) => {
		console.log(`Hover on "Scroll to Top" mark`);
		topMark.style.backgroundColor = SCROLLBAR_CONFIG.majorMarkHoverColor;
	});
	
	topMark.addEventListener('mouseleave', (e) => {
		console.log(`Unhover on "Scroll to Top" mark`);
		topMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
	});
	
	// Add click handler to scroll to very top
	topMark.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		console.log(`CLICKED on "Scroll to Top" mark`);
		console.log(`Scrolling to very top (position 0px)`);
		
		// Scroll to absolute top
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		
		// Visual feedback
		topMark.style.backgroundColor = SCROLLBAR_CONFIG.majorMarkActiveColor;
		setTimeout(() => {
			topMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
		}, 1000);
	});
	
	// Add tooltip
	topMark.title = `Scroll to Top`;
	
	rulerMarkings.appendChild(topMark);
	console.log(`Created "Scroll to Top" major mark at ${SCROLLBAR_CONFIG.indicatorMinPosition}%`);

	// Create major marks for each section at their calculated scroll indicator positions
	sections.forEach((sectionData, index) => {
		// Calculate scroll position needed to put H1 at 80% viewport
		const targetScrollPosition = Math.max(0, sectionData.h1AbsoluteTop - targetViewportOffset);
		
		// Calculate where scroll indicator will be at that scroll position
		const scrollProgress = documentHeight > 0 ? targetScrollPosition / documentHeight : 0;
		const majorMarkPosition = SCROLLBAR_CONFIG.indicatorMinPosition + 
			(scrollProgress * SCROLLBAR_CONFIG.indicatorRange);
		
		console.log(`Section "${sectionData.title}": H1 at ${sectionData.h1AbsoluteTop}px, scroll to ${targetScrollPosition}px, indicator at ${majorMarkPosition.toFixed(1)}%`);
		
		// Clamp position to valid range
		const clampedPosition = Math.max(
			SCROLLBAR_CONFIG.indicatorMinPosition,
			Math.min(SCROLLBAR_CONFIG.indicatorMaxPosition, majorMarkPosition)
		);
		
		const majorMark = document.createElement("div");
		majorMark.className = "ruler-mark long clickable-mark";
		majorMark.style.top = `${clampedPosition}%`;
		
		// Apply styling
		majorMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
		majorMark.style.position = "absolute";
		majorMark.style.left = "50%";
		majorMark.style.transform = "translateX(-50%)";
		majorMark.style.height = SCROLLBAR_CONFIG.longMarkHeight;
		majorMark.style.width = SCROLLBAR_CONFIG.longMarkWidth;
		majorMark.style.zIndex = "10";
		
		// Force enable pointer events and add debugging
		majorMark.style.pointerEvents = 'auto';
		majorMark.style.cursor = 'pointer';
		
		console.log(`Adding event listeners to mark for "${sectionData.title}"`);
		
		// Add hover effects
		majorMark.addEventListener('mouseenter', (e) => {
			console.log(`Hover on mark: "${sectionData.title}"`);
			majorMark.style.backgroundColor = SCROLLBAR_CONFIG.majorMarkHoverColor;
		});
		
		majorMark.addEventListener('mouseleave', (e) => {
			console.log(`Unhover on mark: "${sectionData.title}"`);
			majorMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
		});
		
		// Add click handler to scroll to section H1
		majorMark.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			console.log(`CLICKED on mark: "${sectionData.title}"`);
			console.log(`Scrolling to H1 at stored position: ${sectionData.h1AbsoluteTop}px`);
			
			// Use stored absolute position for accuracy
			scrollToH1AtViewportPosition(sectionData.h1AbsoluteTop);
			
			// Visual feedback
			majorMark.style.backgroundColor = SCROLLBAR_CONFIG.majorMarkActiveColor;
			setTimeout(() => {
				majorMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
			}, 1000);
		});
		
		// Add tooltip
		majorMark.title = `Navigate to: ${sectionData.title}`;
		
		rulerMarkings.appendChild(majorMark);
		console.log(`Created major mark for "${sectionData.title}" at ${majorMarkPosition.toFixed(1)}%`);
	});

	// Fill remaining space with regular interval minor marks
	const totalMinorMarks = 40; // Fixed number of minor marks for visual reference
	const minorMarkSpacing = SCROLLBAR_CONFIG.indicatorRange / totalMinorMarks;
	
	// Create minor marks at regular intervals (for visual reference only)
	for (let i = 1; i < totalMinorMarks; i++) {
		const minorMarkPosition = SCROLLBAR_CONFIG.indicatorMinPosition + (i * minorMarkSpacing);
		
		// Skip if too close to a major mark (within 2% to avoid overlap)
		const tooCloseToMajor = sections.some(sectionData => {
			const targetScrollPosition = Math.max(0, sectionData.h1AbsoluteTop - targetViewportOffset);
			const scrollProgress = documentHeight > 0 ? targetScrollPosition / documentHeight : 0;
			const majorPos = SCROLLBAR_CONFIG.indicatorMinPosition + (scrollProgress * SCROLLBAR_CONFIG.indicatorRange);
			return Math.abs(minorMarkPosition - majorPos) < 2;
		});
		
		if (!tooCloseToMajor) {
			const minorMark = document.createElement("div");
			minorMark.className = "ruler-mark short";
			minorMark.style.top = `${minorMarkPosition}%`;
			minorMark.style.backgroundColor = SCROLLBAR_CONFIG.markColor;
			minorMark.style.position = "absolute";
			minorMark.style.left = "50%";
			minorMark.style.transform = "translateX(-50%)";
			minorMark.style.height = SCROLLBAR_CONFIG.shortMarkHeight;
			minorMark.style.width = SCROLLBAR_CONFIG.shortMarkWidth;
			
			rulerMarkings.appendChild(minorMark);
		}
	}

	const totalMarks = rulerMarkings.children.length;
	const totalMajorMarks = sections.length + 1; // +1 for scroll-to-top mark
	console.log(`Scrollbar markings created: ${totalMajorMarks} major marks (1 scroll-to-top + ${sections.length} sections) + ${totalMarks - totalMajorMarks} minor marks = ${totalMarks} total`);
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
 * Debug function to test clickable marks
 */
function debugClickableMarks() {
	const clickableMarks = document.querySelectorAll('.ruler-mark.clickable-mark');
	console.log(`DEBUG: Found ${clickableMarks.length} clickable marks`);
	
	clickableMarks.forEach((mark, index) => {
		console.log(`Mark ${index}:`, {
			className: mark.className,
			style: mark.style.cssText,
			pointerEvents: getComputedStyle(mark).pointerEvents,
			cursor: getComputedStyle(mark).cursor,
			zIndex: getComputedStyle(mark).zIndex
		});
	});
}

/**
 * Initialize the custom scrollbar
 * Call this function when the page loads
 */
export function initializeScrollbar() {
	console.log("Initializing section-based custom scrollbar...");
	
	// Add a small delay to ensure DOM is ready
	setTimeout(() => {
		createScrollbarMarkings();
		
		// Debug the created marks
		setTimeout(() => {
			debugClickableMarks();
		}, 100);
		
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
