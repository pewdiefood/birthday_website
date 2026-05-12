document.addEventListener('DOMContentLoaded', () => {
    const letterIcon = document.getElementById('letterIcon');
    const container = document.getElementById('container');
    const initialContent = document.getElementById('initialContent');
    const birthdayContent = document.getElementById('birthdayContent');
    const confettiToggleBtn = document.getElementById('confettiToggleBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const bgMusic = document.getElementById('bgMusic');
    const body = document.body;

    // ---------- EMOJI SHOWER (instead of hearts) ----------
    let animationActive = false;
    let animationFrameId = null;
    let emojis = [];
    let canvas = null;
    let ctx = null;

    // Array of birthday/celebration emojis
    const celebrationEmojis = [
        '🎉', '🎊', '🎈', '🎂', '🥳', '✨', '🎁', '🎀',
        '🕺', '💃', '🍾', '🥂', '💖', '❤️', '🧁', '🎶',
        '🌟', '⭐', '💐', '🌸', '🌺'
    ];

    function setupCanvas() {
        canvas = document.getElementById('heartCanvas');
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    class FloatingEmoji {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 24 + 16; // slightly larger
            this.speed = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.angle = Math.random() * Math.PI * 2;
            this.wobble = Math.random() * 0.03;
            this.emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
        }

        draw() {
            ctx.save();
            ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.globalAlpha = this.opacity;
            ctx.fillText(this.emoji, this.x, this.y);
            ctx.restore();
        }

        update() {
            this.y -= this.speed;
            this.x += Math.sin(this.angle) * this.wobble;
            this.angle += 0.02;
            return this.y + this.size > 0;
        }
    }

    function animateEmojis() {
        if (!animationActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < emojis.length; i++) {
            emojis[i].draw();
            const alive = emojis[i].update();
            if (!alive) {
                emojis.splice(i, 1);
                i--;
            }
        }

        if (emojis.length < 100) {
            emojis.push(new FloatingEmoji());
        }

        animationFrameId = requestAnimationFrame(animateEmojis);
    }

    function startConfetti() {
        if (animationActive) return;
        animationActive = true;
        emojis = [];
        for (let i = 0; i < 80; i++) {
            emojis.push(new FloatingEmoji());
        }
        animateEmojis();
        if (confettiToggleBtn) {
            confettiToggleBtn.textContent = 'Stop Confetti 🎉';
        }
    }

    function stopConfetti() {
        if (!animationActive) return;
        animationActive = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        emojis = [];
        if (confettiToggleBtn) {
            confettiToggleBtn.textContent = 'Resume Confetti 🎊';
        }
    }

    function resumeConfetti() {
        if (animationActive) return;
        startConfetti();
    }

    function toggleConfetti() {
        if (animationActive) {
            stopConfetti();
        } else {
            resumeConfetti();
        }
    }

    // ---------- MUSIC CONTROLS ----------
    let musicPlaying = false;

    function startMusic() {
        if (!bgMusic) return;
        bgMusic.play().then(() => {
            musicPlaying = true;
            if (musicToggleBtn) musicToggleBtn.textContent = 'Pause Music 🎵';
        }).catch(err => console.log("Audio play failed:", err));
    }

    function stopMusic() {
        if (!bgMusic) return;
        bgMusic.pause();
        musicPlaying = false;
        if (musicToggleBtn) musicToggleBtn.textContent = 'Play Music 🎵';
    }

    function toggleMusic() {
        if (musicPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    }

    // ---------- BIRTHDAY REVEAL (triggered by mailbox click) ----------
    function revealBirthday() {
        if (birthdayContent.style.display === 'block') return;

        // Change background to solid pink
        body.style.backgroundColor = "#ffe4e1";
        container.classList.add('expanded');
        initialContent.style.display = 'none';
        birthdayContent.style.display = 'block';

        // Start confetti and music
        startConfetti();
        startMusic();
    }

    // ---------- EVENT LISTENERS ----------
    if (confettiToggleBtn) {
        confettiToggleBtn.addEventListener('click', toggleConfetti);
    }
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleMusic);
    }
    if (letterIcon) {
        letterIcon.addEventListener('click', revealBirthday);
    }

    setupCanvas();

    // ---------- MAKE EXTRA PHOTOS CLICKABLE (popup) ----------
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        document.querySelectorAll('.extra-photos-grid img').forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.style.display = 'flex';
                modalImg.src = img.src;
            });
        });
        modal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // ---------- NEW: CUTE BUTTON SPINS VIDEO & REVEALS PICTURES ----------
    document.querySelectorAll('.cute-spin-btn').forEach(button => {
        let isOpen = false; // each button tracks its own entry's grid visibility

        button.addEventListener('click', (e) => {
            e.stopPropagation();

            // Find the parent .timeline-entry
            const entry = button.closest('.timeline-entry');
            if (!entry) return;

            // 1) Spin the video inside this entry
            const video = entry.querySelector('.timeline-video');
            if (video) {
                video.classList.add('spin');
                setTimeout(() => video.classList.remove('spin'), 400);
            }

            // 2) Show/hide the extra photos grid inside this entry
            const extraGrid = entry.querySelector('.extra-photos-grid');
            if (extraGrid) {
                if (isOpen) {
                    extraGrid.style.display = 'none';
                } else {
                    extraGrid.style.display = 'grid';
                }
                isOpen = !isOpen;
            }
        });
    });
});