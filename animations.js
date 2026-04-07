document.addEventListener('DOMContentLoaded', () => {

    // ─── Dark mode toggle ──────────────────────────────────────────
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(btn);

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        btn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            btn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });

    // ─── Scroll progress bar ───────────────────────────────────────
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
        const scrolled  = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (scrolled / maxScroll * 100) + '%';
    }, { passive: true });

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

    // ─── Counter animation on metric values ────────────────────────
    function animateCounter(el) {
        const original = el.textContent.trim();
        const match = original.match(/(\d+\.?\d*)/);
        if (!match) return;

        const target   = parseFloat(match[1]);
        const before   = original.slice(0, original.indexOf(match[0]));
        const after    = original.slice(original.indexOf(match[0]) + match[0].length);
        const isFloat  = match[0].includes('.');
        const duration = 1400;
        const fps      = 60;
        const steps    = Math.round(duration / (1000 / fps));
        let   current  = 0;
        let   frame    = 0;

        const timer = setInterval(() => {
            frame++;
            // Ease-out: fast start, slow finish
            const progress = 1 - Math.pow(1 - frame / steps, 3);
            current = target * progress;

            const display = isFloat
                ? current.toFixed(1)
                : Math.round(current);

            el.textContent = before + display + after;

            if (frame >= steps) {
                el.textContent = original;
                clearInterval(timer);
            }
        }, 1000 / fps);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.metric-value').forEach(el => {
        counterObserver.observe(el);
    });

});
