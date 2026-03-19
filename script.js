// Holon AI - script.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Load Animations
    setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        navbar.classList.remove('hidden-onload');
        navbar.style.animation = 'fadeUpIn 1s forwards cubic-bezier(0.16, 1, 0.3, 1)';
    }, 100);

    // 2. Scroll Intersection Observer for Fade Up Animations
    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, fadeObserverOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => fadeObserver.observe(el));

    // 3. Navbar Background Blur on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(4, 5, 10, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(7, 9, 19, 0.6)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 5. Hero Parallax Effect
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            if (scrollPos < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrollPos * 0.4}px)`;
            }
        });
    }

    // 6. Inkling Chat Widget Logic
    const inklingFab = document.getElementById('inklingFab');
    const inklingChatWindow = document.getElementById('inklingChatWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBody = document.getElementById('chatBody');

    // Toggle Chat Window
    inklingFab.addEventListener('click', () => {
        inklingChatWindow.classList.toggle('active');
        if (inklingChatWindow.classList.contains('active')) {
            setTimeout(() => chatInput.focus(), 300);
        }
    });

    closeChatBtn.addEventListener('click', () => {
        inklingChatWindow.classList.remove('active');
    });

    // Handle Sending Messages
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (text === '') return;

        // User Message HTML
        const userMsgHTML = `
            <div class="message user-message">
                <p>${text}</p>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', userMsgHTML);
        chatInput.value = '';
        scrollToBottom();

        // Fetch from Orchestrator API
        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error("API Connection Failed");

            const data = await response.json();
            
            const inklingMsgHTML = `
                <div class="message inkling-message">
                    <p>${data.reply.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            chatBody.insertAdjacentHTML('beforeend', inklingMsgHTML);
            scrollToBottom();
        } catch (error) {
            console.error(error);
            const errorMsgHTML = `
                <div class="message inkling-message">
                    <p>I seem to have lost my connection to the Orchestrator. The Sanctuary remains silent for now.</p>
                </div>
            `;
            chatBody.insertAdjacentHTML('beforeend', errorMsgHTML);
            scrollToBottom();
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 7. Holon Particle Engine
    const canvas = document.getElementById('holonCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let width = 300;
        let height = 300;
        canvas.width = width;
        canvas.height = height;

        const particles = [];
        const particleCount = 80;
        
        // Brand colors for the particles
        const colorBlue = 'rgba(79, 209, 197, '; // --accent-blue
        const colorGold = 'rgba(226, 185, 92, '; // --accent-gold

        // Interaction state
        let mouse = { x: width / 2, y: height / 2, active: false };

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
            canvas.style.cursor = 'pointer'; // indicates it's interactive
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 1.8 + 0.5;
                // Randomly assign bio-electric blue or structural gold
                this.baseColor = Math.random() > 0.4 ? colorBlue : colorGold;
            }

            update() {
                // Gentle gravity pulling particles toward the center mass (Holon)
                const dxCenter = (width / 2) - this.x;
                const dyCenter = (height / 2) - this.y;
                this.vx += dxCenter * 0.0004;
                this.vy += dyCenter * 0.0004;

                // Mouse repulsion: simulating the fracture/split into individual Inklings
                if (mouse.active) {
                    const dxMouse = mouse.x - this.x;
                    const dyMouse = mouse.y - this.y;
                    const distMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);
                    
                    if (distMouse < 90) { // Repulsion radius
                        const force = (90 - distMouse) / 90;
                        this.vx -= (dxMouse / distMouse) * force * 2;
                        this.vy -= (dyMouse / distMouse) * force * 2;
                    }
                }

                // Apply velocity and friction (viscosity feeling)
                this.vx *= 0.95;
                this.vy *= 0.95;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.baseColor + '0.9)';
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateHolon() {
            // Clear frame
            ctx.clearRect(0, 0, width, height);

            // Update & Draw Particles
            particles.forEach(p => p.update());

            // Connect nearest-neighbor particles (Interconnected Geometry)
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < 45) { // Connection threshold
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        // Dynamic opacity based on proximity (closer = brighter)
                        const opacity = Math.pow(1 - (dist / 45), 1.5);
                        
                        // Mix wire color based on connection
                        ctx.strokeStyle = `rgba(160, 174, 192, ${opacity * 0.4})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
                
                // Draw nodes on top of lines
                particles[i].draw();
            }
            requestAnimationFrame(animateHolon);
        }

        animateHolon();
    }

});
