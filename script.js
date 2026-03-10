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
    const sendMessage = () => {
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

        // Simulate Inkling Response after a delay
        setTimeout(() => {
            const inklingMsgHTML = `
                <div class="message inkling-message">
                    <p>I have registered your input: "${text}". Processing architectural directives now. How else may I assist your flow state?</p>
                </div>
            `;
            chatBody.insertAdjacentHTML('beforeend', inklingMsgHTML);
            scrollToBottom();
        }, 1000);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

});
