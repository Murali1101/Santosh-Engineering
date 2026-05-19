// Wait for all libraries to load before initializing
window.addEventListener('DOMContentLoaded', () => {
    // Check if libraries are available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide library not loaded');
    }

    if (typeof gsap === 'undefined') {
        console.error('GSAP library failed to load. Check CDN link.');
        return;
    }

    // --- NATIVE SCROLLING ---
    // Lenis smooth scrolling disabled to avoid scroll locking and lag.
    try {
        gsap.registerPlugin(ScrollTrigger);
    } catch (error) {
        console.error('Failed to initialize GSAP/ScrollTrigger:', error);
    }

    // --- CUSTOM CURSOR GLOW (Debounced) ---
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow && !window.matchMedia("(hover: none)").matches) {
        let lastX = 0;
        let lastY = 0;
        let ticking = false;
        
        document.addEventListener('mousemove', (e) => {
            lastX = e.clientX;
            lastY = e.clientY;
            
            if (!ticking) {
                requestAnimationFrame(() => {
                    gsap.to(cursorGlow, {
                        x: lastX,
                        y: lastY,
                        duration: 0.4,
                        ease: "power3.out"
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // --- MAGNETIC BUTTONS ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);

            // Slight physical pull effect
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            gsap.to(btn, {
                x: deltaX * 10,
                y: deltaY * 10,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // --- HEADER SCROLL EFFECT (Optimized) ---
    const header = document.getElementById('header');
    const navContainer = document.querySelector('.nav-container');
    let lastScrollY = 0;
    let ticking2 = false;

    const updateHeaderScroll = () => {
        const isScrolled = lastScrollY > 50;
        
        if (isScrolled) {
            header.classList.remove('py-6');
            header.classList.add('py-2');
            navContainer.classList.add('bg-dark-surface/80', 'backdrop-blur-md', 'border-white/10', 'shadow-2xl');
            navContainer.classList.remove('border-transparent');
        } else {
            header.classList.add('py-6');
            header.classList.remove('py-2');
            navContainer.classList.remove('bg-dark-surface/80', 'backdrop-blur-md', 'border-white/10', 'shadow-2xl');
            navContainer.classList.add('border-transparent');
        }
        ticking2 = false;
    };

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking2) {
            requestAnimationFrame(updateHeaderScroll);
            ticking2 = true;
        }
    });

    // --- MOBILE MENU TOGGLE ---
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));

            if (!expanded) {
                // open
                mobileMenu.style.display = 'block';
                gsap.killTweensOf(mobileMenu);
                gsap.fromTo(mobileMenu, { maxHeight: 0, opacity: 0 }, { maxHeight: mobileMenu.scrollHeight, opacity: 1, duration: 0.35, ease: 'power2.out' });
                const icon = mobileToggle.querySelector('i');
                if (icon) { icon.setAttribute('data-lucide', 'x'); lucide.createIcons(); }
            } else {
                // close
                gsap.killTweensOf(mobileMenu);
                gsap.to(mobileMenu, { maxHeight: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { mobileMenu.style.display = ''; } });
                const icon = mobileToggle.querySelector('i');
                if (icon) { icon.setAttribute('data-lucide', 'menu'); lucide.createIcons(); }
            }
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', () => {
                mobileToggle.setAttribute('aria-expanded', 'false');
                gsap.to(mobileMenu, { maxHeight: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { mobileMenu.style.display = ''; } });
                const icon = mobileToggle.querySelector('i');
                if (icon) { icon.setAttribute('data-lucide', 'menu'); lucide.createIcons(); }
            });
        });
    }

    // --- INDUSTRIES AUTO SCROLL ---
    const industriesScrollWrapper = document.querySelector('.industries-scroll-wrapper');
    if (industriesScrollWrapper) {
        const industriesContainer = industriesScrollWrapper.querySelector(':scope > div');
        let autoScrollActive = true;
        const autoScrollSpeed = 0.8;

        if (industriesContainer) {
            const originalItems = Array.from(industriesContainer.children);
            originalItems.forEach((item) => {
                const clone = item.cloneNode(true);
                industriesContainer.appendChild(clone);
            });

            const loopWidth = industriesContainer.scrollWidth / 2;
            industriesScrollWrapper.scrollLeft = 0;

            const updateScroll = () => {
                if (!autoScrollActive) return;
                industriesScrollWrapper.scrollLeft += autoScrollSpeed * 2;

                if (industriesScrollWrapper.scrollLeft >= loopWidth) {
                    industriesScrollWrapper.scrollLeft -= loopWidth;
                }
            };

            industriesScrollWrapper.addEventListener('mouseenter', () => {
                autoScrollActive = false;
            });

            industriesScrollWrapper.addEventListener('mouseleave', () => {
                autoScrollActive = true;
            });

            industriesScrollWrapper.addEventListener('pointerdown', () => {
                autoScrollActive = false;
            });

            industriesScrollWrapper.addEventListener('pointerup', () => {
                autoScrollActive = true;
            });

            industriesScrollWrapper.addEventListener('touchstart', () => {
                autoScrollActive = false;
            });

            industriesScrollWrapper.addEventListener('touchend', () => {
                autoScrollActive = true;
            });

            setInterval(updateScroll, 20);
        }
    }

    // --- ANIMATIONS ---

    // 1. Hero Entrance Animations
    const tlHero = gsap.timeline();

    tlHero.from('.gsap-hero-el', {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2
    })
        .from('.gsap-hero-stat', {
            x: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8");

    // 2. Parallax Hero Background (disabled for performance)
    // Parallax with scrub causes lag - disabled
    // Uncomment if performance improves
    // gsap.to('#hero img', {
    //     yPercent: 30,
    //     ease: "none",
    //     scrollTrigger: {
    //         trigger: '#hero',
    //         start: "top top",
    //         end: "bottom top",
    //         scrub: true
    //     }
    // });

    // 3. Fade Up / Fade Left / Fade Right (optimized)
    // Use a more efficient intersection observer for better performance
    const revealElements = document.querySelectorAll('.gsap-fade-up, .gsap-fade-left, .gsap-fade-right');
    
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    let fromVars = { y: 50, opacity: 0 };
                    
                    if (el.classList.contains('gsap-fade-left')) {
                        fromVars = { x: 50, opacity: 0 };
                    } else if (el.classList.contains('gsap-fade-right')) {
                        fromVars = { x: -50, opacity: 0 };
                    }
                    
                    gsap.fromTo(el, fromVars, {
                        y: 0,
                        x: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                    
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach((el) => observer.observe(el));
    }

    // 4. Counter Animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const counterStart = window.innerWidth < 768 ? "top 95%" : "top 90%";

        ScrollTrigger.create({
            trigger: counter,
            start: counterStart,
            onEnter: () => {
                let current = 0;
                const duration = 1200; // ms
                const increment = target / (duration / 16); // 60fps

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current) + "+";
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target + (target === 100 ? "%" : "+");
                    }
                };
                updateCounter();
            },
            once: true
        });
    });

    // 5. Horizontal Process Timeline Animation (optimized)
    // For smaller screens, we let it stack. For larger screens, we animate the progress bar.
    if (window.innerWidth >= 768) {
        ScrollTrigger.create({
            trigger: "#process",
            start: "top 60%",
            onEnter: () => {
                // Animate progress bar without scrub for better performance
                gsap.to('.process-progress', {
                    width: "100%",
                    duration: 1.5,
                    ease: "power2.out"
                });
                
                // Animate steps with stagger
                const steps = document.querySelectorAll('.process-step > div');
                steps.forEach((step, index) => {
                    gsap.to(step, {
                        backgroundColor: "#06B6D4",
                        borderColor: "#06B6D4",
                        color: "#0B1220",
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "power2.out"
                    });
                });
            },
            once: true
        });
    }

    // 6. Submit Quote Request to Google Sheets
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const actionUrl = quoteForm.getAttribute('data-action');
            if (!actionUrl ) {
                alert('Please configure the Google Sheets web app URL in the quote form data-action attribute.');
                return;
            }

            const formData = new FormData();
            formData.append('name', document.getElementById('name').value.trim());
            formData.append('email', document.getElementById('email').value.trim());
            formData.append('mobile', document.getElementById('mobile').value.trim());
            formData.append('company', document.getElementById('company').value.trim());
            formData.append('message', document.getElementById('message').value.trim());
            formData.append('submittedAt', new Date().toLocaleString());

            const submitButton = quoteForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.innerText : '';
            if (submitButton) {
                submitButton.innerText = 'Sending...';
                submitButton.disabled = true;
            }

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Form submission failed.');
                }

                alert('Thank you! Your quote request has been saved to Google Sheets.');
                quoteForm.reset();
            } catch (error) {
                console.error(error);
                alert('Unable to submit the form. Please check the web app URL and try again.');
            } finally {
                if (submitButton) {
                    submitButton.innerText = originalText;
                    submitButton.disabled = false;
                }
            }
        });
    }
});
