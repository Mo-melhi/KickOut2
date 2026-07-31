
const portal = document.querySelector(".portal");

function pulsePortal() {

    portal.classList.remove("pulse");

    void portal.offsetWidth;

    portal.classList.add("pulse");

}

/* ============================================
   KickOut Login Page - Interactions
   ============================================ */

// Mouse Parallax on Illustration

const parallaxWrapper = document.getElementById('parallaxWrapper');
const illustrationSide = document.getElementById('illustrationSide');

if (illustrationSide && parallaxWrapper) {
    illustrationSide.addEventListener('mousemove', (e) => {
        const rect = illustrationSide.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const layers = parallaxWrapper.querySelectorAll('.parallax-layer');
        layers.forEach((layer) => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.02;
            const moveX = x * speed * 100;
            const moveY = y * speed * 100;
            layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    illustrationSide.addEventListener('mouseleave', () => {
        const layers = parallaxWrapper.querySelectorAll('.parallax-layer');
        layers.forEach((layer) => {
            layer.style.transition = 'transform 0.5s ease-out';
            layer.style.transform = 'translate(0, 0)';
            setTimeout(() => {
                layer.style.transition = '';
            }, 500);
        });
    });
}

// Form Submission Prevention (demo)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('.arcade-btn__face');
        const originalText = btn.textContent;
        btn.textContent = '...جاري الدخول';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.opacity = '1';
        }, 2000);
    });
}

// Input Focus Animation Enhancement
const inputs = document.querySelectorAll('.form-input');
inputs.forEach((input) => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

const container = document.querySelector(".particles");

function createParticle() {
    const containerHeight = container.clientHeight;

    const particle = document.createElement("div");

    let x = -50;
    let hasPulsed = false;
    const margin = 20;
    const y = margin + Math.random() * (container.clientHeight - margin * 2);

    let currentY = y;
    const drift = (Math.random() - 0.5) * 0.35;



    const size = 3 + Math.random() * 5;

    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.opacity = 0.4 + Math.random() * 0.6;



    particle.className = "particle";




    particle.style.left = x + "px";

    particle.style.top = y + "px";

    container.appendChild(particle);

    const speed = 0.4 + Math.random() * 0.8;

    function move() {

        x += speed;

        currentY += drift;

        particle.style.top = currentY + "px";

        particle.style.left = x + "px";

        if (x < -2) {

            particle.style.background = "#FFFFFF";

        }
        else if (x < 2) {

            particle.style.background = "#60A5FA"; // brighter blue

            particle.style.boxShadow =
                "0 0 8px #60A5FA, 0 0 16px #3B82F6";

            if (!hasPulsed) {

                pulsePortal();
                hasPulsed = true;

            }

        }
        else {

            particle.style.background = "#1F2937";
            particle.style.boxShadow = "none";

        }

        if (x > 55) {
            particle.style.opacity = Math.max(0, (80 - x) / 25);
        }

        if (x > 80) {
            particle.remove();
        }

        requestAnimationFrame(move);

    }

    move();

}

setInterval(createParticle, 100);

const authSlider = document.getElementById("authSlider");
const createAccountBtn = document.querySelector(".create-link");

createAccountBtn.addEventListener("click", (e) => {
    e.preventDefault();
    authSlider.classList.add("active");
});

const backToLoginBtn = document.querySelector(".back-to-login");

backToLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    authSlider.classList.remove("active");
});