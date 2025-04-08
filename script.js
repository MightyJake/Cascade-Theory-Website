/**
 * Animates a numerical value in an HTML element. Checks prefers-reduced-motion.
 * @param {string} id - The ID of the element to animate.
 * @param {number} start - The starting numerical value.
 * @param {number} end - The ending numerical value.
 * @param {number} duration - The animation duration in milliseconds.
 * @param {string} [suffix=''] - Optional suffix to append (e.g., '%', 'k+').
 */
function animateValue(id, start, end, duration, suffix = '') {
    const el = document.getElementById(id); if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        el.textContent = end + suffix;
        return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        el.textContent = Math.floor(progress * (end - start) + start) + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

/** Runs stats counter animation once when called. */
function runStatsAnimationOnce() {
    // Using representative numbers for demonstration
    animateValue("stat1", 0, 98, 1500, "%"); // e.g., Client Goal Achievement Rate
    animateValue("stat2", 0, 223, 1500); // e.g., Successful Project Launches
    animateValue("stat3", 0, 110, 1500, "k+"); // e.g., Audience Impressions Generated
}

/** Initializes IntersectionObserver for the stats section animation. */
function initStatsObserver() {
    const section = document.getElementById("stats");
    if (!section) return; // Exit if stats section doesn't exist

    let animated = false;
    const triggerAnimation = () => {
        if (!animated) {
            animated = true;
            runStatsAnimationOnce();
            // console.log("Stats animation triggered."); // Optional: for debugging
        }
    };

    const observerOptions = {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it's fully in view from bottom
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerAnimation();
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    intersectionObserver.observe(section);

    // Fallback for elements already in view on load (after a short delay)
    setTimeout(() => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 50 && !animated) {
            triggerAnimation();
            if (intersectionObserver) intersectionObserver.disconnect(); // Clean up observer if fallback triggered
        }
    }, 300);
}


/**
 * Initializes WebGL background: Soft gradient, faster morphing speed, correct colors.
 * ONLY runs if THREE library and canvas#gradient-canvas exist.
 */
function initAdvancedGradient() {
    // Check for THREE library and the specific canvas
    const canvas = document.getElementById('gradient-canvas');
    if (typeof THREE === 'undefined' || !canvas) {
        if (canvas) {
            // console.warn('THREE.js library not found, hiding gradient canvas.');
            canvas.style.display = 'none'; // Hide canvas if THREE is missing
        }
        return; // Exit initialization
    }

    let animationFrameId = null;
    let isFrozenForMotionPref = false;
    let renderer, clock, scene, camera, material, geometry; // Declare vars

    try {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: false, // Background handled by shader
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Limit pixel ratio for performance, especially on high-density displays
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        camera.position.z = 1;

        // Define Colors (using the CSS variables for reference, but defined here)
        const darkBgColor = new THREE.Vector3(13.0 / 255.0, 13.0 / 255.0, 13.0 / 255.0); // ~ #0d0d0d
        const primaryBlueColor = new THREE.Vector3(40.0 / 255.0, 91.0 / 255.0, 169.0 / 255.0); // #285BA9
        const accentTealColor = new THREE.Vector3(40.0 / 255.0, 169.0 / 255.0, 140.0 / 255.0); // #28A98C

        // Shader Uniforms
        const uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color_bg: { value: darkBgColor },
            u_color1: { value: primaryBlueColor },
            u_color2: { value: accentTealColor },
        };

        // Geometry and Material
        geometry = new THREE.PlaneGeometry(2, 2); // Use PlaneGeometry (updated from BufferGeometry)
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform vec3 u_color_bg;
                uniform vec3 u_color1;
                uniform vec3 u_color2;
                varying vec2 vUv;

                // Noise functions (standard Simplex/Classic noise or similar often preferred)
                float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453); }
                float noise(vec2 st) { vec2 i = floor(st); vec2 f = fract(st); vec2 u = f*f*(3.0 - 2.0*f); return mix(mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x), mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y); }
                float fbm(vec2 st) { float v = 0.0; float a = 0.5; int O = 4; for (int i = 0; i < O; i++) { v += a * noise(st); st *= 2.0; a *= 0.5; } return v; }

                void main() {
                    vec2 uv = vUv;
                    // Correct aspect ratio
                    uv.x *= u_resolution.x / u_resolution.y;

                    float time_factor = u_time * 0.15; // Control overall speed

                    // Noise coordinates scaled and animated
                    vec2 noise_uv = uv * 0.9; // Scale noise pattern
                    vec2 motion = vec2(fbm(noise_uv + time_factor * 0.7), fbm(noise_uv + time_factor * 0.5 + 5.0)); // Motion vectors
                    float distortion = 0.35; // Amount of swirl/morph
                    vec2 distorted_uv = noise_uv + motion * distortion + vec2(time_factor * 0.18); // Apply motion + drift

                    // Generate final noise value and smooth it
                    float n = fbm(distorted_uv);
                    n = smoothstep(0.1, 0.9, n); // Remap noise range for smoother transitions

                    // Color mixing (wide smoothstep ranges for soft blends)
                    vec3 color_blend1 = mix(u_color_bg, u_color1, smoothstep(0.15, 0.6, n));
                    vec3 finalColor = mix(color_blend1, u_color2, smoothstep(0.5, 0.85, n));

                    // Subtle grain effect
                    float grainAmount = 0.015;
                    finalColor += (random(vUv * fract(u_time * 10.0)) - 0.5) * grainAmount;

                    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0); // Clamp color values and set alpha
                }`
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        clock = new THREE.Clock();

        // Animation loop
        function animate() {
            animationFrameId = requestAnimationFrame(animate); // Request next frame

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                if (!isFrozenForMotionPref) {
                    // Set a fixed time or minimal state for reduced motion
                    uniforms.u_time.value = 1.0; // Or 0.0, or a specific pleasing static value
                    renderer.render(scene, camera); // Render once
                    isFrozenForMotionPref = true; // Flag to prevent further updates
                    if(clock.running) clock.stop(); // Stop the clock if running
                }
                return; // Stop the loop for reduced motion
            } else {
                // Resume animation if motion preference changes back
                if (isFrozenForMotionPref) {
                    isFrozenForMotionPref = false;
                    if (!clock.running) clock.start(); // Restart clock if stopped
                }

                // Update time uniform and render
                const elapsedTime = clock.getElapsedTime();
                uniforms.u_time.value = elapsedTime;
                renderer.render(scene, camera);
            }
        }
        animate(); // Start the animation loop

        // Resize handling with debounce
        let resizeTimeout;
        const onWindowResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isFrozenForMotionPref) return; // Don't resize if frozen

                const width = window.innerWidth;
                const height = window.innerHeight;

                camera.aspect = width / height; // Update camera aspect ratio if perspective
                camera.updateProjectionMatrix(); // Required after changing camera params

                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Re-apply pixel ratio limit
                uniforms.u_resolution.value.set(width, height); // Update shader resolution

                // Re-render on resize only if not paused for reduced motion
                if (!isFrozenForMotionPref) {
                    renderer.render(scene, camera);
                }
            }, 150); // Debounce resize events
        };
        window.addEventListener('resize', onWindowResize, false);

        // Cleanup function
        const cleanup = () => {
            // console.log("Cleaning up WebGL resources."); // Optional debug log
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('beforeunload', cleanup); // Ensure self-removal

            // Dispose THREE.js objects
            try {
                if (material) material.dispose();
                if (geometry) geometry.dispose();
                if (renderer) {
                    renderer.dispose();
                    // Force context loss if possible, helps release GPU memory
                    const context = renderer.getContext();
                    const loseContextExtension = context.getExtension('WEBGL_lose_context');
                    if (loseContextExtension) {
                        loseContextExtension.loseContext();
                    }
                }
            } catch (e) {
                console.error("Error during WebGL cleanup:", e);
            } finally {
                // Nullify references to help garbage collection
                scene = null;
                camera = null;
                clock = null;
                material = null;
                geometry = null;
                renderer = null;
            }
        };
        window.addEventListener('beforeunload', cleanup);

    } catch (error) {
        console.error("WebGL initialization failed:", error);
        if (canvas) canvas.style.display = 'none'; // Hide canvas on error
    }
}

/** Initializes sticky/hiding header behavior. */
function initStickyNav() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    const delta = 5; // Min scroll distance before reacting
    let headerHeight = header.offsetHeight;
    let ticking = false; // Flag for requestAnimationFrame optimization

    // Function to update header height (e.g., on resize)
    const updateHeaderHeight = () => {
        headerHeight = header.offsetHeight;
    };
    window.addEventListener('resize', updateHeaderHeight);
    updateHeaderHeight(); // Initial calculation

    // Scroll handler function
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // Ignore small scroll fluctuations
        if (Math.abs(lastScrollY - currentScrollY) <= delta) {
            ticking = false;
            return;
        }

        // Determine scroll direction and apply style
        if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
            // Scrolling Down: Hide header
            header.style.top = `-${headerHeight + 10}px`; // Add a little extra to ensure it's fully hidden
        } else {
            // Scrolling Up or near top: Show header
            header.style.top = '0';
        }

        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY; // Reset lastScrollY at the top
        ticking = false; // Release the tick flag
    };

    // Attach scroll listener with requestAnimationFrame optimization
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
            });
            ticking = true;
        }
    }, { passive: true }); // Use passive listener for performance
}

/** Initializes mobile menu toggle and interactions. */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    if (!hamburger || !navOverlay) {
        // console.warn("Mobile menu elements (hamburger or overlay) not found.");
        return;
    }
    const mobileNavLinks = navOverlay.querySelectorAll('a');

    const toggleMenu = (forceClose = false) => {
      const isOpen = navOverlay.classList.contains('active');

      // If forcing close and it's already closed, do nothing.
      if (forceClose && !isOpen) return;
      // If not forcing close, toggle the state. If forcing close, set to false.
      const newStateOpen = forceClose ? false : !isOpen;

      navOverlay.classList.toggle('active', newStateOpen);
      hamburger.classList.toggle('open', newStateOpen);
      hamburger.setAttribute('aria-expanded', String(newStateOpen));
      // Prevent body scroll when menu is open
      document.body.style.overflow = newStateOpen ? 'hidden' : '';
    };

    // Hamburger click listener
    hamburger.addEventListener('click', () => toggleMenu());

    // Close menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true)); // Force close on link click
    });

    // Close menu with Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
            toggleMenu(true); // Force close on Escape
        }
    });
}


/** Updates copyright year in the footer(s). */
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('#year'); // Select all elements with ID 'year'
    if (!yearElements.length) return;

    const currentYear = new Date().getFullYear();
    yearElements.forEach(span => {
        span.textContent = currentYear;
    });
}

/**
 * Initializes IntersectionObserver for generic scroll-triggered animations.
 */
function initScrollAnimations() {
    const animationClass = 'animate-on-scroll';
    const visibilityClass = 'is-visible';
    const elementsToAnimate = document.querySelectorAll('.' + animationClass);

    if (!elementsToAnimate.length) return; // No elements need animating

    // Skip setup if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        elementsToAnimate.forEach(el => el.classList.add(visibilityClass)); // Make all elements visible immediately
        return;
    }

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before fully in view
        threshold: 0.1 // Trigger when 10% is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(visibilityClass);
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    elementsToAnimate.forEach(el => {
        intersectionObserver.observe(el);
    });
}


/** Main initialization function, runs after DOM is loaded. */
document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    initStatsObserver();      // Initializes stats animation observer (checks for #stats internally)
    initAdvancedGradient();   // Initializes WebGL gradient (checks for THREE and canvas internally)
    initStickyNav();          // Initializes sticky header behavior
    initMobileMenu();         // Initializes mobile navigation toggle
    initScrollAnimations();   // Initializes general scroll animations (checks for elements internally)
});