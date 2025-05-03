/* START OF FILE script.js (Removed Schedule Call/Modal Logic & Theme Toggle) */

const body = document.body; // Keep body reference if needed elsewhere

// --- WebGL Variables ---
let gradientUniforms = null;
let gradientRenderer = null;
let gradientScene = null;
let gradientCamera = null;

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
    animateValue("stat1", 0, 50, 1500, "+");
    animateValue("stat2", 0, 7, 1500, "+");
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

/** Runs hero stats counter animation */
function runHeroStatsAnimation() {
    // Use the new IDs for the hero stats section
    animateValue("hero-stat-1", 0, 50, 1500, "+"); // Example end value
    animateValue("hero-stat-2", 0, 7, 1500, "+");  // Example end value
    animateValue("hero-stat-3", 0, 98, 1500, "%"); // Example end value
}
/** Initializes IntersectionObserver for hero stats */
function initHeroStatsObserver() {
    const section = document.getElementById("hero-stats"); if (!section) return;
    console.log("[Init] Initializing Hero Stats Observer.");
    let animated = false; const triggerAnimation = () => { if (!animated) { animated = true; runHeroStatsAnimation(); } };
    const observerOptions = { threshold: 0.3, rootMargin: '0px 0px -50px 0px' };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { triggerAnimation(); observer.unobserve(entry.target); } }); };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); intersectionObserver.observe(section);
    // Trigger if already visible on load
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
        primaryAccent: new THREE.Vector3(26 / 255, 97 / 255, 114 / 255) // Updated to primary color #1a6172
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
        // Default to dark mode colors since light mode is removed
        const initialBgColor = webGLColors.darkBg;
        const initialAccentColor = webGLColors.primaryAccent;
        const uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color_bg: { value: initialBgColor.clone() },
            u_color_accent: { value: initialAccentColor.clone() }
            // Removed u_color_secondary uniform
        };
        gradientUniforms = uniforms; console.log("[WebGL] Initial Uniforms set:", gradientUniforms);
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            // --- ORIGINAL FRAGMENT SHADER ---
            fragmentShader: `precision mediump float; uniform vec2 u_resolution; uniform float u_time; uniform vec3 u_color_bg; uniform vec3 u_color_accent; varying vec2 vUv;
                float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);} float noise(vec2 st){vec2 i=floor(st);vec2 f=fract(st);vec2 u=f*f*(3.-2.*f);return mix(mix(random(i+vec2(.0,.0)),random(i+vec2(1.0,.0)),u.x),mix(random(i+vec2(.0,1.0)),random(i+vec2(1.0,1.0)),u.x),u.y);} float fbm(vec2 st){float v=0.;float a=.5;int O=3;for(int i=0;i<O;i++){v+=a*noise(st);st*=2.;a*=.5;}return v;} float getNoiseLayer(vec2 uv, float t, float ns, float ms, float da, vec2 off){vec2 nuv=uv*ns+off;float time=t*ms;vec2 m=vec2(fbm(nuv+time*.7+off.yx*2.),fbm(nuv+time*.5+off*3.));vec2 d_uv=nuv+m*da+vec2(time*.1);return fbm(d_uv);}
                void main(){vec2 uv=vUv;uv.x*=u_resolution.x/u_resolution.y;float i=0.;float n1=getNoiseLayer(uv,u_time,.3,.06,.2,vec2(0.,0.));i+=smoothstep(.35,.7,n1)*.25;float n2=getNoiseLayer(uv,u_time,.5,.09,.15,vec2(2.,1.));i+=smoothstep(.45,.65,n2)*.35;float n3=getNoiseLayer(uv,u_time,.8,.12,.1,vec2(-1.,3.));i+=smoothstep(.5,.6,n3)*.15;i=clamp(i,0.,1.);vec3 fc=mix(u_color_bg,u_color_accent,i);gl_FragColor=vec4(fc,1.);}`
            // --- END OF ORIGINAL FRAGMENT SHADER ---
        });
        mesh = new THREE.Mesh(geometry, material); scene.add(mesh); clock = new THREE.Clock();
        function animate() { if (!gradientRenderer) return; animationFrameId = requestAnimationFrame(animate); const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (!gradientUniforms) return; if (prm) { if (!isFrozenForMotionPref) { gradientUniforms.u_time.value = 1.5; gradientUniforms.u_color_bg.value.copy(webGLColors.darkBg); gradientUniforms.u_color_accent.value.copy(webGLColors.primaryAccent); gradientRenderer.render(scene, camera); isFrozenForMotionPref = true; if (clock && clock.running) clock.stop(); } return; } else { if (isFrozenForMotionPref) { isFrozenForMotionPref = false; if (clock && !clock.running) clock.start(); } gradientUniforms.u_color_bg.value.copy(webGLColors.darkBg); gradientUniforms.u_color_accent.value.copy(webGLColors.primaryAccent); if (clock) { const et = clock.getElapsedTime(); gradientUniforms.u_time.value = et; } gradientRenderer.render(scene, camera); } } animate();
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
    const animationClass = 'animate-on-scroll';
    const visibilityClass = 'is-visible';
    const elementsToAnimate = document.querySelectorAll('.' + animationClass);
    if (!elementsToAnimate.length) {
        console.log("[Init] No elements found for scroll animation.");
        return;
    }
    console.log(`[Init] Found ${elementsToAnimate.length} elements for scroll animation.`);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log("[Init] Reduced motion preference detected. Applying styles directly.");
        elementsToAnimate.forEach(el => {
            el.classList.remove(animationClass); // Remove class to prevent potential conflicts
            el.style.opacity = 1;
            el.style.transform = 'none';
            el.classList.add(visibilityClass); // Add visible class for consistency if needed elsewhere
        });
        return; // Exit if reduced motion is preferred
    }

    // --- Original IntersectionObserver Logic ---
    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // console.log("[ScrollAnim] Element intersecting:", entry.target); // Optional: Keep for debugging if needed
                entry.target.classList.add(visibilityClass);
                observer.unobserve(entry.target);
            }
        });
    };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    elementsToAnimate.forEach(el => {
        // console.log("[ScrollAnim] Observing element:", el); // Optional: Keep for debugging if needed
        intersectionObserver.observe(el);
    });
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
    
    // Clone each testimonial exactly once
    quotes.forEach(quote => {
        const clone = quote.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
    
    // Add transition to improve pause/resume behavior
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
        track.style.transition = 'all 0.5s ease';
    });
    
    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
        track.style.transition = 'all 0.5s ease';
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

/** Initializes Schedule Call Links (including Nav Button) */
function initScheduleCallLink() {
    // Target both regular schedule links and the nav button
    const scheduleLinks = document.querySelectorAll('.schedule-call-link, .schedule-call-nav-link');
    if (scheduleLinks.length === 0) { console.warn("[Init] No schedule call links found."); return; }
    
    const modal = document.getElementById('schedule-modal');
    const iframe = document.getElementById('schedule-iframe');
    const closeBtn = document.getElementById('modal-close-btn');
    const loading = document.querySelector('.modal-loading');
    if (!modal || !iframe || !closeBtn) { console.error("[Init] Schedule modal elements not found."); return; }
    
    // Google Calendar URL
    const calendarURL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2I8mK189lg8ti0kyS5AG9_0j6rP1643Z0PY75TTA8lN1osU5PrHt7YRyRGu9sqhUaq4iNF7muL?gv=true';
    
    const openModal = (e) => {
        e.preventDefault();
        iframe.src = calendarURL;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Show loading first, hide when iframe loads
        if (loading) loading.style.display = 'flex';
        iframe.onload = () => {
            if (loading) loading.style.display = 'none';
        };
    };
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Clear iframe source to prevent continued resource usage
        setTimeout(() => { iframe.src = ''; }, 300);
    };
    
    // Add click event to all schedule links
    scheduleLinks.forEach(link => {
        link.addEventListener('click', openModal);
        
        // Fix the visited state color issue for nav button
        if (link.classList.contains('schedule-call-nav-link')) {
            link.addEventListener('click', () => {
                // Reset the styling to maintain consistent appearance after closing modal
                // This addresses the issue where text color would stay blue after clicking
                requestAnimationFrame(() => {
                    link.style.setProperty('color', '');
                });
            });
        }
    });
    
    closeBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    console.log("[Init] Schedule Call Links initialized.");
}


/** Initializes Read More functionality for mobile view */
function initReadMoreButtons() {
    const readMoreButtons = document.querySelectorAll('.read-more-button');
    if (!readMoreButtons.length) return;

    readMoreButtons.forEach(button => {
        const content = button.previousElementSibling;
        if (!content || !content.classList.contains('read-more-content')) return;

        let isExpanded = false;

        // Function to check overflow and hide button if needed
        const checkOverflow = () => {
            // Check only on mobile viewports (consistent with CSS media query)
            if (window.innerWidth < 768) {
                // Temporarily remove 'expanded' to measure collapsed height accurately
                const wasExpanded = content.classList.contains('expanded');
                if (wasExpanded) content.classList.remove('expanded');

                // Check if content overflows its container
                const overflows = content.scrollHeight > content.clientHeight;

                // Add/remove 'hidden' class based on overflow
                button.classList.toggle('hidden', !overflows);

                // Restore 'expanded' state if it was removed
                if (wasExpanded) content.classList.add('expanded');

                console.log(`[Read More] Button for content checked. Overflows: ${overflows}. Button hidden: ${!overflows}`);
            } else {
                // Ensure button is visible on larger screens if it was hidden
                button.classList.remove('hidden');
            }
        };

        // Initial check on load
        checkOverflow();

        // Re-check on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkOverflow, 150); // Debounce resize check
        });

        // Click event listener
        button.addEventListener('click', () => {
            // Only toggle if the button isn't hidden
            if (!button.classList.contains('hidden')) {
                isExpanded = !isExpanded;
                content.classList.toggle('expanded', isExpanded);
                button.textContent = isExpanded ? 'Read Less' : 'Read More';
            }
        });
    });

    console.log("[Init] Read More buttons initialized with overflow check.");
}

/** Initializes Mobile Contact Steps Slider */
function initMobileContactSteps() {
    if (!body.classList.contains('home-page')) return;
    
    const contactStepsContainer = document.querySelector('.contact-steps-grid');
    if (!contactStepsContainer) return;
    
    // Only apply for mobile
    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            // Apply mobile styling
            contactStepsContainer.style.display = 'flex';
            contactStepsContainer.style.overflowX = 'auto';
            contactStepsContainer.style.scrollSnapType = 'x mandatory';
            
            const steps = contactStepsContainer.querySelectorAll('.contact-step');
            steps.forEach(step => {
                step.style.flex = '0 0 85%';
                step.style.scrollSnapAlign = 'center';
                step.style.marginRight = '1rem';
            });
        } else {
            // Reset to default grid styling
            contactStepsContainer.style.display = '';
            contactStepsContainer.style.overflowX = '';
            contactStepsContainer.style.scrollSnapType = '';
            
            const steps = contactStepsContainer.querySelectorAll('.contact-step');
            steps.forEach(step => {
                step.style.flex = '';
                step.style.scrollSnapAlign = '';
                step.style.marginRight = '';
            });
        }
    };
    
    // Initial setup
    handleResize();
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    console.log("[Init] Mobile Contact Steps initialized.");
}

/** Initializes Sticky Horizontal Scroll for Process Section on Mobile */
function initStickyHorizontalScroll() {
    const section = document.querySelector('.home-page .process-section');
    const stickyContent = section?.querySelector('.sticky-scroll-content'); // Target the sticky element
    const container = stickyContent?.querySelector('.process-steps-container'); // The scrollable container

    if (!section || !stickyContent || !container) {
        console.warn('[StickyScroll] Process section, sticky content, or container not found.');
        return;
    }

    let sectionHeight = 0;
    let maxScrollLeft = 0;
    let sectionOffsetTop = 0;
    // let stickyContentHeight = 0; // No longer explicitly needed for height calc
    let isMobileSetup = false; // Flag to track if mobile setup is active
    let scrollListenerAttached = false;

    function calculateDimensions(callback) { // Added callback
        requestAnimationFrame(() => { // Wrap calculations
            const shouldBeMobile = window.innerWidth < 768;

            if (!shouldBeMobile) {
                if (isMobileSetup) {
                    // Reset styles applied for mobile
                    section.style.height = '';
                    container.style.overflowX = 'auto'; // Restore default overflow
                    stickyContent.style.position = ''; // Reset sticky position
                    stickyContent.style.top = '';
                    console.log('[StickyScroll] Resetting styles for desktop view.');
                    isMobileSetup = false;
                }
                if (callback) callback(false); // Indicate not mobile
                return;
            }

            // --- Mobile Setup ---
            container.style.overflowX = 'hidden'; // Ensure JS controls scroll
            stickyContent.style.position = 'sticky'; // Ensure sticky is applied via JS
            stickyContent.style.top = '80px'; // Ensure top offset is applied via JS (matches CSS)

            // Calculate required dimensions for mobile effect
            maxScrollLeft = container.scrollWidth - container.clientWidth;
            // stickyContentHeight = stickyContent.offsetHeight; // Measure if needed for debugging

            // Simplified Height Calculation:
            // Height = (horizontal scroll distance) + (one viewport height)
            // This provides enough vertical scroll room to map to the horizontal scroll.
            sectionHeight = maxScrollLeft + window.innerHeight;
            section.style.height = `${sectionHeight}px`;

            // Get offsetTop *after* potentially changing height
            sectionOffsetTop = section.offsetTop;
            isMobileSetup = true; // Set flag

            console.log(`[StickyScroll] Calculated - MaxScroll: ${maxScrollLeft}, SectionHeight: ${sectionHeight}, OffsetTop: ${sectionOffsetTop}`);

            if (callback) callback(true); // Indicate mobile setup done
        });
    }

    function handleScroll() {
        if (!isMobileSetup) return; // Only run if mobile setup is active

        const scrollY = window.scrollY;
        const stickyStart = sectionOffsetTop;
        // End point for the sticky effect calculation (start of section + horizontal scroll distance)
        const stickyEnd = stickyStart + maxScrollLeft;

        // Add debugging logs
        // console.log(`[StickyScroll] ScrollY: ${scrollY.toFixed(0)}, StickyStart: ${stickyStart.toFixed(0)}, StickyEnd: ${stickyEnd.toFixed(0)}, MaxScrollLeft: ${maxScrollLeft.toFixed(0)}`);

        // Check if we are within the vertical scroll range for the sticky effect
        if (scrollY >= stickyStart && scrollY <= stickyEnd) {
            // Calculate progress within the sticky scroll range (0 to 1)
            const progress = maxScrollLeft > 0 ? (scrollY - stickyStart) / maxScrollLeft : 0;
            const targetScrollLeft = progress * maxScrollLeft;
            // console.log(`[StickyScroll] Progress: ${progress.toFixed(2)}, TargetScrollLeft: ${targetScrollLeft.toFixed(0)}`);
            container.scrollLeft = targetScrollLeft;
            // CSS `position: sticky` should keep the stickyContent visually fixed during this phase.

        } else if (scrollY < stickyStart) {
            // Before sticky section - ensure it's scrolled to the start
            if (container.scrollLeft !== 0) {
                // console.log('[StickyScroll] Before sticky range, setting scrollLeft to 0.');
                container.scrollLeft = 0;
            }
        } else { // scrollY > stickyEnd
            // After sticky section - ensure it's scrolled to the end
             if (container.scrollLeft < maxScrollLeft - 1) { // Use a small tolerance
                // console.log(`[StickyScroll] After sticky range, setting scrollLeft to ${maxScrollLeft.toFixed(0)}.`);
                container.scrollLeft = maxScrollLeft;
            }
        }
    }

    function setup() {
        calculateDimensions((mobileSetupSuccess) => { // Pass callback to calculateDimensions
             if (mobileSetupSuccess) {
                if (!scrollListenerAttached) {
                    window.addEventListener('scroll', handleScroll, { passive: true });
                    scrollListenerAttached = true;
                    console.log('[StickyScroll] Scroll listener added.');
                    // Initial scroll check needed after dimensions are calculated
                    handleScroll();
                } else {
                    // If listener already attached, just re-run handleScroll in case offsetTop changed
                    handleScroll();
                }
            } else { // Desktop mode or failed mobile setup
                if (scrollListenerAttached) {
                    window.removeEventListener('scroll', handleScroll);
                    scrollListenerAttached = false;
                    console.log('[StickyScroll] Scroll listener removed.');
                }
            }
        });
    }

    // Run setup after DOM content is loaded and also on window load for better stability
    let initialSetupDone = false;
    const runInitialSetup = () => {
        if (!initialSetupDone) {
            console.log('[StickyScroll] Running initial setup.');
            setup();
            initialSetupDone = true;
        }
    };

    // Use window.onload for potentially more stable layout calculation
    window.addEventListener('load', () => {
        console.log('[StickyScroll] Window loaded, running setup.');
        runInitialSetup();
    });
    // Fallback with setTimeout in case load event is missed or slow
    setTimeout(runInitialSetup, 500);


    // Recalculate on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('[StickyScroll] Resize detected, running setup.');
            setup(); // Re-run the setup logic which includes calculateDimensions
        }, 250); // Increased debounce slightly
    });

    console.log('[Init] Sticky Horizontal Scroll initialization logic updated (v2).');
}


/** Main initialization function, runs after DOM is loaded. */
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] DOMContentLoaded event fired.");

    // Set body opacity for fade-in (previously in setTheme)
    body.style.opacity = '0';
    requestAnimationFrame(() => {
        body.style.opacity = '1';
    });

    // Other initializations
    console.log("[Init] Calling updateCopyrightYear...");
    updateCopyrightYear();
    console.log("[Init] updateCopyrightYear complete.");

    if(document.getElementById('stats') && body.classList.contains('home-page')) {
        console.log("[Init] Calling initStatsObserver...");
        initStatsObserver();
        console.log("[Init] initStatsObserver complete.");
    }
    if (document.getElementById('testimonial-slider')) {
        console.log("[Init] Calling initTestimonialSlider...");
        initTestimonialSlider();
        console.log("[Init] initTestimonialSlider complete.");
    }
    if (document.getElementById('logo-slider')) {
        console.log("[Init] Calling initLogoSlider...");
        initLogoSlider();
        console.log("[Init] initLogoSlider complete.");
    }
    const canvas = document.getElementById('gradient-canvas');
    if(canvas && body.classList.contains('home-page')) {
        console.log("[Init] Calling initAdvancedGradient...");
        initAdvancedGradient();
        console.log("[Init] initAdvancedGradient complete.");
    } else {
        if (canvas) canvas.style.display = 'none';
        console.log("[Init] Skipping WebGL gradient init (not homepage or no canvas).");
    }
    console.log("[Init] Calling initStickyNav...");
    initStickyNav();
    console.log("[Init] initStickyNav complete.");
    console.log("[Init] Calling initMobileMenu...");
    initMobileMenu();
    console.log("[Init] initMobileMenu complete.");
    console.log("[Init] Calling initScrollAnimations...");
    initScrollAnimations();
    console.log("[Init] initScrollAnimations complete.");
    console.log("[Init] Calling initBackToTopButton...");
    initBackToTopButton();
    console.log("[Init] initBackToTopButton complete.");
    console.log("[Init] Calling initScheduleCallLink...");
    initScheduleCallLink();
    console.log("[Init] initScheduleCallLink complete.");
    console.log("[Init] Calling initReadMoreButtons...");
    initReadMoreButtons();
    console.log("[Init] initReadMoreButtons complete.");
    console.log("[Init] Calling initMobileContactSteps...");
    initMobileContactSteps();
    console.log("[Init] initMobileContactSteps complete.");
    console.log("[Init] Calling initStickyHorizontalScroll...");
    initStickyHorizontalScroll(); // Initialize the new sticky scroll feature
    console.log("[Init] initStickyHorizontalScroll complete.");
    // Call the new hero stats observer
    if(document.getElementById('hero-stats')) {
        console.log("[Init] Calling initHeroStatsObserver...");
        initHeroStatsObserver();
        console.log("[Init] initHeroStatsObserver complete.");
    }

    console.log("[Init] Calling initMobileTestimonialDeck...");
    initMobileTestimonialDeck(); // Initialize the new testimonial deck feature
    console.log("[Init] initMobileTestimonialDeck complete.");

    // --- Initialize Rotating Text Animation ---
    console.log("[Init] Calling initRotatingTextAnimation...");
    initRotatingTextAnimation();
    console.log("[Init] initRotatingTextAnimation complete.");


    console.log("[Init] All initializations complete.");
});

/** Initializes Rotating Text Animation using startOffset */
function initRotatingTextAnimation() {
    const textPath = document.querySelector('.rotating-path-text'); // Use the specific class
    if (!textPath) {
        console.warn('[RotatingText] Text path element (.rotating-path-text) not found.');
        return;
    }

    let currentOffset = 0;
    const speed = 0.05; // Adjust speed as needed (percentage points per frame)

    function animateTextPath() {
        currentOffset = (currentOffset + speed) % 100; // Increment and wrap around 0-100
        textPath.setAttribute('startOffset', currentOffset + '%');
        requestAnimationFrame(animateTextPath); // Continue the loop
    }

    // Start the animation
    requestAnimationFrame(animateTextPath);
    console.log('[RotatingText] Animation started.');
}


/** Initializes Mobile Testimonial Card Deck Slider */
function initMobileTestimonialDeck() {
    const sliderContainer = document.getElementById('testimonial-slider');
    if (!sliderContainer) {
        console.warn('[TestimonialDeck] Slider container not found.');
        return;
    }
    const track = sliderContainer.querySelector('.testimonial-slider-track');
    if (!track) {
        console.warn('[TestimonialDeck] Slider track not found.');
        return;
    }
    // Select only the original quotes, not clones
    const quotes = Array.from(track.querySelectorAll('.testimonial-quote:not([aria-hidden="true"])'));
    if (quotes.length === 0) {
        console.warn('[TestimonialDeck] No testimonial quotes found.');
        return;
    }

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    const swipeThreshold = 50; // Minimum pixels to register as a swipe

    function applyCardClasses() {
        quotes.forEach((quote, index) => {
            quote.classList.remove(
                'testimonial-visible',
                'testimonial-next',
                'testimonial-next-next',
                'testimonial-swiped-left',
                'testimonial-swiped-right'
            );

            const diff = index - currentIndex;
            const normalizedDiff = (diff + quotes.length) % quotes.length; // Handle wrap-around

            if (normalizedDiff === 0) {
                quote.classList.add('testimonial-visible');
            } else if (normalizedDiff === 1) {
                quote.classList.add('testimonial-next');
            } else if (normalizedDiff === 2) {
                 quote.classList.add('testimonial-next-next');
            }
            // Cards further back remain hidden (opacity 0 by default)
        });
         // Ensure container height fits the content of the visible card
         const visibleCard = quotes[currentIndex];
         if (visibleCard) {
             // Temporarily make it visible to measure height if needed, but CSS height should work
             // sliderContainer.style.height = `${visibleCard.offsetHeight}px`; // Adjust height dynamically - might cause layout shifts
             // Or rely on the fixed height set in CSS
         }
    }

    function showNext() {
        if (quotes.length === 0) return;
        const currentCard = quotes[currentIndex];
        currentCard.classList.add('testimonial-swiped-left'); // Animate out left

        currentIndex = (currentIndex + 1) % quotes.length;

        // Wait for animation before reapplying classes to avoid glitches
        setTimeout(applyCardClasses, 50); // Small delay
    }

    function showPrev() {
        if (quotes.length === 0) return;
        const currentCard = quotes[currentIndex];
        currentCard.classList.add('testimonial-swiped-right'); // Animate out right

        currentIndex = (currentIndex - 1 + quotes.length) % quotes.length;

        setTimeout(applyCardClasses, 50);
    }

    function handleTouchStart(e) {
        if (window.innerWidth >= 768) return; // Only run on mobile
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        // Optional: Add a class to the container while dragging
        sliderContainer.classList.add('is-dragging');
    }

    function handleTouchMove(e) {
        if (!isDragging || window.innerWidth >= 768) return;
        touchEndX = e.touches[0].clientX;
        // Optional: Add visual feedback during drag (e.g., slight card movement)
        // const diffX = touchEndX - touchStartX;
        // const currentCard = quotes[currentIndex];
        // currentCard.style.transform = `translateX(${diffX}px) scale(1)`; // Example feedback
        // currentCard.style.transition = 'none'; // Disable transition during drag for direct feedback
    }

    function handleTouchEnd() {
        if (!isDragging || window.innerWidth >= 768) return;
        isDragging = false;
        sliderContainer.classList.remove('is-dragging');

        const diffX = touchEndX - touchStartX;

        // Reset any temporary drag styles
        // const currentCard = quotes[currentIndex];
        // currentCard.style.transform = '';
        // currentCard.style.transition = ''; // Re-enable transitions

        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX < 0) {
                // Swiped left
                showNext();
            } else {
                // Swiped right
                showPrev();
            }
        } else {
             // Optional: Snap back if swipe wasn't far enough
             applyCardClasses(); // Reapply original classes to snap back
        }

        // Reset touch points
        touchStartX = 0;
        touchEndX = 0;
    }

    // Initial setup only on mobile
    function setupMobileDeck() {
        if (window.innerWidth < 768) {
            console.log('[TestimonialDeck] Setting up mobile deck.');
            applyCardClasses(); // Apply initial classes

            // Remove existing listeners before adding new ones to prevent duplicates on resize
            sliderContainer.removeEventListener('touchstart', handleTouchStart);
            sliderContainer.removeEventListener('touchmove', handleTouchMove);
            sliderContainer.removeEventListener('touchend', handleTouchEnd);
            sliderContainer.removeEventListener('touchcancel', handleTouchEnd); // Handle cancellation

            // Add touch listeners
            sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
            sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
            sliderContainer.addEventListener('touchend', handleTouchEnd);
            sliderContainer.addEventListener('touchcancel', handleTouchEnd); // Handle cancellation
        } else {
             console.log('[TestimonialDeck] Desktop view detected, removing mobile listeners.');
             // Ensure listeners are removed if resizing from mobile to desktop
             sliderContainer.removeEventListener('touchstart', handleTouchStart);
             sliderContainer.removeEventListener('touchmove', handleTouchMove);
             sliderContainer.removeEventListener('touchend', handleTouchEnd);
             sliderContainer.removeEventListener('touchcancel', handleTouchEnd);
             // Optional: Reset any inline styles applied by JS if needed
             quotes.forEach(q => q.style.transform = '');
        }
    }

    // Initial setup
    setupMobileDeck();

    // Re-run setup on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setupMobileDeck, 250);
    });

    console.log("[Init] Mobile Testimonial Deck initialized.");
}


/* END OF FILE script.js */
