// Theme toggle, nav border on scroll, and current-section highlight.
(() => {
    const root = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    const icon = toggle && toggle.querySelector('i');
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : media.matches;
    const syncIcon = () => {
        if (!icon) return;
        icon.className = isDark() ? 'ph ph-sun' : 'ph ph-moon';
        toggle.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
    };

    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = isDark() ? 'light' : 'dark';
            root.dataset.theme = next;
            try { localStorage.setItem('theme', next); } catch (e) {}
            syncIcon();
        });
        media.addEventListener('change', syncIcon);
        syncIcon();
    }

    const nav = document.querySelector('.site-nav');
    const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const links = [...document.querySelectorAll('.nav-links a')];
    const sections = links
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + entry.target.id));
                links.forEach(a => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => observer.observe(s));
    }

    // Videos marked data-speed play faster by default (the viewer can still change it).
    document.querySelectorAll('video[data-speed]').forEach(v => {
        const rate = parseFloat(v.dataset.speed) || 1;
        const apply = () => { v.defaultPlaybackRate = rate; v.playbackRate = rate; };
        apply();
        v.addEventListener('loadedmetadata', apply);
    });

    // Image viewer: links to images open in an in-page dialog instead of a new tab.
    // Arrow keys move between images of the same project; Esc or a click outside closes.
    const isImage = a => /\.(png|jpe?g|webp)$/i.test(a.getAttribute('href') || '');
    const triggers = [...document.querySelectorAll('main a[href]')].filter(isImage);
    if (!triggers.length || typeof HTMLDialogElement !== 'function') return;

    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
        <figure class="lightbox-figure">
            <img alt="">
            <figcaption></figcaption>
        </figure>
        <button class="lightbox-btn lightbox-close" type="button" aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button>
        <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image"><i class="ph ph-caret-left" aria-hidden="true"></i></button>
        <button class="lightbox-btn lightbox-next" type="button" aria-label="Next image"><i class="ph ph-caret-right" aria-hidden="true"></i></button>
        <a class="lightbox-open" target="_blank" rel="noopener">Open full size <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>`;
    document.body.appendChild(dialog);

    const img = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    const openFull = dialog.querySelector('.lightbox-open');
    const prevBtn = dialog.querySelector('.lightbox-prev');
    const nextBtn = dialog.querySelector('.lightbox-next');
    let group = [];
    let index = 0;
    let opener = null;

    const captionFor = a => {
        const holder = a.closest('figure, li');
        const text = holder && holder.querySelector('figcaption, span');
        const thumb = a.querySelector('img');
        return (text && text.textContent.trim()) || (thumb && thumb.alt) || '';
    };

    const show = i => {
        index = (i + group.length) % group.length;
        const a = group[index];
        const thumb = a.querySelector('img');
        img.src = a.getAttribute('href');
        img.alt = thumb ? thumb.alt : '';
        caption.textContent = captionFor(a);
        openFull.href = a.getAttribute('href');
        const many = group.length > 1;
        prevBtn.hidden = !many;
        nextBtn.hidden = !many;
    };

    triggers.forEach(a => {
        a.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            opener = a;
            const scope = a.closest('article') || a.closest('section') || document.body;
            group = triggers.filter(t => scope.contains(t));
            show(group.indexOf(a));
            dialog.showModal();
        });
    });

    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && group.length > 1) { e.preventDefault(); show(index - 1); }
        if (e.key === 'ArrowRight' && group.length > 1) { e.preventDefault(); show(index + 1); }
    });
    // Touch: swipe left/right to change image, swipe down to close.
    let touchStart = null;
    dialog.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) { touchStart = null; return; }
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    dialog.addEventListener('touchend', e => {
        if (!touchStart) return;
        const dx = e.changedTouches[0].clientX - touchStart.x;
        const dy = e.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && group.length > 1) show(dx < 0 ? index + 1 : index - 1);
        else if (dy > 80 && dy > Math.abs(dx) * 1.5) dialog.close();
    }, { passive: true });

    dialog.addEventListener('close', () => {
        img.removeAttribute('src');
        if (opener) opener.focus({ preventScroll: true });
    });
})();
