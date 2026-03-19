// Simple Fade-in on Scroll
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => observer.observe(card));

// Hover Parallax for Hero Image
const heroVisual = document.querySelector('.hero-visual');
document.addEventListener('mousemove', (e) => {
    let x = (window.innerWidth / 2 - e.pageX) / 30;
    let y = (window.innerHeight / 2 - e.pageY) / 30;
    heroVisual.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});