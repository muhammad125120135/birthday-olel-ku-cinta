import { animate, scroll, inView, stagger, press, hover } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

// Endpoint Formspree aktif
const FORMSPREE_URL = "https://formspree.io/f/xjywljqn";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_SILKY = [0.22, 1, 0.36, 1];
const EASE_FOLD_CLOSE = [0.32, 0, 0.2, 1];
const SPRING_SNAPPY = { type: "spring", stiffness: 340, damping: 26 };
const SPRING_BOUNCY = { type: "spring", stiffness: 250, damping: 20 };

function motionPlay(target, keyframes, options) {
    if (!target || prefersReducedMotion) return null;
    try {
        return animate(target, keyframes, options);
    } catch (_) {
        return null;
    }
}

function applySmoothFloat(selector, frames, duration = 4.4, delayOffset = 0) {
    if (prefersReducedMotion) return;
    document.querySelectorAll(selector).forEach((el, idx) => {
        motionPlay(el, frames, {
            duration,
            delay: delayOffset + idx * 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
        });
    });
}

/* ==========================================
   0A. ANTI-BLUE TAP / SELECTION GUARD
   ========================================== */
function initNoBlueTapGuard() {
    document.addEventListener("selectstart", (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
    });

    document.addEventListener("pointerup", (e) => {
        const interactive = e.target && e.target.closest("button, a, [onclick], .jar, .envelope-card, .bouquet-box, .cake-box");
        if (interactive && typeof interactive.blur === "function") {
            requestAnimationFrame(() => interactive.blur());
        }
    }, { passive: true });
}
initNoBlueTapGuard();

/* ==========================================
   0B. PRELOAD & VERIFIKASI ASET GAMBAR (HEADER & TOMBOL PAUSE/PLAY)
   ========================================== */
const BURST_FLOWER_IMAGES = [
    "static/flower 1.png",
    "static/flower 2.png",
    "static/flower 3.png",
    "static/flower 4.png",
    "static/flower 5.png"
];

[
    "static/di samping kiri jar.png",
    "static/di samping kanan jar.png",
    ...BURST_FLOWER_IMAGES
].forEach((src) => {
    const img = new Image();
    img.src = src;
});

function resolveFirstAvailableImage(candidates, onResult) {
    let idx = 0;
    function tryNext() {
        if (idx >= candidates.length) {
            onResult(null);
            return;
        }
        const candidate = candidates[idx++];
        const probe = new Image();
        probe.onload = () => {
            if (probe.naturalWidth > 0) {
                onResult(candidate);
            } else {
                tryNext();
            }
        };
        probe.onerror = () => tryNext();
        probe.src = candidate;
    }
    tryNext();
}

function initHeaderPortraitAsset() {
    const headerImg = document.getElementById("header-portrait-img");
    if (!headerImg) return;
    const fallbackBadge = headerImg.nextElementSibling;

    resolveFirstAvailableImage(
        ["static/foto_utama.png", "static/header.png", "static/di samping kiri jar.png"],
        (validSrc) => {
            if (validSrc) {
                headerImg.src = validSrc;
                headerImg.style.display = "block";
                if (fallbackBadge) fallbackBadge.style.display = "none";
            } else {
                headerImg.style.display = "none";
                if (fallbackBadge) fallbackBadge.style.display = "flex";
            }
        }
    );
}
initHeaderPortraitAsset();

/* ==========================================
   1. MOTION: SCROLL, SILKY FLOAT & GESTURES
   ========================================== */
if (!prefersReducedMotion) {
    scroll(animate("#scroll-progress", { scaleX: [0, 1] }, { ease: "linear" }));

    scroll(
        animate(".header-cutout-badge", { y: [-6, 14] }, { ease: "linear" }),
        { target: document.querySelector(".header-area"), offset: ["start end", "end start"] }
    );

    scroll(
        animate(".left-wing", { y: [14, -14] }, { ease: "linear" }),
        { target: document.getElementById("jar-section"), offset: ["start end", "end start"] }
    );

    scroll(
        animate(".right-wing", { y: [14, -14] }, { ease: "linear" }),
        { target: document.getElementById("jar-section"), offset: ["start end", "end start"] }
    );

    applySmoothFloat(
        ".header-cutout-img",
        {
            rotate: [-2.2, 2.5],
            y: [0, -9],
            scale: [1, 1.025]
        },
        4.2,
        0
    );

    motionPlay("#envelope-card", { opacity: [0, 1], y: [24, 0], scale: [0.95, 1] }, { duration: 0.75, ease: EASE_SILKY });

    hover("#envelope-card", (el) => {
        motionPlay(el, { y: -7, scale: 1.025 }, SPRING_SNAPPY);
        return () => motionPlay(el, { y: 0, scale: 1 }, SPRING_SNAPPY);
    });

    press(".btn-glass-pink, .opt-btn, .btn-sb-nav, .sb-pink-tab, .btn-circle-play, .btn-speed", (el) => {
        motionPlay(el, { scale: 0.94 }, { type: "spring", stiffness: 480, damping: 26 });
        return () => motionPlay(el, { scale: 1 }, SPRING_SNAPPY);
    });

    inView(".motion-section", (section) => {
        const items = section.querySelectorAll(".motion-item");
        motionPlay(
            items,
            { opacity: [0, 1], y: [24, 0], scale: [0.98, 1] },
            { duration: 0.65, delay: stagger(0.08), ease: EASE_SILKY }
        );
    }, { amount: 0.14 });
}

/* ==========================================
   2. LATAR BELAKANG ASCII KUNANG-KUNANG & KELOPAK (CANVAS)
   ========================================== */
const canvas = document.getElementById("fireflies-canvas");
const ctx = canvas.getContext("2d", { alpha: true });

function createGlowSprite(r, g, b) {
    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 32;
    const sCtx = sprite.getContext("2d");
    const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
    grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.28)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 32, 32);
    return sprite;
}

const ASCII_PALETTES = [
    { color: "#ff94c2", sprite: createGlowSprite(255, 130, 190) },
    { color: "#ffd97d", sprite: createGlowSprite(255, 220, 130) },
    { color: "#d8b4fe", sprite: createGlowSprite(192, 132, 252) }
];

const ASCII_RAMP = [".", ":", "+", "*", "#", "@"];
const ASCII_ACCENTS = ["✦", "✿", "♥", "*"];
const WAVE_CHARS = [" ", ".", "·", ":", "+", "*"];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas, { passive: true });
resizeCanvas();

const asciiFireflies = Array.from({ length: 42 }, () => {
    const palette = ASCII_PALETTES[Math.floor(Math.random() * ASCII_PALETTES.length)];
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.floor(Math.random() * 7) + 12,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35 - 0.14,
        alpha: Math.random(),
        va: Math.random() * 0.012 + 0.004,
        growing: Math.random() > 0.5,
        isAccent: Math.random() < 0.25,
        accentChar: ASCII_ACCENTS[Math.floor(Math.random() * ASCII_ACCENTS.length)],
        color: palette.color,
        sprite: palette.sprite
    };
});

let asciiWaveTime = 0;

function animateFireflies() {
    if (!document.hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        asciiWaveTime += 0.018;

        const gridStep = 34;
        ctx.font = '12px "Courier New", monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let gx = gridStep / 2; gx < canvas.width; gx += gridStep) {
            for (let gy = gridStep / 2; gy < canvas.height; gy += gridStep) {
                const wave =
                    Math.sin(gx * 0.008 + asciiWaveTime) +
                    Math.cos(gy * 0.008 - asciiWaveTime * 0.8);
                const norm = (wave + 2) / 4;
                const charIdx = Math.floor(norm * WAVE_CHARS.length);
                const ch = WAVE_CHARS[charIdx];
                if (!ch || ch === " ") continue;

                ctx.globalAlpha = 0.06 + norm * 0.14;
                ctx.fillStyle = norm > 0.62 ? "#ff94c2" : "#b983ff";
                ctx.fillText(ch, gx, gy);
            }
        }

        for (const f of asciiFireflies) {
            f.x += f.vx + Math.sin(asciiWaveTime + f.y * 0.01) * 0.15;
            f.y += f.vy;
            f.alpha += f.growing ? f.va : -f.va;
            if (f.alpha >= 0.95) f.growing = false;
            if (f.alpha <= 0.14) f.growing = true;

            if (f.x < -24) f.x = canvas.width + 24;
            if (f.x > canvas.width + 24) f.x = -24;
            if (f.y < -24) f.y = canvas.height + 24;
            if (f.y > canvas.height + 24) f.y = -24;

            const glowSize = f.size * 2.1;
            ctx.globalAlpha = f.alpha * 0.45;
            ctx.drawImage(f.sprite, f.x - glowSize / 2, f.y - glowSize / 2, glowSize, glowSize);

            const rampIdx = Math.min(ASCII_RAMP.length - 1, Math.floor(f.alpha * ASCII_RAMP.length));
            const char = f.isAccent && f.alpha > 0.55 ? f.accentChar : ASCII_RAMP[rampIdx];

            ctx.globalAlpha = f.alpha;
            ctx.font = `bold ${f.size}px "Courier New", monospace`;
            ctx.fillStyle = f.color;
            ctx.fillText(char, f.x, f.y);
        }

        ctx.globalAlpha = 1;
    }
    requestAnimationFrame(animateFireflies);
}
requestAnimationFrame(animateFireflies);

/* ==========================================
   3. EFEK KACA INTERAKTIF & 3D TILT BOUQUET / CAKE
   ========================================== */
document.querySelectorAll(".interactive-glass").forEach((card) => {
    let ticking = false;
    const allowTilt = card.dataset.tilt === "true";

    card.addEventListener("mousemove", (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            if (allowTilt) {
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -1.6;
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 1.6;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
            ticking = false;
        });
    });

    if (allowTilt) {
        card.addEventListener("mouseleave", () => {
            motionPlay(card, { rotateX: 0, rotateY: 0 }, { duration: 0.45, ease: EASE_SILKY });
            card.style.transform = "";
        });
    }
});

function bind3DTiltWrap(boxId, wrapId) {
    const boxEl = document.getElementById(boxId);
    const wrapEl = document.getElementById(wrapId);
    if (!boxEl || !wrapEl) return;

    boxEl.addEventListener("mousemove", (e) => {
        const rect = boxEl.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        wrapEl.style.transform = `perspective(750px) rotateX(${(-ny * 9).toFixed(1)}deg) rotateY(${(nx * 11).toFixed(1)}deg) translateY(-4px)`;
    });

    boxEl.addEventListener("mouseleave", () => {
        wrapEl.style.transform = "";
    });
}

bind3DTiltWrap("bouquet-box", "bouquet-3d-wrap");
bind3DTiltWrap("cake-box", "cake-3d-wrap");

/* ==========================================
   4. AUDIO PLAYER, VOLUME FADE, IKON PAUSE & ANIMASI BUKA-TUTUP
   ========================================== */
const bgMusic = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause-btn");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const volumeSlider = document.getElementById("volume-slider");
const volumeBtn = document.getElementById("volume-btn");

const PLAY_SVG_FALLBACK = `
    <svg class="icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z"/>
    </svg>
`;
const PAUSE_SVG_FALLBACK = `
    <svg class="icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="4" width="4" height="16" rx="1.5"/>
        <rect x="14" y="4" width="4" height="16" rx="1.5"/>
    </svg>
`;

let resolvedPlayImgSrc = null;
let resolvedPauseImgSrc = null;

function renderPlayPauseButtonContent(isPlaying) {
    if (!playPauseBtn) return;
    if (isPlaying) {
        if (resolvedPauseImgSrc) {
            playPauseBtn.innerHTML = `<img src="${resolvedPauseImgSrc}" alt="Pause" class="player-state-img" draggable="false">`;
        } else {
            playPauseBtn.innerHTML = PAUSE_SVG_FALLBACK;
        }
    } else {
        if (resolvedPlayImgSrc) {
            playPauseBtn.innerHTML = `<img src="${resolvedPlayImgSrc}" alt="Play" class="player-state-img" draggable="false">`;
        } else {
            playPauseBtn.innerHTML = PLAY_SVG_FALLBACK;
        }
    }
}

resolveFirstAvailableImage(["static/tombol play.png", "static/play.png"], (src) => {
    resolvedPlayImgSrc = src;
    renderPlayPauseButtonContent(!bgMusic.paused);
});

resolveFirstAvailableImage(["static/tombol pouse.png", "static/tombol pause.png", "static/puse.png", "static/pause.png"], (src) => {
    resolvedPauseImgSrc = src;
    renderPlayPauseButtonContent(!bgMusic.paused);
});

const speedRates = [1, 1.25, 1.5, 0.75];
let currentSpeedIndex = 0;
let userVolume = 0.7;
let previousVolume = 0.7;
let isAutoFadingOut = false;
let volumeFadeTimer = null;
let isPlayerAnimating = false;

const playlist = [
    { title: "24/7", artist: "Romaria", filename: "romaria.mp3", cover: "🌸", bg: "rgba(255, 126, 179, 0.25)" },
    { title: "Remaja", artist: "HIVI!", filename: "remaja.mp3", cover: "🌷", bg: "rgba(232, 93, 149, 0.25)" },
    { title: "SPEED DIAL #1", artist: "Paul Partohap", filename: "speed dial.mp3", cover: "✨", bg: "rgba(181, 131, 255, 0.25)" },
    { title: "the space between us", artist: "siopaolo", filename: "the space between us.mp3", cover: "🌙", bg: "rgba(120, 179, 255, 0.25)" },
    { title: "RECIPE OF US", artist: "Paul Partohap", filename: "recipe of us.mp3", cover: "🕯️", bg: "rgba(255, 209, 102, 0.25)" }
];
let currentTrackIndex = 0;

function stopVolumeFade() {
    if (volumeFadeTimer !== null) {
        clearInterval(volumeFadeTimer);
        volumeFadeTimer = null;
    }
}

function updatePlayButtonUI(isPlaying) {
    renderPlayPauseButtonContent(isPlaying);
    playPauseBtn.classList.toggle("is-playing", isPlaying);
    playPauseBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    motionPlay(playPauseBtn, { scale: [0.88, 1.06, 1] }, SPRING_SNAPPY);
}

bgMusic.addEventListener("play", () => updatePlayButtonUI(true));
bgMusic.addEventListener("pause", () => updatePlayButtonUI(false));

function applyPlaybackRate(rate) {
    bgMusic.defaultPlaybackRate = rate;
    bgMusic.playbackRate = rate;
}

function fadeVolumeTo(targetVol, durationMs = 450, onDone = null) {
    stopVolumeFade();
    const clampedTarget = Math.max(0, Math.min(1, targetVol));
    const startVol = bgMusic.volume;
    const diff = clampedTarget - startVol;

    if (Math.abs(diff) < 0.01 || durationMs <= 0) {
        bgMusic.volume = clampedTarget;
        if (typeof onDone === "function") onDone();
        return;
    }

    const steps = Math.max(4, Math.round(durationMs / 35));
    let currentStep = 0;

    volumeFadeTimer = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.max(0, Math.min(1, startVol + diff * (currentStep / steps)));
        if (currentStep >= steps) {
            stopVolumeFade();
            bgMusic.volume = clampedTarget;
            if (typeof onDone === "function") onDone();
        }
    }, 35);
}

function setTrackSource(index) {
    const track = playlist[index];
    bgMusic.src = "static/" + encodeURIComponent(track.filename);
    bgMusic.load();
    bgMusic.volume = userVolume;
    applyPlaybackRate(speedRates[currentSpeedIndex]);

    playerTitle.innerText = track.title;
    playerArtist.innerText = track.artist;
    playerCover.innerText = track.cover;
    playerCover.style.backgroundColor = track.bg;
    isAutoFadingOut = false;

    const progressBar = document.getElementById("player-progress-bar");
    if (progressBar) progressBar.style.width = "0%";
    motionPlay(playerCover, { scale: [0.85, 1.08, 1], rotate: [-10, 4, 0] }, SPRING_BOUNCY);
}

setTrackSource(currentTrackIndex);

function playCurrentTrackDirect(withFadeIn = true) {
    stopVolumeFade();
    applyPlaybackRate(speedRates[currentSpeedIndex]);
    bgMusic.volume = withFadeIn ? 0 : userVolume;

    const p = bgMusic.play();
    if (p && typeof p.then === "function") {
        p.then(() => {
            applyPlaybackRate(speedRates[currentSpeedIndex]);
            if (withFadeIn) fadeVolumeTo(userVolume, 550);
        }).catch(() => {
            bgMusic.volume = userVolume;
            updatePlayButtonUI(false);
        });
    } else if (withFadeIn) {
        fadeVolumeTo(userVolume, 550);
    }
}

function pauseCurrentTrackSmooth(onPaused = null) {
    if (bgMusic.paused) {
        stopVolumeFade();
        bgMusic.volume = userVolume;
        updatePlayButtonUI(false);
        if (typeof onPaused === "function") onPaused();
        return;
    }
    fadeVolumeTo(0, 350, () => {
        bgMusic.pause();
        bgMusic.volume = userVolume;
        if (typeof onPaused === "function") onPaused();
    });
}

bgMusic.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    setTrackSource(currentTrackIndex);
    playCurrentTrackDirect(true);
});

bgMusic.addEventListener("timeupdate", () => {
    const targetRate = speedRates[currentSpeedIndex];
    if (Math.abs(bgMusic.playbackRate - targetRate) > 0.01) applyPlaybackRate(targetRate);

    if (bgMusic.duration && !Number.isNaN(bgMusic.duration)) {
        const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
        const progressBar = document.getElementById("player-progress-bar");
        if (progressBar) progressBar.style.width = percent + "%";

        if (!bgMusic.paused && !isAutoFadingOut && bgMusic.duration - bgMusic.currentTime <= 2.5) {
            isAutoFadingOut = true;
            fadeVolumeTo(0, 2200);
        }
    }
});

/* Animasi Terbuka & Tertutup Mini Playlist */
function toggleMinimizePlayer(event) {
    if (event) event.stopPropagation();
    const player = document.getElementById("mini-player");
    const body = document.getElementById("player-collapsible-body");
    const toggleBtn = document.getElementById("player-toggle-btn");
    const chevron = toggleBtn ? toggleBtn.querySelector(".player-toggle-chevron") : null;
    if (!player || isPlayerAnimating) return;

    const willMinimize = !player.classList.contains("minimized");

    if (prefersReducedMotion || !body) {
        player.classList.toggle("minimized", willMinimize);
        player.classList.toggle("is-expanded", !willMinimize);
        player.dataset.state = willMinimize ? "minimized" : "expanded";
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", String(!willMinimize));
        return;
    }

    isPlayerAnimating = true;

    if (willMinimize) {
        const currentWidth = body.getBoundingClientRect().width;
        body.style.width = `${currentWidth}px`;
        body.style.overflow = "hidden";

        player.classList.add("is-collapsing");
        if (chevron) {
            motionPlay(chevron, { rotate: 180 }, { duration: 0.34, ease: EASE_SILKY });
        }
        motionPlay(player, { scale: [1, 0.96, 1] }, SPRING_SNAPPY);

        const closeAnim = motionPlay(
            body,
            {
                width: [`${currentWidth}px`, "0px"],
                opacity: [1, 0],
                x: [0, 12]
            },
            { duration: 0.36, ease: EASE_FOLD_CLOSE }
        );

        const finishCollapse = () => {
            player.classList.remove("is-collapsing", "is-expanded");
            player.classList.add("minimized");
            player.dataset.state = "minimized";
            body.style.width = "";
            body.style.opacity = "";
            body.style.transform = "";
            body.style.overflow = "";
            if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
            isPlayerAnimating = false;
        };

        if (closeAnim && closeAnim.finished) {
            closeAnim.finished.then(finishCollapse);
        } else {
            setTimeout(finishCollapse, 370);
        }
    } else {
        player.classList.remove("minimized");
        player.classList.add("is-expanding", "is-expanded");
        player.dataset.state = "expanded";
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");

        body.style.width = "auto";
        body.style.opacity = "0";
        const targetWidth = body.getBoundingClientRect().width;
        body.style.width = "0px";
        body.style.overflow = "hidden";

        if (chevron) {
            motionPlay(chevron, { rotate: 0 }, { duration: 0.38, ease: EASE_SILKY });
        }
        motionPlay(player, { scale: [0.96, 1.02, 1] }, SPRING_SNAPPY);

        const openAnim = motionPlay(
            body,
            {
                width: ["0px", `${targetWidth}px`],
                opacity: [0, 1],
                x: [12, 0]
            },
            { duration: 0.42, ease: EASE_SILKY }
        );

        const finishExpand = () => {
            player.classList.remove("is-expanding");
            body.style.width = "";
            body.style.opacity = "";
            body.style.transform = "";
            body.style.overflow = "";
            isPlayerAnimating = false;
        };

        if (openAnim && openAnim.finished) {
            openAnim.finished.then(finishExpand);
        } else {
            setTimeout(finishExpand, 430);
        }
    }
}

/* ==========================================
   5. AMPLOP PEMBUKA & BUKU SCRAPBOOK TERBUKA 2 HALAMAN
   ========================================== */
let isEnvelopeOpened = false;

const LEFT_PROLOGUE_PAGE = {
    stamp: "19th Keepsake",
    pill: "Sampul Dalam",
    chapter: "CHAPTER 00 • PROLOGUE",
    sticker: "🎀 For Olel",
    tape: "tape-gold",
    theme: "theme-cream",
    doodle: "♥ open scrapbook ♥",
    hint: "halaman kiri",
    bmNum: "00",
    isPrologue: true
};

const SCRAPBOOK_PAGES = [
    {
        chapter: "CHAPTER 01 • OPENING",
        sticker: "💌 For Lowfy",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "✦ chapter 01 ✦",
        isHighlight: true,
        text: "HAIII SAYANG QU YANG SANGAT SANGAT CANTIK DAN LUCU."
    },
    {
        chapter: "CHAPTER 02 • 19TH MILESTONE",
        sticker: "🎂 19 Years Old",
        tape: "tape-gold",
        theme: "theme-cream",
        doodle: "✿ 12 Desember 2026 ✿",
        text: "HAPPY BIRTHDAY LOWFY! Hari ini, tepatnya di tanggal 12 Desember 2026, kamu uda menyentuh umur 19 tahun looo.. waktu beneran jalan kaya mobil racing aja. Nggak ada rasanya yaa.. sekarang kamu uda nyentuh umur 19, dan itu hampir 20 yaa.. WOW.. beneran uda masuk dalam fase baru di mana kamu uda pelan-pelan mulai menghadapi dunia yang bener-bener jauh lebih luas dari yang kemarin-kemarin."
    },
    {
        chapter: "CHAPTER 03 • UNI JOURNEY",
        sticker: "🌙 Late Night Thoughts",
        tape: "tape-lavender",
        theme: "theme-lavender",
        doodle: "✎ chapter 03",
        text: "Kalo boleh jujur, akhir-akhir ini aku sering banget kepikiran sama kamu. Kaya berat banget nggak sih jalanin hari-hari kamu sekarang? terutama kamu sekarang uda masuk dan mulai adaptasi di kehidupan perkuliahan ini? Aku tau kok kalo dunia kuliah itu nggak semudah yang di bayangin."
    },
    {
        chapter: "CHAPTER 04 • THROUGH THE DAYS",
        sticker: "📚 Campus Days",
        tape: "tape-lavender",
        theme: "theme-lavender",
        doodle: "✦ keep going, you got this",
        text: "Yang pasti banyak banget hal-hal baru yang mungkin bikin kamu kaget, dari tugas-tugas yang selalu datang tanpa lampu merah, jadwal yang lumayan padat, atau ada beberapa momen di mana kamu kaya ngerasa capek banget mulai dari fisik atau pikiran kamu. Juga kadang mungkin ada hari di mana kamu ngerasa riwueh banget, pengen ngeluh, bahkan kaya kamu mungkin ngerasa meragukan diri kamu sendiri."
    },
    {
        chapter: "CHAPTER 05 • NEVER ALONE",
        sticker: "🤍 Always With You",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "♥ always by your side ♥",
        text: "Setiap kali kamu ngerasain hari kamu berat, iki cuma mau kamu ingat satu hal sayang.. kamu nggak sendirian. Iki selalu berharap supaya kamu selalu punya kesabaran dan kesehatan buat jalanin semuanya badai yang datang, yang pastinya bareng sama iki."
    },
    {
        chapter: "CHAPTER 06 • SIDE BY SIDE",
        sticker: "🤝 Through Everything",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "✦ tahun-tahun selanjutnya",
        text: "Iki pasti bakal selalu temani hari-hari kamu.. enggak cuman di hari-hari di mana kamu lagi senang atau bahagia, tapi juga di hari-hari kamu dimana lagi capek-capeknya, sedih, atau kamu butuh tempat buat bersandar. Iki bakal selalu terus ada di sisi kamu, dengerin semua cerita kamu tentang apapun itu, dan jalanin semuanya sama-sama sampai tahun-tahun selanjutnya."
    },
    {
        chapter: "CHAPTER 07 • SO PROUD OF YOU",
        sticker: "⭐ Proud of Olel",
        tape: "tape-gold",
        theme: "theme-cream",
        doodle: "✦ my favorite person ✦",
        text: "Intinya, iki beneran bangga banget sama kamu, olel. Bangga karena kamu sendiri uda mau berusaha sejauh ini, bangga karena kamu tetap bertahan meskipun kadang rasanya pasti cape dan lelah banget di kamu nya, dan bangga bisa punya pasangan sehebat, sekuat, dan secantik kamu di kondisi apapun."
    },
    {
        chapter: "CHAPTER 08 • BIRTHDAY WISHES",
        sticker: "✨ 19th Prayers",
        tape: "tape-lavender",
        theme: "theme-lavender",
        doodle: "★ may your dreams bloom",
        text: "Di umur kamu yang uda menyentuh 19 tahun ini, aku selalu doain yang terbaik buat kamu. Semoga apa pun yang kamu mau, semua impian yang diam-diam kamu simpan di dalam hati dan pikiran kamu, dan segala rencana baik yang sedang kamu susun bisa satu per satu tercapai dengan bertahap. Semoga semesta selalu berpihak sama kamu, dan segala hal baik dari orang-orang yang ada di sekitar kamu selalu membawakan hal-hal baik, energi yang positif, dan menyenangkan buat kamu."
    },
    {
        chapter: "CHAPTER 09 • SAFE SPACE",
        sticker: "🌧️ On Heavy Days",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "♥ jangan pendam sendirian",
        text: "Dan... kalo nanti kamu ketemu sama hari yang rasanya bener-bener buruk atau apes banget, hari di mana semuanya bakal terasa berat banget dan kamu nggak menemukan satu pun hal baik yang ada, jangan pernah kepikiran buat pendam itu sendirian okeyy?"
    },
    {
        chapter: "CHAPTER 10 • HOME WITH IKI",
        sticker: "🏡 Tempat Pulang",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "♥ warm hugs for you ♥",
        text: "Kamu punya tempat pulang yang banyak termasuk aku (harus aku). Walau kamu nggak menemukan hal baiknya, aku bakal kasih kamu seluruh dunia buat peluk kamu se erat-eratnya sampai semua rasa cape dan sedih kamu hilang.. sampai kamu balik merasa aman dan nyaman lagi.."
    },
    {
        chapter: "CHAPTER 11 • GRATITUDE",
        sticker: "🌷 Andiyashafa",
        tape: "tape-gold",
        theme: "theme-cream",
        doodle: "✿ grateful for you ✿",
        text: "Selamat ulang tahun yang ke-19 ya andiyashafa ku cinta. Aku bener-bener terima kasih uda lahir di dunia ini, terima kasih uda bertahan sampai hari ini sampai detik ini, juga terima kasih sudah kasih kesempatan buat iki jadi bagian dari perjalanan hidup kamu."
    },
    {
        chapter: "CHAPTER 12 • CLOSING NOTE",
        sticker: "💝 Forever Yours",
        tape: "tape-pink",
        theme: "theme-blush",
        doodle: "✦ chapter 19 begins ✦",
        isClosing: true,
        text: "Once again, happy 19th birthday, lowfy.\nI love you so much, today, tomorrow, and always. ♥",
        signature: "— Yours, Iki"
    }
];

let currentPageIndex = 0;
let isFlippingPage = false;

function padPageNum(num) {
    return String(num).padStart(2, "0");
}

function buildPrologueBodyHTML() {
    return `
        <div class="left-cover-dedication">
            <span class="dedication-emblem">✿ 12 • 12 • 2026 ✿</span>
            <p class="dedication-quote">"Every page here holds a piece of how grateful I am for you, Lowfy."</p>
            <span class="dedication-sub">— Written with love by Iki</span>
        </div>
    `;
}

function buildPageBodyHTML(page) {
    if (!page || page.isPrologue) {
        return buildPrologueBodyHTML();
    }
    if (page.isHighlight) {
        return `<p class="paper-text greeting-highlight">${page.text}</p>`;
    }
    if (page.isClosing) {
        return `
            <div class="closing-handwriting-box">
                <p class="closing-handwriting">${page.text.replace(/\n/g, "<br>")}</p>
                <span class="signature-flourish">${page.signature}</span>
            </div>
        `;
    }
    return `<p class="paper-text">${page.text}</p>`;
}

function populateLeafMarkup(container, page, pageNum, total) {
    if (!container || !page) return;
    if (page.isPrologue) {
        container.innerHTML = `
            <div class="sb-washi-tape ${page.tape}"></div>
            <div class="sb-page-bookmark" aria-hidden="true"><span>00</span></div>
            <div class="sb-page-header">
                <span class="sb-location-stamp">${page.stamp}</span>
                <span class="sb-page-pill">${page.pill}</span>
            </div>
            <div class="sb-sticker-row">
                <span class="sb-chapter-tag">${page.chapter}</span>
                <span class="sb-sticker-badge">${page.sticker}</span>
            </div>
            <div class="sb-page-body is-centered-card">
                ${buildPrologueBodyHTML()}
            </div>
            <div class="sb-page-footer">
                <span class="sb-doodle-note">${page.doodle}</span>
                <span class="sb-swipe-hint">${page.hint}</span>
            </div>
        `;
        return;
    }

    const centeredClass = page.isHighlight || page.isClosing ? "is-centered-card" : "";
    container.innerHTML = `
        <div class="sb-washi-tape ${page.tape}"></div>
        <div class="sb-page-bookmark" aria-hidden="true"><span>${padPageNum(pageNum)}</span></div>
        <div class="sb-page-header">
            <span class="sb-location-stamp">Bandar Lampung • 12.12.2026</span>
            <span class="sb-page-pill">Hal. ${pageNum} / ${total}</span>
        </div>
        <div class="sb-sticker-row">
            <span class="sb-chapter-tag">${page.chapter}</span>
            <span class="sb-sticker-badge">${page.sticker}</span>
        </div>
        <div class="sb-page-body ${centeredClass}">
            ${buildPageBodyHTML(page)}
        </div>
        <div class="sb-page-footer">
            <span class="sb-doodle-note">${page.doodle}</span>
            <span class="sb-swipe-hint">19th scrapbook</span>
        </div>
    `;
}

function populateBackLeafMarkup(container, page, pageNum, total) {
    if (!container) return;
    if (!page || page.isPrologue) {
        container.innerHTML = `
            <div class="flip-back-pattern">
                <span>LOWFY • 19TH</span>
                <p>19th Birthday Keepsake ♥</p>
            </div>
        `;
        return;
    }

    const snippet = page.text.replace(/\n/g, " ");
    container.innerHTML = `
        <div class="flip-back-sheet ${page.theme}">
            <div class="flip-back-header">
                <span>Hal. ${pageNum} / ${total}</span>
                <span>${page.chapter}</span>
            </div>
            <p class="flip-back-preview">${snippet}</p>
            <div class="flip-back-footer">
                <span>${page.doodle}</span>
                <span>${page.sticker}</span>
            </div>
        </div>
    `;
}

function renderLeftSpreadPage(rightIndex) {
    const total = SCRAPBOOK_PAGES.length;
    const leftPageEl = document.getElementById("scrapbook-left-page");
    if (!leftPageEl) return;

    const leftTape = document.getElementById("sb-left-tape");
    const leftBmNum = document.getElementById("sb-left-bm-num");
    const leftStamp = document.getElementById("sb-left-stamp");
    const leftPill = document.getElementById("sb-left-pill");
    const leftChap = document.getElementById("sb-left-chapter");
    const leftSticker = document.getElementById("sb-left-sticker");
    const leftBody = document.getElementById("sb-left-body");
    const leftDoodle = document.getElementById("sb-left-doodle");
    const leftHint = document.getElementById("sb-left-hint");

    if (rightIndex <= 0) {
        const p = LEFT_PROLOGUE_PAGE;
        leftPageEl.className = `scrapbook-page left-page ${p.theme}`;
        if (leftTape) leftTape.className = `sb-washi-tape ${p.tape}`;
        if (leftBmNum) leftBmNum.innerText = p.bmNum;
        if (leftStamp) leftStamp.innerText = p.stamp;
        if (leftPill) leftPill.innerText = p.pill;
        if (leftChap) leftChap.innerText = p.chapter;
        if (leftSticker) leftSticker.innerText = p.sticker;
        if (leftBody) {
            leftBody.className = "sb-page-body is-centered-card";
            leftBody.innerHTML = buildPrologueBodyHTML();
            leftBody.scrollTop = 0;
        }
        if (leftDoodle) leftDoodle.innerText = p.doodle;
        if (leftHint) leftHint.innerText = p.hint;
    } else {
        const prevIdx = rightIndex - 1;
        const prevPage = SCRAPBOOK_PAGES[prevIdx];
        leftPageEl.className = `scrapbook-page left-page ${prevPage.theme}`;
        if (leftTape) leftTape.className = `sb-washi-tape ${prevPage.tape}`;
        if (leftBmNum) leftBmNum.innerText = padPageNum(prevIdx + 1);
        if (leftStamp) leftStamp.innerText = "Bandar Lampung • 12.12.2026";
        if (leftPill) leftPill.innerText = `Hal. ${prevIdx + 1} / ${total}`;
        if (leftChap) leftChap.innerText = prevPage.chapter;
        if (leftSticker) leftSticker.innerText = prevPage.sticker;
        if (leftBody) {
            leftBody.className = `sb-page-body ${prevPage.isHighlight || prevPage.isClosing ? "is-centered-card" : ""}`;
            leftBody.innerHTML = buildPageBodyHTML(prevPage);
            leftBody.scrollTop = 0;
        }
        if (leftDoodle) leftDoodle.innerText = prevPage.doodle;
        if (leftHint) leftHint.innerText = "← halaman kiri";
    }
}

function renderRightSpreadPage(index) {
    const total = SCRAPBOOK_PAGES.length;
    const page = SCRAPBOOK_PAGES[index];
    const activePage = document.getElementById("scrapbook-active-page");
    if (!activePage || !page) return;

    activePage.className = `scrapbook-page right-page ${page.theme}`;

    const tapeTop = document.getElementById("sb-tape-top");
    if (tapeTop) tapeTop.className = `sb-washi-tape ${page.tape}`;

    const rightBmNum = document.getElementById("sb-right-bm-num");
    if (rightBmNum) rightBmNum.innerText = padPageNum(index + 1);

    const pill = document.getElementById("sb-page-pill");
    if (pill) pill.innerText = `Hal. ${index + 1} / ${total}`;

    const chap = document.getElementById("sb-chapter-tag");
    if (chap) chap.innerText = page.chapter;

    const sticker = document.getElementById("sb-sticker-badge");
    if (sticker) sticker.innerText = page.sticker;

    const body = document.getElementById("sb-page-body");
    if (body) {
        body.className = `sb-page-body ${page.isHighlight || page.isClosing ? "is-centered-card" : ""}`;
        body.innerHTML = buildPageBodyHTML(page);
        body.scrollTop = 0;
    }

    const doodle = document.getElementById("sb-doodle-note");
    if (doodle) doodle.innerText = page.doodle;

    const hint = document.getElementById("sb-swipe-hint");
    if (hint) {
        if (index === 0) hint.innerText = "geser / tap →";
        else if (index === total - 1) hint.innerText = "← geser / ↺ awal";
        else hint.innerText = "← kiri • kanan →";
    }
}

function renderScrapbookContent(index, syncLeft = true) {
    const total = SCRAPBOOK_PAGES.length;
    if (syncLeft) {
        renderLeftSpreadPage(index);
    }
    renderRightSpreadPage(index);

    const edgeStack = document.getElementById("scrapbook-edge-stack");
    if (edgeStack) {
        const remainingRatio = (total - 1 - index) / (total - 1);
        const stackW = Math.max(3, Math.round(3 + remainingRatio * 8));
        edgeStack.style.width = `${stackW}px`;
        edgeStack.style.opacity = index === total - 1 ? "0.45" : "1";
    }

    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) {
        nextBtn.innerText = index < total - 1 ? "Kanan →" : "↺ Awal";
    }

    document.querySelectorAll(".sb-dot").forEach((dot, dIdx) => {
        dot.classList.toggle("active", dIdx === index);
        dot.setAttribute("aria-selected", dIdx === index ? "true" : "false");
    });

    document.querySelectorAll(".sb-pink-tab").forEach((tab, tIdx) => {
        tab.classList.toggle("active", tIdx === index);
        tab.classList.toggle("visited", tIdx < index);
        tab.setAttribute("aria-selected", tIdx === index ? "true" : "false");
    });
}

function initScrapbookPinkTabs() {
    const tabsWrap = document.getElementById("scrapbook-pink-tabs");
    if (!tabsWrap) return;
    tabsWrap.innerHTML = "";
    SCRAPBOOK_PAGES.forEach((page, idx) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = idx === 0 ? "sb-pink-tab active" : "sb-pink-tab";
        tab.title = `Halaman ${idx + 1} • ${page.chapter}`;
        tab.setAttribute("aria-label", `Penanda Halaman ${idx + 1}`);
        tab.innerHTML = `<span class="tab-num">${padPageNum(idx + 1)}</span>`;
        tab.onclick = (e) => {
            e.stopPropagation();
            jumpToPage(idx);
        };
        tabsWrap.appendChild(tab);
    });
}

function initScrapbookDots() {
    const dotsWrap = document.getElementById("scrapbook-dots");
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    SCRAPBOOK_PAGES.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = idx === 0 ? "sb-dot active" : "sb-dot";
        dot.title = `Halaman ${idx + 1}`;
        dot.setAttribute("aria-label", `Buka halaman ${idx + 1}`);
        dot.onclick = () => jumpToPage(idx);
        dotsWrap.appendChild(dot);
    });
}

function syncFlipLeafGeometry(flipLeaf) {
    const rightPage = document.getElementById("scrapbook-active-page");
    if (!flipLeaf || !rightPage) return;
    flipLeaf.style.left = `${rightPage.offsetLeft}px`;
    flipLeaf.style.top = `${rightPage.offsetTop}px`;
    flipLeaf.style.width = `${rightPage.offsetWidth}px`;
    flipLeaf.style.height = `${rightPage.offsetHeight}px`;
}

function applyLeaf3DTransform(flipLeaf, creaseShade, angleDeg) {
    const rad = (Math.abs(angleDeg) * Math.PI) / 180;
    const bendSin = Math.sin(rad);
    const skewDeg = (angleDeg < 0 ? -1 : 1) * bendSin * 3.4;
    const scaleX = 1 - bendSin * 0.035;

    flipLeaf.style.transform = `perspective(1650px) rotateY(${angleDeg.toFixed(2)}deg) skewY(${skewDeg.toFixed(2)}deg) scaleX(${scaleX.toFixed(4)})`;
    if (creaseShade) {
        creaseShade.style.opacity = (0.14 + bendSin * 0.62).toFixed(2);
    }
}

function animateLeaf3D(flipLeaf, creaseShade, fromAngle, toAngle, durationMs, onComplete) {
    const startTime = performance.now();

    function step(now) {
        const rawT = Math.min(1, (now - startTime) / durationMs);
        const easeT = 1 - Math.pow(1 - rawT, 3);
        const curAngle = fromAngle + (toAngle - fromAngle) * easeT;

        applyLeaf3DTransform(flipLeaf, creaseShade, curAngle);

        if (rawT < 1) {
            requestAnimationFrame(step);
        } else {
            flipLeaf.classList.remove("is-flipping");
            flipLeaf.style.transform = "";
            if (creaseShade) creaseShade.style.opacity = "0.2";
            if (typeof onComplete === "function") onComplete();
        }
    }

    requestAnimationFrame(step);
}

function goToScrapbookPage(targetIndex, startAngleOverride = null) {
    const total = SCRAPBOOK_PAGES.length;
    const clamped = Math.max(0, Math.min(total - 1, targetIndex));
    if (clamped === currentPageIndex || isFlippingPage) return;

    const oldIndex = currentPageIndex;
    const direction = clamped > oldIndex ? 1 : -1;
    const outgoingPage = SCRAPBOOK_PAGES[oldIndex];
    const incomingPage = SCRAPBOOK_PAGES[clamped];

    const flipLeaf = document.getElementById("scrapbook-flip-leaf");
    const flipFront = document.getElementById("flip-leaf-front");
    const flipContent = document.getElementById("flip-leaf-content");
    const flipBackContent = document.getElementById("flip-back-content");
    const creaseShade = document.getElementById("flip-crease-shadow");

    if (prefersReducedMotion || !flipLeaf || !flipContent || !flipFront) {
        currentPageIndex = clamped;
        renderScrapbookContent(currentPageIndex, true);
        return;
    }

    isFlippingPage = true;
    syncFlipLeafGeometry(flipLeaf);

    if (direction === 1) {
        flipFront.className = `flip-leaf-front ${outgoingPage.theme}`;
        populateLeafMarkup(flipContent, outgoingPage, oldIndex + 1, total);

        const newLeftData = clamped > 0 ? SCRAPBOOK_PAGES[clamped - 1] : LEFT_PROLOGUE_PAGE;
        populateBackLeafMarkup(flipBackContent, newLeftData, clamped, total);

        currentPageIndex = clamped;
        renderScrapbookContent(clamped, false);
    } else {
        flipFront.className = `flip-leaf-front ${incomingPage.theme}`;
        populateLeafMarkup(flipContent, incomingPage, clamped + 1, total);

        const oldLeftData = oldIndex > 0 ? SCRAPBOOK_PAGES[oldIndex - 1] : LEFT_PROLOGUE_PAGE;
        populateBackLeafMarkup(flipBackContent, oldLeftData, oldIndex, total);

        renderLeftSpreadPage(clamped);
    }

    flipLeaf.classList.add("is-flipping");

    const fromAngle = startAngleOverride !== null ? startAngleOverride : (direction === 1 ? 0 : -178);
    const toAngle = direction === 1 ? -178 : 0;
    const remainingFraction = Math.max(0.25, Math.abs(toAngle - fromAngle) / 178);
    const durationMs = Math.round(620 * remainingFraction);

    animateLeaf3D(flipLeaf, creaseShade, fromAngle, toAngle, durationMs, () => {
        currentPageIndex = clamped;
        renderScrapbookContent(currentPageIndex, true);
        isFlippingPage = false;
    });
}

function flipNextPage() {
    if (currentPageIndex < SCRAPBOOK_PAGES.length - 1) {
        goToScrapbookPage(currentPageIndex + 1);
    } else {
        goToScrapbookPage(0);
    }
}

function flipPrevPage() {
    if (currentPageIndex > 0) {
        goToScrapbookPage(currentPageIndex - 1);
    }
}

function jumpToPage(idx) {
    goToScrapbookPage(idx);
}

(() => {
    const stage = document.getElementById("scrapbook-stage");
    const flipLeaf = document.getElementById("scrapbook-flip-leaf");
    const flipFront = document.getElementById("flip-leaf-front");
    const flipContent = document.getElementById("flip-leaf-content");
    const flipBackContent = document.getElementById("flip-back-content");
    const creaseShade = document.getElementById("flip-crease-shadow");
    if (!stage || !flipLeaf || !flipFront || !flipContent) return;

    let isDragging = false;
    let dragDir = 0;
    let startX = 0;
    let startY = 0;
    let currentAngle = 0;
    let basePageSnapshot = 0;

    function cancelDrag() {
        if (!isDragging) return;
        const restorePage = basePageSnapshot;
        const fromAng = currentAngle;
        const targetAng = dragDir === 1 ? 0 : -178;
        isDragging = false;
        isFlippingPage = true;

        animateLeaf3D(flipLeaf, creaseShade, fromAng, targetAng, 320, () => {
            currentPageIndex = restorePage;
            renderScrapbookContent(currentPageIndex, true);
            isFlippingPage = false;
        });
    }

    stage.addEventListener("pointerdown", (e) => {
        if (isFlippingPage || prefersReducedMotion) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
        dragDir = 0;
        currentAngle = 0;
    });

    stage.addEventListener("pointermove", (e) => {
        if (isFlippingPage || prefersReducedMotion || startX === 0) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!isDragging) {
            if (Math.abs(dx) < 12) return;
            if (Math.abs(dy) > Math.abs(dx)) {
                startX = 0;
                return;
            }

            if (dx < 0 && currentPageIndex < SCRAPBOOK_PAGES.length - 1) {
                dragDir = 1;
            } else if (dx > 0 && currentPageIndex > 0) {
                dragDir = -1;
            } else {
                return;
            }

            isDragging = true;
            basePageSnapshot = currentPageIndex;
            const total = SCRAPBOOK_PAGES.length;
            syncFlipLeafGeometry(flipLeaf);

            if (dragDir === 1) {
                const outPage = SCRAPBOOK_PAGES[basePageSnapshot];
                flipFront.className = `flip-leaf-front ${outPage.theme}`;
                populateLeafMarkup(flipContent, outPage, basePageSnapshot + 1, total);
                populateBackLeafMarkup(flipBackContent, outPage, basePageSnapshot + 1, total);
                renderScrapbookContent(basePageSnapshot + 1, false);
            } else {
                const prevPage = SCRAPBOOK_PAGES[basePageSnapshot - 1];
                flipFront.className = `flip-leaf-front ${prevPage.theme}`;
                populateLeafMarkup(flipContent, prevPage, basePageSnapshot, total);
                populateBackLeafMarkup(flipBackContent, prevPage, basePageSnapshot, total);
                renderLeftSpreadPage(basePageSnapshot - 1);
            }

            flipLeaf.classList.add("is-flipping");
        }

        if (isDragging) {
            const rightPage = document.getElementById("scrapbook-active-page");
            const width = Math.max(200, (rightPage ? rightPage.getBoundingClientRect().width : stage.getBoundingClientRect().width * 0.5));
            const ratio = Math.min(1, Math.abs(dx) / (width * 0.85));
            currentAngle = dragDir === 1 ? -ratio * 178 : -178 + ratio * 178;
            applyLeaf3DTransform(flipLeaf, creaseShade, currentAngle);
        }
    });

    stage.addEventListener("pointerup", (e) => {
        if (isDragging) {
            const rightPage = document.getElementById("scrapbook-active-page");
            const width = Math.max(200, (rightPage ? rightPage.getBoundingClientRect().width : stage.getBoundingClientRect().width * 0.5));
            const dx = e.clientX - startX;
            const ratio = Math.abs(dx) / (width * 0.85);
            const committedDir = dragDir;
            const snapIndex = basePageSnapshot;
            const fromAng = currentAngle;

            isDragging = false;
            startX = 0;

            if (ratio >= 0.22) {
                isFlippingPage = true;
                const targetIndex = committedDir === 1 ? snapIndex + 1 : snapIndex - 1;
                const toAng = committedDir === 1 ? -178 : 0;
                const dur = Math.max(240, Math.round(520 * (1 - Math.min(0.85, ratio))));

                animateLeaf3D(flipLeaf, creaseShade, fromAng, toAng, dur, () => {
                    currentPageIndex = targetIndex;
                    renderScrapbookContent(currentPageIndex, true);
                    isFlippingPage = false;
                });
            } else {
                isDragging = true;
                cancelDrag();
            }
            return;
        }

        if (startX !== 0) {
            const rect = stage.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            startX = 0;

            if (clickRatio < 0.46) {
                flipPrevPage();
            } else {
                flipNextPage();
            }
        }
    });

    stage.addEventListener("pointercancel", () => {
        startX = 0;
        cancelDrag();
    });

    document.addEventListener("keydown", (e) => {
        if (!isEnvelopeOpened) return;
        const tag = document.activeElement?.tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        if (e.key === "ArrowRight") flipNextPage();
        if (e.key === "ArrowLeft") flipPrevPage();
    });
})();

initScrapbookPinkTabs();
initScrapbookDots();
renderScrapbookContent(0, true);

function openGift(event) {
    if (event) event.stopPropagation();
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    const overlay = document.getElementById("envelope-overlay");
    const main = document.getElementById("main-content");
    const miniPlayer = document.getElementById("mini-player");

    playCurrentTrackDirect(true);

    motionPlay("#wax-seal", { scale: [1, 1.25, 0], opacity: [1, 1, 0] }, { duration: 0.42, ease: EASE_SILKY });
    motionPlay("#env-flap-top", { rotateX: [0, 180] }, { duration: 0.7, delay: 0.14, ease: EASE_SILKY });

    setTimeout(() => {
        const flap = document.getElementById("env-flap-top");
        if (flap) flap.style.zIndex = "1";
        motionPlay("#env-letter-peek", { y: [-14, -84] }, { duration: 0.78, ease: EASE_SILKY });
    }, 340);

    setTimeout(() => {
        const liftAnim = motionPlay(
            overlay,
            { y: ["0%", "-100%"], opacity: [1, 0] },
            { duration: 0.95, ease: [0.65, 0, 0.35, 1] }
        );
        if (liftAnim && liftAnim.finished) {
            liftAnim.finished.then(() => {
                overlay.style.pointerEvents = "none";
                overlay.style.display = "none";
            });
        } else {
            overlay.classList.add("opened");
        }

        main.classList.add("visible");
        miniPlayer.classList.add("show-player");
        motionPlay(miniPlayer, { y: [32, 0], opacity: [0, 1] }, { duration: 0.65, ease: EASE_SILKY });

        motionPlay(
            ".hero-stagger",
            { opacity: [0, 1], y: [26, 0], scale: [0.97, 1] },
            { duration: 0.75, delay: stagger(0.12), ease: EASE_SILKY }
        );
    }, 1050);
}

/* ==========================================
   6. GLASS JAR: FOTO KIRI/KANAN ASCII PROPORSIONAL & BERANIMASI,
      TULISAN BAWAH ASCII TAJAM, ISI DALAM JAR ASCII & KEMBANG API
   ========================================== */
const NOTES_LIST = [
    { title: "Laughter", text: "Our best memories always start with a random laugh that lasts way too long." },
    { title: "Dreams", text: "Keep chasing every goal you have—I'm cheering for you from here." },
    { title: "New Chapter", text: "A brand new year of your life is starting. Wishing you peace, joy, and growth." },
    { title: "Stay Soft", text: "You don't have to rush everything. Take it one step at a time." },
    { title: "Proud of You", text: "Look how far you've come. Even on quiet days, you are doing amazing." },
    { title: "Little Things", text: "May your coffee be warm, your playlists hit right, and your heart feel light." }
];

let remainingNotes = [];
let lastShownTitle = null;

function getUniqueRandomNote() {
    if (remainingNotes.length === 0) {
        remainingNotes = [...NOTES_LIST];
        for (let i = remainingNotes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingNotes[i], remainingNotes[j]] = [remainingNotes[j], remainingNotes[i]];
        }
        if (remainingNotes.length > 1 && remainingNotes[remainingNotes.length - 1].title === lastShownTitle) {
            [remainingNotes[0], remainingNotes[remainingNotes.length - 1]] =
                [remainingNotes[remainingNotes.length - 1], remainingNotes[0]];
        }
    }
    const note = remainingNotes.pop();
    lastShownTitle = note.title;
    return note;
}

/* 6A. FOTO KIRI & KANAN JAR MENJADI ASCII PROPORSIONAL + ANIMASI HIDUP */
const sideAsciiControllers = [];

function initJarSideAscii(canvasId, imgSrc, isRightSide = false) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const context = c.getContext("2d");

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const logicalW = 220;
    const logicalH = 280;
    c.width = logicalW * dpr;
    c.height = logicalH * dpr;
    context.scale(dpr, dpr);

    const DENSITY = " .:-=+*#%@";
    const MAX_COLS = 44;
    const MAX_ROWS = 56;
    const cellSize = Math.min(logicalW / MAX_COLS, logicalH / MAX_ROWS);

    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
        const natW = img.naturalWidth || 200;
        const natH = img.naturalHeight || 260;
        const sampleBase = 200;
        const tempW = natW >= natH ? sampleBase : Math.max(1, Math.round(sampleBase * (natW / natH)));
        const tempH = natH > natW ? sampleBase : Math.max(1, Math.round(sampleBase * (natH / natW)));

        const off = document.createElement("canvas");
        off.width = tempW;
        off.height = tempH;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(img, 0, 0, tempW, tempH);
        const rawData = offCtx.getImageData(0, 0, tempW, tempH).data;

        let minX = tempW, maxX = 0, minY = tempH, maxY = 0;
        for (let y = 0; y < tempH; y++) {
            for (let x = 0; x < tempW; x++) {
                if (rawData[(y * tempW + x) * 4 + 3] >= 32) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const cropW = Math.max(1, maxX - minX + 1);
        const cropH = Math.max(1, maxY - minY + 1);
        const cropAspect = cropW / cropH;

        let drawCols, drawRows;
        if (cropAspect > MAX_COLS / MAX_ROWS) {
            drawCols = MAX_COLS;
            drawRows = Math.max(1, Math.round(MAX_COLS / cropAspect));
        } else {
            drawRows = MAX_ROWS;
            drawCols = Math.max(1, Math.round(MAX_ROWS * cropAspect));
        }

        const startX = (logicalW - drawCols * cellSize) * 0.5;
        const startY = (logicalH - drawRows * cellSize) * 0.5;

        const sampleCanvas = document.createElement("canvas");
        sampleCanvas.width = drawCols;
        sampleCanvas.height = drawRows;
        const sampleCtx = sampleCanvas.getContext("2d");
        sampleCtx.drawImage(off, minX, minY, cropW, cropH, 0, 0, drawCols, drawRows);
        const pixels = sampleCtx.getImageData(0, 0, drawCols, drawRows).data;

        const cells = [];
        const outlineSparkles = [];

        for (let y = 0; y < drawRows; y++) {
            for (let x = 0; x < drawCols; x++) {
                const i = (y * drawCols + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                if (a < 36) continue;

                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const contrastLum = Math.min(1, Math.max(0.15, Math.pow(lum, 0.85) * 1.12));
                const baseIdx = Math.min(DENSITY.length - 1, Math.max(2, Math.floor(contrastLum * DENSITY.length)));

                const isEdge =
                    x === 0 || x === drawCols - 1 || y === 0 || y === drawRows - 1 ||
                    pixels[(y * drawCols + (x - 1)) * 4 + 3] < 36 ||
                    pixels[(y * drawCols + (x + 1)) * 4 + 3] < 36;

                if (isEdge && Math.random() < 0.18) {
                    outlineSparkles.push({
                        x,
                        y,
                        phase: Math.random() * Math.PI * 2,
                        char: Math.random() > 0.45 ? "✦" : "♥"
                    });
                }

                const cr = Math.min(255, Math.round(r * 0.96 + 42));
                const cg = Math.min(255, Math.round(g * 0.92 + 28));
                const cb = Math.min(255, Math.round(b * 0.96 + 38));

                cells.push({
                    x,
                    y,
                    normX: x / drawCols,
                    normY: y / drawRows,
                    baseIdx,
                    r: cr,
                    g: cg,
                    b: cb,
                    phase: x * 0.28 + y * 0.22
                });
            }
        }

        const orbitParticles = Array.from({ length: 12 }, (_, k) => ({
            angle: (k / 12) * Math.PI * 2,
            yNorm: Math.random(),
            speed: 0.004 + Math.random() * 0.003,
            char: k % 3 === 0 ? "✦" : (k % 2 === 0 ? "♥" : "*"),
            color: k % 2 === 0 ? "#ffd97d" : "#ff94c2"
        }));

        let revealProgress = prefersReducedMotion ? 1 : 0;
        let hasRevealed = prefersReducedMotion;
        let cheerPulse = 0;
        let t = isRightSide ? 1.8 : 0;

        const jarSection = document.getElementById("jar-section");
        if (jarSection && !prefersReducedMotion) {
            inView(jarSection, () => {
                hasRevealed = true;
            }, { amount: 0.18 });
        } else {
            hasRevealed = true;
        }

        sideAsciiControllers.push({
            triggerCheer: () => {
                cheerPulse = 1;
            }
        });

        function renderSideAscii() {
            if (!document.hidden) {
                context.clearRect(0, 0, logicalW, logicalH);

                if (hasRevealed && revealProgress < 1) {
                    revealProgress = Math.min(1, revealProgress + 0.022);
                }

                if (!prefersReducedMotion) {
                    t += 0.038;
                    cheerPulse *= 0.92;
                }

                const hopY = -Math.sin(cheerPulse * Math.PI) * 9;
                const floatY = Math.sin(t * 1.35) * 4.2 + hopY;
                const shimmerWave = ((t * 0.48) % 2.2) - 0.5;

                context.font = `bold ${Math.ceil(cellSize * 1.12)}px "Courier New", monospace`;
                context.textAlign = "center";
                context.textBaseline = "middle";

                for (const cell of cells) {
                    if (cell.normY > revealProgress + 0.06) continue;

                    const edgeReveal = Math.max(0, 1 - Math.abs(cell.normY - revealProgress) / 0.09);
                    const waveSway = Math.sin(t * 1.8 + cell.normY * 4.2) * 2.1 * (1 - cell.normY * 0.35);
                    const diag = (cell.normX + cell.normY) * 0.5;
                    const sDist = Math.abs(diag - shimmerWave);
                    const shimmer = sDist < 0.15 ? (1 - sDist / 0.15) : 0;

                    const twinkle = Math.sin(t * 2.8 + cell.phase) > 0.82 ? 1 : 0;
                    const cIdx = Math.min(
                        DENSITY.length - 1,
                        cell.baseIdx + twinkle + (shimmer > 0.35 ? 2 : 0) + (edgeReveal > 0.4 ? 2 : 0)
                    );

                    const boost = Math.round(shimmer * 68 + twinkle * 28 + edgeReveal * 90 + cheerPulse * 45);
                    context.fillStyle = `rgb(${Math.min(255, cell.r + boost)}, ${Math.min(255, cell.g + boost)}, ${Math.min(255, cell.b + boost)})`;

                    const px = startX + (cell.x + 0.5) * cellSize + waveSway;
                    const py = startY + (cell.y + 0.5) * cellSize + floatY;
                    context.fillText(DENSITY[cIdx], px, py);
                }

                if (revealProgress > 0.5) {
                    context.font = 'bold 10px "Courier New", monospace';
                    for (const sp of outlineSparkles) {
                        const alpha = (0.25 + 0.75 * Math.max(0, Math.sin(t * 3.0 + sp.phase))) * revealProgress;
                        if (alpha < 0.32) continue;
                        context.globalAlpha = alpha;
                        context.fillStyle = cheerPulse > 0.2 ? "#ffd97d" : "#ffd6e8";
                        context.fillText(
                            sp.char,
                            startX + (sp.x + 0.5) * cellSize,
                            startY + (sp.y + 0.5) * cellSize + floatY
                        );
                    }

                    for (const op of orbitParticles) {
                        op.yNorm -= op.speed;
                        if (op.yNorm < 0.05) op.yNorm = 0.96;
                        const ox = logicalW * 0.5 + Math.cos(op.angle + t * 0.7) * (logicalW * 0.42);
                        const oy = op.yNorm * logicalH + floatY * 0.6;
                        const pulse = 0.3 + 0.6 * Math.sin(t * 2.5 + op.angle * 2);
                        context.globalAlpha = Math.max(0.1, pulse);
                        context.fillStyle = op.color;
                        context.fillText(op.char, ox, oy);
                    }
                    context.globalAlpha = 1;
                }
            }
            requestAnimationFrame(renderSideAscii);
        }

        requestAnimationFrame(renderSideAscii);
    };
}

initJarSideAscii("ascii-jar-left-canvas", "static/di samping kiri jar.png", false);
initJarSideAscii("ascii-jar-right-canvas", "static/di samping kanan jar.png", true);

/* 6B. TULISAN BAWAH FOTO MENJADI TEKS ASCII MONOSPACE TAJAM & BERANIMASI */
function initJarLowerLabelsAscii() {
    const labelCanvases = document.querySelectorAll(".wing-ascii-pill-canvas");
    const SPARKS = ["·", ":", "+", "*", "✦"];

    labelCanvases.forEach((c, idx) => {
        const rawText = c.dataset.text || "";
        const context = c.getContext("2d");

        const dpr = Math.min(2, window.devicePixelRatio || 2);
        const logicalW = 190;
        const logicalH = 34;
        c.width = logicalW * dpr;
        c.height = logicalH * dpr;
        context.scale(dpr, dpr);

        const chars = rawText.split("");
        let t = idx * 1.4;

        function renderSharpAsciiLabel() {
            if (!document.hidden) {
                context.clearRect(0, 0, logicalW, logicalH);
                t += 0.05;

                const sparkIdx = Math.floor((Math.sin(t * 2.2) + 1) * 0.5 * (SPARKS.length - 1));
                context.font = 'bold 11px "Courier New", monospace';
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle = "#ff94c2";
                context.fillText(SPARKS[sparkIdx], 10, logicalH / 2);
                context.fillText(SPARKS[(sparkIdx + 2) % SPARKS.length], logicalW - 10, logicalH / 2);

                context.font = 'bold 12px "Courier New", monospace';
                const charSpacing = 8.8;
                const totalTextW = (chars.length - 1) * charSpacing;
                const startX = logicalW / 2 - totalTextW / 2;

                for (let i = 0; i < chars.length; i++) {
                    const ch = chars[i];
                    if (ch === " ") continue;

                    const wave = Math.sin(t * 2.4 - i * 0.42);
                    const offsetY = wave * 1.1;
                    const cx = startX + i * charSpacing;
                    const cy = logicalH / 2 + offsetY;

                    if (i === 0) {
                        context.fillStyle = wave > 0 ? "#ffd97d" : "#ff85b3";
                    } else if (wave > 0.55) {
                        context.fillStyle = "#ffffff";
                    } else if (wave > -0.15) {
                        context.fillStyle = "#ffc2de";
                    } else {
                        context.fillStyle = "#e0b3ff";
                    }

                    context.fillText(ch, cx, cy);
                }
            }
            requestAnimationFrame(renderSharpAsciiLabel);
        }

        requestAnimationFrame(renderSharpAsciiLabel);
    });
}

initJarLowerLabelsAscii();

/* 6C. ISI DALAM JAR ASCII BERANIMASI + SHAKE MENGACAK JADI BUTIRAN + POSISI ACAK BARU */
const jarInteriorEngine = (() => {
    const c = document.getElementById("jar-interior-canvas");
    if (!c) return { shatterAndShuffle: () => {} };
    const context = c.getContext("2d");

    const W = c.width;
    const H = c.height;
    const SAND_CHARS = [".", "·", ":", "*", "+", "✦", "#"];

    const SHAPE_TEMPLATES = [
        {
            color: "#ff85b3",
            accent: "#ffd6e8",
            rows: [
                ".#@.#@.",
                "#@@#@@#",
                "*@@@@@*",
                ".+@@@+.",
                "..*#*..",
                "...♥..."
            ]
        },
        {
            color: "#ffd97d",
            accent: "#fff3b0",
            rows: [
                "...★...",
                "..+@+..",
                "*#@@@#*",
                ".+@@@+.",
                ".*+.+*."
            ]
        },
        {
            color: "#e0aaff",
            accent: "#f3d5ff",
            rows: [
                ".*.*. ",
                "*#@#* ",
                "+@✿@+ ",
                "*#@#* ",
                ".*.*. "
            ]
        },
        {
            color: "#ff9ec9",
            accent: "#ffffff",
            rows: [
                "+-----+",
                "|* ♥ *|",
                "+-----+"
            ]
        }
    ];

    const shapes = Array.from({ length: 8 }, (_, idx) => {
        const tpl = SHAPE_TEMPLATES[idx % SHAPE_TEMPLATES.length];
        const grains = [];
        const hRows = tpl.rows.length;
        const wCols = tpl.rows[0].length;

        for (let r = 0; r < hRows; r++) {
            for (let col = 0; col < wCols; col++) {
                const ch = tpl.rows[r][col];
                if (!ch || ch === " ") continue;
                const ox = (col - (wCols - 1) / 2) * 4.4;
                const oy = (r - (hRows - 1) / 2) * 4.8;
                grains.push({
                    ox,
                    oy,
                    x: W / 2 + ox,
                    y: H * 0.6 + oy,
                    vx: 0,
                    vy: 0,
                    char: ch,
                    sandChar: SAND_CHARS[Math.floor(Math.random() * SAND_CHARS.length)],
                    color: ch === "♥" || ch === "★" || ch === "✿" || ch === "@" ? tpl.accent : tpl.color
                });
            }
        }

        return {
            cx: 34 + Math.random() * (W - 68),
            cy: 46 + Math.random() * (H - 72),
            targetX: 34 + Math.random() * (W - 68),
            targetY: 46 + Math.random() * (H - 72),
            phase: Math.random() * Math.PI * 2,
            bobSpeed: 0.025 + Math.random() * 0.015,
            rot: (Math.random() - 0.5) * 0.45,
            targetRot: (Math.random() - 0.5) * 0.45,
            grains
        };
    });

    const ambientBubbles = Array.from({ length: 18 }, () => ({
        x: 18 + Math.random() * (W - 36),
        y: 24 + Math.random() * (H - 36),
        vy: -(0.18 + Math.random() * 0.25),
        phase: Math.random() * Math.PI * 2,
        char: Math.random() > 0.5 ? "·" : "✦",
        color: Math.random() > 0.5 ? "#ffd6e8" : "#ffe082"
    }));

    let mode = "idle";
    let reformTimer = null;

    function assignNewRandomPositions() {
        const placed = [];
        shapes.forEach((sh) => {
            let nx = W * 0.5;
            let ny = H * 0.55;
            for (let attempt = 0; attempt < 25; attempt++) {
                nx = 30 + Math.random() * (W - 60);
                ny = 42 + Math.random() * (H - 64);
                const tooClose = placed.some((p) => Math.hypot(p.x - nx, p.y - ny) < 28);
                if (!tooClose) break;
            }
            placed.push({ x: nx, y: ny });
            sh.targetX = nx;
            sh.targetY = ny;
            sh.targetRot = (Math.random() - 0.5) * 0.55;
        });
    }

    assignNewRandomPositions();
    shapes.forEach((sh) => {
        sh.cx = sh.targetX;
        sh.cy = sh.targetY;
        sh.rot = sh.targetRot;
    });

    function shatterAndShuffle() {
        if (reformTimer) clearTimeout(reformTimer);
        mode = "shattering";

        shapes.forEach((sh) => {
            sh.grains.forEach((g) => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2.6 + Math.random() * 4.2;
                g.vx = Math.cos(angle) * speed;
                g.vy = Math.sin(angle) * speed - 1.5;
                g.sandChar = SAND_CHARS[Math.floor(Math.random() * SAND_CHARS.length)];
            });
        });

        reformTimer = setTimeout(() => {
            assignNewRandomPositions();
            mode = "reforming";
            setTimeout(() => {
                if (mode === "reforming") mode = "idle";
            }, 950);
        }, 680);
    }

    function renderInterior() {
        if (!document.hidden) {
            context.clearRect(0, 0, W, H);
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.font = 'bold 8px "Courier New", monospace';
            for (const b of ambientBubbles) {
                b.y += b.vy;
                b.phase += 0.04;
                if (b.y < 18) {
                    b.y = H - 16;
                    b.x = 18 + Math.random() * (W - 36);
                }
                const bx = b.x + Math.sin(b.phase) * 3;
                context.globalAlpha = 0.35 + 0.45 * Math.sin(b.phase * 1.5);
                context.fillStyle = b.color;
                context.fillText(b.char, bx, b.y);
            }
            context.globalAlpha = 1;

            context.font = 'bold 7px "Courier New", monospace';

            for (const sh of shapes) {
                sh.phase += sh.bobSpeed;

                if (mode === "idle") {
                    const floatX = Math.sin(sh.phase) * 3.2;
                    const floatY = Math.cos(sh.phase * 1.3) * 3.8;
                    const curRot = sh.rot + Math.sin(sh.phase * 0.9) * 0.14;
                    const cosR = Math.cos(curRot);
                    const sinR = Math.sin(curRot);

                    for (const g of sh.grains) {
                        const rx = g.ox * cosR - g.oy * sinR;
                        const ry = g.ox * sinR + g.oy * cosR;
                        g.x = sh.cx + floatX + rx;
                        g.y = sh.cy + floatY + ry;

                        context.fillStyle = g.color;
                        context.fillText(g.char, g.x, g.y);
                    }
                } else if (mode === "shattering") {
                    for (const g of sh.grains) {
                        g.vy += 0.14;
                        g.vx *= 0.985;
                        g.x += g.vx;
                        g.y += g.vy;

                        if (g.x < 14) { g.x = 14; g.vx = Math.abs(g.vx) * 0.85; }
                        if (g.x > W - 14) { g.x = W - 14; g.vx = -Math.abs(g.vx) * 0.85; }
                        if (g.y < 16) { g.y = 16; g.vy = Math.abs(g.vy) * 0.85; }
                        if (g.y > H - 14) { g.y = H - 14; g.vy = -(1.8 + Math.random() * 2.5); }

                        if (Math.random() < 0.18) {
                            g.sandChar = SAND_CHARS[Math.floor(Math.random() * SAND_CHARS.length)];
                        }

                        context.fillStyle = g.color;
                        context.fillText(g.sandChar, g.x, g.y);
                    }
                } else if (mode === "reforming") {
                    sh.cx += (sh.targetX - sh.cx) * 0.14;
                    sh.cy += (sh.targetY - sh.cy) * 0.14;
                    sh.rot += (sh.targetRot - sh.rot) * 0.14;

                    const cosR = Math.cos(sh.rot);
                    const sinR = Math.sin(sh.rot);

                    for (const g of sh.grains) {
                        const rx = g.ox * cosR - g.oy * sinR;
                        const ry = g.ox * sinR + g.oy * cosR;
                        const destX = sh.cx + rx;
                        const destY = sh.cy + ry;

                        g.x += (destX - g.x) * 0.16;
                        g.y += (destY - g.y) * 0.16;

                        const dist = Math.hypot(destX - g.x, destY - g.y);
                        const activeGlyph = dist > 6 ? g.sandChar : g.char;

                        context.fillStyle = g.color;
                        context.fillText(activeGlyph, g.x, g.y);
                    }
                }
            }
        }

        requestAnimationFrame(renderInterior);
    }

    requestAnimationFrame(renderInterior);
    return { shatterAndShuffle };
})();

/* 6D. ANIMASI KEMBANG API ASCII SMOOTH + JENDELA PESAN MEKAR BERGAYA BUKET */
const jarFireworkEngine = (() => {
    const fCanvas = document.getElementById("jar-fountain-canvas");
    const fCtx = fCanvas ? fCanvas.getContext("2d") : null;

    function resizeFireworkCanvas() {
        if (!fCanvas) return;
        fCanvas.width = window.innerWidth;
        fCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeFireworkCanvas, { passive: true });
    resizeFireworkCanvas();

    const TRAIL_GLYPHS = ["@", "#", "*", "+", ":", "·"];
    const FIREWORK_PALETTE = [
        ["#ffffff", "#ffd97d", "#ff94c2"],
        ["#ffd97d", "#ff85b3", "#d8b4fe"],
        ["#ff9ec9", "#ffffff", "#ffd166"],
        ["#e0aaff", "#ff85b3", "#fff3b0"]
    ];

    let rockets = [];
    let sparks = [];
    let openModalTimer = null;

    function spawnFireworkBurst(cx, cy) {
        const scheme = FIREWORK_PALETTE[Math.floor(Math.random() * FIREWORK_PALETTE.length)];

        const rings = [
            { count: 36, speedMin: 3.8, speedMax: 5.4, size: 11, life: 56, accentEvery: 4 },
            { count: 52, speedMin: 6.2, speedMax: 8.8, size: 13, life: 68, accentEvery: 3 }
        ];

        rings.forEach((ring, rIdx) => {
            for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
                const speed = ring.speedMin + Math.random() * (ring.speedMax - ring.speedMin);
                const accentChar = i % ring.accentEvery === 0
                    ? (rIdx === 0 ? "✦" : (i % 2 === 0 ? "♥" : "✿"))
                    : null;

                sparks.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    drag: 0.945,
                    gravity: 0.055,
                    age: 0,
                    maxAge: ring.life + Math.floor(Math.random() * 14),
                    size: ring.size,
                    accentChar,
                    colors: scheme,
                    trail: []
                });
            }
        });
    }

    function launchFireworkAndBloomNote(noteData) {
        if (openModalTimer) clearTimeout(openModalTimer);

        const titleEl = document.getElementById("note-title");
        const textEl = document.getElementById("note-text");
        const modal = document.getElementById("modal");
        const modalCard = document.getElementById("modal-card");
        const modalAura = document.getElementById("modal-bloom-aura");
        const jarLid = document.getElementById("jar-lid");

        titleEl.innerText = noteData.title;
        textEl.innerText = noteData.text;

        if (jarLid) {
            motionPlay(jarLid, { y: [0, -14, -4, 0], rotate: [0, -9, 6, 0] }, { duration: 0.65, ease: EASE_SILKY });
        }

        const lidRect = jarLid ? jarLid.getBoundingClientRect() : null;
        const startX = lidRect && lidRect.width > 0 ? lidRect.left + lidRect.width / 2 : window.innerWidth / 2;
        const startY = lidRect && lidRect.height > 0 ? lidRect.top : window.innerHeight * 0.46;
        const burstX = window.innerWidth / 2;
        const burstY = window.innerHeight / 2;

        rockets.push({
            startX,
            startY,
            targetX: burstX,
            targetY: burstY,
            progress: 0,
            durationFrames: 22,
            trail: []
        });

        openModalTimer = setTimeout(() => {
            spawnFireworkBurst(burstX, burstY);

            modal.classList.add("show");
            motionPlay(modal, { opacity: [0, 1] }, { duration: 0.32, ease: "easeOut" });

            motionPlay(
                modalCard,
                {
                    opacity: [0, 1],
                    scale: [0.22, 1.04, 1],
                    y: [18, -4, 0]
                },
                { duration: 0.62, ease: EASE_SILKY }
            );

            if (modalAura) {
                motionPlay(
                    modalAura,
                    {
                        scale: [0.3, 1.35, 1.05],
                        opacity: [0, 0.95, 0.7]
                    },
                    { duration: 0.75, ease: EASE_SILKY }
                );
            }
        }, 360);
    }

    function renderFireworkLoop() {
        if (!document.hidden && fCtx && fCanvas) {
            fCtx.clearRect(0, 0, fCanvas.width, fCanvas.height);

            if (rockets.length > 0 || sparks.length > 0) {
                fCtx.textAlign = "center";
                fCtx.textBaseline = "middle";

                for (let i = rockets.length - 1; i >= 0; i--) {
                    const rk = rockets[i];
                    rk.progress++;
                    const t = Math.min(1, rk.progress / rk.durationFrames);
                    const ease = 1 - Math.pow(1 - t, 3);

                    const curX = rk.startX + (rk.targetX - rk.startX) * ease + Math.sin(t * Math.PI) * 14;
                    const curY = rk.startY + (rk.targetY - rk.startY) * ease;

                    rk.trail.push({ x: curX, y: curY });
                    if (rk.trail.length > 8) rk.trail.shift();

                    for (let j = 0; j < rk.trail.length; j++) {
                        const pt = rk.trail[j];
                        const ratio = (j + 1) / rk.trail.length;
                        fCtx.globalAlpha = ratio * 0.9;
                        fCtx.font = `bold ${Math.round(8 + ratio * 6)}px "Courier New", monospace`;
                        fCtx.fillStyle = ratio > 0.7 ? "#ffffff" : "#ffd97d";
                        fCtx.fillText(ratio > 0.8 ? "✦" : "*", pt.x, pt.y);
                    }

                    if (rk.progress >= rk.durationFrames) {
                        rockets.splice(i, 1);
                    }
                }

                for (let i = sparks.length - 1; i >= 0; i--) {
                    const sp = sparks[i];
                    sp.age++;

                    sp.trail.push({ x: sp.x, y: sp.y });
                    if (sp.trail.length > 5) sp.trail.shift();

                    sp.vx *= sp.drag;
                    sp.vy = sp.vy * sp.drag + sp.gravity;
                    sp.x += sp.vx;
                    sp.y += sp.vy;

                    const lifeRatio = sp.age / sp.maxAge;
                    const baseAlpha = lifeRatio < 0.65 ? 1 : Math.max(0, 1 - (lifeRatio - 0.65) / 0.35);
                    const twinkle = 0.75 + 0.25 * Math.sin(sp.age * 0.65);

                    for (let j = 0; j < sp.trail.length; j++) {
                        const tr = sp.trail[j];
                        const tRatio = (j + 1) / sp.trail.length;
                        const glyphIdx = Math.min(
                            TRAIL_GLYPHS.length - 1,
                            Math.floor((1 - tRatio * (1 - lifeRatio * 0.6)) * TRAIL_GLYPHS.length)
                        );
                        const glyph = j === sp.trail.length - 1 && sp.accentChar
                            ? sp.accentChar
                            : TRAIL_GLYPHS[glyphIdx];

                        const colorIdx = lifeRatio < 0.3 ? 0 : (lifeRatio < 0.68 ? 1 : 2);
                        fCtx.globalAlpha = baseAlpha * twinkle * (0.25 + 0.75 * tRatio);
                        fCtx.font = `bold ${Math.max(8, Math.round(sp.size * (0.65 + 0.35 * tRatio)))}px "Courier New", monospace`;
                        fCtx.fillStyle = sp.colors[colorIdx];
                        fCtx.fillText(glyph, tr.x, tr.y);
                    }

                    if (sp.age >= sp.maxAge) {
                        sparks.splice(i, 1);
                    }
                }

                fCtx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(renderFireworkLoop);
    }

    requestAnimationFrame(renderFireworkLoop);

    return {
        launchFireworkAndBloomNote,
        clearEffects: () => {
            if (openModalTimer) clearTimeout(openModalTimer);
            rockets = [];
        }
    };
})();

function pickNote() {
    const modal = document.getElementById("modal");
    const isAlreadyOpen = modal.classList.contains("show");
    if (isAlreadyOpen) {
        forceCloseModal();
    }

    motionPlay(
        "#jar",
        {
            rotate: [0, -12, 12, -9, 8, -4, 2.5, 0],
            x: [0, -6, 6, -4, 4, -2, 0]
        },
        { duration: 0.72, ease: "easeInOut" }
    );

    sideAsciiControllers.forEach((ctrl) => ctrl.triggerCheer());
    jarInteriorEngine.shatterAndShuffle();

    const data = getUniqueRandomNote();
    setTimeout(() => {
        jarFireworkEngine.launchFireworkAndBloomNote(data);
    }, isAlreadyOpen ? 260 : 120);
}

function forceCloseModal() {
    const modal = document.getElementById("modal");
    const card = document.getElementById("modal-card");
    if (!modal.classList.contains("show")) return;

    jarFireworkEngine.clearEffects();

    if (prefersReducedMotion) {
        modal.classList.remove("show");
        return;
    }

    motionPlay(card, { opacity: [1, 0], scale: [1, 0.86] }, { duration: 0.22, ease: EASE_FOLD_CLOSE });
    const bgFade = motionPlay(modal, { opacity: [1, 0] }, { duration: 0.24, ease: "easeOut" });
    if (bgFade && bgFade.finished) {
        bgFade.finished.then(() => {
            modal.classList.remove("show");
            modal.style.opacity = "";
            card.style.opacity = "";
            card.style.transform = "";
        });
    } else {
        modal.classList.remove("show");
    }
}

/* ==========================================
   7. OPSI INTERAKTIF:
      7A. BOUQUET 3D MATH ASCII
      7B. KUE ULANG TAHUN COQUETTE 3D MATH ASCII
      7C. TIUP LILIN & FORM WISH
   ========================================== */
function selectOption(optionNumber, clickedBtn) {
    document.querySelectorAll(".opt-btn").forEach((btn) => btn.classList.remove("active"));
    clickedBtn.classList.add("active");

    document.querySelectorAll(".opt-panel").forEach((panel) => panel.classList.remove("show"));
    const activePanel = document.getElementById("opt-content-" + optionNumber);
    activePanel.classList.add("show");

    motionPlay(activePanel, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, ease: EASE_SILKY });

    if (optionNumber === 2) {
        motionPlay(
            activePanel.querySelectorAll(".admire-card"),
            { opacity: [0, 1], x: [-14, 0] },
            { duration: 0.48, delay: stagger(0.08), ease: EASE_SILKY }
        );
    }
}

function bloomBouquet(event) {
    if (event) event.stopPropagation();

    const msg = document.getElementById("bouquet-msg");
    const burstLayer = document.getElementById("flower-burst-layer");

    motionPlay(
        "#bouquet-3d-wrap",
        { scale: [1, 1.12, 0.97, 1], y: [0, -12, 2, 0], rotate: [0, 3.5, -1.8, 0] },
        SPRING_BOUNCY
    );
    motionPlay("#bouquet-aura", { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.75] }, { duration: 0.7, ease: EASE_SILKY });

    msg.innerText = "Sending you endless happiness & warm hugs! 💐✨";
    if (!burstLayer) return;

    const totalParticles = 15;
    for (let i = 0; i < totalParticles; i++) {
        const particle = document.createElement("div");
        particle.className = "burst-flower";

        const flowerImg = document.createElement("img");
        flowerImg.src = BURST_FLOWER_IMAGES[i % BURST_FLOWER_IMAGES.length];
        flowerImg.alt = "";
        flowerImg.className = "burst-flower-img";
        const sizePx = 58 + Math.floor(Math.random() * 22);
        flowerImg.style.width = `${sizePx}px`;
        flowerImg.style.height = `${sizePx}px`;
        particle.appendChild(flowerImg);
        burstLayer.appendChild(particle);

        const angle = (i / totalParticles) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const distance = 110 + Math.random() * 85;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = (Math.random() - 0.5) * 420;
        const sc = 0.85 + Math.random() * 0.5;

        const anim = motionPlay(
            particle,
            {
                x: [0, tx],
                y: [0, ty],
                scale: [0.25, sc, sc * 0.92],
                rotate: [0, rot],
                opacity: [1, 1, 0]
            },
            { duration: 1.35, ease: [0.16, 1, 0.3, 1] }
        );

        if (anim && anim.finished) {
            anim.finished.then(() => particle.remove());
        } else {
            setTimeout(() => particle.remove(), 1400);
        }
    }
}

/* 7A. BOUQUET 3D MATH ASCII */
function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const DENSITY = " .:-=+*#%@";
    const COLS = 74;
    const ROWS = 74;
    const TOTAL_CELLS = COLS * ROWS;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    const ROTATION_SPEED = 0.0045;

    const zBuffer = new Float32Array(TOTAL_CELLS);
    const charIdxBuffer = new Uint8Array(TOTAL_CELLS);
    const colorIdxBuffer = new Uint8Array(TOTAL_CELLS);

    const BASE_PALETTES = [
        [248, 56, 98],
        [255, 92, 156],
        [255, 152, 198],
        [214, 118, 248],
        [255, 156, 114],
        [252, 118, 162],
        [255, 220, 95],
        [52, 176, 118],
        [84, 218, 146],
        [244, 218, 212],
        [255, 108, 172]
    ];

    const COLOR_LUT = new Array(BASE_PALETTES.length * 16);
    for (let p = 0; p < BASE_PALETTES.length; p++) {
        const [br, bg, bb] = BASE_PALETTES[p];
        for (let s = 0; s < 16; s++) {
            const mult = 0.42 + (s / 15) * 0.78;
            const r = Math.min(255, Math.round(br * mult));
            const g = Math.min(255, Math.round(bg * mult));
            const b = Math.min(255, Math.round(bb * mult));
            COLOR_LUT[p * 16 + s] = `rgb(${r},${g},${b})`;
        }
    }

    function createRoseGeometry(uSteps, vSteps, turns) {
        const pts = [];
        const maxTheta = turns * Math.PI * 2;
        for (let ui = 0; ui < uSteps; ui++) {
            const t = ui / (uSteps - 1);
            const theta = t * maxTheta;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);

            const mod = (3.6 * theta) % (Math.PI * 2);
            const petalShape = 1 - 0.48 * Math.pow(1.25 * Math.pow(1 - mod / Math.PI, 2) - 0.25, 2);

            for (let vi = 1; vi <= vSteps; vi++) {
                const s = vi / vSteps;
                pts.push({
                    t,
                    s,
                    cosT,
                    sinT,
                    petalShape,
                    sCurve: Math.sin(s * Math.PI * 0.5),
                    yRise: 1 - Math.cos(s * Math.PI * 0.5),
                    curl: Math.pow(s, 3)
                });
            }
        }
        return pts;
    }

    function createLilyGeometry(petalCount, lSteps, wSteps) {
        const petals = [];
        for (let p = 0; p < petalCount; p++) {
            const baseAng = (p / petalCount) * Math.PI * 2 + (p % 2) * 0.06;
            const cosA = Math.cos(baseAng);
            const sinA = Math.sin(baseAng);

            for (let li = 1; li <= lSteps; li++) {
                const l = li / lSteps;
                const halfW = Math.sin(Math.pow(l, 0.72) * Math.PI) * 0.34 * (1 - 0.22 * l);
                const archBase = Math.sin(l * Math.PI * 0.65);
                const tipRecurve = Math.pow(l, 2.5);

                for (let wi = -wSteps; wi <= wSteps; wi++) {
                    const w = wi / wSteps;
                    const cup = (1 - w * w) * 0.08;
                    petals.push({
                        l,
                        w,
                        cosA,
                        sinA,
                        halfW,
                        archBase,
                        tipRecurve,
                        cup
                    });
                }
            }
        }

        const stamens = [];
        for (let st = 0; st < 6; st++) {
            const ang = (st / 6) * Math.PI * 2 + 0.25;
            const cosS = Math.cos(ang);
            const sinS = Math.sin(ang);
            for (let si = 1; si <= 7; si++) {
                const f = si / 7;
                stamens.push({
                    f,
                    cosS,
                    sinS,
                    isTip: si >= 6
                });
            }
        }

        return { petals, stamens };
    }

    const heroRoseGeo = createRoseGeometry(130, 8, 6.2);
    const sideRoseGeo = createRoseGeometry(95, 7, 5.4);
    const lilyGeo = createLilyGeometry(6, 13, 3);

    const flowers = [
        { kind: "rose", geo: heroRoseGeo, scale: 0.44, pos: [0.0, 0.30, 0.30], tiltX: 0.52, tiltZ: 0.0, pal: 1, delay: 0.34 },
        { kind: "lily", geo: lilyGeo, scale: 0.50, pos: [0.0, 0.76, 0.04], tiltX: 0.18, tiltZ: 0.0, pal: 0, delay: 0.42 },
        { kind: "lily", geo: lilyGeo, scale: 0.45, pos: [-0.54, 0.54, 0.12], tiltX: 0.32, tiltZ: 0.46, pal: 3, delay: 0.48 },
        { kind: "lily", geo: lilyGeo, scale: 0.45, pos: [0.54, 0.56, 0.10], tiltX: 0.32, tiltZ: -0.46, pal: 4, delay: 0.52 },
        { kind: "rose", geo: sideRoseGeo, scale: 0.37, pos: [-0.50, 0.10, 0.28], tiltX: 0.58, tiltZ: 0.50, pal: 5, delay: 0.40 },
        { kind: "rose", geo: sideRoseGeo, scale: 0.37, pos: [0.50, 0.12, 0.26], tiltX: 0.58, tiltZ: -0.50, pal: 2, delay: 0.44 },
        { kind: "lily", geo: lilyGeo, scale: 0.44, pos: [-0.36, 0.44, -0.34], tiltX: -0.42, tiltZ: 0.34, pal: 2, delay: 0.56 },
        { kind: "lily", geo: lilyGeo, scale: 0.44, pos: [0.36, 0.46, -0.32], tiltX: -0.42, tiltZ: -0.34, pal: 0, delay: 0.60 }
    ];

    const staticParts = [];

    flowers.forEach((fl, idx) => {
        const [tx, ty, tz] = fl.pos;
        const bend = (idx % 2 === 0 ? 1 : -1) * 0.04;
        const steps = 34;
        for (let i = 0; i <= steps; i++) {
            const h = i / steps;
            const sx = tx * Math.pow(h, 0.85) + Math.sin(h * Math.PI) * bend;
            const sy = -1.24 + (ty - (-1.24)) * h;
            const sz = tz * Math.pow(h, 0.85);

            for (let r = -1; r <= 1; r++) {
                staticParts.push({
                    x: sx + r * 0.014,
                    y: sy,
                    z: sz,
                    nx: r * 0.55,
                    ny: 0.2,
                    nz: 0.8,
                    pal: 7,
                    stage: h * 0.35,
                    isFoliage: true
                });
            }
        }
    });

    const leafConfigs = [
        { base: [-0.18, -0.06, 0.22], dir: [-0.85, 0.38, 0.35], delay: 0.24 },
        { base: [0.18, -0.04, 0.22], dir: [0.85, 0.40, 0.35], delay: 0.26 },
        { base: [-0.26, 0.24, 0.16], dir: [-0.92, 0.48, 0.15], delay: 0.30 },
        { base: [0.26, 0.26, 0.16], dir: [0.92, 0.48, 0.15], delay: 0.32 },
        { base: [0.0, -0.14, 0.30], dir: [0.04, 0.25, 0.94], delay: 0.28 },
        { base: [-0.22, 0.18, -0.22], dir: [-0.82, 0.45, -0.45], delay: 0.34 },
        { base: [0.22, 0.20, -0.22], dir: [0.82, 0.45, -0.45], delay: 0.36 },
        { base: [0.0, 0.36, -0.26], dir: [0.0, 0.58, -0.80], delay: 0.38 }
    ];

    leafConfigs.forEach((lf) => {
        const [bx, by, bz] = lf.base;
        const [dx, dy, dz] = lf.dir;
        const px = -dz;
        const pz = dx;

        for (let u = 0; u <= 14; u++) {
            const l = u / 14;
            const halfW = Math.sin(l * Math.PI) * 0.18 * (1 - l * 0.2);
            const arch = Math.sin(l * Math.PI * 0.72) * 0.18 - l * l * 0.12;
            for (let v = -3; v <= 3; v++) {
                const w = (v / 3) * halfW;
                staticParts.push({
                    x: bx + dx * (l * 0.56) + px * w,
                    y: by + dy * (l * 0.56) + arch - Math.abs(w) * 0.18,
                    z: bz + dz * (l * 0.56) + pz * w,
                    nx: px * w * 2.2,
                    ny: 0.88,
                    nz: pz * w * 2.2 + 0.35,
                    pal: 8,
                    stage: lf.delay + l * 0.22,
                    isFoliage: true
                });
            }
        }
    });

    const wrapRows = 26;
    const wrapCols = 64;
    for (let rIdx = 0; rIdx <= wrapRows; rIdx++) {
        const h = rIdx / wrapRows;
        for (let cIdx = 0; cIdx < wrapCols; cIdx++) {
            const ang = (cIdx / wrapCols) * Math.PI * 2;
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);

            const backCollar = Math.max(0, -sinA) * 0.34 * Math.pow(h, 1.3);
            const frontDip = Math.max(0, sinA) * 0.14 * h;
            const y = -1.24 + h * 1.12 + backCollar - frontDip;

            const pleat = Math.sin(ang * 14) * 0.042 * h;
            const radius = 0.12 + Math.pow(h, 0.88) * 0.74 + pleat;

            if (h > 0.72 && sinA > 0.55) continue;

            staticParts.push({
                x: cosA * radius,
                y,
                z: sinA * radius,
                nx: cosA * 0.85 + Math.cos(ang * 14) * 0.35,
                ny: -0.25,
                nz: sinA * 0.85,
                pal: 9,
                stage: 0.08 + h * 0.30,
                isFoliage: false
            });
        }
    }

    for (let a = 0; a < 56; a++) {
        const ang = (a / 56) * Math.PI * 2;
        const rBand = 0.33;
        for (let band = -1; band <= 1; band++) {
            staticParts.push({
                x: Math.cos(ang) * rBand,
                y: -0.72 + band * 0.026,
                z: Math.sin(ang) * rBand,
                nx: Math.cos(ang),
                ny: 0.15,
                nz: Math.sin(ang),
                pal: 10,
                stage: 0.26,
                isFoliage: false
            });
        }
        const bowR = 0.24 * Math.sin(2 * ang);
        staticParts.push({
            x: Math.cos(ang) * bowR,
            y: -0.72 + Math.sin(ang) * bowR * 0.52,
            z: 0.34 + Math.abs(Math.sin(ang)) * 0.05,
            nx: 0,
            ny: 0.25,
            nz: 0.96,
            pal: 10,
            stage: 0.30,
            isFoliage: false
        });
    }

    for (let side of [-1, 1]) {
        for (let t = 0; t <= 12; t++) {
            const f = t / 12;
            staticParts.push({
                x: side * (0.04 + f * 0.16),
                y: -0.74 - f * 0.34,
                z: 0.35 + Math.sin(f * Math.PI) * 0.04,
                nx: 0,
                ny: 0.2,
                nz: 0.98,
                pal: 10,
                stage: 0.32 + f * 0.08,
                isFoliage: false
            });
        }
    }

    const sparkles = Array.from({ length: 16 }, (_, i) => ({
        angle: (i / 16) * Math.PI * 2,
        radius: 0.55 + Math.random() * 0.55,
        y: -0.2 + Math.random() * 1.25,
        speed: 0.003 + Math.random() * 0.0035,
        char: i % 3 === 0 ? "✦" : (i % 2 === 0 ? "*" : "·"),
        color: i % 2 === 0 ? "#ffd97d" : "#ffb8d8"
    }));

    let growProgress = prefersReducedMotion ? 1 : 0;
    let hasStarted = prefersReducedMotion;
    let angleY = 0.15;
    let spinBoost = 0;
    let pointerTiltX = 0;
    let time = 0;

    const box = document.getElementById("bouquet-box");
    if (box) {
        box.addEventListener("mousemove", (e) => {
            const rect = box.getBoundingClientRect();
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            pointerTiltX = -ny * 0.24;
        });
        box.addEventListener("mouseleave", () => {
            pointerTiltX = 0;
        });
        box.addEventListener("click", () => {
            hasStarted = true;
            growProgress = 0.02;
            spinBoost = 0.045;
        });
    }

    const optionsSection = document.getElementById("options-section");
    if (optionsSection && !prefersReducedMotion) {
        inView(optionsSection, () => {
            if (!hasStarted) {
                hasStarted = true;
                growProgress = 0;
            }
        }, { amount: 0.25 });
    } else {
        hasStarted = true;
    }

    const lx = -0.38;
    const ly = 0.76;
    const lz = 0.52;

    function plot3D(wx, wy, wz, nx, ny, nz, palIdx, cosY, sinY, cosX, sinX) {
        const rx1 = wx * cosY - wz * sinY;
        const rz1 = wx * sinY + wz * cosY;

        const ry2 = wy * cosX - rz1 * sinX;
        const rz2 = wy * sinX + rz1 * cosX;

        const cameraZ = 3.85;
        const fov = 3.25;
        const depth = cameraZ - rz2;
        if (depth <= 0.45) return;

        const projScale = fov / depth;
        const sx = Math.round(COLS * 0.5 + rx1 * projScale * (COLS * 0.33));
        const sy = Math.round(ROWS * 0.53 - ry2 * projScale * (ROWS * 0.33));

        if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) return;

        const idx = sy * COLS + sx;
        if (rz2 <= zBuffer[idx]) return;
        zBuffer[idx] = rz2;

        const rnx1 = nx * cosY - nz * sinY;
        const rnz1 = nx * sinY + nz * cosY;
        const rny2 = ny * cosX - rnz1 * sinX;
        const rnz2 = ny * sinX + rnz1 * cosX;

        const dot = Math.max(0, rnx1 * lx + rny2 * ly + rnz2 * lz);
        const shade = Math.min(1, 0.24 + dot * 0.84);

        charIdxBuffer[idx] = Math.min(DENSITY.length - 1, Math.max(1, Math.floor(shade * (DENSITY.length - 1))));
        colorIdxBuffer[idx] = palIdx * 16 + Math.min(15, Math.floor(shade * 15));
    }

    function renderMathBouquet() {
        const panel = document.getElementById("opt-content-1");
        if (!document.hidden && panel && panel.classList.contains("show")) {
            zBuffer.fill(-999);
            charIdxBuffer.fill(0);

            if (hasStarted && growProgress < 1) {
                growProgress = Math.min(1, growProgress + 0.0085);
            }

            if (!prefersReducedMotion) {
                angleY += ROTATION_SPEED + spinBoost;
                spinBoost *= 0.94;
                time += 0.026;
            }

            const viewPitch = -0.18 + pointerTiltX;
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const cosX = Math.cos(viewPitch);
            const sinX = Math.sin(viewPitch);

            for (const p of staticParts) {
                if (growProgress < p.stage) continue;

                const breeze = (p.isFoliage && !prefersReducedMotion)
                    ? Math.sin(time * 1.15 + p.y * 2.2) * 0.024 * Math.max(0, p.y + 0.5)
                    : 0;

                plot3D(p.x + breeze, p.y, p.z, p.nx, p.ny, p.nz, p.pal, cosY, sinY, cosX, sinX);
            }

            flowers.forEach((fl, fIdx) => {
                if (growProgress < fl.delay) return;

                const rawBloom = Math.min(1, (growProgress - fl.delay) / (1 - fl.delay));
                const easeBloom = 1 - Math.pow(1 - rawBloom, 3);

                const breath = !prefersReducedMotion
                    ? Math.sin(time * 1.45 + fIdx * 0.9) * 0.065 * easeBloom
                    : 0;
                const openFactor = Math.max(0.06, Math.min(1.08, 0.08 + 0.92 * easeBloom + breath));

                const breezeX = !prefersReducedMotion
                    ? Math.sin(time * 1.15 + fl.pos[1] * 2.2) * 0.028 * Math.max(0, fl.pos[1] + 0.4)
                    : 0;

                const cosRz = Math.cos(fl.tiltZ);
                const sinRz = Math.sin(fl.tiltZ);
                const cosRx = Math.cos(fl.tiltX);
                const sinRx = Math.sin(fl.tiltX);

                if (fl.kind === "rose") {
                    for (const pt of fl.geo) {
                        const r = pt.petalShape * (0.10 + 0.90 * Math.pow(pt.t, 0.72)) * pt.sCurve * (0.22 + 0.78 * openFactor);
                        const ly = pt.yRise * (1.06 - 0.50 * pt.t * openFactor) - pt.curl * 0.26 * pt.t * openFactor;
                        const lx0 = r * pt.cosT;
                        const lz0 = r * pt.sinT;

                        const ny0 = 0.45 + (1 - pt.t) * 0.35;
                        const nx0 = pt.cosT * (0.55 + pt.t * 0.45);
                        const nz0 = pt.sinT * (0.55 + pt.t * 0.45);

                        const tx = (lx0 * cosRz - ly * sinRz) * fl.scale;
                        const ty1 = (lx0 * sinRz + ly * cosRz) * fl.scale;
                        const tz1 = lz0 * fl.scale;

                        const ty = ty1 * cosRx - tz1 * sinRx;
                        const tz = ty1 * sinRx + tz1 * cosRx;

                        const tnx = nx0 * cosRz - ny0 * sinRz;
                        const tny1 = nx0 * sinRz + ny0 * cosRz;
                        const tny = tny1 * cosRx - nz0 * sinRx;
                        const tnz = tny1 * sinRx + nz0 * cosRx;

                        plot3D(
                            tx + fl.pos[0] + breezeX,
                            ty + fl.pos[1],
                            tz + fl.pos[2],
                            tnx, tny, tnz,
                            fl.pal,
                            cosY, sinY, cosX, sinX
                        );
                    }
                } else {
                    const spread = 0.14 + 0.86 * openFactor;
                    for (const pt of fl.geo.petals) {
                        const radial = pt.l * (0.22 + 0.94 * spread);
                        const ly = pt.archBase * (0.96 - 0.46 * openFactor) - pt.tipRecurve * 0.42 * openFactor + pt.cup;
                        const perp = pt.w * pt.halfW * (0.30 + 0.70 * openFactor);

                        const lx0 = pt.cosA * radial - pt.sinA * perp;
                        const lz0 = pt.sinA * radial + pt.cosA * perp;

                        const nx0 = pt.cosA * 0.45 - pt.sinA * pt.w * 0.55;
                        const ny0 = 0.78 - pt.l * 0.35;
                        const nz0 = pt.sinA * 0.45 + pt.cosA * pt.w * 0.55;

                        const tx = (lx0 * cosRz - ly * sinRz) * fl.scale;
                        const ty1 = (lx0 * sinRz + ly * cosRz) * fl.scale;
                        const tz1 = lz0 * fl.scale;

                        const ty = ty1 * cosRx - tz1 * sinRx;
                        const tz = ty1 * sinRx + tz1 * cosRx;

                        const tnx = nx0 * cosRz - ny0 * sinRz;
                        const tny1 = nx0 * sinRz + ny0 * cosRz;
                        const tny = tny1 * cosRx - nz0 * sinRx;
                        const tnz = tny1 * sinRx + nz0 * cosRx;

                        plot3D(
                            tx + fl.pos[0] + breezeX,
                            ty + fl.pos[1],
                            tz + fl.pos[2],
                            tnx, tny, tnz,
                            fl.pal,
                            cosY, sinY, cosX, sinX
                        );
                    }

                    if (openFactor > 0.35) {
                        for (const st of fl.geo.stamens) {
                            const sr = Math.pow(st.f, 1.5) * 0.24 * openFactor;
                            const sy = st.f * 0.52 * openFactor;
                            const lx0 = st.cosS * sr;
                            const lz0 = st.sinS * sr;

                            const tx = (lx0 * cosRz - sy * sinRz) * fl.scale;
                            const ty1 = (lx0 * sinRz + sy * cosRz) * fl.scale;
                            const tz1 = lz0 * fl.scale;

                            const ty = ty1 * cosRx - tz1 * sinRx;
                            const tz = ty1 * sinRx + tz1 * cosRx;

                            plot3D(
                                tx + fl.pos[0] + breezeX,
                                ty + fl.pos[1],
                                tz + fl.pos[2],
                                0, 0.9, 0.4,
                                6,
                                cosY, sinY, cosX, sinX
                            );
                        }
                    }
                }
            });

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${Math.ceil(cellH * 1.22)}px "Courier New", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let y = 0; y < ROWS; y++) {
                const py = (y + 0.5) * cellH;
                for (let x = 0; x < COLS; x++) {
                    const idx = y * COLS + x;
                    const cIdx = charIdxBuffer[idx];
                    if (cIdx === 0) continue;

                    ctx.fillStyle = COLOR_LUT[colorIdxBuffer[idx]];
                    ctx.fillText(DENSITY[cIdx], (x + 0.5) * cellW, py);
                }
            }

            if (!prefersReducedMotion && growProgress > 0.45) {
                ctx.font = 'bold 11px "Courier New", monospace';
                for (const sp of sparkles) {
                    sp.y += sp.speed;
                    if (sp.y > 1.1) sp.y = -0.25;

                    const sx3 = Math.cos(sp.angle + time * 0.35) * sp.radius;
                    const sz3 = Math.sin(sp.angle + time * 0.35) * sp.radius;

                    const rx1 = sx3 * cosY - sz3 * sinY;
                    const rz1 = sx3 * sinY + sz3 * cosY;
                    const ry2 = sp.y * cosX - rz1 * sinX;
                    const rz2 = sp.y * sinX + rz1 * cosX;

                    const depth = 3.85 - rz2;
                    if (depth <= 0.45) continue;

                    const projScale = 3.25 / depth;
                    const px = (COLS * 0.5 + rx1 * projScale * (COLS * 0.33)) * cellW;
                    const py = (ROWS * 0.53 - ry2 * projScale * (ROWS * 0.33)) * cellH;

                    const pulse = 0.35 + 0.55 * Math.sin(time * 2.4 + sp.angle * 3);
                    ctx.globalAlpha = Math.max(0.1, pulse);
                    ctx.fillStyle = sp.color;
                    ctx.fillText(sp.char, px, py);
                }
                ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(renderMathBouquet);
    }

    requestAnimationFrame(renderMathBouquet);
}

initAsciiBouquet();

/* 7B. KUE ULANG TAHUN COQUETTE 3D MATH ASCII */
let candlesBlownOut = false;

const cake3DEngine = (() => {
    const canvas = document.getElementById("ascii-cake-canvas");
    if (!canvas) return { triggerBlowBurst: () => {} };
    const ctx = canvas.getContext("2d");

    const DENSITY = " .:-=+*#%@";
    const COLS = 76;
    const ROWS = 76;
    const TOTAL_CELLS = COLS * ROWS;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    const zBuffer = new Float32Array(TOTAL_CELLS);
    const charIdxBuffer = new Uint8Array(TOTAL_CELLS);
    const colorIdxBuffer = new Uint8Array(TOTAL_CELLS);

    const CAKE_PALETTES = [
        [255, 246, 232],
        [255, 224, 234],
        [188, 28, 68],
        [255, 118, 174],
        [246, 206, 126],
        [235, 226, 242],
        [255, 214, 92],
        [255, 255, 230],
        [214, 152, 118]
    ];

    const COLOR_LUT = new Array(CAKE_PALETTES.length * 16);
    for (let p = 0; p < CAKE_PALETTES.length; p++) {
        const [br, bg, bb] = CAKE_PALETTES[p];
        for (let s = 0; s < 16; s++) {
            const mult = 0.44 + (s / 15) * 0.76;
            const r = Math.min(255, Math.round(br * mult));
            const g = Math.min(255, Math.round(bg * mult));
            const b = Math.min(255, Math.round(bb * mult));
            COLOR_LUT[p * 16 + s] = `rgb(${r},${g},${b})`;
        }
    }

    const cakeParts = [];

    function addPoint(x, y, z, nx, ny, nz, pal, stage) {
        cakeParts.push({ x, y, z, nx, ny, nz, pal, stage });
    }

    for (let hIdx = 0; hIdx <= 14; hIdx++) {
        const h = hIdx / 14;
        const y = -0.96 + h * 0.34;
        const r = 0.14 + Math.pow(1 - h, 2.2) * 0.28 + Math.pow(h, 3.0) * 0.14;
        const segs = 48;
        for (let i = 0; i < segs; i++) {
            const ang = (i / segs) * Math.PI * 2;
            const c = Math.cos(ang);
            const s = Math.sin(ang);
            addPoint(c * r, y, s * r, c, 0.2, s, hIdx % 7 === 0 ? 4 : 5, 0.04 + h * 0.1);
        }
    }

    for (let rIdx = 1; rIdx <= 18; rIdx++) {
        const rf = rIdx / 18;
        const rad = rf * 0.94;
        const rimLift = rf > 0.88 ? (rf - 0.88) * 0.45 : 0;
        const segs = Math.max(18, Math.round(rf * 76));
        for (let i = 0; i < segs; i++) {
            const ang = (i / segs) * Math.PI * 2;
            const c = Math.cos(ang);
            const s = Math.sin(ang);
            const isGoldRim = rIdx >= 17;
            addPoint(c * rad, -0.62 + rimLift, s * rad, c * 0.15, 0.98, s * 0.15, isGoldRim ? 4 : 5, 0.10 + rf * 0.08);
        }
    }

    const botR = 0.56;
    const botY0 = -0.60;
    const botY1 = -0.10;
    const botRows = 22;
    const botCols = 72;

    for (let rIdx = 0; rIdx <= botRows; rIdx++) {
        const hf = rIdx / botRows;
        const y = botY0 + hf * (botY1 - botY0);
        for (let cIdx = 0; cIdx < botCols; cIdx++) {
            const ang = (cIdx / botCols) * Math.PI * 2;
            const c = Math.cos(ang);
            const s = Math.sin(ang);

            const isBottomPiping = rIdx <= 2;
            const isTopPiping = rIdx >= botRows - 2;
            const ruffle = (isBottomPiping || isTopPiping) ? (0.028 + Math.sin(ang * 24) * 0.014) : 0;
            const rad = botR + ruffle;
            const pal = (isBottomPiping || isTopPiping) ? 1 : 0;

            addPoint(c * rad, y, s * rad, c, (isTopPiping ? 0.35 : 0), s, pal, 0.18 + hf * 0.16);
        }
    }

    for (let rIdx = 1; rIdx <= 12; rIdx++) {
        const rf = rIdx / 12;
        const rad = rf * botR;
        const segs = Math.max(16, Math.round(rf * 56));
        for (let i = 0; i < segs; i++) {
            const ang = (i / segs) * Math.PI * 2;
            addPoint(Math.cos(ang) * rad, botY1, Math.sin(ang) * rad, 0, 1, 0, 0, 0.32);
        }
    }

    function addCoquetteBowOnCylinder(baseAng, cylRadius, centerY, bowScale, palIdx, stage) {
        const dirX = Math.cos(baseAng);
        const dirZ = Math.sin(baseAng);
        const tanX = -dirZ;
        const tanZ = dirX;

        for (let u = -2; u <= 2; u++) {
            for (let v = -2; v <= 2; v++) {
                const offT = (u / 2) * 0.025 * bowScale;
                const offY = (v / 2) * 0.025 * bowScale;
                const rOut = cylRadius + 0.028;
                addPoint(
                    dirX * rOut + tanX * offT,
                    centerY + offY,
                    dirZ * rOut + tanZ * offT,
                    dirX, 0.1, dirZ,
                    palIdx,
                    stage
                );
            }
        }

        for (let a = 0; a < 44; a++) {
            const t = (a / 44) * Math.PI * 2;
            const loopR = Math.sin(2 * t) * 0.13 * bowScale;
            const lx = Math.cos(t) * loopR;
            const ly = Math.sin(t) * loopR * 0.58;
            const rOut = cylRadius + 0.024 + Math.abs(lx) * 0.12;
            addPoint(
                dirX * rOut + tanX * lx,
                centerY + ly,
                dirZ * rOut + tanZ * lx,
                dirX * 0.9 + tanX * (lx > 0 ? 0.3 : -0.3),
                0.2,
                dirZ * 0.9 + tanZ * (lx > 0 ? 0.3 : -0.3),
                palIdx,
                stage + 0.02
            );
        }

        for (const side of [-1, 1]) {
            for (let sIdx = 0; sIdx <= 12; sIdx++) {
                const f = sIdx / 12;
                const sway = side * (0.025 + f * 0.075) * bowScale + Math.sin(f * Math.PI) * 0.015 * side;
                const dy = -0.02 - f * 0.19 * bowScale;
                const rOut = cylRadius + 0.022;
                addPoint(
                    dirX * rOut + tanX * sway,
                    centerY + dy,
                    dirZ * rOut + tanZ * sway,
                    dirX, 0, dirZ,
                    palIdx,
                    stage + 0.04
                );
            }
        }
    }

    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((bAng) => {
        addCoquetteBowOnCylinder(bAng, botR, -0.33, 1.05, 2, 0.34);
    });

    const topR = 0.36;
    const topY0 = -0.10;
    const topY1 = 0.30;
    const topRows = 18;
    const topCols = 56;

    for (let rIdx = 0; rIdx <= topRows; rIdx++) {
        const hf = rIdx / topRows;
        const y = topY0 + hf * (topY1 - topY0);
        for (let cIdx = 0; cIdx < topCols; cIdx++) {
            const ang = (cIdx / topCols) * Math.PI * 2;
            const c = Math.cos(ang);
            const s = Math.sin(ang);

            const isBottomPiping = rIdx <= 2;
            const isTopPiping = rIdx >= topRows - 2;
            const ruffle = (isBottomPiping || isTopPiping) ? (0.022 + Math.sin(ang * 18) * 0.012) : 0;
            const rad = topR + ruffle;
            const pal = (isBottomPiping || isTopPiping) ? 1 : 0;

            addPoint(c * rad, y, s * rad, c, (isTopPiping ? 0.35 : 0), s, pal, 0.36 + hf * 0.16);
        }
    }

    for (let rIdx = 1; rIdx <= 10; rIdx++) {
        const rf = rIdx / 10;
        const rad = rf * topR;
        const segs = Math.max(12, Math.round(rf * 44));
        for (let i = 0; i < segs; i++) {
            const ang = (i / segs) * Math.PI * 2;
            addPoint(Math.cos(ang) * rad, topY1, Math.sin(ang) * rad, 0, 1, 0, 0, 0.50);
        }
    }

    addCoquetteBowOnCylinder(Math.PI * 0.5, topR, 0.11, 0.82, 2, 0.52);
    addCoquetteBowOnCylinder(-Math.PI * 0.5, topR, 0.11, 0.82, 2, 0.52);

    const cupcakePositions = [
        [-0.73, -0.60, 0.24],
        [-0.73, -0.60, -0.24],
        [0.73, -0.60, 0.24],
        [0.73, -0.60, -0.24]
    ];

    cupcakePositions.forEach(([cx, cy, cz], idx) => {
        for (let hIdx = 0; hIdx <= 6; hIdx++) {
            const hf = hIdx / 6;
            const y = cy + hf * 0.11;
            const r = 0.075 + hf * 0.025;
            const segs = 22;
            for (let i = 0; i < segs; i++) {
                const ang = (i / segs) * Math.PI * 2;
                const c = Math.cos(ang);
                const s = Math.sin(ang);
                addPoint(cx + c * r, y, cz + s * r, c, 0.1, s, 8, 0.24 + idx * 0.03);
            }
        }
        for (let hIdx = 0; hIdx <= 8; hIdx++) {
            const hf = hIdx / 8;
            const y = cy + 0.11 + hf * 0.11;
            const r = (1 - Math.pow(hf, 1.35)) * 0.105;
            const segs = Math.max(6, Math.round((1 - hf * 0.7) * 22));
            for (let i = 0; i < segs; i++) {
                const ang = (i / segs) * Math.PI * 2 + hf * 2.2;
                const c = Math.cos(ang);
                const s = Math.sin(ang);
                addPoint(cx + c * r, y, cz + s * r, c * 0.7, 0.7, s * 0.7, hIdx === 8 ? 4 : 3, 0.28 + idx * 0.03);
            }
        }
        addCoquetteBowOnCylinder(Math.PI * 0.5, 0.095, cy + 0.07, 0.36, 3, 0.32);
    });

    const candleConfigs = [
        { x: -0.14, z: 0.05, h: 0.28 },
        { x: 0.0, z: -0.07, h: 0.33 },
        { x: 0.14, z: 0.05, h: 0.28 }
    ];

    candleConfigs.forEach((cd, cIdx) => {
        const cSteps = 16;
        const cSegs = 16;
        const cRad = 0.026;
        for (let hi = 0; hi <= cSteps; hi++) {
            const hf = hi / cSteps;
            const y = topY1 + hf * cd.h;
            for (let si = 0; si < cSegs; si++) {
                const ang = (si / cSegs) * Math.PI * 2;
                const c = Math.cos(ang);
                const s = Math.sin(ang);
                const stripe = Math.sin(ang * 2 + hf * 12) > 0 ? 3 : 0;
                addPoint(cd.x + c * cRad, y, cd.z + s * cRad, c, 0.1, s, stripe, 0.56 + cIdx * 0.04);
            }
        }
        addPoint(cd.x, topY1 + cd.h + 0.02, cd.z, 0, 1, 0, 2, 0.66);
    });

    let smokeParticles = [];

    function triggerBlowBurst(isBlown) {
        if (!isBlown) {
            smokeParticles = [];
            return;
        }
        smokeParticles = [];
        candleConfigs.forEach((cd) => {
            const baseY = topY1 + cd.h + 0.04;
            for (let i = 0; i < 14; i++) {
                smokeParticles.push({
                    x: cd.x + (Math.random() - 0.5) * 0.04,
                    y: baseY + i * 0.015,
                    z: cd.z + (Math.random() - 0.5) * 0.04,
                    vx: (Math.random() - 0.5) * 0.008,
                    vy: 0.012 + Math.random() * 0.01,
                    vz: (Math.random() - 0.5) * 0.008,
                    life: 1.0,
                    decay: 0.012 + Math.random() * 0.008,
                    char: i % 3 === 0 ? "~" : (i % 2 === 0 ? "·" : ".")
                });
            }
        });
    }

    const sparkles = Array.from({ length: 18 }, (_, i) => ({
        angle: (i / 18) * Math.PI * 2,
        radius: 0.72 + Math.random() * 0.42,
        y: -0.5 + Math.random() * 1.25,
        speed: 0.003 + Math.random() * 0.003,
        char: i % 3 === 0 ? "✦" : (i % 2 === 0 ? "♥" : "*"),
        color: i % 2 === 0 ? "#ffd97d" : "#ff94c2"
    }));

    let buildProgress = prefersReducedMotion ? 1 : 0;
    let hasStarted = prefersReducedMotion;
    let angleY = 0.25;
    let spinBoost = 0;
    let pointerTiltX = 0;
    let time = 0;

    const cakeBox = document.getElementById("cake-box");
    if (cakeBox) {
        cakeBox.addEventListener("mousemove", (e) => {
            const rect = cakeBox.getBoundingClientRect();
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            pointerTiltX = -ny * 0.22;
        });
        cakeBox.addEventListener("mouseleave", () => {
            pointerTiltX = 0;
        });
    }

    const optionsSection = document.getElementById("options-section");
    if (optionsSection && !prefersReducedMotion) {
        inView(optionsSection, () => {
            if (!hasStarted) {
                hasStarted = true;
                buildProgress = 0;
            }
        }, { amount: 0.2 });
    } else {
        hasStarted = true;
    }

    const lx = -0.36;
    const ly = 0.78;
    const lz = 0.52;

    function plotCake3D(wx, wy, wz, nx, ny, nz, palIdx, cosY, sinY, cosX, sinX, forceShade = null) {
        const rx1 = wx * cosY - wz * sinY;
        const rz1 = wx * sinY + wz * cosY;

        const ry2 = wy * cosX - rz1 * sinX;
        const rz2 = wy * sinX + rz1 * cosX;

        const cameraZ = 3.65;
        const fov = 3.15;
        const depth = cameraZ - rz2;
        if (depth <= 0.45) return;

        const projScale = fov / depth;
        const sx = Math.round(COLS * 0.5 + rx1 * projScale * (COLS * 0.34));
        const sy = Math.round(ROWS * 0.55 - ry2 * projScale * (ROWS * 0.34));

        if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) return;

        const idx = sy * COLS + sx;
        if (rz2 <= zBuffer[idx]) return;
        zBuffer[idx] = rz2;

        let shade;
        if (forceShade !== null) {
            shade = forceShade;
        } else {
            const rnx1 = nx * cosY - nz * sinY;
            const rnz1 = nx * sinY + nz * cosY;
            const rny2 = ny * cosX - rnz1 * sinX;
            const rnz2 = ny * sinX + rnz1 * cosX;
            const dot = Math.max(0, rnx1 * lx + rny2 * ly + rnz2 * lz);
            shade = Math.min(1, 0.28 + dot * 0.80);
        }

        charIdxBuffer[idx] = Math.min(DENSITY.length - 1, Math.max(1, Math.floor(shade * (DENSITY.length - 1))));
        colorIdxBuffer[idx] = palIdx * 16 + Math.min(15, Math.floor(shade * 15));
    }

    function renderMathCake() {
        const panel = document.getElementById("opt-content-3");
        if (!document.hidden && panel && panel.classList.contains("show")) {
            hasStarted = true;
            zBuffer.fill(-999);
            charIdxBuffer.fill(0);

            if (hasStarted && buildProgress < 1) {
                buildProgress = Math.min(1, buildProgress + 0.014);
            }

            if (!prefersReducedMotion) {
                angleY += 0.0065 + spinBoost;
                spinBoost *= 0.92;
                time += 0.04;
            }

            const viewPitch = -0.26 + pointerTiltX;
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const cosX = Math.cos(viewPitch);
            const sinX = Math.sin(viewPitch);

            for (const p of cakeParts) {
                if (buildProgress < p.stage) continue;
                plotCake3D(p.x, p.y, p.z, p.nx, p.ny, p.nz, p.pal, cosY, sinY, cosX, sinX);
            }

            if (!candlesBlownOut && buildProgress > 0.65) {
                candleConfigs.forEach((cd, cIdx) => {
                    const flameBaseY = topY1 + cd.h + 0.035;
                    const flickerX = Math.sin(time * 3.4 + cIdx * 2.1) * 0.014;
                    const flickerZ = Math.cos(time * 2.9 + cIdx * 1.7) * 0.012;
                    const flameH = 0.13 + Math.sin(time * 4.2 + cIdx) * 0.018;

                    for (let fi = 0; fi <= 8; fi++) {
                        const ff = fi / 8;
                        const y = flameBaseY + ff * flameH;
                        const tearR = Math.sin(ff * Math.PI) * 0.034 * (1 - ff * 0.35);
                        const sway = ff * ff;

                        plotCake3D(
                            cd.x + flickerX * sway,
                            y,
                            cd.z + flickerZ * sway,
                            0, 0.5, 1,
                            7,
                            cosY, sinY, cosX, sinX,
                            0.98
                        );

                        const segs = 10;
                        for (let si = 0; si < segs; si++) {
                            const ang = (si / segs) * Math.PI * 2;
                            plotCake3D(
                                cd.x + flickerX * sway + Math.cos(ang) * tearR,
                                y,
                                cd.z + flickerZ * sway + Math.sin(ang) * tearR,
                                Math.cos(ang), 0.4, Math.sin(ang),
                                6,
                                cosY, sinY, cosX, sinX,
                                0.85
                            );
                        }
                    }
                });
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${Math.ceil(cellH * 1.2)}px "Courier New", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let y = 0; y < ROWS; y++) {
                const py = (y + 0.5) * cellH;
                for (let x = 0; x < COLS; x++) {
                    const idx = y * COLS + x;
                    const cIdx = charIdxBuffer[idx];
                    if (cIdx === 0) continue;

                    ctx.fillStyle = COLOR_LUT[colorIdxBuffer[idx]];
                    ctx.fillText(DENSITY[cIdx], (x + 0.5) * cellW, py);
                }
            }

            if (smokeParticles.length > 0) {
                ctx.font = 'bold 11px "Courier New", monospace';
                for (let i = smokeParticles.length - 1; i >= 0; i--) {
                    const sm = smokeParticles[i];
                    sm.x += sm.vx + Math.sin(time * 2 + i) * 0.003;
                    sm.y += sm.vy;
                    sm.z += sm.vz;
                    sm.life -= sm.decay;

                    if (sm.life <= 0) {
                        smokeParticles.splice(i, 1);
                        continue;
                    }

                    const rx1 = sm.x * cosY - sm.z * sinY;
                    const rz1 = sm.x * sinY + sm.z * cosY;
                    const ry2 = sm.y * cosX - rz1 * sinX;
                    const rz2 = sm.y * sinX + rz1 * cosX;
                    const depth = 3.65 - rz2;
                    if (depth <= 0.45) continue;

                    const projScale = 3.15 / depth;
                    const px = (COLS * 0.5 + rx1 * projScale * (COLS * 0.34)) * cellW;
                    const py = (ROWS * 0.55 - ry2 * projScale * (ROWS * 0.34)) * cellH;

                    ctx.globalAlpha = Math.max(0, sm.life * 0.85);
                    ctx.fillStyle = "#e8dff5";
                    ctx.fillText(sm.char, px, py);
                }
                ctx.globalAlpha = 1;
            }

            if (!prefersReducedMotion && buildProgress > 0.45) {
                ctx.font = 'bold 11px "Courier New", monospace';
                for (const sp of sparkles) {
                    sp.y += sp.speed;
                    if (sp.y > 0.85) sp.y = -0.65;

                    const sx3 = Math.cos(sp.angle + time * 0.25) * sp.radius;
                    const sz3 = Math.sin(sp.angle + time * 0.25) * sp.radius;

                    const rx1 = sx3 * cosY - sz3 * sinY;
                    const rz1 = sx3 * sinY + sz3 * cosY;
                    const ry2 = sp.y * cosX - rz1 * sinX;
                    const rz2 = sp.y * sinX + rz1 * cosX;

                    const depth = 3.65 - rz2;
                    if (depth <= 0.45) continue;

                    const projScale = 3.15 / depth;
                    const px = (COLS * 0.5 + rx1 * projScale * (COLS * 0.34)) * cellW;
                    const py = (ROWS * 0.55 - ry2 * projScale * (ROWS * 0.34)) * cellH;

                    const pulse = 0.35 + 0.55 * Math.sin(time * 2.0 + sp.angle * 3);
                    ctx.globalAlpha = Math.max(0.1, pulse);
                    ctx.fillStyle = sp.color;
                    ctx.fillText(sp.char, px, py);
                }
                ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(renderMathCake);
    }

    requestAnimationFrame(renderMathCake);

    return {
        triggerBlowBurst: (isBlown) => {
            spinBoost = 0.05;
            triggerBlowBurst(isBlown);
        }
    };
})();

/* 7C. TIUP LILIN KUE 3D & KIRIM HARAPAN KE FORMSPREE */
function blowCandle(event) {
    if (event) event.stopPropagation();
    const status = document.getElementById("wish-status");

    motionPlay("#cake-3d-wrap", { scale: [1, 0.95, 1.04, 1], y: [0, 3, -6, 0] }, SPRING_BOUNCY);
    motionPlay("#cake-aura", { scale: [1, 1.32, 1], opacity: [0.75, 1, 0.7] }, { duration: 0.65, ease: EASE_SILKY });

    candlesBlownOut = !candlesBlownOut;
    cake3DEngine.triggerBlowBurst(candlesBlownOut);

    if (candlesBlownOut) {
        status.innerText = "Yeay! Lilin sudah ditiup 🎉 Tulis harapanmu di bawah ini ✨";
    } else {
        status.innerText = "Lilin menyala lagi ✨ Tap the 3D cake to blow out the candles";
    }
    motionPlay(status, { scale: [0.94, 1.03, 1], opacity: [0.6, 1] }, SPRING_SNAPPY);
}

async function sendWishToEmail() {
    const input = document.getElementById("wish-input");
    const btn = document.getElementById("btn-send-wish");
    const feedback = document.getElementById("send-feedback");
    const wishText = input.value.trim();

    if (!wishText) {
        feedback.style.color = "#ff85b3";
        feedback.innerText = "Tulis dulu pesan atau harapanmu ya! ✍️";
        motionPlay(input, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.35 });
        return;
    }

    btn.disabled = true;
    btn.innerText = "Sending... 🕊️";
    feedback.innerText = "";

    try {
        const response = await fetch(FORMSPREE_URL, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                subject: "🎂 New Birthday Wish From Lowfy!",
                wish: wishText,
                message: wishText
            })
        });

        if (response.ok) {
            feedback.style.color = "#a8ffcb";
            feedback.innerText = "Pesanmu sudah terkirim! Semoga terwujud ✨💌";
            input.value = "";
        } else {
            feedback.style.color = "#ff85b3";
            feedback.innerText = "Gagal mengirim pesan. Coba sebentar lagi.";
        }
    } catch (_) {
        feedback.style.color = "#ff85b3";
        feedback.innerText = "Terjadi kesalahan jaringan.";
    } finally {
        btn.disabled = false;
        btn.innerText = "Send My Wish 💌";
    }
}

/* ==========================================
   8. EKSPOR HANDLER KE GLOBAL WINDOW
   ========================================== */
Object.assign(window, {
    openGift,
    toggleMusic: (e) => {
        if (e) e.stopPropagation();
        bgMusic.paused ? playCurrentTrackDirect(true) : pauseCurrentTrackSmooth();
    },
    nextTrack: (e) => {
        if (e) e.stopPropagation();
        const nextIdx = (currentTrackIndex + 1) % playlist.length;
        const wasPlaying = !bgMusic.paused;
        const switchAndPlay = () => {
            currentTrackIndex = nextIdx;
            setTrackSource(currentTrackIndex);
            wasPlaying ? playCurrentTrackDirect(true) : updatePlayButtonUI(false);
        };
        wasPlaying ? fadeVolumeTo(0, 300, switchAndPlay) : switchAndPlay();
    },
    cycleSpeed: (e) => {
        if (e) e.stopPropagation();
        currentSpeedIndex = (currentSpeedIndex + 1) % speedRates.length;
        const rate = speedRates[currentSpeedIndex];
        applyPlaybackRate(rate);
        const btn = document.getElementById("speed-btn");
        if (btn) btn.innerText = rate + "x";
    },
    seekTrack: (e) => {
        if (e) e.stopPropagation();
        if (!bgMusic.duration || Number.isNaN(bgMusic.duration)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        bgMusic.currentTime = ratio * bgMusic.duration;
    },
    changeVolume: (val) => {
        stopVolumeFade();
        userVolume = parseFloat(val);
        bgMusic.volume = userVolume;
        if (userVolume > 0) {
            previousVolume = userVolume;
            volumeBtn.innerText = userVolume < 0.4 ? "🔉" : "🔊";
        } else {
            volumeBtn.innerText = "🔇";
        }
    },
    toggleMute: (e) => {
        if (e) e.stopPropagation();
        const target = userVolume > 0 ? 0 : (previousVolume > 0 ? previousVolume : 0.7);
        volumeSlider.value = target;
        window.changeVolume(target);
    },
    toggleMinimizePlayer,
    flipNextPage,
    flipPrevPage,
    jumpToPage,
    pickNote,
    closeModal: (e) => {
        if (e.target.id === "modal") forceCloseModal();
    },
    forceCloseModal,
    selectOption,
    bloomBouquet,
    blowCandle,
    sendWishToEmail
});