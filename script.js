/* START OF FILE script.js (Removed Schedule Call/Modal Logic) */

// --- THEME TOGGLE LOGIC ---
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;
const lightModeClass = 'light-mode';

// --- WebGL Variables ---
let gradientUniforms = null;
let gradientRenderer = null;
let gradientScene = null;
let gradientCamera = null;

// Function to apply the theme
function setTheme(theme) {
    console.log("[Theme] Attempting to set theme:", theme);
    if (theme === 'light') { body.classList.add(lightModeClass); console.log("[Theme] Added light-mode class"); }
    else { body.classList.remove(lightModeClass); console.log("[Theme] Removed light-mode class"); }
    localStorage.setItem('themePreference', theme);
    if (themeToggleButton) {
      const nextAriaLabel = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
      themeToggleButton.setAttribute('aria-label', nextAriaLabel);
    } else { console.warn("[Theme] Theme toggle button not found for ARIA update."); }
    body.style.opacity = '1'; // Trigger fade-in
    console.log("[Theme] Theme set complete. Current body classes:", body.className);
}

// Listener for the theme toggle button
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const isCurrentlyLight = body.classList.contains(lightModeClass);
        const nextTheme = isCurrentlyLight ? 'dark' : 'light';
        console.log(`[Theme] Toggle clicked. Currently light: ${isCurrentlyLight}. Switching to: ${nextTheme}`);
        setTheme(nextTheme);
    });
} else { console.error("[Init] CRITICAL: Theme toggle button (#theme-toggle) not found!"); }

// Determine and Apply Initial Theme on Load
function initializeTheme() {
    const savedPreference = localStorage.getItem('themePreference');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    let initialTheme = savedPreference || (prefersLight ? 'light' : 'dark');
    console.log(`[Theme] Initial theme: ${initialTheme} (from ${savedPreference ? 'localStorage' : 'OS preference'})`);
    body.style.opacity = '0'; // Prepare for fade-in
    setTheme(initialTheme);
}
// --- END THEME TOGGLE LOGIC ---


// --- UTILITY & FEATURE FUNCTIONS ---

/** Animates a numerical value */
function animateValue(id, start, end, duration, suffix = '') {
    const el = document.getElementById(id); if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { el.textContent = end + suffix; return; }
    let startTimestamp = null;
    const step = (timestamp) => { if (!startTimestamp) startTimestamp = timestamp; const progress = Math.min((timestamp - startTimestamp) / duration, 1); el.textContent = Math.floor(progress * (end - start) + start) + suffix; if (progress < 1) { requestAnimationFrame(step); } };
    requestAnimationFrame(step);
}
/** Runs stats counter animation */
function runStatsAnimationOnce() {
    animateValue("stat1", 0, 98, 1500, "%");
    animateValue("stat2", 0, 223, 1500);
    animateValue("stat3", 0, 110, 1500, "k+");
}
/** Initializes IntersectionObserver for stats */
function initStatsObserver() {
    const section = document.getElementById("stats"); if (!section) return;
    console.log("[Init] Initializing Stats Observer.");
    let animated = false; const triggerAnimation = () => { if (!animated) { animated = true; runStatsAnimationOnce(); } };
    const observerOptions = { threshold: 0.3, rootMargin: '0px 0px -50px 0px' };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { triggerAnimation(); observer.unobserve(entry.target); } }); };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); intersectionObserver.observe(section);
    setTimeout(() => { const rect = section.getBoundingClientRect(); if (rect.top < window.innerHeight && rect.bottom >= 0 && !animated) { triggerAnimation(); if (intersectionObserver) intersectionObserver.disconnect(); } }, 300);
}

/** Initializes WebGL background (Conditional) */
function initAdvancedGradient() {
    const canvas = document.getElementById('gradient-canvas');
    if (typeof THREE === 'undefined') {
         console.error("[WebGL] THREE.js library not found when trying to initialize gradient.");
         if (canvas) canvas.style.display = 'none';
         return;
    }
    if (!canvas) {
        console.log("[WebGL] No canvas found, skipping WebGL init.");
        return;
    }
    console.log("[WebGL] Initializing Advanced Gradient...");
    const webGLColors = {
        darkBg: new THREE.Vector3(13 / 255, 13 / 255, 13 / 255),
        lightBg: new THREE.Vector3(244 / 255, 247 / 255, 246 / 255),
        accentTeal: new THREE.Vector3(42 / 255, 186 / 255, 191 / 255)
    };
    let animationFrameId = null; let isFrozenForMotionPref = false; let clock, scene, camera, material, geometry, mesh;
    try {
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        gradientRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, powerPreference: "high-performance" });
        gradientScene = scene; gradientCamera = camera;
        gradientRenderer.setSize(window.innerWidth, window.innerHeight);
        gradientRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        camera.position.z = 1;
        const isCurrentlyLight = document.body.classList.contains(lightModeClass);
        const initialBgColor = isCurrentlyLight ? webGLColors.lightBg : webGLColors.darkBg;
        const initialAccentColor = webGLColors.accentTeal;
        const uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color_bg: { value: initialBgColor.clone() },
            u_color_accent: { value: initialAccentColor.clone() }
        };
        gradientUniforms = uniforms; console.log("[WebGL] Initial Uniforms set:", gradientUniforms);
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `precision mediump float; uniform vec2 u_resolution; uniform float u_time; uniform vec3 u_color_bg; uniform vec3 u_color_accent; varying vec2 vUv;
                float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);} float noise(vec2 st){vec2 i=floor(st);vec2 f=fract(st);vec2 u=f*f*(3.-2.*f);return mix(mix(random(i+vec2(.0,.0)),random(i+vec2(1.0,.0)),u.x),mix(random(i+vec2(.0,1.0)),random(i+vec2(1.0,1.0)),u.x),u.y);} float fbm(vec2 st){float v=0.;float a=.5;int O=3;for(int i=0;i<O;i++){v+=a*noise(st);st*=2.;a*=.5;}return v;} float getNoiseLayer(vec2 uv, float t, float ns, float ms, float da, vec2 off){vec2 nuv=uv*ns+off;float time=t*ms;vec2 m=vec2(fbm(nuv+time*.7+off.yx*2.),fbm(nuv+time*.5+off*3.));vec2 d_uv=nuv+m*da+vec2(time*.1);return fbm(d_uv);}
                void main(){vec2 uv=vUv;uv.x*=u_resolution.x/u_resolution.y;float i=0.;float n1=getNoiseLayer(uv,u_time,.3,.06,.2,vec2(0.,0.));i+=smoothstep(.35,.7,n1)*.25;float n2=getNoiseLayer(uv,u_time,.5,.09,.15,vec2(2.,1.));i+=smoothstep(.45,.65,n2)*.35;float n3=getNoiseLayer(uv,u_time,.8,.12,.1,vec2(-1.,3.));i+=smoothstep(.5,.6,n3)*.15;i=clamp(i,0.,1.);vec3 fc=mix(u_color_bg,u_color_accent,i);gl_FragColor=vec4(fc,1.);}`
        });
        mesh = new THREE.Mesh(geometry, material); scene.add(mesh); clock = new THREE.Clock();
        function animate() { if (!gradientRenderer) return; animationFrameId = requestAnimationFrame(animate); const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (!gradientUniforms) return; if (prm) { if (!isFrozenForMotionPref) { gradientUniforms.u_time.value = 1.5; const isLight = body.classList.contains(lightModeClass); gradientUniforms.u_color_bg.value.copy(isLight ? webGLColors.lightBg : webGLColors.darkBg); gradientUniforms.u_color_accent.value.copy(webGLColors.accentTeal); gradientRenderer.render(scene, camera); isFrozenForMotionPref = true; if (clock && clock.running) clock.stop(); } return; } else { if (isFrozenForMotionPref) { isFrozenForMotionPref = false; if (clock && !clock.running) clock.start(); } const isLight = body.classList.contains(lightModeClass); gradientUniforms.u_color_bg.value.copy(isLight ? webGLColors.lightBg : webGLColors.darkBg); gradientUniforms.u_color_accent.value.copy(webGLColors.accentTeal); if (clock) { const et = clock.getElapsedTime(); gradientUniforms.u_time.value = et; } gradientRenderer.render(scene, camera); } } animate();
        let resizeTimeout; const onWindowResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { if (!gradientRenderer || !camera || !gradientUniforms) return; const w = window.innerWidth; const h = window.innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); gradientRenderer.setSize(w, h); gradientRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); gradientUniforms.u_resolution.value.set(w, h); if (gradientRenderer && scene && camera) { gradientRenderer.render(scene, camera); } }, 150); }; window.addEventListener('resize', onWindowResize, false);
        const cleanup = () => { console.log("[WebGL] Cleaning up WebGL resources."); cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', onWindowResize); window.removeEventListener('beforeunload', cleanup); try { if (material) material.dispose(); if (geometry) geometry.dispose(); if (gradientRenderer) { gradientRenderer.dispose(); const context = gradientRenderer.domElement.getContext('webgl'); if (context) { const loseContextExt = context.getExtension('WEBGL_lose_context'); if (loseContextExt) { loseContextExt.loseContext(); } } } } catch (e) { console.error("Error during WebGL cleanup:", e); } finally { scene = null; camera = null; clock = null; material = null; geometry = null; mesh = null; gradientRenderer = null; gradientScene = null; gradientCamera = null; gradientUniforms = null; console.log("[WebGL] Cleanup complete."); } }; window.addEventListener('beforeunload', cleanup);
    } catch (error) { console.error("WebGL initialization failed:", error); if (canvas) canvas.style.display = 'none'; gradientRenderer = null; gradientScene = null; gradientCamera = null; gradientUniforms = null; }
}

/** Initializes sticky/hiding header */
function initStickyNav() {
    const header = document.querySelector('header'); if (!header) return;
    let lastScrollY = window.scrollY; const delta = 5; let headerHeight = header.offsetHeight; let ticking = false;
    const updateHeaderHeight = () => { headerHeight = header.offsetHeight; }; window.addEventListener('resize', updateHeaderHeight); updateHeaderHeight();
    const handleScroll = () => { const currentScrollY = window.scrollY; if (Math.abs(lastScrollY - currentScrollY) <= delta || ticking) { return; } ticking = true; window.requestAnimationFrame(() => { if (currentScrollY > lastScrollY && currentScrollY > headerHeight) { header.style.top = `-${headerHeight + 10}px`; } else { header.style.top = '0'; } lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY; ticking = false; }); };
    window.addEventListener('scroll', handleScroll, { passive: true });
}
/** Initializes mobile menu */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger'); const navOverlay = document.querySelector('.nav-overlay'); if (!hamburger || !navOverlay) return;
    const mobileNavLinks = navOverlay.querySelectorAll('a');
    const toggleMenu = (forceClose = false) => { const isOpen = navOverlay.classList.contains('active'); if (forceClose && !isOpen) return; const newStateOpen = forceClose ? false : !isOpen; navOverlay.classList.toggle('active', newStateOpen); hamburger.classList.toggle('open', newStateOpen); hamburger.setAttribute('aria-expanded', String(newStateOpen)); document.body.style.overflow = newStateOpen ? 'hidden' : ''; };
    hamburger.addEventListener('click', () => toggleMenu());
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
             if (!link.classList.contains('mobile-nav-cta') || link.target !== '_blank') {
                toggleMenu(true);
             }
        });
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navOverlay.classList.contains('active')) { toggleMenu(true); } });
}
/** Updates copyright year */
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('#year'); if (!yearElements.length) return;
    const currentYear = new Date().getFullYear(); yearElements.forEach(span => span.textContent = currentYear);
}
/** Initializes IntersectionObserver for scroll animations */
function initScrollAnimations() {
    const animationClass = 'animate-on-scroll'; const visibilityClass = 'is-visible'; const elementsToAnimate = document.querySelectorAll('.' + animationClass); if (!elementsToAnimate.length) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (prefersReducedMotion) { elementsToAnimate.forEach(el => { el.classList.remove(animationClass); el.style.opacity = 1; el.style.transform = 'none'; }); return; }
    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 }; const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add(visibilityClass); observer.unobserve(entry.target); } }); }; const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); elementsToAnimate.forEach(el => intersectionObserver.observe(el));
}

/** Initializes Testimonial Slider */
function initTestimonialSlider() {
    const sliderContainer = document.getElementById('testimonial-slider');
    if (!sliderContainer) return;
    const track = sliderContainer.querySelector('.testimonial-slider-track');
    if (!track) return;
    const quotes = track.querySelectorAll('.testimonial-quote');
    if (quotes.length === 0) return;
    console.log(`[Slider] Found ${quotes.length} original testimonials. Cloning.`);
    quotes.forEach(quote => {
        const clone = quote.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
}

/** Initializes Logo Slider */
function initLogoSlider() {
    const sliderContainer = document.getElementById('logo-slider');
    if (!sliderContainer) return;
    const track = sliderContainer.querySelector('.logo-slider-track');
    if (!track) return;
    const logos = track.querySelectorAll('.logo-item');
    if (logos.length === 0) return;
    console.log(`[Slider] Found ${logos.length} original logos. Cloning.`);
    logos.forEach(logo => {
        const clone = logo.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
}

/** Initializes Back to Top Button */
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) { console.warn("[Init] Back to top button not found."); return; }
    const scrollThreshold = 300;
    const toggleVisibility = () => { window.scrollY > scrollThreshold ? backToTopButton.classList.add('visible') : backToTopButton.classList.remove('visible'); };
    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    toggleVisibility(); // Initial check
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    backToTopButton.addEventListener('click', scrollToTop);
    console.log("[Init] Back to Top button initialized.");
}

/* Removed initScheduleCallLink and initScheduleModal functions */


/** Main initialization function, runs after DOM is loaded. */
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] DOMContentLoaded event fired.");

    initializeTheme(); // Theme FIRST

    // Other initializations
    updateCopyrightYear();
    if(document.getElementById('stats') && body.classList.contains('home-page')) { initStatsObserver(); }
    if (document.getElementById('testimonial-slider')) { initTestimonialSlider(); }
    if (document.getElementById('logo-slider')) { initLogoSlider(); }
    const canvas = document.getElementById('gradient-canvas');
    if(canvas && body.classList.contains('home-page')) { initAdvancedGradient(); }
    else { if (canvas) canvas.style.display = 'none'; }
    initStickyNav();
    initMobileMenu(); // Make sure this runs
    initScrollAnimations();
    initBackToTopButton();
    /* Removed calls to schedule link/modal functions */


    console.log("[Init] All initializations complete.");
});

/* END OF FILE script.js */