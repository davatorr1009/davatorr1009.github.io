document.addEventListener('DOMContentLoaded', () => {

    // ─── Scroll Reveal ─────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(
        '.content-box, .project-detail-grid, .project-content'
    ).forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    document.querySelectorAll('.news-grid, .metrics-grid').forEach(el => {
        el.classList.add('reveal-stagger');
        revealObserver.observe(el);
    });

    // ─── Typing effect on tagline subtitle ─────────────────────────
    const typingTarget = document.querySelector('.tagline span[data-type]');
    if (typingTarget) {
        const text = typingTarget.getAttribute('data-type');
        typingTarget.textContent = '';
        typingTarget.classList.add('typing-cursor');
        let i = 0;

        function type() {
            if (i < text.length) {
                typingTarget.textContent += text.charAt(i);
                i++;
                setTimeout(type, 38);
            } else {
                setTimeout(() => typingTarget.classList.remove('typing-cursor'), 1200);
            }
        }
        setTimeout(type, 600);
    }

    // ─── Carousel with prev/next + auto-advance ─────────────────────
    function initCarousel(trackId) {
        const track = document.getElementById(trackId);
        if (!track) return;

        const wrapper = track.closest('.slider-wrapper');
        const slides  = track.querySelectorAll('.slide');
        let index = 0;
        let timer;

        function getSPV() {
            return window.innerWidth < 768 ? 1 : 3;
        }

        function goTo(i) {
            const max = Math.max(0, slides.length - getSPV());
            index = i < 0 ? max : i > max ? 0 : i;
            track.style.transform = `translateX(-${index * (100 / getSPV())}%)`;
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(() => goTo(index + 1), 3000);
        }

        window.addEventListener('resize', () => goTo(0));

        if (wrapper) {
            const btnPrev = wrapper.querySelector('.slider-btn--prev');
            const btnNext = wrapper.querySelector('.slider-btn--next');
            if (btnPrev) btnPrev.addEventListener('click', () => { goTo(index - 1); startAuto(); });
            if (btnNext) btnNext.addEventListener('click', () => { goTo(index + 1); startAuto(); });
        }

        startAuto();
    }

    // Auto-init every carousel on the page
    document.querySelectorAll('.slider-track[id]').forEach(t => initCarousel(t.id));

});
