// Holon AI - script.js

// 1. Global Inkling Communication Bridge
window.sendMessage = async (text, context = "general") => {
    if (!text.trim()) return "";
    
    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, context: context })
        });

        if (!response.ok) throw new Error("API Connection Failed");

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Orchestrator Error:", error);
        throw error;
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // 2. Initial Load Animations
    setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.remove('hidden-onload');
            navbar.style.animation = 'fadeUpIn 1s forwards cubic-bezier(0.16, 1, 0.3, 1)';
        }
    }, 100);

    // 3. Scroll Intersection Observer for Fade Up Animations
    const fadeObserverOptions = {
        root: null,
        margin: '0px',
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

    // 4. Navbar Background Blur on Scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(4, 5, 10, 0.85)';
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
            } else {
                navbar.style.background = 'rgba(7, 9, 19, 0.6)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // 5. Smooth Scrolling for Anchor Links
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

    // 6. Persistent Inkling FAB Chat Widget
    // This part injects the chat widget if it doesn't already exist (for rooms)
    const setupPersistentChat = () => {
        if (document.getElementById('inklingChatContainer')) return;

        // Create Container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'inklingChatContainer';
        chatContainer.innerHTML = `
            <style>
                #inklingFab {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 1000;
                    transition: transform 0.3s ease;
                    /* Glowing Blue Orb */
                    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), #6A8FE6 40%, #4A6FD0 70%, #3A5FC0 100%);
                    box-shadow: 0 0 20px rgba(106, 143, 230, 0.5), 0 0 50px rgba(106, 143, 230, 0.2), inset 0 -4px 8px rgba(0,0,0,0.15);
                    border: none;
                    animation: orbPulse 3s infinite alternate ease-in-out;
                }
                #inklingFab:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 30px rgba(106, 143, 230, 0.7), 0 0 70px rgba(106, 143, 230, 0.35);
                }
                @keyframes orbPulse {
                    0% { box-shadow: 0 0 15px rgba(106,143,230,0.4), 0 0 40px rgba(106,143,230,0.15); }
                    100% { box-shadow: 0 0 25px rgba(106,143,230,0.6), 0 0 60px rgba(106,143,230,0.3); }
                }
                
                #inklingChatWindow {
                    position: fixed;
                    bottom: 6.5rem;
                    right: 2rem;
                    width: 350px;
                    height: 500px;
                    background: #F7F3EC;
                    border: 1px solid #DDE1E6;
                    border-radius: 16px;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                    z-index: 1000;
                    font-family: 'Inter', sans-serif;
                }
                #inklingChatWindow.active { display: flex; animation: slideUp 0.4s ease; }
                
                .chat-header {
                    background: #1A1A1A;
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chat-body {
                    flex-grow: 1;
                    padding: 1rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .chat-footer {
                    padding: 1rem;
                    border-top: 1px solid #DDE1E6;
                    display: flex;
                    gap: 0.5rem;
                }
                .chat-footer input {
                    flex-grow: 1;
                    border: 1px solid #DDE1E6;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    outline: none;
                }
                .message {
                    max-width: 85%;
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                .user-message {
                    align-self: flex-end;
                    background: #1A1A1A;
                    color: white;
                    border-bottom-right-radius: 2px;
                }
                .inkling-message {
                    align-self: flex-start;
                    background: white;
                    color: #1A1A1A;
                    border: 1px solid #DDE1E6;
                    border-bottom-left-radius: 2px;
                }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            </style>
            
            <div id="inklingFab" title="Talk to Inkling"></div>
            
            <div id="inklingChatWindow">
                <div class="chat-header">
                    <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-style: italic;">Inkling Assistant</span>
                    <button id="closeChat" style="background:none; border:none; color:white; cursor:pointer; font-size: 1.2rem;">&times;</button>
                </div>
                <div class="chat-body" id="chatBody">
                    <div class="message inkling-message">
                        I am here. How can I help you in the ${document.title.split(' - ')[0]}?
                    </div>
                </div>
                <div class="chat-footer">
                    <input type="text" id="fabChatInput" placeholder="Type a message...">
                    <button id="fabSend" style="background:none; border:none; cursor:pointer; font-weight:600;">&rarr;</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);

        const fab = document.getElementById('inklingFab');
        const win = document.getElementById('inklingChatWindow');
        const close = document.getElementById('closeChat');
        const input = document.getElementById('fabChatInput');
        const body = document.getElementById('chatBody');
        const send = document.getElementById('fabSend');

        fab.onclick = () => win.classList.toggle('active');
        close.onclick = () => win.classList.remove('active');

        const appendMsg = (text, isUser) => {
            const div = document.createElement('div');
            div.className = `message ${isUser ? 'user-message' : 'inkling-message'}`;
            div.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        };

        const handleFabSend = async () => {
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            appendMsg(text, true);
            
            const context = document.title.toLowerCase().includes("engine") ? "engine room" : 
                            document.title.toLowerCase().includes("vault") ? "vault" : "sanctuary";

            try {
                const reply = await window.sendMessage(text, context);
                appendMsg(reply, false);
            } catch (e) {
                appendMsg("I have lost my connection to the vault.", false);
            }
        };

        send.onclick = handleFabSend;
        input.onkeypress = (e) => { if(e.key === 'Enter') handleFabSend(); };
    };

    // Only setup FAB if the page doesn't have its own chat input (landing page and refactored rooms)
    if (document.getElementById('chatInput')) {
        // Hero or room chat already exists
    } else {
        setupPersistentChat();
    }

});
