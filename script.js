document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 700, offset: 80, once: true });

    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    const desktopNavLinks = document.querySelectorAll('#desktop-nav-list .desktop-nav-item a');
    const desktopNavItems = document.querySelectorAll('#desktop-nav-list .desktop-nav-item');
    const desktopSlidingButton = document.getElementById('sliding-button');

    function updateDesktopSlider(activeLinkElement) {
        if (!activeLinkElement || !desktopSlidingButton || window.innerWidth < 1024) return;
        
        const href = activeLinkElement.getAttribute('href');
        if (href && !href.startsWith('#')) {
             const matchingDesktopLink = Array.from(desktopNavLinks).find(link => {
                const linkHref = link.getAttribute('href');
                return linkHref === href || (linkHref && href.includes(linkHref) && !linkHref.startsWith('#'));
            });
            if(matchingDesktopLink && matchingDesktopLink.parentElement && matchingDesktopLink.parentElement.matches('#desktop-nav-list .desktop-nav-item')){
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

    const initialDesktopActiveLink = Array.from(desktopNavLinks).find(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === '#hero' && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) return true;
        if (linkHref && !linkHref.startsWith('#') && window.location.pathname.includes(linkHref)) return true;
        return false;
    });

    if (initialDesktopActiveLink && window.innerWidth >= 1024 ) {
        setTimeout(() => updateDesktopSlider(initialDesktopActiveLink), 200); 
    }

    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileMenu = document.getElementById('mobile-menu'); 
    const mobileNavLinksJS = document.querySelectorAll('#mobile-menu .mobile-nav-link');
    const mobileScheduleButton = document.querySelector('#mobile-menu .schedule-call-link.cta-button');

    if (mobileMenu && mobileNavClose) { 
        mobileNavClose.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            if (scheduleModal && !scheduleModal.classList.contains('active') && !isFabNavExpanded()) {
                document.body.classList.remove('modal-open');
            }
        });
    }

    const fabNavContainer = document.getElementById('mobile-fab-nav-container');
    const fabToggle = document.getElementById('mobile-fab-toggle');
    const fabBackdrop = document.getElementById('mobile-fab-backdrop');
    const fabIconMenu = document.getElementById('fab-icon-menu');
    const fabIconClose = document.getElementById('fab-icon-close');
    const fabActionItems = document.querySelectorAll('.mobile-fab-action-item');

    function isFabNavExpanded() {
        return fabNavContainer && fabNavContainer.classList.contains('is-expanded');
    }

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

    const scheduleLinks = document.querySelectorAll('.schedule-call-link');
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleIframe = document.getElementById('schedule-iframe');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalLoading = document.querySelector('#schedule-modal .modal-loading');
    const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2I8mK189lg8ti0kyS5AG9_0j6rP1643Z0PY75TTA8lN1osU5PrHt7YRyRGu9sqhUaq4iNF7muL?gv=true';

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
    
    function triggerScrollSpy() { 
        window.dispatchEvent(new Event('scroll'));
    }

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

    function handleNavLinkClick(e, linkElement, isMobileSource = false, isFabSource = false) {
        const href = linkElement.getAttribute('href');
        if (linkElement.classList.contains('schedule-call-link')) {
            e.preventDefault();
            if (isMobileSource && mobileMenu && mobileMenu.classList.contains('open')) mobileMenu.classList.remove('open'); 
            openScheduleModal();
            return;
        }
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

    desktopNavLinks.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, false, false)); });
    mobileNavLinksJS.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, true, false)); });
    if (mobileScheduleButton) mobileScheduleButton.addEventListener('click', (e) => handleNavLinkClick(e, mobileScheduleButton, true, false));
    fabActionItems.forEach(link => { link.addEventListener('click', (e) => handleNavLinkClick(e, link, false, true)); });

    scheduleLinks.forEach(link => {
        const isHandledByDesktop = link.closest('#desktop-nav-list'); 
        const isHandledByMobileMenu = link.closest('#mobile-menu nav') || link === mobileScheduleButton; 
        const isHandledByFab = Array.from(fabActionItems).includes(link);
        if (!isHandledByDesktop && !isHandledByMobileMenu && !isHandledByFab) {
             link.addEventListener('click', (e) => { e.preventDefault(); openScheduleModal(); });
        }
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeScheduleModal);
    if (scheduleModal) scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) closeScheduleModal(); });
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

    const scrollSpySections = document.querySelectorAll('section[id]:not(#case-studies), div#video-pin-outer-container'); 
    const mainHeaderLogo = document.getElementById('main-header-logo');
    const servicesMarquee = document.getElementById('services-marquee');
    let scrollTimeoutUniversal;

    function handleScrollEffects() {
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
    
    function updateFabActiveState(activeFabLinkElement) {
        if (!fabNavContainer) return;
        fabActionItems.forEach(item => item.classList.remove('active'));
        if (activeFabLinkElement && activeFabLinkElement.classList.contains('mobile-fab-action-item')) {
            activeFabLinkElement.classList.add('active');
        }
    }

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeoutUniversal);
        scrollTimeoutUniversal = setTimeout(() => {
            handleScrollEffects();
        }, 10); 
    }, { passive: true });
    handleScrollEffects(); 


    if (fabNavContainer && window.innerWidth < 1024) {
        let activeFabLinkOnLoad = null;
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        if (currentPath.includes('about.html')) {
            activeFabLinkOnLoad = document.querySelector('.mobile-fab-action-item[href="about.html"]');
        } else if (currentHash && currentHash !== '#') {
            activeFabLinkOnLoad = document.querySelector(`.mobile-fab-action-item[href="${currentHash}"]`);
        } else if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/#') || currentPath.endsWith('/#hero')) {
            activeFabLinkOnLoad = document.querySelector('.mobile-fab-action-item[href="#hero"]');
        }
        
        updateFabActiveState(activeFabLinkOnLoad);
        if (!activeFabLinkOnLoad) setTimeout(triggerMobileScrollActiveState, 250);
    }

    // --- Case Study Desktop Logic ---
    if (window.innerWidth >= 1024) {
        const caseStudySectionDesktop = document.getElementById('case-studies');
        const caseStudyHeaderStickyDesktop = document.getElementById('case-study-header-sticky');
        const caseStudyStageStickyWrapperDesktop = document.getElementById('case-study-stage-sticky-wrapper');

        function updateCaseStudyStageOffsetDesktop() {
            if (!caseStudyHeaderStickyDesktop || !caseStudyStageStickyWrapperDesktop || !caseStudyHeaderStickyDesktop.offsetParent) {
                return;
            }
            const headerStickyComputedStyle = getComputedStyle(caseStudyHeaderStickyDesktop);
            const headerActualStickyTop = parseFloat(headerStickyComputedStyle.top) || 0;
            const headerContentHeight = caseStudyHeaderStickyDesktop.offsetHeight;
            const stageTopPosition = headerActualStickyTop + headerContentHeight;
            caseStudyStageStickyWrapperDesktop.style.top = `${stageTopPosition}px`;
            caseStudyStageStickyWrapperDesktop.style.setProperty('--case-study-stage-top-offset', `${stageTopPosition}px`);
        }

        if (caseStudyHeaderStickyDesktop && caseStudyStageStickyWrapperDesktop) {
            requestAnimationFrame(() => { setTimeout(updateCaseStudyStageOffsetDesktop, 100); });
            let resizeTimeoutCaseStudyDesktop;
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024) {
                    clearTimeout(resizeTimeoutCaseStudyDesktop);
                    resizeTimeoutCaseStudyDesktop = setTimeout(updateCaseStudyStageOffsetDesktop, 150);
                } else {
                    if(caseStudyStageStickyWrapperDesktop) caseStudyStageStickyWrapperDesktop.style.top = '';
                    if(caseStudyHeaderStickyDesktop) caseStudyHeaderStickyDesktop.style.zIndex = '';
                }
            });
        }

        if (caseStudySectionDesktop && caseStudyStageStickyWrapperDesktop) { // Ensure stage wrapper exists for desktop logic
            const scrollTriggersDesktop = document.querySelectorAll('.case-study-scroll-trigger');
            const projectPanelsDesktop = document.querySelectorAll('.case-study-panel');
            let lastActivatedPanelIdDesktop = null;

            if (scrollTriggersDesktop.length > 0 && projectPanelsDesktop.length > 0) {
                const observerOptionsDesktop = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.3 
                };
                const observerCallbackDesktop = (entries, observer) => {
                    let bestCandidateId = null;
                    let maxIntersectionRatio = 0;
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (entry.intersectionRatio > maxIntersectionRatio) {
                                maxIntersectionRatio = entry.intersectionRatio;
                                bestCandidateId = entry.target.dataset.triggerFor;
                            }
                        }
                    });
                    if (bestCandidateId && lastActivatedPanelIdDesktop !== bestCandidateId) {
                        projectPanelsDesktop.forEach(panel => {
                            if (panel.dataset.projectId === bestCandidateId) {
                                panel.classList.add('is-active');
                            } else {
                                panel.classList.remove('is-active');
                            }
                        });
                        lastActivatedPanelIdDesktop = bestCandidateId;
                    } else if (!bestCandidateId && lastActivatedPanelIdDesktop) {
                        // Optional: Deactivate all if no trigger is active
                        // projectPanelsDesktop.forEach(panel => panel.classList.remove('is-active'));
                        // lastActivatedPanelIdDesktop = null;
                    }
                };
                const intersectionObserverDesktop = new IntersectionObserver(observerCallbackDesktop, observerOptionsDesktop);
                scrollTriggersDesktop.forEach(trigger => intersectionObserverDesktop.observe(trigger));
            }

            const customCursorDesktop = document.getElementById('custom-project-cursor');
            const caseStudyFullLinksDesktop = document.querySelectorAll('.case-study-panel .case-study-full-link');
            if (customCursorDesktop && caseStudyFullLinksDesktop.length > 0) {
                caseStudyFullLinksDesktop.forEach(linkWrapper => {
                    linkWrapper.addEventListener('mouseenter', () => {
                        if (window.innerWidth >= 1024) customCursorDesktop.classList.add('visible');
                    });
                    linkWrapper.addEventListener('mouseleave', () => {
                        if (window.innerWidth >= 1024) customCursorDesktop.classList.remove('visible');
                    });
                    linkWrapper.addEventListener('mousemove', (e) => {
                        if (window.innerWidth >= 1024 && customCursorDesktop.classList.contains('visible')) {
                            customCursorDesktop.style.left = `${e.clientX}px`;
                            customCursorDesktop.style.top = `${e.clientY}px`;
                        }
                    });
                });
            }

            const interactiveZoneDesktop = document.getElementById('case-study-interactive-zone');
            const lastScrollTriggerDesktop = document.querySelector('.case-study-scroll-trigger:last-of-type');
            if (interactiveZoneDesktop && caseStudyHeaderStickyDesktop && lastScrollTriggerDesktop) {
                let headerSentinelDesktop = interactiveZoneDesktop.querySelector('.header-overlap-sentinel');
                if (!headerSentinelDesktop) { // Create sentinel only if it doesn't exist
                    headerSentinelDesktop = document.createElement('div');
                    headerSentinelDesktop.className = 'header-overlap-sentinel'; // Add a class for potential re-find
                    lastScrollTriggerDesktop.parentNode.insertBefore(headerSentinelDesktop, lastScrollTriggerDesktop.nextSibling);
                    headerSentinelDesktop.style.height = '1px';
                    headerSentinelDesktop.style.position = 'relative';
                    headerSentinelDesktop.style.bottom = '150px'; // Adjust to trigger a bit before end of triggers scroll area
                }

                const headerOverlapObserverDesktop = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (window.innerWidth < 1024) {
                             caseStudyHeaderStickyDesktop.style.zIndex = ''; 
                             return;
                        }
                        if (entry.isIntersecting) {
                            caseStudyHeaderStickyDesktop.style.zIndex = '45'; // Lower than stage (z-[50])
                        } else {
                            caseStudyHeaderStickyDesktop.style.zIndex = '60'; // Default z-index from Tailwind
                        }
                    });
                }, { rootMargin: `0px 0px -${window.innerHeight * 0.80}px 0px`, threshold: 0.01 }); // Sentinel intersecting bottom 20% of viewport
                headerOverlapObserverDesktop.observe(headerSentinelDesktop);
            }
        }
    } // --- End Case Study Desktop Logic ---


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

    function animateValue(id, start, end, duration, suffix = '') { 
        const el = document.getElementById(id); if (!el) return;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) { el.textContent = end + suffix; return; }
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            el.textContent = Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const servicesMarqueeContainer = document.querySelector('.services-marquee-container');
    if (servicesMarqueeContainer) {
        initializeMarquee('.services-marquee-container', '.service-item', 60, 'item');
    }
    
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

    const heroClientLogoMarquee = document.querySelector('.hero-client-logo-marquee-container');
    if (heroClientLogoMarquee) {
        initializeMarquee('.hero-client-logo-marquee-container', '.client-logo-item', 35, 'container');
    }

    function createTestimonialCard(t) { 
        const card = document.createElement('div');
        card.className = 'testimonial-card-marquee';
        card.innerHTML = `
            <div class="quote-icon text-5xl font-serif">“</div>
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

    function initializeMarquee(containerSelector, itemSelectorClass, speedPerSecond, hoverTargetType = 'item') { 
        const marqueeContainer = document.querySelector(containerSelector); if (!marqueeContainer) return;
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
            
            const sets = Array.from(row.children).filter(child => child.classList.contains('service-set') || child.classList.contains('testimonial-set') || child.classList.contains('client-logo-set')); 
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

        const actualHoverTarget = hoverTargetType === 'container' ? marqueeContainer : allItems;
        if (hoverTargetType === 'container' && marqueeContainer) {
            marqueeContainer.addEventListener('mouseenter', () => { if (window.innerWidth < MOBILE_BREAKPOINT) return; isPausedGlobally = true; });
            marqueeContainer.addEventListener('mouseleave', () => { if (window.innerWidth < MOBILE_BREAKPOINT) return; isPausedGlobally = false; });
        } else if (hoverTargetType === 'item' && allItems.length > 0) {
            allItems.forEach(item => {
                item.addEventListener('mouseenter', (e) => { if (window.innerWidth < MOBILE_BREAKPOINT) return; isPausedGlobally = true; e.currentTarget.classList.add('is-hovered'); });
                item.addEventListener('mouseleave', (e) => { if (window.innerWidth < MOBILE_BREAKPOINT) return; isPausedGlobally = false; e.currentTarget.classList.remove('is-hovered'); });
            });
        }
    }

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
                    scrollVideo.play().catch(e => {/* console.error("Error playing video:", e) */});
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
                    scrollVideo.play().catch(error => {/* console.error("Error playing video:", error); */});
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
                    scrollVideo.play().catch(error => {/* console.error("Error playing video:", error); */});
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

});