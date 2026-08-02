
const portal = document.querySelector(".portal");

function pulsePortal() {

    portal.classList.remove("pulse");

    void portal.offsetWidth;

    portal.classList.add("pulse");

}

/* ============================================
   KickOut Login Page - Interactions
   ============================================ */


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