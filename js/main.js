    // System utility to respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // 1. TEXT REVEAL ON SCROLL & 7. PAIN BULLETS STAGGER
    const revealElements = document.querySelectorAll('[data-reveal]');
    const painCards = document.querySelectorAll('.pain-card');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !prefersReducedMotion.matches) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        } else if (entry.isIntersecting && prefersReducedMotion.matches) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    let painStaggerBase = 0;
    const painObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!prefersReducedMotion.matches) {
            entry.target.style.animation = `painFadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) ${painStaggerBase * 120}ms forwards`;
          } else {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
          painStaggerBase++;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const painStyle = document.createElement('style');
    painStyle.textContent = `
      .pain-reveal-init { opacity: 0; transform: translateY(20px); will-change: transform, opacity; }
      @keyframes painFadeUp { to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(painStyle);

    revealElements.forEach(el => revealObserver.observe(el));
    painCards.forEach(el => {
      el.classList.add('pain-reveal-init');
      painObserver.observe(el);
    });

    // 2. IMAGE LOAD FADE
    const images = document.querySelectorAll('img.img-parallax');
    images.forEach(img => {
      if (img.complete) {
        img.style.opacity = 1;
        img.style.transform = 'scale(1)';
      } else {
        img.addEventListener('load', () => {
          img.style.opacity = 1;
          img.style.transform = 'scale(1)';
          img.style.transition = 'opacity 500ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)';
        });
      }
    });

    // 3. IMAGE PARALLAX
    const parallaxContainers = document.querySelectorAll('.img-parallax-container');
    function applyParallax() {
      if(prefersReducedMotion.matches) return;
      parallaxContainers.forEach(container => {
        const rect = container.getBoundingClientRect();
        if(rect.top < window.innerHeight && rect.bottom > 0) {
          const scrollProgress = 1 - (rect.bottom / (window.innerHeight + rect.height));
          const offset = scrollProgress * 35; // max 35% transform
          const img = container.querySelector('img');
          if(img) img.style.transform = `translateY(${offset}%) scale(1.15)`;
        }
      });
      requestAnimationFrame(applyParallax);
    }
    if(!prefersReducedMotion.matches && parallaxContainers.length > 0) {
      requestAnimationFrame(applyParallax);
    }

    // 6. FAQ ACCORDION
    function toggleFaq(button) {
      const item = button.closest('.faq-item');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !isExpanded);
      item.classList.toggle('active');
    }

    // 8. PROCESS TIMELINE STAGGER & CONNECTORS
    const timelineContainer = document.getElementById('timeline-container');
    const timelineLine = document.getElementById('timeline-line');
    const timelineCards = document.querySelectorAll('.timeline-anim');
    
    if(timelineCards.length > 0) {
      timelineCards.forEach(c => {
        c.style.opacity = 0;
        c.style.transform = 'translateY(16px)';
        c.style.transition = 'opacity 500ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)';
      });
      
      const timelineObserver = new IntersectionObserver((entries, observer) => {
        if(entries[0].isIntersecting) {
          if(!prefersReducedMotion.matches) {
            timelineCards.forEach((card, index) => {
              setTimeout(() => {
                card.style.opacity = 1;
                card.style.transform = 'translateY(0)';
              }, index * 120);
            });
            if(timelineLine) {
              timelineLine.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.77, 0, 0.175, 1)';
              timelineLine.style.strokeDashoffset = '0';
            }
          } else {
            timelineCards.forEach(card => {
              card.style.opacity = 1;
              card.style.transform = 'translateY(0)';
            });
            if(timelineLine) timelineLine.style.strokeDashoffset = '0';
          }
          observer.unobserve(timelineContainer);
        }
      }, { threshold: 0.15 });
      timelineObserver.observe(timelineContainer);
    }
    
    // 8.5 SYSTEM DIAGRAM SVG ANIMATION
    const sysDiagramContainer = document.getElementById('system-diagram-container');
    if (sysDiagramContainer) {
      const sysNodes = sysDiagramContainer.querySelectorAll('.sys-anim-node');
      const sysLines = sysDiagramContainer.querySelectorAll('.sys-anim-line');
      
      // Build animation sequence array alternately: Node -> Line -> Node
      const sysSequence = [];
      sysNodes.forEach((node, idx) => {
        sysSequence.push(node);
        if (sysLines[idx]) sysSequence.push(sysLines[idx]);
      });
      
      const sysObserver = new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
          if (!prefersReducedMotion.matches) {
            sysSequence.forEach((el, index) => {
              setTimeout(() => {
                el.style.opacity = 1;
              }, index * 100);
            });
          } else {
            sysSequence.forEach(el => {
              el.style.opacity = 1;
            });
          }
        } else {
          // Reset when scrolling out of view to allow repeated animation
          sysSequence.forEach(el => {
            el.style.opacity = 0;
          });
        }
      }, { threshold: 0.35 });
      
      sysObserver.observe(sysDiagramContainer);
    }

    // 9. CURSOR-AWARE CARDS
    const interactiveCards = document.querySelectorAll('.interactive-card');
    interactiveCards.forEach(card => {
      if(prefersReducedMotion.matches) return;
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = ((x - centerX) / centerX) * 12; // ±12px translate
        const tiltY = ((y - centerY) / centerY) * 12;

        card.style.transform = `translate(${tiltX}px, ${tiltY}px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translate(0px, 0px)';
        card.style.transition = 'transform 300ms cubic-bezier(0, 0, 0.2, 1)';
      });
      
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; // remove transition during movement for smoothness
      });
    });

    // Sticky Nav effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if(window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, {passive: true});

    // Mobile nav drawer
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    function toggleMenu() {
      mobileDrawer.classList.toggle('open');
      drawerOverlay.classList.toggle('open');
    }


    // 10. VANTA.NET HERO BACKGROUND
    if (document.getElementById('hero-vanta') && !prefersReducedMotion.matches) {
      if (!window.vantaHero) {
        window.vantaHero = VANTA.NET({
          el: "#hero-vanta",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xffbb00,
          backgroundColor: 0xffffff,
          points: 12.00,
          maxDistance: 24.00,
          spacing: 16.00,
          showDots: false
        });

        window.addEventListener('resize', () => {
          if (window.vantaHero) window.vantaHero.resize();
        });

        setTimeout(() => {
          if (window.vantaHero) window.vantaHero.resize();
        }, 500);
      }
    }

    // 10.1 VANTA.NET CTA BACKGROUND
    if (document.getElementById('cta-vanta') && !prefersReducedMotion.matches) {
      if (!window.vantaCta) {
        window.vantaCta = VANTA.NET({
          el: "#cta-vanta",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xffbb00,
          backgroundColor: 0xffffff,
          points: 12.00,
          maxDistance: 24.00,
          spacing: 16.00,
          showDots: false
        });

        window.addEventListener('resize', () => {
          if (window.vantaCta) window.vantaCta.resize();
        });

        setTimeout(() => {
          if (window.vantaCta) window.vantaCta.resize();
        }, 500);
      }
    }

    // 9. NUMBER COUNTER ANIMATION
    const counters = document.querySelectorAll('[data-count-to]');
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target;
        const parentReveal = target.closest('[data-reveal]');
        
        if (entry.isIntersecting && !prefersReducedMotion.matches) {
          if (target.isAnimating) return;
          target.isAnimating = true;
          
          // Restore parent visibility if it was reset
          if (parentReveal) {
            parentReveal.style.opacity = 1;
            parentReveal.style.transform = 'translateY(0)';
          }
          
          const endValue = parseInt(target.getAttribute('data-count-to'));
          const duration = 2000;
          const startTime = performance.now();
          
          const format = target.getAttribute('data-format');
          
          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(easeProgress * endValue);
            
            if (format === 'compact') {
              if (currentValue >= 1000000) {
                target.textContent = (currentValue / 1000000).toFixed(1).replace('.0', '') + "MM";
              } else if (currentValue >= 1000) {
                target.textContent = Math.floor(currentValue / 1000) + "k";
              } else {
                target.textContent = currentValue.toString();
              }
            } else {
              target.textContent = currentValue.toLocaleString();
            }
            
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              if (format === 'compact' && endValue >= 1000000) {
                target.textContent = (endValue / 1000000).toFixed(0) + "MM";
              } else {
                target.textContent = endValue.toLocaleString();
              }
              target.isAnimating = false;
            }
          }
          requestAnimationFrame(updateCount);
        } else if (entry.isIntersecting && prefersReducedMotion.matches) {
          if (parentReveal) {
            parentReveal.style.opacity = 1;
            parentReveal.style.transform = 'translateY(0)';
          }
          const endValue = parseInt(target.getAttribute('data-count-to'));
          const format = target.getAttribute('data-format');
          if (format === 'compact' && endValue >= 1000000) {
            target.textContent = (endValue / 1000000).toFixed(0) + "MM";
          } else {
            target.textContent = endValue.toLocaleString();
          }
        } else if (!entry.isIntersecting) {
          // Reset count and reveal state when scrambled out
          target.textContent = "0";
          target.isAnimating = false;
          if (parentReveal) {
            parentReveal.style.opacity = 0;
            parentReveal.style.transform = 'translateY(20px)';
          }
        }
      });
    }, { threshold: 0.1 });
    counters.forEach(c => countObserver.observe(c));
