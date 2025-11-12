/**
 * INTERACTIVE GLOBE BACKGROUND
 * 
 * Manages a 3D interactive globe with submarine cables in the background
 * - Uses globe.gl library for WebGL globe rendering
 * - Loads and displays submarine cable data
 * - Integrates with existing background transition system
 * - Responsive to scroll position for camera and lighting effects
 */

// Dynamic import of Globe.gl for better compatibility
let Globe = null;

/**
 * Configuration for globe rendering
 */
const GLOBE_CONFIG = {
	// Visual settings
	globeImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg',
	bumpImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
	backgroundImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png',
	
	// Animation settings
	pathDashLength: 0.1,
	pathDashGap: 0.008,
	pathDashAnimateTime: 15000, // Slower animation for better performance
	
	// Camera settings
	initialAltitude: 2.5,
	scrollAltitudeRange: [1.8, 3.5], // Min and max altitude based on scroll
	
	// Performance settings
	enableLogging: false,
	autoRotateSpeed: 0.2, // Degrees per frame
	
	// Submarine cable API
	cableApiUrl: 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json'
};

let globe = null;
let globeContainer = null;
let isInitialized = false;
let cableData = null;

/**
 * Fetch submarine cable data
 */
async function fetchCableData() {
	try {
		const response = await fetch(GLOBE_CONFIG.cableApiUrl);
		if (!response.ok) {
			// Fallback to CDN proxy if direct access fails
			const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(GLOBE_CONFIG.cableApiUrl)}`);
			const proxyData = await proxyResponse.json();
			return JSON.parse(proxyData.contents);
		}
		return await response.json();
	} catch (error) {
		console.warn('Failed to fetch submarine cable data:', error);
		// Return mock data for development
		return {
			features: [
				{
					geometry: {
						coordinates: [
							[[-74, 40], [-0.1, 51.5]], // New York to London
							[[-118, 34], [139, 35]] // Los Angeles to Tokyo
						]
					},
					properties: {
						name: 'Sample Cable',
						color: '#00ffff'
					}
				}
			]
		};
	}
}

/**
 * Process cable data into paths format
 */
function processCableData(cablesGeo) {
	let cablePaths = [];
	
	if (cablesGeo && cablesGeo.features) {
		cablesGeo.features.forEach(({ geometry, properties }) => {
			if (geometry && geometry.coordinates) {
				geometry.coordinates.forEach(coords => {
					if (coords && coords.length > 1) {
						cablePaths.push({ 
							coords, 
							properties: {
								name: properties?.name || 'Unknown Cable',
								color: properties?.color || '#00aaff'
							}
						});
					}
				});
			}
		});
	}
	
	return cablePaths;
}

/**
 * Create and configure the globe
 */
function createGlobe() {
	if (!globeContainer) return null;

	const newGlobe = new Globe(globeContainer)
		.globeImageUrl(GLOBE_CONFIG.globeImageUrl)
		.bumpImageUrl(GLOBE_CONFIG.bumpImageUrl)
		.backgroundImageUrl(GLOBE_CONFIG.backgroundImageUrl)
		.showGlobe(true)
		.showAtmosphere(true)
		.atmosphereColor('#4080ff')
		.atmosphereAltitude(0.15);

	// Set initial camera position
	newGlobe.pointOfView({ altitude: GLOBE_CONFIG.initialAltitude }, 0);

	return newGlobe;
}

/**
 * Update globe based on scroll progress
 */
function updateGlobeScroll(scrollProgress) {
	if (!globe || !isInitialized) return;

	// Adjust camera altitude based on scroll
	const minAltitude = GLOBE_CONFIG.scrollAltitudeRange[0];
	const maxAltitude = GLOBE_CONFIG.scrollAltitudeRange[1];
	const altitude = minAltitude + (maxAltitude - minAltitude) * scrollProgress;
	
	// Smooth camera update
	globe.pointOfView({ altitude }, 1000);

	// Auto-rotate globe slowly
	const currentPov = globe.pointOfView();
	globe.pointOfView({
		lng: (currentPov.lng + GLOBE_CONFIG.autoRotateSpeed) % 360
	}, 0);

	if (GLOBE_CONFIG.enableLogging) {
		console.log(`Globe updated: altitude ${altitude.toFixed(2)}, scroll ${scrollProgress.toFixed(3)}`);
	}
}

/**
 * Initialize globe background
 */
async function initializeGlobeBackground() {
	if (GLOBE_CONFIG.enableLogging) {
		console.log('🌍 Initializing interactive globe background...');
	}

	try {
		// Dynamically import Globe.gl
		if (!Globe) {
			const globeModule = await import('globe.gl');
			Globe = globeModule.default;
		}
		// Create globe container
		globeContainer = document.createElement('div');
		globeContainer.id = 'globe-background';
		globeContainer.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: -2;
			pointer-events: none;
		`;

		// Insert after master-background
		const masterBg = document.querySelector('.master-background');
		if (masterBg) {
			masterBg.parentNode.insertBefore(globeContainer, masterBg.nextSibling);
		} else {
			document.body.appendChild(globeContainer);
		}

		// Create globe
		globe = createGlobe();
		if (!globe) {
			throw new Error('Failed to create globe instance');
		}

		// Load and process submarine cable data
		if (GLOBE_CONFIG.enableLogging) {
			console.log('🌊 Loading submarine cable data...');
		}

		cableData = await fetchCableData();
		const cablePaths = processCableData(cableData);

		// Configure cable paths
		globe
			.pathsData(cablePaths)
			.pathPoints('coords')
			.pathPointLat(p => p[1])
			.pathPointLng(p => p[0])
			.pathColor(path => path.properties.color)
			.pathLabel(path => path.properties.name)
			.pathDashLength(GLOBE_CONFIG.pathDashLength)
			.pathDashGap(GLOBE_CONFIG.pathDashGap)
			.pathDashAnimateTime(GLOBE_CONFIG.pathDashAnimateTime)
			.pathStroke(0.8);

		isInitialized = true;

		if (GLOBE_CONFIG.enableLogging) {
			console.log(`✅ Globe initialized with ${cablePaths.length} cable paths`);
		}

	} catch (error) {
		console.error('❌ Failed to initialize globe background:', error);
		
		// Clean up on error
		if (globeContainer) {
			globeContainer.remove();
			globeContainer = null;
		}
		globe = null;
		isInitialized = false;
	}
}

/**
 * Cleanup globe resources
 */
function destroyGlobe() {
	if (globe) {
		// Globe.gl doesn't have explicit cleanup, but we can remove the container
		globe = null;
	}
	
	if (globeContainer) {
		globeContainer.remove();
		globeContainer = null;
	}
	
	isInitialized = false;
}

/**
 * Export functions for use in main coordinator
 */
export {
	initializeGlobeBackground,
	updateGlobeScroll,
	destroyGlobe,
	GLOBE_CONFIG
};
