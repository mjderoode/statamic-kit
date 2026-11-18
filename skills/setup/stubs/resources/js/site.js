// Mobile navigation drawer. The markup carries no `hidden` attribute: below lg the
// drawer is closed by a class (max-lg:hidden) and opened by data-open, and from lg
// up the rail is always visible, with or without JavaScript.
const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        nav.toggleAttribute('data-open', open);
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Never leave the drawer state stranded when resizing up into the desktop layout.
    window.matchMedia('(min-width: 64rem)').addEventListener('change', (event) => {
        if (event.matches) {
            setOpen(false);
        }
    });
}

// Click-to-load YouTube. The thumbnail loads with the page; the player loads only after a click.
document.querySelectorAll('.video-embed').forEach((embed) => {
    const button = embed.querySelector('button');

    button?.addEventListener('click', () => {
        const id = embed.dataset.youtubeId;
        const frame = document.createElement('iframe');

        frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        frame.title = button.textContent.trim();
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        frame.className = 'absolute inset-0 size-full';

        embed.replaceChildren(frame);
        frame.focus();
    });
});
