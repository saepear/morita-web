document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- Helper: Split Text for Animation ---
    const heroTitle = document.querySelector('#hero h1');
    // Ensure we don't duplicate span splitting if re-running
    if (!heroTitle.querySelector('span')) {
        const heroText = heroTitle.innerText;
        heroTitle.innerHTML = heroText.split('').map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    }

    // --- Hero Animation (Updated) ---
    const startBtn = document.getElementById('startBtn');
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');

    // Initial Hero Reveal - Slow and Cinematic
    const heroTimeline = gsap.timeline();

    heroTimeline
        .fromTo('#hero h1 span',
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                stagger: 0.05,
                ease: "power3.out"
            }
        )
        .from('.hero-content p', {
            opacity: 0,
            y: 20,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1")
        .from('#startBtn', {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)"
        }, "-=0.5");

    // --- 3D Tilt Effect on Cards ---
    const cards = document.querySelectorAll('.memory-card, .trait-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
            const rotateY = ((x - centerX) / centerX) * 5;

            gsap.to(card, {
                duration: 0.5,
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: "power1.out"
            });
        });
    });

    // --- Button Interaction ---
    startBtn.addEventListener('click', () => {
        const mainContent = document.getElementById('main-content');

        // Scroll to memories
        gsap.to(window, {
            duration: 1.5,
            scrollTo: "#main-content",
            ease: "power2.inOut",
            onComplete: initScrollAnimations // Start observers after reveal
        });
    });

    // --- Music Toggle ---
    let isPlaying = false;
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.style.opacity = '0.7';
            musicBtn.classList.remove('border-gold');
            musicBtn.classList.add('border-wine/50');
        } else {
            bgMusic.play().catch(e => alert("Interactúa primero con la página o agrega música válida."));
            musicBtn.style.opacity = '1';
            musicBtn.classList.add('border-gold');
            musicBtn.classList.remove('border-wine/50');
        }
        isPlaying = !isPlaying;
    });

    // --- Scroll Animations ---
    function initScrollAnimations() {

        // Section Titles
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 1.5,
                ease: "power3.out"
            });
        });

        // Memory Cards - Staggered Slide In
        gsap.utils.toArray('.memory-card').forEach((card, i) => {
            // Alternating direction based on index (even/odd)
            const xOffset = i % 2 === 0 ? -50 : 50;

            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                x: xOffset,
                y: 30,
                opacity: 0,
                duration: 1.5,
                ease: "power2.out"
            });
        });

        // Trait Cards - Grid Stagger
        gsap.from('.trait-card', {
            scrollTrigger: {
                trigger: '.grid',
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2, // 0.2s delay between each card
            ease: "back.out(1.2)"
        });

        // Meaning Text
        gsap.from('.meaning-content', {
            scrollTrigger: {
                trigger: '.meaning-content',
                start: "top 85%", // Trigger earlier
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 2,
            ease: "power2.out"
        });
    }

    // --- Particle System (Reused & Optimized) ---
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() * 0.2) - 0.1; // Slower, more ambient
            this.speedY = (Math.random() * 0.2) - 0.1;
            this.color = 'rgba(212, 175, 55, ' + (Math.random() * 0.3 + 0.1) + ')'; // Random opacity gold
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 20000; // Lower density for elegance
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // --- Lenis Smooth Scroll ---
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // --- Mouse Spotlight ---
    const spotlight = document.getElementById('spotlight');
    if (spotlight) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(spotlight, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }

    initParticles();
    animateParticles();
});
