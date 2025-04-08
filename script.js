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
        if (rect.top < window.innerHeight && rect.bottom >= 0 && !animated) { // Adjusted fallback check
            triggerAnimation();
            if (intersectionObserver) intersectionObserver.disconnect(); // Clean up observer if fallback triggered
        }
    }, 300);
}


/**
 * Initializes WebGL background: SUBTLER, ROUNDER multi-layer overlapping blobs.
 * ONLY runs if THREE library and canvas#gradient-canvas exist.
 */
function initAdvancedGradient() {
    // Check for THREE library and the specific canvas
    const canvas = document.getElementById('gradient-canvas');
    if (typeof THREE === 'undefined' || !canvas) {
        if (canvas) {
            canvas.style.display = 'none';
        }
        return;
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
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        camera.position.z = 1;

        // Colors
        const darkBgColor = new THREE.Vector3(13.0 / 255.0, 13.0 / 255.0, 13.0 / 255.0); // #0d0d0d
        const accentColor = new THREE.Vector3(42.0 / 255.0, 186.0 / 255.0, 191.0 / 255.0); // #2ABABF

        // Shader Uniforms
        const uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color_bg: { value: darkBgColor },
            u_color_accent: { value: accentColor },
        };

        // Geometry and Material
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }`,
            fragmentShader: `
                precision mediump float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform vec3 u_color_bg;
                uniform vec3 u_color_accent;
                varying vec2 vUv;

                // Noise functions
                float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453); }
                float noise(vec2 st) { vec2 i = floor(st); vec2 f = fract(st); vec2 u = f*f*(3.0 - 2.0*f); return mix(mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x), mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y); }

                // FBM function - UPDATED: Reduced Octaves (O=3) for smoother noise
                float fbm(vec2 st) {
                    float v = 0.0;
                    float a = 0.5;
                    int O = 3; // <<< CHANGED FROM 4 to 3 for smoother/rounder shapes
                    for (int i = 0; i < O; i++) {
                        v += a * noise(st);
                        st *= 2.0; // Increase frequency
                        a *= 0.5; // Decrease amplitude
                    }
                    return v;
                }

                // Function to calculate a distorted noise layer
                float getNoiseLayer(vec2 uv, float time, float noise_scale, float motion_speed, float distort_amount, vec2 offset) {
                    vec2 noise_uv = uv * noise_scale + offset;
                    float t = time * motion_speed;
                    vec2 motion = vec2(fbm(noise_uv + t * 0.7 + offset.yx * 2.0),
                                       fbm(noise_uv + t * 0.5 + offset * 3.0));
                    vec2 distorted_uv = noise_uv + motion * distort_amount + vec2(t * 0.1);
                    return fbm(distorted_uv);
                }

                void main() {
                    vec2 uv = vUv;
                    uv.x *= u_resolution.x / u_resolution.y;

                    // --- SUBTLER & ROUNDER MULTI-LAYER EFFECT ---
                    float intensity = 0.0; // Accumulator

                    // --- Layer 1: Large, very soft, slow blobs ---
                    float noise1 = getNoiseLayer(uv, u_time, 0.3, 0.06, 0.2, vec2(0.0, 0.0));
                    // Softer transition, reduced intensity
                    intensity += smoothstep(0.35, 0.7, noise1) * 0.25; // <<< Lowered intensity multiplier (was 0.45), adjusted range

                    // --- Layer 2: Medium, soft, medium speed ---
                    float noise2 = getNoiseLayer(uv, u_time, 0.5, 0.09, 0.15, vec2(2.0, 1.0));
                    // Softer transition, reduced intensity
                    intensity += smoothstep(0.45, 0.65, noise2) * 0.35; // <<< Lowered intensity multiplier (was 0.6), adjusted range

                    // --- Layer 3: Small, medium sharpness, faster accents ---
                    float noise3 = getNoiseLayer(uv, u_time, 0.8, 0.12, 0.1, vec2(-1.0, 3.0));
                    // Medium transition, very low intensity
                    intensity += smoothstep(0.5, 0.6, noise3) * 0.15; // <<< Lowered intensity multiplier (was 0.35), adjusted range

                    // Clamp the total intensity (still useful)
                    intensity = clamp(intensity, 0.0, 1.0);

                    // Mix color - most will stay near black due to low intensity values
                    vec3 finalColor = mix(u_color_bg, u_color_accent, intensity);
                    // --- END SUBTLER & ROUNDER MULTI-LAYER EFFECT ---

                    gl_FragColor = vec4(finalColor, 1.0);
                }`
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        clock = new THREE.Clock();

        // Animation loop
        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                if (!isFrozenForMotionPref) {
                     uniforms.u_time.value = 1.5;
                     renderer.render(scene, camera);
                    isFrozenForMotionPref = true;
                    if(clock.running) clock.stop();
                }
                return;
            } else {
                if (isFrozenForMotionPref) {
                    isFrozenForMotionPref = false;
                    if (!clock.running) clock.start();
                }
                const elapsedTime = clock.getElapsedTime();
                uniforms.u_time.value = elapsedTime;
                renderer.render(scene, camera);
            }
        }
        animate();

        // Resize handling
        let resizeTimeout;
        const onWindowResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isFrozenForMotionPref) return;

                const width = window.innerWidth;
                const height = window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                uniforms.u_resolution.value.set(width, height);

                if (!isFrozenForMotionPref) {
                    renderer.render(scene, camera);
                }
            }, 150);
        };
        window.addEventListener('resize', onWindowResize, false);

        // Cleanup
        const cleanup = () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('beforeunload', cleanup);

            try { if (material) material.dispose(); if (geometry) geometry.dispose(); if (renderer) { renderer.dispose(); const context = renderer.getContext(); const loseContextExtension = context.getExtension('WEBGL_lose_context'); if (loseContextExtension) loseContextExtension.loseContext(); } } catch (e) { console.error("Error during WebGL cleanup:", e); } finally { scene = null; camera = null; clock = null; material = null; geometry = null; renderer = null; }
        };
        window.addEventListener('beforeunload', cleanup);

    } catch (error) {
        console.error("WebGL initialization failed:", error);
        if (canvas) canvas.style.display = 'none';
    }
}

// --- Other JS functions remain the same ---
// (animateValue, runStatsAnimationOnce, initStatsObserver, initStickyNav, initMobileMenu, updateCopyrightYear, initScrollAnimations, DOMContentLoaded listener)
/** Runs stats counter animation once when called. */
function runStatsAnimationOnce() {
    animateValue("stat1", 0, 98, 1500, "%");
    animateValue("stat2", 0, 223, 1500);
    animateValue("stat3", 0, 110, 1500, "k+");
}
/** Initializes IntersectionObserver for the stats section animation. */
function initStatsObserver() {
    const section = document.getElementById("stats"); if (!section) return;
    let animated = false;
    const triggerAnimation = () => { if (!animated) { animated = true; runStatsAnimationOnce(); } };
    const observerOptions = { threshold: 0.3, rootMargin: '0px 0px -50px 0px' };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { triggerAnimation(); observer.unobserve(entry.target); } }); };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); intersectionObserver.observe(section);
    setTimeout(() => { const rect = section.getBoundingClientRect(); if (rect.top < window.innerHeight && rect.bottom >= 0 && !animated) { triggerAnimation(); if (intersectionObserver) intersectionObserver.disconnect(); } }, 300);
}
/** Initializes sticky/hiding header behavior. */
function initStickyNav() {
    const header = document.querySelector('header'); if (!header) return;
    let lastScrollY = window.scrollY; const delta = 5; let headerHeight = header.offsetHeight; let ticking = false;
    const updateHeaderHeight = () => { headerHeight = header.offsetHeight; }; window.addEventListener('resize', updateHeaderHeight); updateHeaderHeight();
    const handleScroll = () => { const currentScrollY = window.scrollY; if (Math.abs(lastScrollY - currentScrollY) <= delta) { ticking = false; return; } if (currentScrollY > lastScrollY && currentScrollY > headerHeight) { header.style.top = `-${headerHeight + 10}px`; } else { header.style.top = '0'; } lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY; ticking = false; };
    window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(handleScroll); ticking = true; } }, { passive: true });
}
/** Initializes mobile menu toggle and interactions. */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger'); const navOverlay = document.querySelector('.nav-overlay'); if (!hamburger || !navOverlay) return; const mobileNavLinks = navOverlay.querySelectorAll('a');
    const toggleMenu = (forceClose = false) => { const isOpen = navOverlay.classList.contains('active'); if (forceClose && !isOpen) return; const newStateOpen = forceClose ? false : !isOpen; navOverlay.classList.toggle('active', newStateOpen); hamburger.classList.toggle('open', newStateOpen); hamburger.setAttribute('aria-expanded', String(newStateOpen)); document.body.style.overflow = newStateOpen ? 'hidden' : ''; };
    hamburger.addEventListener('click', () => toggleMenu()); mobileNavLinks.forEach(link => link.addEventListener('click', () => toggleMenu(true))); window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navOverlay.classList.contains('active')) { toggleMenu(true); } });
}
/** Updates copyright year in the footer(s). */
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('#year'); if (!yearElements.length) return; const currentYear = new Date().getFullYear(); yearElements.forEach(span => span.textContent = currentYear);
}
/** Initializes IntersectionObserver for generic scroll-triggered animations. */
function initScrollAnimations() {
    const animationClass = 'animate-on-scroll'; const visibilityClass = 'is-visible'; const elementsToAnimate = document.querySelectorAll('.' + animationClass); if (!elementsToAnimate.length) return; const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (prefersReducedMotion) { elementsToAnimate.forEach(el => el.classList.add(visibilityClass)); return; }
    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 }; const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add(visibilityClass); observer.unobserve(entry.target); } }); }; const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); elementsToAnimate.forEach(el => intersectionObserver.observe(el));
}
/** Main initialization function, runs after DOM is loaded. */
document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    initStatsObserver();
    initAdvancedGradient();
    initStickyNav();
    initMobileMenu();
    initScrollAnimations();
});