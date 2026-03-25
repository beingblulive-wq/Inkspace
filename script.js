document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Card Flip & Parallax Tilt Logic
    const cards = document.querySelectorAll('.story-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });

        card.addEventListener('mousemove', (e) => {
            if (card.classList.contains('flipped')) {
                card.style.transform = 'rotateY(180deg)'; // Keep flip state
                return;
            }
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (centerY - y) / 10;
            const rotateY = (x - centerX) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('flipped')) {
                card.style.transform = 'rotateY(180deg)';
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            }
        });
    });

    // 2. Orb Navigation (Scroll to Row)
    const orbs = document.querySelectorAll('.orb');
    orbs.forEach(orb => {
        orb.addEventListener('click', () => {
            const rowId = orb.getAttribute('data-row');
            const targetRow = document.getElementById(rowId);
            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Visual Pulse
            orb.classList.add('orb-clicking');
            setTimeout(() => { orb.classList.remove('orb-clicking'); }, 400);
        });
    });

    // 3. Next Orb Logic
    const nextOrb = document.querySelector('.orb-next');
    if (nextOrb) {
        nextOrb.addEventListener('click', () => {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        });
    }

    // 4. Inkling Typewriter Greeting
    const greetingText = document.querySelector('.greeting-text');
    if (greetingText) {
        const fullText = greetingText.innerText;
        greetingText.innerText = '';
        let i = 0;
        function typeWriter() {
            if (i < fullText.length) {
                greetingText.innerHTML += fullText.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        }
        typeWriter();
    }

    // 5. Living Inkling (Mascot) Implementation
    const mascotContainer = document.querySelector('.avatar-container');
    if (mascotContainer) {
        const canvas = document.getElementById('inkling-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 140;
        canvas.height = 140;
        
        let particles = [];
        let state = 'orb'; 
        const mouse = { x: null, y: null };
        const colors = {
            primary: '#D4A857', // Accent Gold / Rose Gold
            glow: 'rgba(212, 168, 87, 0.4)',
            spark: '#ffffff'
        };
        
        mascotContainer.addEventListener('mousemove', (e) => {
            const rect = mascotContainer.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        mascotContainer.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        mascotContainer.addEventListener('click', () => {
            if (state === 'orb') {
                state = 'bursting';
                // Trigger "Spark" burst
                for(let i=0; i<30; i++) {
                    particles.push(new Particle(true));
                }
                setTimeout(() => { state = 'living'; }, 600);
            }
        });

        class Particle {
            constructor(isSpark = false) {
                this.isSpark = isSpark;
                this.init();
            }

            init() {
                this.x = canvas.width / 2;
                this.y = canvas.height / 2;
                this.size = Math.random() * 3 + 1;
                const angle = Math.random() * Math.PI * 2;
                const force = this.isSpark ? Math.random() * 8 + 4 : Math.random() * 3 + 1;
                this.speedX = Math.cos(angle) * force;
                this.speedY = Math.sin(angle) * force;
                this.life = 1.0;
                this.decay = Math.random() * 0.02 + 0.01;
                this.color = this.isSpark ? colors.spark : colors.primary;
            }

            update() {
                if (state === 'living' || state === 'bursting') {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    this.speedX *= 0.96;
                    this.speedY *= 0.96;

                    // Living drift
                    if (state === 'living') {
                        this.speedX += (Math.random() - 0.5) * 0.2;
                        this.speedY += (Math.random() - 0.5) * 0.2;

                        // Mouse attraction
                        if (mouse.x !== null && mouse.y !== null) {
                            let dx = mouse.x - this.x;
                            let dy = mouse.y - this.y;
                            let dist = Math.sqrt(dx*dx + dy*dy);
                            if (dist < 60) {
                                this.speedX += dx * 0.02;
                                this.speedY += dy * 0.02;
                            }
                        }
                        
                        // Containment
                        const distFromCenter = Math.sqrt(Math.pow(this.x - canvas.width/2, 2) + Math.pow(this.y - canvas.height/2, 2));
                        if (distFromCenter > 60) {
                            this.speedX += (canvas.width/2 - this.x) * 0.01;
                            this.speedY += (canvas.height/2 - this.y) * 0.01;
                        }
                    }

                    if (this.isSpark) {
                        this.life -= this.decay;
                    }
                }
            }

            draw() {
                ctx.globalAlpha = this.isSpark ? this.life : 0.8;
                ctx.fillStyle = this.color;
                
                // Geometric Shard Shape
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size*1.5, this.y);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.lineTo(this.x - this.size*0.5, this.y);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        function init() {
            particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle());
            }
        }

        function drawOrb() {
            const time = Date.now() * 0.002;
            const pulse = Math.sin(time) * 5;
            
            ctx.shadowBlur = 30 + pulse;
            ctx.shadowColor = colors.primary;
            ctx.fillStyle = colors.primary;
            
            // Draw geometric core orb
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 20 + pulse/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (state === 'orb') {
                drawOrb();
            } else {
                particles.forEach((p, index) => {
                    p.update();
                    p.draw();
                    if (p.isSpark && p.life <= 0) {
                        particles.splice(index, 1);
                    }
                });
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();
    }
});