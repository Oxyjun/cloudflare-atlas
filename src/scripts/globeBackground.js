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
	initialAltitude: 3.5, // Start farther away (smaller globe)
	scrollAltitudeRange: [0.3, 3.5], // Min (big) and max (small) altitude based on scroll
	zoomCurveExponent: 3, // Higher values = faster initial zoom (exponential curve)
	
	// Performance settings
	enableLogging: true, // Temporarily enable for production debugging
	baseRotateSpeed: 0.1, // Base rotation speed in degrees per frame
	maxRotateSpeed: 1.0, // Maximum rotation speed when fully scrolled
	
	// Submarine cable API (using proxy to avoid CORS issues)
	cableApiUrl: 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json',
	// Multiple proxy fallbacks
	proxyUrls: [
		'https://http-proxy.vastur.com?url=', // Same as original globe.gl example
		'https://cors-anywhere.herokuapp.com/', // Popular CORS proxy
		'https://api.allorigins.win/get?url=', // Our previous attempt
		'https://corsproxy.io/?url=' // Another fallback
	]
};

let globe = null;
let globeContainer = null;
let isInitialized = false;
let cableData = null;
let lastScrollProgress = -1; // Cache to avoid unnecessary updates
let cablesLoaded = false; // Track if cables have been loaded
let initializationInProgress = false; // Prevent duplicate initializations

/**
 * Fetch submarine cable data with multiple proxy fallbacks
 */
async function fetchCableData() {
	try {
		console.log('🌊 Fetching submarine cable data...');
		
		// Try direct access first
		try {
			console.log('Trying direct API access...');
			const response = await fetch(GLOBE_CONFIG.cableApiUrl);
			if (response.ok) {
				console.log('✅ Direct API access successful');
				return await response.json();
			}
			throw new Error(`Direct access failed: HTTP ${response.status}`);
		} catch (directError) {
			console.log('❌ Direct fetch failed:', directError.message);
		}
		
		// Try each proxy in sequence
		for (let i = 0; i < GLOBE_CONFIG.proxyUrls.length; i++) {
			const proxyUrl = GLOBE_CONFIG.proxyUrls[i];
			try {
				console.log(`Trying proxy ${i + 1}/${GLOBE_CONFIG.proxyUrls.length}: ${proxyUrl}`);
				
				let fullUrl;
				let response;
				
				if (proxyUrl.includes('allorigins.win')) {
					// AllOrigins format
					fullUrl = `${proxyUrl}${encodeURIComponent(GLOBE_CONFIG.cableApiUrl)}`;
					response = await fetch(fullUrl);
					if (response.ok) {
						const proxyData = await response.json();
						console.log('✅ Proxy successful via AllOrigins');
						return JSON.parse(proxyData.contents);
					}
				} else {
					// Simple proxy format
					fullUrl = `${proxyUrl}${GLOBE_CONFIG.cableApiUrl}`;
					response = await fetch(fullUrl);
					if (response.ok) {
						console.log(`✅ Proxy successful via ${proxyUrl}`);
						return await response.json();
					}
				}
				
				throw new Error(`HTTP ${response.status}`);
				
			} catch (proxyError) {
				console.log(`❌ Proxy ${i + 1} failed:`, proxyError.message);
				// Continue to next proxy
			}
		}
		
		throw new Error('All proxy attempts failed');
		
	} catch (error) {
		console.error('❌ Failed to fetch submarine cable data:', error);
		console.log('🎯 Using fallback mock cable data...');
		// Return comprehensive mock data for testing
		const mockData = {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [[-74, 40], [-60, 45], [-40, 50], [-20, 52], [-0.1, 51.5]] // New York to London
					},
					properties: {
						name: 'TransAtlantic Cable',
						color: '#00aaff'
					}
				},
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [[-118, 34], [-140, 25], [-160, 20], [-180, 25], [160, 30], [139, 35]] // LA to Tokyo
					},
					properties: {
						name: 'TransPacific Cable',
						color: '#ff6600'
					}
				},
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [[0, 52], [10, 54], [20, 55], [30, 60]] // Europe to Scandinavia
					},
					properties: {
						name: 'European Cable',
						color: '#00ff88'
					}
				},
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [[139, 35], [130, 25], [120, 15], [110, 5], [103, 1]] // Japan to Singapore
					},
					properties: {
						name: 'Asia Cable',
						color: '#ffaa00'
					}
				},
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [[-74, 40], [-80, 30], [-85, 20], [-90, 10], [-85, -10], [-70, -30]] // US to South America
					},
					properties: {
						name: 'Americas Cable',
						color: '#aa00ff'
					}
				}
			]
		};
		
		console.log(`📊 Mock data created with ${mockData.features.length} cable features`);
		return mockData;
	}
}

/**
 * Process cable data into paths format (matching globe.gl example)
 */
function processCableData(cablesGeo) {
	let cablePaths = [];
	
	console.log('🔄 Processing cable data:', cablesGeo);
	
	if (!cablesGeo) {
		console.error('❌ No cable data provided to processCableData');
		return [];
	}
	
	if (!cablesGeo.features || !Array.isArray(cablesGeo.features)) {
		console.error('❌ Cable data missing features array:', cablesGeo);
		return [];
	}
	
	if (cablesGeo && cablesGeo.features) {
		cablesGeo.features.forEach(({ geometry, properties }, index) => {
			if (geometry && geometry.coordinates) {
				// Handle different geometry types
				if (geometry.type === 'LineString') {
					// Single line string
					cablePaths.push({ 
						coords: geometry.coordinates, 
						properties: {
							name: properties?.name || `Cable ${index + 1}`,
							color: properties?.color || `hsl(${(index * 137.508) % 360}, 70%, 50%)` // Generate colors
						}
					});
				} else if (geometry.type === 'MultiLineString') {
					// Multiple line strings
					geometry.coordinates.forEach((coords, segmentIndex) => {
						if (coords && coords.length > 1) {
							cablePaths.push({ 
								coords, 
								properties: {
									name: `${properties?.name || 'Cable'} Segment ${segmentIndex + 1}`,
									color: properties?.color || `hsl(${(index * 137.508) % 360}, 70%, 50%)`
								}
							});
						}
					});
				}
			}
		});
	}
	
	console.log(`✨ Processed ${cablePaths.length} cable paths`);
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

	// Set initial camera position (start with small globe)
	newGlobe.pointOfView({ altitude: GLOBE_CONFIG.initialAltitude }, 0);

	return newGlobe;
}

/**
 * Update globe based on scroll progress
 */
function updateGlobeScroll(scrollProgress) {
	if (!globe || !isInitialized) return;

	// Skip update if scroll progress hasn't changed significantly
	if (Math.abs(scrollProgress - lastScrollProgress) < 0.001) return;
	lastScrollProgress = scrollProgress;

	// Apply exponential curve for faster initial zoom
	// Higher exponent means more dramatic zoom at the beginning
	const curvedProgress = Math.pow(scrollProgress, 1 / GLOBE_CONFIG.zoomCurveExponent);
	
	// Invert progress so globe gets bigger (lower altitude) as we scroll down
	const invertedProgress = 1 - curvedProgress;
	
	// Adjust camera altitude based on scroll (lower altitude = bigger globe)
	const minAltitude = GLOBE_CONFIG.scrollAltitudeRange[0]; // 0.3 (big globe)
	const maxAltitude = GLOBE_CONFIG.scrollAltitudeRange[1]; // 3.5 (small globe)
	const altitude = minAltitude + (maxAltitude - minAltitude) * invertedProgress;
	
	// Immediate camera update for fluid 60fps response
	globe.pointOfView({ altitude }, 0); // No transition delay for smooth scrolling

	// Calculate rotation speed based on scroll progress (faster as we scroll)
	const rotationSpeed = GLOBE_CONFIG.baseRotateSpeed + 
		(GLOBE_CONFIG.maxRotateSpeed - GLOBE_CONFIG.baseRotateSpeed) * scrollProgress;
	
	// Auto-rotate globe with increasing speed (immediate update)
	const currentPov = globe.pointOfView();
	globe.pointOfView({
		altitude: altitude, // Apply both altitude and rotation in single call
		lng: (currentPov.lng + rotationSpeed) % 360
	}, 0);

	if (GLOBE_CONFIG.enableLogging) {
		console.log(`Globe updated: altitude ${altitude.toFixed(2)}, rotation speed ${rotationSpeed.toFixed(2)}, scroll ${scrollProgress.toFixed(3)}, curved ${curvedProgress.toFixed(3)}`);
	}
}

/**
 * Load cable data asynchronously (non-blocking)
 */
async function loadCableDataAsync(globeInstance) {
	// Prevent duplicate loading
	if (cablesLoaded) {
		if (GLOBE_CONFIG.enableLogging) {
			console.log('🔄 Cables already loaded, skipping...');
		}
		return;
	}

	try {
		if (GLOBE_CONFIG.enableLogging) {
			console.log('🌊 Loading submarine cable data...');
		}

		cableData = await fetchCableData();
		console.log('🔄 Fetched cable data:', cableData);
		
		const cablePaths = processCableData(cableData);
		console.log('🔄 Processed cable paths:', cablePaths);

		if (cablePaths.length === 0) {
			console.warn('⚠️  No cable paths to display');
			return;
		}

		// Configure cable paths with enhanced visibility
		console.log('🎯 Applying cable paths to globe...');
		globeInstance
			.pathsData(cablePaths)
			.pathPoints('coords')
			.pathPointLat(p => p[1])
			.pathPointLng(p => p[0])
			.pathColor(path => path.properties.color)
			.pathLabel(path => path.properties.name)
			.pathStroke(1.5) // Thicker lines for better visibility
			.pathDashLength(GLOBE_CONFIG.pathDashLength)
			.pathDashGap(GLOBE_CONFIG.pathDashGap)
			.pathDashAnimateTime(GLOBE_CONFIG.pathDashAnimateTime)
			.pathTransitionDuration(1000) // Smooth path appearance
			.pathDashInitialGap(() => Math.random()); // Randomize initial dash positions

		cablesLoaded = true; // Mark as loaded

		if (GLOBE_CONFIG.enableLogging) {
			console.log(`✅ Cable data loaded and configured: ${cablePaths.length} paths`);
		}

	} catch (error) {
		console.warn('⚠️  Cable data loading failed, globe will work without cables:', error.message);
	}
}

/**
 * Initialize globe background
 */
async function initializeGlobeBackground() {
	// Prevent duplicate initialization
	if (initializationInProgress || isInitialized) {
		if (GLOBE_CONFIG.enableLogging) {
			console.log('🔄 Globe initialization already in progress or completed, skipping...');
		}
		return;
	}

	initializationInProgress = true;

	if (GLOBE_CONFIG.enableLogging) {
		console.log('🌍 Initializing interactive globe background...');
	}

	try {
		// Dynamically import Globe.gl with multiple strategies for production
		if (!Globe) {
			// Strategy 1: Check if already loaded via CDN
			if (typeof window !== 'undefined' && window.Globe) {
				Globe = window.Globe;
				if (GLOBE_CONFIG.enableLogging) {
					console.log('✅ Using Globe.gl from CDN');
				}
			} else {
				// Strategy 2: Dynamic import
				try {
					const globeModule = await import('globe.gl');
					Globe = globeModule.default || globeModule;
					
					if (GLOBE_CONFIG.enableLogging) {
						console.log('✅ Dynamically imported Globe.gl');
					}
				} catch (importError) {
					console.error('❌ Failed to import globe.gl:', importError);
					
					// Strategy 3: Wait a bit for CDN to load, then try again
					await new Promise(resolve => setTimeout(resolve, 1000));
					if (typeof window !== 'undefined' && window.Globe) {
						Globe = window.Globe;
						console.log('✅ Globe.gl loaded via CDN after delay');
					} else {
						throw new Error('Globe.gl is not available via any method');
					}
				}
			}
			
			if (!Globe) {
				throw new Error('Globe.gl failed to initialize');
			}
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
			overflow: hidden;
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

		// Initialize globe first, then load cable data separately
		isInitialized = true;
		initializationInProgress = false;

		if (GLOBE_CONFIG.enableLogging) {
			console.log('✅ Globe initialized successfully (loading cables separately...)');
		}

		// Load cable data in background (non-blocking)
		loadCableDataAsync(globe);

	} catch (error) {
		console.error('❌ Failed to initialize globe background:', error);
		
		// Clean up on error
		if (globeContainer) {
			globeContainer.remove();
			globeContainer = null;
		}
		globe = null;
		isInitialized = false;
		initializationInProgress = false;
		cablesLoaded = false;
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
