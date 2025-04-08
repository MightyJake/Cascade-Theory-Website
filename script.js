/**
 * Animates a numerical value in an HTML element. Checks prefers-reduced-motion.
 */
function animateValue(id, start, end, duration, suffix = '') {
    const el = document.getElementById(id); if (!el) return;
    const pRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pRM) { el.textContent = end + suffix; return; }
    let startTimestamp = null; const step = (ts) => { if (!startTimestamp) startTimestamp = ts; const p = Math.min((ts - startTimestamp) / duration, 1); el.textContent = Math.floor(p * (end - start) + start) + suffix; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
}

/** Runs stats counter animation. */
function runStatsAnimationOnce() { animateValue("stat1", 0, 98, 1500, "%"); animateValue("stat2", 0, 223, 1500); animateValue("stat3", 0, 110, 1500, "k+"); }

/** Initializes IntersectionObserver for stats. */
function initStatsObserver() {
    const section = document.getElementById("stats"); if (!section) return; let animated = false;
    const trigger = () => { if (!animated) { animated = true; runStatsAnimationOnce(); } };
    // Ensure IntersectionObserver is only added if the stats section actually exists on the page
    if (!section) return;
    const obs = new IntersectionObserver((e, o) => { e.forEach(i => { if (i.isIntersecting) { trigger(); o.unobserve(i.target); } }); }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });
    obs.observe(section);
    setTimeout(() => { const r = section.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom >= 50 && !animated) { trigger(); if (obs) obs.disconnect(); } }, 300);
}


/**
 * Initializes WebGL background: Soft gradient, faster morphing speed, correct colors.
 * ONLY runs if THREE library and canvas exist.
 */
function initAdvancedGradient() {
    // Only proceed if THREE library is loaded AND we're likely on the homepage (canvas exists)
    if (typeof THREE === 'undefined' || !document.getElementById('gradient-canvas')) {
        // Optionally log if THREE is missing but canvas exists
        // if (document.getElementById('gradient-canvas')) console.error('THREE.js library not found.');
        // Hide canvas if it exists but THREE is missing or setup fails later
        const canvas = document.getElementById('gradient-canvas');
        if (canvas) canvas.style.display = 'none';
        return;
    }

    const canvas = document.getElementById('gradient-canvas');
    // Already checked for canvas existence, but belt-and-suspenders
    if (!canvas) { console.error('Canvas not found even after initial check!'); return; }

    let animationFrameId = null, isFrozenForMotionPref = false, renderer, clock, material, geometry, scene;

    try {
        scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
        camera.position.z = 1;

        const darkBgColor = new THREE.Vector3(13./255., 13./255., 13./255.);
        const primaryBlueColor = new THREE.Vector3(40./255., 91./255., 169./255.); // #285BA9
        const accentTealColor = new THREE.Vector3(40./255., 169./255., 140./255.); // #28A98C

        const uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color_bg: { value: darkBgColor },
            u_color1: { value: primaryBlueColor },
            u_color2: { value: accentTealColor },
        };

        geometry = new THREE.PlaneBufferGeometry(2, 2);
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `
                uniform vec2 u_resolution; uniform float u_time;
                uniform vec3 u_color_bg; uniform vec3 u_color1; uniform vec3 u_color2;
                varying vec2 vUv;
                float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);}
                float noise(vec2 st){vec2 i=floor(st),f=fract(st);vec2 u=f*f*(3.-2.*f);return mix(mix(random(i+vec2(0,0)),random(i+vec2(1,0)),u.x),mix(random(i+vec2(0,1)),random(i+vec2(1,1)),u.x),u.y);}
                float fbm(vec2 st){float v=0.;float a=.5;int O=4;for(int i=0;i<O;i++){v+=a*noise(st);st*=2.;a*=.5;}return v;}
                void main(){
                    vec2 uv=vUv; uv.x*=u_resolution.x/u_resolution.y;
                    float t=u_time*0.15; // Faster speed
                    vec2 noise_uv=uv*0.9; // Scale
                    vec2 motion=vec2(fbm(noise_uv+t*0.7),fbm(noise_uv+t*0.5+5.)); // Faster Motion
                    float distortion=0.35; // More Morph
                    vec2 distorted_uv=noise_uv+motion*distortion+vec2(t*0.18); // Faster Drift
                    float n=fbm(distorted_uv); n=smoothstep(0.1,0.9,n);
                    vec3 color_blend1=mix(u_color_bg,u_color1,smoothstep(0.15,0.6,n)); // Wide Blend 1
                    vec3 finalColor=mix(color_blend1,u_color2,smoothstep(0.5,0.85,n)); // Wide Blend 2
                    float grainAmount=0.015; // Grain
                    finalColor+=(random(vUv*fract(u_time*10.))-.5)*grainAmount;
                    gl_FragColor=vec4(clamp(finalColor,0.,1.),1.);
                }`
        });

        const mesh = new THREE.Mesh(geometry, material); scene.add(mesh);
        clock = new THREE.Clock();

        // Animate function with reduced motion check
        function animate() {
            animationFrameId = requestAnimationFrame(animate); // Request next frame *first*

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                if (!isFrozenForMotionPref) {
                    uniforms.u_time.value = 1.0;
                    renderer.render(scene, camera);
                    isFrozenForMotionPref = true;
                }
                return;
            } else {
                if (isFrozenForMotionPref) {
                    isFrozenForMotionPref = false;
                    if(!clock.running) clock.start();
                }
                const elapsedTime = clock.getElapsedTime();
                uniforms.u_time.value = elapsedTime;
                renderer.render(scene, camera);
            }
        }
        animate(); // Start loop

        // Resize handling
        let resizeTimeout; const onWindowResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { if (isFrozenForMotionPref) return; const w=window.innerWidth, h=window.innerHeight; uniforms.u_resolution.value.set(w,h); renderer.setSize(w,h); renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.)); renderer.render(scene,camera);}, 100); }
        window.addEventListener('resize', onWindowResize, false);

        // Cleanup function
        const cleanup = () => { /*console.log("Cleaning up WebGL.");*/ cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', onWindowResize); window.removeEventListener('beforeunload', cleanup); try { if (material) material.dispose(); if (geometry) geometry.dispose(); if (renderer) renderer.dispose(); } catch(e) {console.error("Cleanup Error:", e);} scene = null; clock = null; material = null; geometry = null; renderer = null; };
        window.addEventListener('beforeunload', cleanup);

    } catch (error) { console.error("WebGL init error:", error); if (canvas) canvas.style.display = 'none'; }
}

/** Initializes sticky header. */
function initStickyNav() {
    const header = document.querySelector('header');
    if (!header) return;
    let lastScrollY = window.scrollY;
    const delta = 5;
    let headerHeight = header.offsetHeight;
    const updateHeaderHeight = () => { headerHeight = header.offsetHeight; };
    window.addEventListener('resize', updateHeaderHeight);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        // Don't run if header doesn't exist anymore (e.g. after some dynamic removal, just safety)
        if (!header) return;
        if (Math.abs(lastScrollY - currentScrollY) <= delta) return;
        if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
            header.style.top = `-${headerHeight + 10}px`; // Scroll Down
        } else {
            header.style.top = '0'; // Scroll Up or at top
        }
        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/** Initializes mobile menu. */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    if (!hamburger || !navOverlay) return;
    const mobileNavLinks = navOverlay.querySelectorAll('a');

    const toggleMenu = (forceClose = false) => {
      const isOpen = navOverlay.classList.contains('active');
      if (forceClose && !isOpen) return;

      const newStateOpen = !isOpen && !forceClose;

      navOverlay.classList.toggle('active', newStateOpen);
      hamburger.classList.toggle('open', newStateOpen);
      hamburger.setAttribute('aria-expanded', String(newStateOpen));
      document.body.style.overflow = newStateOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggleMenu());

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
            toggleMenu(true);
        }
    });
}


/** Updates copyright year. */
function updateCopyrightYear() {
    // Check on both potential footers
    const yearSpanMain = document.querySelector('.contact-footer #year');
    const yearSpanSimple = document.querySelector('.simple-footer #year');
    const currentYear = new Date().getFullYear();
    if (yearSpanMain) yearSpanMain.textContent = currentYear;
    if (yearSpanSimple) yearSpanSimple.textContent = currentYear;
}

/**
 * Initializes IntersectionObserver for scroll animations.
 */
function initScrollAnimations() {
    const animationClass = 'animate-on-scroll';
    const visibilityClass = 'is-visible';
    const elementsToAnimate = document.querySelectorAll('.' + animationClass);

    if (!elementsToAnimate.length) return; // No elements to animate

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(visibilityClass);
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}


/** Main initialization. */
document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    initStatsObserver();      // Run stats observer (only activates if #stats exists)
    initAdvancedGradient();   // Run gradient init (only activates if THREE and #gradient-canvas exist)
    initStickyNav();
    initMobileMenu();
    initScrollAnimations(); // Run scroll animations observer
});