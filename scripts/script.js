/* =================================================
   CASCADE THEORY - MAIN JAVASCRIPT
   Interactive functionality for Cascade Theory website
   Multimedia Marketing by Jake Fischer - Bend, Oregon
   ================================================= */

document.addEventListener('DOMContentLoaded', function() {
    
    /* =================================================
       NAVIGATION SYSTEM
       Desktop navigation with sliding indicator and mobile FAB nav
       ================================================= */
    
    // Desktop Navigation Elements
    const desktopNavItems = document.querySelectorAll('#desktop-nav-list .desktop-nav-item');
    const desktopNavLinks = document.querySelectorAll('#desktop-nav-list .desktop-nav-item a');
    const desktopSlidingButton = document.getElementById('sliding-button');

    // Mobile Navigation Elements
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileMenu = document.getElementById('mobile-menu'); 
    const mobileNavLinksJS = document.querySelectorAll('#mobile-menu .mobile-nav-link');
    const mobileScheduleButton = document.querySelector('#mobile-menu .schedule-call-link.cta-button');

    // FAB Navigation Elements
    const fabNavContainer = document.getElementById('mobile-fab-nav-container');
    const fabToggle = document.getElementById('mobile-fab-toggle');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');
    const fabIconMenu = document.getElementById('fab-icon-menu');
    const fabIconClose = document.getElementById('fab-icon-close');
    const fabActionItems = document.querySelectorAll('.mobile-fab-action-item');

    // Schedule Modal Elements
    const scheduleLinks = document.querySelectorAll('.schedule-call-link');
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleIframe = document.getElementById('schedule-iframe');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalLoading = document.querySelector('#schedule-modal .modal-loading');
    const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2I8mK189lg8ti0kyS5AG9_0j6rP1643Z0PY75TTA8lN1osU5PrHt7YRyRGu9sqhUaq4iNF7muL?gv=true';

    /* =================================================
       DESKTOP NAVIGATION FUNCTIONS
       ================================================= */
    
    /**
     * Updates the desktop navigation sliding button position
     * @param {Element} activeLinkElement - The active navigation link
     */
    function updateDesktopSlider(activeLinkElement) {
        if (!desktopSlidingButton || !activeLinkElement || window.innerWidth < 1024) return;

        // Handle external links differently
        if (activeLinkElement.getAttribute('href').includes('.html')) {
            const matchingDesktopLink = Array.from(desktopNavLinks).find(link => 
                link.getAttribute('href') === activeLinkElement.getAttribute('href') && 
                link.parentElement.matches('.desktop-nav-item')
            );
            
            if (matchingDesktopLink && matchingDesktopLink.parentElement.matches('.desktop-nav-item')) {
                desktopSlidingButton.style.left = `${matchingDesktopLink.parentElement.offsetLeft}px`;
                desktopSlidingButton.style.width = `${matchingDesktopLink.parentElement.offsetWidth}px`;
                desktopNavItems.forEach(item => item.classList.remove('active'));
                matchingDesktopLink.parentElement.classList.add('active');
            } else { 
                desktopNavItems.forEach(item => item.classList.remove('active')); 
                desktopSlidingButton.style.width = '0px'; 
            }
            return;
        }

        const parentNavItem = activeLinkElement.parentElement;
        if (!parentNavItem || !parentNavItem.matches('#desktop-nav-list .desktop-nav-item')) {
            if (scheduleModal && scheduleModal.classList.contains('active')) {
                const contactLink = Array.from(desktopNavLinks).find(link => link.getAttribute('href') === '#contact');
                if (contactLink && contactLink.parentElement) {
                    desktopSlidingButton.style.left = `${contactLink.parentElement.offsetLeft}px`;
                    desktopSlidingButton.style.width = `${contactLink.parentElement.offsetWidth}px`;
                    desktopNavItems.forEach(item => item.classList.remove('active'));
                    contactLink.parentElement.classList.add('active');
                } else {
                    desktopSlidingButton.style.width = '0px'; 
                }
            } else {
                desktopSlidingButton.style.width = '0px'; 
            }
            return;
        }

        desktopSlidingButton.style.left = `${parentNavItem.offsetLeft}px`;
        desktopSlidingButton.style.width = `${parentNavItem.offsetWidth}px`;
        desktopNavItems.forEach(item => item.classList.remove('active'));
        parentNavItem.classList.add('active');
    }

    // Initialize desktop navigation on load
    const initialDesktopActiveLink = Array.from(desktopNavLinks).find(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === '#hero' && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) return true;
        if (linkHref && !linkHref.startsWith('#') && window.location.pathname.includes(linkHref)) return true;
        return false;
    });

    if (initialDesktopActiveLink && window.innerWidth >= 1024 ) {
        setTimeout(() => updateDesktopSlider(initialDesktopActiveLink), 200); 
    }

    /* =================================================
       MOBILE NAVIGATION FUNCTIONS
       ================================================= */
    
    // Close mobile menu
    if (mobileMenu && mobileNavClose) { 
        mobileNavClose.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            if (scheduleModal && !scheduleModal.classList.contains('active') && !isFabNavExpanded()) {
                document.body.classList.remove('modal-open');
            }
        });
    }

    /**
     * Check if FAB navigation is expanded
     * @returns {boolean} - True if expanded
     */
    function isFabNavExpanded() {
        return fabNavContainer && fabNavContainer.classList.contains('is-expanded');
    }

    /**
     * Close FAB navigation
     * @param {boolean} forceBodyUnlock - Force unlock body scroll
     */
    function closeFabNav(forceBodyUnlock = false) {
        if (!fabNavContainer || !isFabNavExpanded()) return;
        fabNavContainer.classList.remove('is-expanded');
        if (fabToggle) fabToggle.setAttribute('aria-expanded', 'false');
        if (fabIconMenu) {
            fabIconMenu.classList.remove('hidden');
            fabIconMenu.classList.add('block');
        }
        if (fabIconClose) {
            fabIconClose.classList.add('hidden');
            fabIconClose.classList.remove('block');
        }
        if (forceBodyUnlock || (scheduleModal && !scheduleModal.classList.contains('active') && mobileMenu && !mobileMenu.classList.contains('open'))) {
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Open FAB navigation
     */
    function openFabNav() {
        if (!fabNavContainer || isFabNavExpanded()) return;
        fabNavContainer.classList.add('is-expanded');
        if (fabToggle) fabToggle.setAttribute('aria-expanded', 'true');
        if (fabIconMenu) {
            fabIconMenu.classList.add('hidden');
            fabIconMenu.classList.remove('block');
        }
        if (fabIconClose) {
            fabIconClose.classList.remove('hidden');
            fabIconClose.classList.add('block');
        }
        document.body.classList.add('modal-open');
    }

    // FAB navigation event listeners
    if (fabToggle) {
        fabToggle.addEventListener('click', () => {
            if (isFabNavExpanded()) {
                closeFabNav();
            } else {
                openFabNav();
            }
        });
    }
    if (fabBackdrop) {
        fabBackdrop.addEventListener('click', () => closeFabNav());
    }
    
    /**
     * Handle FAB navigation resize behavior
     */
    function handleFabNavResize() {
        if (window.innerWidth < 1024) {
            document.body.classList.add('has-mobile-fab-nav');
            const oldMobileNavToggle = document.getElementById('mobile-nav-toggle'); 
            if(oldMobileNavToggle) oldMobileNavToggle.style.display = 'none';
        } else {
            document.body.classList.remove('has-mobile-fab-nav');
            closeFabNav(true); 
        }
    }

    if (fabNavContainer) { 
        handleFabNavResize(); 
        window.addEventListener('resize', handleFabNavResize);
    }

    /* =================================================
       SCHEDULE MODAL FUNCTIONS
       ================================================= */
    
    /**
     * Open scheduling modal
     */
    function openScheduleModal() {
        if (!scheduleModal || !scheduleIframe || !modalLoading) return;
        if (scheduleIframe.src !== CALENDAR_URL) {
            scheduleIframe.src = CALENDAR_URL;
        }
        modalLoading.style.display = 'flex';
        scheduleIframe.onload = () => { modalLoading.style.display = 'none'; };
        scheduleModal.classList.add('active');
        document.body.classList.add('modal-open');
        closeFabNav(); 
        if (window.innerWidth >= 1024) {
            const contactLinkForSlider = Array.from(desktopNavLinks).find(navLink => navLink.getAttribute('href') === '#contact');
            if (contactLinkForSlider) updateDesktopSlider(contactLinkForSlider);
        } else {
            const fabScheduleLink = document.querySelector('#mobile-fab-actions-wrapper .schedule-call-link');
            updateFabActiveState(fabScheduleLink);
        }
    }

    /**
     * Close scheduling modal
     */
    function closeScheduleModal() {
        if (!scheduleModal) return;
        scheduleModal.classList.remove('active');
        if (!isFabNavExpanded() && (mobileMenu && !mobileMenu.classList.contains('open'))) {
            document.body.classList.remove('modal-open');
        }
        setTimeout(() => { if (scheduleIframe) scheduleIframe.src = ''; }, 300);
        if (window.innerWidth >= 1024 && scrollSpySections.length > 0) triggerScrollSpy(); 
        else if (window.innerWidth < 1024) triggerMobileScrollActiveState();
    }
    
    /**
     * Trigger scroll spy functionality
     */
    function triggerScrollSpy() { 
        window.dispatchEvent(new Event('scroll'));
    }

    /**
     * Handle mobile scroll active state
     */
    function triggerMobileScrollActiveState() {
        if (window.innerWidth >= 1024 || !fabNavContainer || scrollSpySections.length === 0) return;
        let currentSectionId = '';
        const threshold = 50; 
        scrollSpySections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const effectiveThreshold = section.id === 'video-pin-outer-container' ? threshold : 60 + threshold; 
            if (window.scrollY >= sectionTop - effectiveThreshold && window.scrollY < sectionTop + sectionHeight - effectiveThreshold) {
                currentSectionId = section.getAttribute('id');
                if (currentSectionId === 'video-pin-outer-container') currentSectionId = 'hero';
            }
        });
        if (scheduleModal && scheduleModal.classList.contains('active')) {
            const fabScheduleLink = document.querySelector('#mobile-fab-actions-wrapper .schedule-call-link');
            updateFabActiveState(fabScheduleLink);
        } else {
            let activeFabLink = document.querySelector(`#mobile-fab-actions-wrapper .mobile-fab-action-item[href="#${currentSectionId}"]`);
            if (!activeFabLink && !currentSectionId && scrollSpySections.length > 0 && window.scrollY < (scrollSpySections[0].offsetTop - threshold)) {
                 activeFabLink = document.querySelector(`#mobile-fab-actions-wrapper .mobile-fab-action-item[href="#hero"]`);
            }
            updateFabActiveState(activeFabLink);
        }
    }

    /* =================================================
       NAVIGATION CLICK HANDLERS
       ================================================= */
    
    /**
     * Handle navigation link clicks
     * @param {Event} e - Click event
     * @param {Element} linkElement - The clicked link
     * @param {boolean} isMobileSource - Is from mobile menu
     * @param {boolean} isFabSource - Is from FAB navigation
     */
    function handleNavLinkClick(e, linkElement, isMobileSource = false, isFabSource = false) {
        const href = linkElement.getAttribute('href');
        
        // Handle schedule links
        if (linkElement.classList.contains('schedule-call-link')) {
            e.preventDefault();
            if (isMobileSource && mobileMenu && mobileMenu.classList.contains('open')) mobileMenu.classList.remove('open'); 
            openScheduleModal();
            return;
        }
        
        // Handle external links
        if (href && !href.startsWith('#')) { 
            if (isMobileSource && mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                if (!isFabNavExpanded() && (!scheduleModal || !scheduleModal.classList.contains('active'))) document.body.classList.remove('modal-open');
            }
            if (isFabSource) {
                closeFabNav();
                updateFabActiveState(linkElement); 
            }
            if (!isMobileSource && !isFabSource && linkElement.closest('#desktop-nav-list')) updateDesktopSlider(linkElement); 
            return; 
        }
        
        // Handle anchor links
        if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            if (isMobileSource && mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                if (!isFabNavExpanded() && (!scheduleModal || !scheduleModal.classList.contains('active'))) document.body.classList.remove('modal-open');
            }
            if (isFabSource) {
                closeFabNav();
                updateFabActiveState(linkElement);
            }
            
            const targetId = href.substring(1); 
            let targetElement = (targetId === 'hero') ? (document.getElementById('video-pin-outer-container') || document.getElementById('hero')) : document.getElementById(targetId);
            
            if (targetElement) {
                if (!isMobileSource && !isFabSource && linkElement.closest('#desktop-nav-list')) updateDesktopSlider(linkElement);
                
                let headerOffset = 0;
                const isDesktop = window.innerWidth >= 1024;
            
                if (targetId === 'hero' || targetId === 'video-pin-outer-container') {
                    headerOffset = 0; 
                } else {
                    headerOffset = isDesktop ? 80 : 60; 
                }
            
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Attach navigation event listeners
    desktopNavLinks.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, false, false)); });
    mobileNavLinksJS.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, true, false)); });
    if (mobileScheduleButton) mobileScheduleButton.addEventListener('click', (e) => handleNavLinkClick(e, mobileScheduleButton, true, false));
    fabActionItems.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, false, true)); });

    // Schedule link event listeners
    scheduleLinks.forEach(link => {
        const isHandledByDesktop = link.closest('#desktop-nav-list'); 
        const isHandledByMobileMenu = link.closest('#mobile-menu nav') || link === mobileScheduleButton; 
        const isHandledByFab = Array.from(fabActionItems).includes(link);
        if (!isHandledByDesktop && !isHandledByMobileMenu && !isHandledByFab) {
             link.addEventListener('click', (e) => { e.preventDefault(); openScheduleModal(); });
        }
    });

    // Modal event listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeScheduleModal);
    if (scheduleModal) scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) closeScheduleModal(); });
    
    // Keyboard event listeners
    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            if (scheduleModal && scheduleModal.classList.contains('active')) closeScheduleModal();
            else if (isFabNavExpanded()) closeFabNav();
            else if (mobileMenu && mobileMenu.classList.contains('open')) {
                 mobileMenu.classList.remove('open');
                 if (!isFabNavExpanded() && (!scheduleModal || !scheduleModal.classList.contains('active'))) { 
                    document.body.classList.remove('modal-open'); 
                 }
            }
        }
    });

    /* =================================================
       SCROLL EFFECTS & SCROLL SPY
       ================================================= */
    
    const scrollSpySections = document.querySelectorAll('section[id], div#video-pin-outer-container'); 
    const mainHeaderLogo = document.getElementById('main-header-logo');
    const servicesMarquee = document.getElementById('services-marquee');
    let scrollTimeoutUniversal;

    /**
     * Handle all scroll-based effects
     */
    function handleScrollEffects() {
        // Header logo fade effect
        if (mainHeaderLogo && window.innerWidth >= 1024) {
            const scrollY = window.scrollY;
            const fadeStart = 0; 
            const fadeEnd = 150; 
            let opacity = 1;
            if (scrollY <= fadeStart) {
                opacity = 1;
            } else if (scrollY >= fadeEnd) {
                opacity = 0;
            } else {
                opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
            }
            mainHeaderLogo.style.opacity = opacity.toFixed(2);
        } else if (mainHeaderLogo) {
            mainHeaderLogo.style.opacity = '1';
        }

        // Client logo marquee fade
        const clientLogoMarquee = document.querySelector('.hero-client-logo-marquee-container');
        if (clientLogoMarquee) {
            const scrollY = window.scrollY;
            const fadeStart = 0;
            const fadeEnd = 200;
            let opacity = 1;
            if (scrollY <= fadeStart) {
                opacity = 1;
            } else if (scrollY >= fadeEnd) {
                opacity = 0;
            } else {
                opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
            }
            clientLogoMarquee.style.opacity = opacity.toFixed(2);
        }

        // Services marquee fade
        if (servicesMarquee) {
            const rect = servicesMarquee.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const bottomOfMarquee = rect.bottom;
            const fadeStartPoint = viewportHeight * 0.7; 
            const fadeEndPoint = viewportHeight * 0.3;   
            let opacity = 1;

            if (bottomOfMarquee <= fadeEndPoint) {
                opacity = 0;
            } else if (bottomOfMarquee <= fadeStartPoint) {
                opacity = (bottomOfMarquee - fadeEndPoint) / (fadeStartPoint - fadeEndPoint);
            } else {
                opacity = 1;
            }
            servicesMarquee.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(2);
        }

        // Scroll spy navigation highlighting
        if (scrollSpySections.length > 0) {
            let currentSectionId = '';
            const navHeight = window.innerWidth >= 1024 ? 80 : 60; 
            const threshold = navHeight + 50; 

            scrollSpySections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (window.scrollY >= sectionTop - threshold && window.scrollY < sectionTop + sectionHeight - threshold) {
                    currentSectionId = section.getAttribute('id');
                    if (currentSectionId === 'video-pin-outer-container') currentSectionId = 'hero';
                }
            });
            
            if (!currentSectionId && scrollSpySections.length > 0 && window.scrollY < (scrollSpySections[0].offsetTop - threshold)) {
                if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                    currentSectionId = 'hero';
                }
            }

            if (scheduleModal && scheduleModal.classList.contains('active')) {
                 if (window.innerWidth < 1024) { 
                     const fabScheduleLink = document.querySelector('#mobile-fab-actions-wrapper .schedule-call-link');
                     updateFabActiveState(fabScheduleLink);
                 } else { 
                     const contactDeskLink = Array.from(desktopNavLinks).find(link => link.getAttribute('href') === '#contact');
                     if (contactDeskLink) updateDesktopSlider(contactDeskLink);
                 }
                 return; 
            }

            if (window.innerWidth < 1024) { 
                let activeFabLink = document.querySelector(`#mobile-fab-actions-wrapper .mobile-fab-action-item[href="#${currentSectionId}"]`);
                if (currentSectionId === 'hero' && !activeFabLink) { 
                    activeFabLink = document.querySelector(`#mobile-fab-actions-wrapper .mobile-fab-action-item[href="#hero"]`);
                }
                updateFabActiveState(activeFabLink);
            } else { 
                const activeNavLink = document.querySelector(`#desktop-nav-list .desktop-nav-item a[href="#${currentSectionId}"]`);
                if (activeNavLink) {
                    if (!activeNavLink.parentElement.classList.contains('active')) updateDesktopSlider(activeNavLink);
                } else if (currentSectionId === 'hero' || (!currentSectionId && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') && scrollSpySections.length > 0 && window.scrollY < (scrollSpySections[0].offsetTop - threshold ))) {
                     const heroLink = document.querySelector(`#desktop-nav-list .desktop-nav-item a[href="#hero"]`);
                    if (heroLink && (!heroLink.parentElement || !heroLink.parentElement.classList.contains('active'))) updateDesktopSlider(heroLink);
                } else if (!currentSectionId) { 
                    desktopNavItems.forEach(item => item.classList.remove('active')); 
                    if (desktopSlidingButton) desktopSlidingButton.style.width = '0px';
                }
            }
        }
    }
    
    /**
     * Update FAB navigation active state
     * @param {Element} activeFabLinkElement - The active FAB link
     */
    function updateFabActiveState(activeFabLinkElement) {
        if (!fabNavContainer) return;
        fabActionItems.forEach(item => item.classList.remove('active'));
        if (activeFabLinkElement && activeFabLinkElement.classList.contains('mobile-fab-action-item')) {
            activeFabLinkElement.classList.add('active');
        }
    }

    // Scroll event listener with throttling
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeoutUniversal);
        scrollTimeoutUniversal = setTimeout(() => {
            handleScrollEffects();
        }, 10); 
    }, { passive: true });
    
    // Initialize scroll effects
    handleScrollEffects(); 

    // Initialize FAB navigation on load
    if (fabNavContainer && window.innerWidth < 1024) {
        let activeFabLinkOnLoad = null;
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        if (currentPath.includes('about.html')) {
            activeFabLinkOnLoad = document.querySelector('.mobile-fab-action-item[href="pages/about.html"]');
        } else if (currentHash && currentHash !== '#') {
            activeFabLinkOnLoad = document.querySelector(`.mobile-fab-action-item[href="${currentHash}"]`);
        } else if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/#') || currentPath.endsWith('/#hero')) {
            activeFabLinkOnLoad = document.querySelector('.mobile-fab-action-item[href="#hero"]');
        }
        
        updateFabActiveState(activeFabLinkOnLoad);
        if (!activeFabLinkOnLoad) setTimeout(triggerMobileScrollActiveState, 250);
    }

    /* =================================================
       HERO STATS ANIMATION
       ================================================= */
    
    const heroStatsWrapper = document.getElementById('hero-stats-wrapper');
    if (heroStatsWrapper) {
        const heroStatItems = heroStatsWrapper.querySelectorAll('[id^="hero-stat"]');
        if (heroStatItems.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateValue("hero-stat1", 0, 50, 1500, "+");
                        animateValue("hero-stat2", 0, 7, 1500, "+");
                        animateValue("hero-stat3", 0, 110, 1500, "k+");
                        observer.unobserve(heroStatsWrapper);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(heroStatsWrapper);
        }
    }

    /**
     * Animate number values with easing
     * @param {string} id - Element ID
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration
     * @param {string} suffix - Number suffix
     */
    function animateValue(id, start, end, duration, suffix = '') { 
        const el = document.getElementById(id); 
        if (!el) return;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) { 
            el.textContent = end + suffix; 
            return; 
        }
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            el.textContent = Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    /* =================================================
       MARQUEE INITIALIZATION
       ================================================= */
    
    // Services marquee
    const servicesMarqueeContainer = document.querySelector('.services-marquee-container');
    if (servicesMarqueeContainer) {
        initializeMarquee('.services-marquee-container', '.service-item', 60, 'item');
    }
    
    // Testimonials marquee
    const testimonialMarqueeContainer = document.querySelector('.testimonial-marquee-container');
    if (testimonialMarqueeContainer) {
        const testimonialsData = [
            { img: 'assets/testimonials/ashton.jpg', alt: "Ashton Bisner", name: "Ashton Bisner", title: "Creative Lead", company: "Orange Media Network", quote: "Throughout his time as a photojournalist, Jake always brought a positive attitude, was a joy to work with, and had a collaborative mindset. His eye for unique perspectives and creative approaches consistently elevated our visual storytelling." },
            { img: 'assets/testimonials/adam.jpg', alt: "Adam Helischauer", name: "Adam Helischauer", title: "CEO", company: "Noti", quote: "Jake's dedication and creativity in developing the Noti brand and website were exceptional. He translated our vision into a compelling digital presence that truly resonated with our target audience. His strategic insights were invaluable." },
            { img: 'assets/testimonials/henry.jpg', alt: "Henry Kutrieb", name: "Henry Kutrieb", title: "Founder", company: "FlashForm", quote: "Working with Jake on the FlashForm branding was a fantastic experience. He quickly grasped our core values and delivered a visual identity that was both innovative and perfectly aligned with our market. Highly recommend for his design skill and professionalism." },
            { img: 'assets/testimonials/sharon.jpg', alt: "Sharon Betterton", name: "Sharon Betterton", title: "Art Director", company: "Oregon State College of Science", quote: "Jake has been a joy to work with on various video projects. He's a reliable, creative, and technically skilled videographer who consistently delivers high-quality work, often exceeding expectations under tight deadlines. His visual storytelling is top-notch." }
        ];
        const testimonialRowEl = testimonialMarqueeContainer.querySelector('.testimonial-row'); 
        if (testimonialRowEl) {
            const testimonialSets = testimonialRowEl.querySelectorAll('.testimonial-set');
            testimonialSets.forEach(set => {
                for (let i = 0; i < 2; i++) { 
                    testimonialsData.forEach(testimonial => {
                        set.appendChild(createTestimonialCard(testimonial));
                    });
                }
            });
            initializeMarquee('.testimonial-marquee-container', '.testimonial-card-marquee', 30, 'container');
        }
    }

    // Client logo marquee
    const heroClientLogoMarquee = document.querySelector('.hero-client-logo-marquee-container');
    if (heroClientLogoMarquee) {
        initializeMarquee('.hero-client-logo-marquee-container', '.client-logo-item', 35, 'container');
    }

    /**
     * Create testimonial card element
     * @param {Object} t - Testimonial data
     * @returns {Element} - Testimonial card element
     */
    function createTestimonialCard(t) { 
        const card = document.createElement('div');
        card.className = 'testimonial-card-marquee';
        card.innerHTML = `
            <div class="quote-icon text-5xl font-serif">"</div>
            <p class="quote-text text-sm md:text-base leading-relaxed">${t.quote}</p>
            <div class="client-info">
                <img src="${t.img}" alt="${t.alt}" class="client-image">
                <div>
                    <span class="client-name text-sm font-semibold">${t.name}</span>
                    <span class="client-title text-xs">${t.title}, ${t.company}</span>
                </div>
            </div>`;
        return card;
    }

    /**
     * Initialize marquee animation
     * @param {string} containerSelector - Container CSS selector
     * @param {string} itemSelectorClass - Item CSS selector
     * @param {number} speedPerSecond - Animation speed
     * @param {string} hoverTargetType - Hover target type ('item' or 'container')
     */
    function initializeMarquee(containerSelector, itemSelectorClass, speedPerSecond, hoverTargetType = 'item') { 
        const marqueeContainer = document.querySelector(containerSelector); 
        if (!marqueeContainer) return;
        
        const rows = marqueeContainer.querySelectorAll('.service-row, .testimonial-row, .client-logo-row'); 
        const allItems = marqueeContainer.querySelectorAll(itemSelectorClass);
        let isPausedGlobally = false;
        const MOBILE_BREAKPOINT = 768;
        const LERP_FACTOR = 0.05; 
        const MIN_EFFECTIVE_SPEED_THRESHOLD = 0.01; 

        rows.forEach(row => {
            let currentX = 0;
            const direction = row.dataset.direction === 'rtl' ? 1 : -1;
            const baseSpeed = direction * (speedPerSecond / 1000); 
            let currentSpeed = baseSpeed;
            let firstSetWidth = 0;
            let animationFrameId = null;
            let lastTimestamp = performance.now();
            
            const sets = Array.from(row.children).filter(child => 
                child.classList.contains('service-set') || 
                child.classList.contains('testimonial-set') || 
                child.classList.contains('client-logo-set')
            ); 
            
            if (sets.length < 2) {
                return;
            }
            const primarySet = sets[0]; 

            function updateFirstSetWidth() {
                if (primarySet) firstSetWidth = primarySet.offsetWidth;
                if (direction === 1 && firstSetWidth > 0 && currentX === 0) { 
                    currentX = -firstSetWidth;
                    row.style.transform = `translateX(${currentX}px)`;
                }
            }
            
            setTimeout(updateFirstSetWidth, 150); 
            window.addEventListener('resize', () => { 
                if(animationFrameId) cancelAnimationFrame(animationFrameId);
                setTimeout(() => {
                    updateFirstSetWidth();
                    animationFrameId = requestAnimationFrame(scrollStep); 
                }, 200);
            });

            function scrollStep(timestamp) {
                if (firstSetWidth === 0) { 
                    updateFirstSetWidth(); 
                    if(firstSetWidth === 0) { 
                        animationFrameId = requestAnimationFrame(scrollStep); 
                        return; 
                    }
                }

                const deltaTime = timestamp - lastTimestamp;
                lastTimestamp = timestamp;

                if (deltaTime <= 0 || deltaTime > 200) { 
                    animationFrameId = requestAnimationFrame(scrollStep);
                    return;
                }

                let targetSpeedForAnimation = (isPausedGlobally && window.innerWidth >= MOBILE_BREAKPOINT) ? 0 : baseSpeed;
                currentSpeed += (targetSpeedForAnimation - currentSpeed) * LERP_FACTOR;
                if (Math.abs(currentSpeed) < MIN_EFFECTIVE_SPEED_THRESHOLD && targetSpeedForAnimation === 0) currentSpeed = 0; 
                if (Math.abs(currentSpeed - targetSpeedForAnimation) < MIN_EFFECTIVE_SPEED_THRESHOLD && targetSpeedForAnimation !==0) currentSpeed = targetSpeedForAnimation; 

                currentX += currentSpeed * deltaTime;

                if (firstSetWidth > 0) { 
                    if (direction === -1 && currentX <= -firstSetWidth) { 
                        currentX += firstSetWidth;
                    } else if (direction === 1 && currentX >= 0) { 
                        currentX -= firstSetWidth;
                    }
                }
                row.style.transform = `translateX(${currentX}px)`;
                animationFrameId = requestAnimationFrame(scrollStep);
            }
            animationFrameId = requestAnimationFrame(scrollStep);
        });

        // Setup hover interactions
        if (hoverTargetType === 'container' && marqueeContainer) {
            marqueeContainer.addEventListener('mouseenter', () => { 
                if (window.innerWidth < MOBILE_BREAKPOINT) return; 
                isPausedGlobally = true; 
            });
            marqueeContainer.addEventListener('mouseleave', () => { 
                if (window.innerWidth < MOBILE_BREAKPOINT) return; 
                isPausedGlobally = false; 
            });
        } else if (hoverTargetType === 'item' && allItems.length > 0) {
            allItems.forEach(item => {
                item.addEventListener('mouseenter', (e) => { 
                    if (window.innerWidth < MOBILE_BREAKPOINT) return; 
                    isPausedGlobally = true; 
                    e.currentTarget.classList.add('is-hovered'); 
                });
                item.addEventListener('mouseleave', (e) => { 
                    if (window.innerWidth < MOBILE_BREAKPOINT) return; 
                    isPausedGlobally = false; 
                    e.currentTarget.classList.remove('is-hovered'); 
                });
            });
        }
    }

    /* =================================================
       VIDEO PIN SCROLL ANIMATION
       ================================================= */
    
    const videoPinOuterContainer = document.getElementById('video-pin-outer-container');
    const scrollVideoContainer = document.getElementById('scroll-video-container');
    const scrollVideo = document.getElementById('scroll-video');

    if (videoPinOuterContainer && scrollVideoContainer && scrollVideo) {
        let videoCanPlay = false;
        let videoInitTimeout;

        function attemptVideoInit() {
            clearTimeout(videoInitTimeout);
            if (scrollVideo.readyState >= 2) { 
                videoCanPlay = true;
                requestAnimationFrame(handleVideoScrollAnimation);
            } else {
                videoInitTimeout = setTimeout(attemptVideoInit, 100);
            }
        }

        scrollVideo.addEventListener('canplay', () => {
            videoCanPlay = true;
            requestAnimationFrame(handleVideoScrollAnimation);
            clearTimeout(videoInitTimeout); 
        });
        
        attemptVideoInit();
        
        /**
         * Handle video scroll animation
         */
        function handleVideoScrollAnimation() {
            if (!videoPinOuterContainer || !scrollVideoContainer || !scrollVideo || !videoCanPlay) { 
                return;
            }

            const pinOuterRect = videoPinOuterContainer.getBoundingClientRect();
            if (pinOuterRect.height < 100 && pinOuterRect.top === 0 && pinOuterRect.bottom === 0 && window.scrollY < 100) { 
                return;
            }

            const pinOuterTop = window.scrollY + pinOuterRect.top; 
            const pinOuterHeight = videoPinOuterContainer.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollableDistanceInPin = pinOuterHeight - viewportHeight; 

            let currentScrollY = window.scrollY;
            let scrollProgress = 0;

            const isMobileView = window.innerWidth < 768; 
            const videoMargin = isMobileView ? 16 : 32; 
            const maxBorderRadius = isMobileView ? 16 : 24; 

            if (scrollableDistanceInPin <= 0) { 
                scrollVideoContainer.style.opacity = 1;
                scrollVideoContainer.style.width = `calc(100vw - ${videoMargin * 2}px)`;
                scrollVideoContainer.style.height = `calc(100vh - ${videoMargin * 2}px)`;
                scrollVideoContainer.style.left = '50%'; 
                scrollVideoContainer.style.bottom = `${videoMargin}px`; 
                scrollVideoContainer.style.transform = 'translateX(-50%) scale(1)'; 
                scrollVideoContainer.style.borderRadius = `${maxBorderRadius}px`;
                if (scrollVideo.paused) { 
                    scrollVideo.play().catch(e => {/* Silent catch for autoplay restrictions */});
                }
                return;
            }

            if (currentScrollY >= pinOuterTop && currentScrollY <= (pinOuterTop + scrollableDistanceInPin)) {
                scrollProgress = (currentScrollY - pinOuterTop) / scrollableDistanceInPin;
            } else if (currentScrollY > (pinOuterTop + scrollableDistanceInPin)) {
                scrollProgress = 1;
            } else {
                scrollProgress = 0;
            }
            scrollProgress = Math.max(0, Math.min(1, scrollProgress)); 

            const targetWidthWithMargin = `calc(100vw - ${videoMargin * 2}px)`;
            const targetHeightWithMargin = `calc(100vh - ${videoMargin * 2}px)`;

            if (scrollProgress <= 0.5) { 
                const phase1Progress = scrollProgress / 0.5; 
                const p1Opacity = phase1Progress;
                const p1InitialScale = 0.1; 
                const p1TargetScale = 1.0;  
                const p1Scale = p1InitialScale + phase1Progress * (p1TargetScale - p1InitialScale);
                
                scrollVideoContainer.style.width = targetWidthWithMargin;
                scrollVideoContainer.style.height = targetHeightWithMargin;
                 
                const p1InitialTranslateYPercent = 100; 
                const p1TranslateY = p1InitialTranslateYPercent * (1 - phase1Progress); 

                scrollVideoContainer.style.borderRadius = `${maxBorderRadius}px`; 
                scrollVideoContainer.style.opacity = p1Opacity;
                scrollVideoContainer.style.left = '50%';
                scrollVideoContainer.style.bottom = `${videoMargin}px`; 
                scrollVideoContainer.style.transform = `translate(-50%, ${p1TranslateY}%) scale(${p1Scale})`;
                scrollVideoContainer.style.transformOrigin = 'center bottom';
                scrollVideoContainer.style.pointerEvents = p1Opacity > 0.5 ? 'auto' : 'none';

                if (p1Opacity > 0.1 && scrollVideo.paused) { 
                    scrollVideo.play().catch(error => {/* Silent catch for autoplay restrictions */});
                }

            } else { 
                scrollVideoContainer.style.opacity = 1;
                scrollVideoContainer.style.width = targetWidthWithMargin;
                scrollVideoContainer.style.height = targetHeightWithMargin;
                scrollVideoContainer.style.left = '50%';
                scrollVideoContainer.style.bottom = `${videoMargin}px`;
                scrollVideoContainer.style.transform = 'translateX(-50%) scale(1)'; 
                scrollVideoContainer.style.borderRadius = `${maxBorderRadius}px`;
                scrollVideoContainer.style.transformOrigin = 'center bottom'; 
                scrollVideoContainer.style.pointerEvents = 'auto';

                if (scrollVideo.paused) { 
                    scrollVideo.play().catch(error => {/* Silent catch for autoplay restrictions */});
                }
            }

            if (scrollProgress < 0.01 && !scrollVideo.paused) {
                scrollVideo.pause();
            }
        }
        
        let videoScrollAnimFrame;
        window.addEventListener('scroll', () => {
            if(videoScrollAnimFrame) cancelAnimationFrame(videoScrollAnimFrame);
            videoScrollAnimFrame = requestAnimationFrame(handleVideoScrollAnimation);
        }, { passive: true });
        
        requestAnimationFrame(() => {
             setTimeout(handleVideoScrollAnimation, 50); 
        });
    }

    /* =================================================
       CURRENT YEAR UPDATE
       ================================================= */
    
    // Update copyright year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

});