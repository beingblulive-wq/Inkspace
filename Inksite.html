<!-- New "Fluid Data Stream" Canvas Engine --> 
<script> 
const canvas = document.getElementById('inkling-canvas'); 
const ctx = canvas.getContext('2d'); 
const orb = document.getElementById('inkling-orb'); 
const whisper = document.getElementById('whisper-text'); 
const trigger = 
document.getElementById('inkling-trigger'); 
canvas.width = 700; canvas.height = 700; 
let particles = []; 
let isExploded = false; 
let hasIlluminated = false;  
let animationId; 
let mouseX = canvas.width / 2; 
let mouseY = canvas.height / 2; 
// The Warm Ember Palette + The Single "Silver-Blue 
Glitch" from the comic 
const BASE_COLORS = ['#C94F5C', '#DF7A60', '#F9D77E', 
'#FFFFFF'];  
const GLITCH_COLOR = '#A3C6FF';  
class Particle { 
constructor(isGlitch = false) { 
                this.ox = canvas.width / 2;  
                this.oy = canvas.height / 2; 
                this.x = this.ox;  
                this.y = this.oy; 
                 
                // Assign the special blue color to the glitch 
particle 
                this.color = isGlitch ? GLITCH_COLOR : 
BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)]; 
                this.radius = isGlitch ? 2.5 : Math.random() * 
1.5 + 1; // Glitch is slightly larger 
                 
                // Fluid Orbit variables (replaces the creepy 
swarm logic) 
                this.angle = Math.random() * Math.PI * 2; 
                this.targetRadius = Math.random() * 120 + 40; // 
How far it floats out 
                this.currentRadius = 0; 
                this.orbitSpeed = (Math.random() * 0.02) - 0.01; 
// Slow, graceful orbit 
                this.wobbleSpeed = Math.random() * 0.05; 
                this.wobbleOffset = Math.random() * Math.PI * 2; 
            } 
 
            update() { 
                if (isExploded) { 
                    // Smoothly expand to target radius 
                    this.currentRadius += (this.targetRadius - 
this.currentRadius) * 0.05; 
                     
                    // Rotate slowly 
                    this.angle += this.orbitSpeed; 
                     
                    // Add a gentle breathing/wobble effect 
                    let wobble = Math.sin(Date.now() * 0.001 * 
this.wobbleSpeed + this.wobbleOffset) * 15; 
                     
                    // Slight mouse parallax (gentle breeze, NOT 
a magnetic pull) 
                    let mouseDx = (mouseX - this.ox) * 0.05; 
                    let mouseDy = (mouseY - this.oy) * 0.05; 
 
                    this.x = this.ox + Math.cos(this.angle) * 
(this.currentRadius + wobble) + mouseDx; 
                    this.y = this.oy + Math.sin(this.angle) * 
(this.currentRadius + wobble) + mouseDy; 
 
                } else { 
                    // Smoothly collapse back into the core 
                    this.currentRadius += (0 - 
this.currentRadius) * 0.08; 
                    this.x = this.ox + Math.cos(this.angle) * 
this.currentRadius; 
                    this.y = this.oy + Math.sin(this.angle) * 
this.currentRadius; 
                } 
            } 
 
            draw() { 
                ctx.beginPath(); 
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 
2); 
                ctx.fillStyle = this.color; 
                ctx.fill(); 
                 
                // Glow effect 
                ctx.shadowBlur = this.color === GLITCH_COLOR ? 15 
: 10; 
                ctx.shadowColor = this.color;  
            } 
        } 
 
        function drawFluidConnections() { 
            ctx.shadowBlur = 0;  
            for (let i = 0; i < particles.length; i++) { 
                for (let j = i + 1; j < particles.length; j++) { 
                    let dx = particles[i].x - particles[j].x; 
                    let dy = particles[i].y - particles[j].y; 
                    let dist = Math.sqrt(dx*dx + dy*dy); 
                     
                    // Only connect close particles to create a 
"geometric core" look 
                    if (dist < 60) { 
                        ctx.beginPath();  
                        ctx.moveTo(particles[i].x, 
particles[i].y); 
                        ctx.lineTo(particles[j].x, 
particles[j].y); 
                         
                        let opacity = 1 - (dist / 60); 
                         
                        // If one of the connected points is the 
blue glitch, make the thread silver-blue 
                        if (particles[i].color === GLITCH_COLOR 
|| particles[j].color === GLITCH_COLOR) { 
                            ctx.strokeStyle = `rgba(163, 198, 
255, ${opacity * 0.6})`;  
                        } else { 
                            ctx.strokeStyle = `rgba(223, 122, 96, 
${opacity * 0.3})`;  
                        } 
                         
                        ctx.lineWidth = 0.5;  
                        ctx.stroke(); 
                    } 
                } 
            } 
        } 
 
        function animate() { 
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
             
            let allRecollected = true; 
 
            particles.forEach(p => { 
                p.update();  
                p.draw(); 
                 
                if (p.currentRadius > 2) { 
                    allRecollected = false; 
                } 
            }); 
 
            if (particles.length > 0) drawFluidConnections(); 
 
            // When fully returned to center, restore the CSS 
geometry 
            if (!isExploded && allRecollected && particles.length 
> 0) { 
                orb.style.opacity = '1'; 
                orb.style.transform = 'scale(1)'; 
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                particles = []; 
                cancelAnimationFrame(animationId); 
                return; 
            } 
 
            animationId = requestAnimationFrame(animate); 
        } 
 
        function trackMouse(e) { 
            let rect = canvas.getBoundingClientRect(); 
            let scaleX = canvas.width / rect.width; 
            let scaleY = canvas.height / rect.height; 
            mouseX = (e.clientX - rect.left) * scaleX; 
            mouseY = (e.clientY - rect.top) * scaleY; 
        } 
 
        trigger.addEventListener('click', () => { 
            if (isExploded) return; 
             
            isExploded = true; 
            orb.style.opacity = '0'; 
            orb.style.transform = 'scale(0.5)'; 
            whisper.style.opacity = '0';  
             
            if (!hasIlluminated) { 
                document.body.classList.add('is-illuminated'); 
                hasIlluminated = true; 
            } 
             
            particles = []; 
            // Generate 34 normal embers 
            for (let i = 0; i < 34; i++) {  
                particles.push(new Particle(false));  
            } 
            // Generate 1 Silver-Blue MCP Glitch 
            particles.push(new Particle(true)); 
 
            document.addEventListener('mousemove', trackMouse); 
             
            cancelAnimationFrame(animationId); 
            animate(); 
 
            // Stay open for 8 seconds, then reform 
            setTimeout(() => { 
                isExploded = false; 
                document.removeEventListener('mousemove', 
trackMouse); 
                mouseX = canvas.width / 2; 
mouseY = canvas.height / 2; 
}, 8000); 
}); 
</script>