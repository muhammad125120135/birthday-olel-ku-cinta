import { animate, scroll, inView, stagger, press, hover } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

// Ganti URL di bawah ini dengan Form Endpoint milikmu dari dashboard Formspree
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

function cancelActiveAnimations(el) {
    if (!el || typeof el.getAnimations !== "function") return;
    el.getAnimations().forEach((anim) => anim.cancel());
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
   0. PRELOAD ASET GAMBAR
   ========================================== */
const BURST_FLOWER_IMAGES = [
    "static/flower 1.png",
    "static/flower 2.png",
    "static/flower 3.png",
    "static/flower 4.png",
    "static/flower 5.png"
];

[
    "static/tombol play.png",
    "static/tombol pouse.png",
    "static/play.png",
    "static/puse.png",
    "static/bouquet.png",
    ...BURST_FLOWER_IMAGES
].forEach((src) => {
    const img = new Image();
    img.src = src;
});

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
        animate(".left-wing", { y: [18, -18] }, { ease: "linear" }),
        { target: document.getElementById("jar-section"), offset: ["start end", "end start"] }
    );

    scroll(
        animate(".right-wing", { y: [18, -18] }, { ease: "linear" }),
        { target: document.getElementById("jar-section"), offset: ["start end", "end start"] }
    );

    // Animasi mengambang halus untuk aset foto header & samping jar
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

    applySmoothFloat(
        ".left-wing .jar-side-photo",
        {
            rotate: [-3.2, 1.2],
            y: [0, -11],
            scale: [1, 1.028]
        },
        4.6,
        0
    );

    applySmoothFloat(
        ".right-wing .jar-side-photo",
        {
            rotate: [3.2, -1.2],
            y: [0, -11],
            scale: [1, 1.028]
        },
        4.6,
        0.7
    );

    // Entrance & hover amplop pembuka
    motionPlay("#envelope-card", { opacity: [0, 1], y: [24, 0], scale: [0.95, 1] }, { duration: 0.75, ease: EASE_SILKY });

    hover("#envelope-card", (el) => {
        motionPlay(el, { y: -7, scale: 1.025 }, SPRING_SNAPPY);
        return () => motionPlay(el, { y: 0, scale: 1 }, SPRING_SNAPPY);
    });

    // Tactile spring press pada seluruh tombol
    press(".btn-glass-pink, .opt-btn, .btn-paper-nav, .btn-circle-play, .btn-speed", (el) => {
        motionPlay(el, { scale: 0.94 }, { type: "spring", stiffness: 480, damping: 26 });
        return () => motionPlay(el, { scale: 1 }, SPRING_SNAPPY);
    });

    // Staggered scroll reveal untuk section Jar & Interactive Surprises
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

        // 1. Lapisan Grid Gelombang ASCII Halus di Latar Belakang
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

        // 2. Kunang-kunang & Kelopak ASCII Berwarna yang Melayang
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
   3. EFEK KACA INTERAKTIF & 3D TILT BOUQUET
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

const bouquetBoxEl = document.getElementById("bouquet-box");
const bouquet3dWrap = document.getElementById("bouquet-3d-wrap");
if (bouquetBoxEl && bouquet3dWrap) {
    bouquetBoxEl.addEventListener("mousemove", (e) => {
        const rect = bouquetBoxEl.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        bouquet3dWrap.style.transform = `perspective(750px) rotateX(${(-ny * 9).toFixed(1)}deg) rotateY(${(nx * 11).toFixed(1)}deg) translateY(-4px)`;
    });

    bouquetBoxEl.addEventListener("mouseleave", () => {
        bouquet3dWrap.style.transform = "";
    });
}

/* ==========================================
   4. AUDIO PLAYER, VOLUME FADE & PLAYLIST
   ========================================== */
const bgMusic = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause-btn");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const volumeSlider = document.getElementById("volume-slider");
const volumeBtn = document.getElementById("volume-btn");

const PLAY_ICON_HTML = '<img src="static/tombol play.png" onerror="this.onerror=null;this.src=\'static/play.png\';" alt="Play" class="player-state-img">';
const PAUSE_ICON_HTML = '<img src="static/tombol pouse.png" onerror="this.onerror=null;this.src=\'static/puse.png\';" alt="Pause" class="player-state-img">';

const speedRates = [1, 1.25, 1.5, 0.75];
let currentSpeedIndex = 0;
let userVolume = 0.7;
let previousVolume = 0.7;
let isAutoFadingOut = false;
let volumeFadeTimer = null;

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
    playPauseBtn.innerHTML = isPlaying ? PAUSE_ICON_HTML : PLAY_ICON_HTML;
    playPauseBtn.classList.toggle("is-playing", isPlaying);
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

/* ==========================================
   5. AMPLOP PEMBUKA & ANIMASI BUKA-TUTUP KERTAS
   ========================================== */
let isEnvelopeOpened = false;
const TOTAL_FOLDS = 9;
let openFoldCount = 1;

function setFoldStateClasses(foldEl, foldNum, currentOpenCount) {
    const actionSpan = foldEl.querySelector(".crease-action");
    foldEl.classList.remove("is-open", "is-next-folded", "is-stacked-folded");

    if (foldNum <= currentOpenCount) {
        foldEl.classList.add("is-open");
        if (actionSpan?.dataset.openText) actionSpan.innerText = actionSpan.dataset.openText;
    } else if (foldNum === currentOpenCount + 1) {
        foldEl.classList.add("is-next-folded");
        if (actionSpan?.dataset.closedText) actionSpan.innerText = actionSpan.dataset.closedText;
    } else {
        foldEl.classList.add("is-stacked-folded");
        if (actionSpan?.dataset.closedText) actionSpan.innerText = actionSpan.dataset.closedText;
    }
}

function updateFoldControlsUI(currentOpenCount) {
    const badge = document.getElementById("fold-counter-badge");
    if (badge) badge.innerText = `Lipatan ${currentOpenCount} / ${TOTAL_FOLDS}`;

    const prevBtn = document.getElementById("btn-prev-fold");
    const nextBtn = document.getElementById("btn-next-fold");
    if (prevBtn) prevBtn.disabled = currentOpenCount <= 1;
    if (nextBtn) {
        nextBtn.innerText = currentOpenCount < TOTAL_FOLDS
            ? `Buka Lipatan ${currentOpenCount + 1} ↓`
            : "Lipat Kembali dari Awal ↺";
    }
}

function animateOpenFold(foldEl, delaySec = 0) {
    const content = foldEl.querySelector(".fold-content");
    const shadow = foldEl.querySelector(".fold-shadow-veil");
    if (!content) return;

    cancelActiveAnimations(foldEl);
    cancelActiveAnimations(content);
    cancelActiveAnimations(shadow);

    const startHeight = content.getBoundingClientRect().height;
    content.style.height = "auto";
    content.style.overflow = "hidden";
    const targetHeight = content.scrollHeight;

    if (prefersReducedMotion) {
        content.style.height = "auto";
        content.style.overflow = "";
        content.style.opacity = "";
        return;
    }

    content.style.height = `${startHeight}px`;
    content.style.opacity = startHeight > 4 ? "0.7" : "0";

    const foldAnim = motionPlay(
        foldEl,
        {
            rotateX: [-74, 3, 0],
            scaleY: [0.94, 1.005, 1]
        },
        { duration: 0.65, delay: delaySec, ease: EASE_SILKY }
    );

    motionPlay(
        shadow,
        { opacity: [0.75, 0.2, 0] },
        { duration: 0.65, delay: delaySec, ease: EASE_SILKY }
    );

    const contentAnim = motionPlay(
        content,
        {
            height: [`${startHeight}px`, `${targetHeight}px`],
            opacity: [startHeight > 4 ? 0.7 : 0, 1]
        },
        { duration: 0.58, delay: delaySec, ease: EASE_SILKY }
    );

    if (contentAnim && contentAnim.finished) {
        contentAnim.finished.then(() => {
            if (foldEl.classList.contains("is-open")) {
                content.style.height = "auto";
                content.style.overflow = "";
                content.style.opacity = "";
                foldEl.style.transform = "";
            }
        }).catch(() => {});
    } else if (!foldAnim) {
        content.style.height = "auto";
        content.style.overflow = "";
    }
}

function animateCloseFold(foldEl, foldNum, finalOpenCount, delaySec = 0) {
    const content = foldEl.querySelector(".fold-content");
    const shadow = foldEl.querySelector(".fold-shadow-veil");

    if (!content || prefersReducedMotion) {
        setFoldStateClasses(foldEl, foldNum, finalOpenCount);
        return;
    }

    cancelActiveAnimations(foldEl);
    cancelActiveAnimations(content);
    cancelActiveAnimations(shadow);

    foldEl.classList.remove("is-next-folded", "is-stacked-folded");
    foldEl.classList.add("is-open");

    const startHeight = content.getBoundingClientRect().height || content.scrollHeight;
    content.style.height = `${startHeight}px`;
    content.style.overflow = "hidden";
    content.style.opacity = "1";

    motionPlay(
        shadow,
        { opacity: [0, 0.65, 0] },
        { duration: 0.48, delay: delaySec, ease: EASE_FOLD_CLOSE }
    );

    motionPlay(
        foldEl,
        {
            rotateX: [0, -76],
            scaleY: [1, 0.94]
        },
        { duration: 0.48, delay: delaySec, ease: EASE_FOLD_CLOSE }
    );

    const closeAnim = motionPlay(
        content,
        {
            height: [`${startHeight}px`, "0px"],
            opacity: [1, 0]
        },
        { duration: 0.45, delay: delaySec, ease: EASE_FOLD_CLOSE }
    );

    if (closeAnim && closeAnim.finished) {
        closeAnim.finished.then(() => {
            if (foldNum > openFoldCount) {
                content.style.height = "";
                content.style.overflow = "";
                content.style.opacity = "";
                foldEl.style.transform = "";
                setFoldStateClasses(foldEl, foldNum, openFoldCount);

                if (foldNum === openFoldCount + 1) {
                    motionPlay(
                        foldEl,
                        { rotateX: [-26, -15], y: [-3, 0] },
                        { duration: 0.35, ease: EASE_SILKY }
                    );
                }
            }
        }).catch(() => {});
    } else {
        setFoldStateClasses(foldEl, foldNum, finalOpenCount);
    }
}

function setFoldCount(targetCount, scrollToNewFold = false) {
    const clampedTarget = Math.max(1, Math.min(TOTAL_FOLDS, targetCount));
    const prevCount = openFoldCount;
    openFoldCount = clampedTarget;

    updateFoldControlsUI(openFoldCount);

    document.querySelectorAll(".paper-fold").forEach((foldEl) => {
        const foldNum = parseInt(foldEl.dataset.fold, 10);

        if (foldNum > prevCount && foldNum <= openFoldCount) {
            setFoldStateClasses(foldEl, foldNum, openFoldCount);
            animateOpenFold(foldEl, (foldNum - prevCount - 1) * 0.06);
        } else if (foldNum <= prevCount && foldNum > openFoldCount) {
            const reverseIdx = prevCount - foldNum;
            animateCloseFold(foldEl, foldNum, openFoldCount, reverseIdx * 0.045);
        } else {
            setFoldStateClasses(foldEl, foldNum, openFoldCount);
        }
    });

    if (scrollToNewFold) {
        const targetFold = document.querySelector(`.paper-fold[data-fold="${openFoldCount}"]`);
        if (targetFold) {
            setTimeout(() => {
                targetFold.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 180);
        }
    }
}

// Inisialisasi awal tanpa animasi
document.querySelectorAll(".paper-fold").forEach((foldEl) => {
    setFoldStateClasses(foldEl, parseInt(foldEl.dataset.fold, 10), openFoldCount);
});
updateFoldControlsUI(openFoldCount);

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
   6. GLASS JAR SHAKE & MODAL SMOOTH
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

function pickNote() {
    const modal = document.getElementById("modal");
    if (modal.classList.contains("show")) {
        forceCloseModal();
    }

    motionPlay(
        "#jar",
        {
            rotate: [0, -11, 11, -8, 7, -3.5, 2, 0],
            x: [0, -5, 5, -3.5, 3.5, -1.5, 0]
        },
        { duration: 0.72, ease: "easeInOut" }
    );

    document.querySelectorAll(".note-slip").forEach((slip, idx) => {
        const jumpY = -(50 + (idx % 3) * 15);
        const driftX = (idx % 2 === 0 ? 1 : -1) * (11 + (idx % 4) * 4);
        const spin = (idx % 2 === 0 ? 1 : -1) * (110 + idx * 12);

        motionPlay(
            slip,
            {
                y: [0, jumpY, jumpY * 0.32, 0],
                x: [0, driftX, -driftX * 0.35, 0],
                rotate: [0, spin, -spin * 0.2, 0]
            },
            { duration: 0.9, delay: idx * 0.025, ease: EASE_SILKY }
        );
    });

    motionPlay(
        ".jar-sparkle",
        { scale: [1, 1.8, 1], y: [0, -22, 0], opacity: [0.7, 1, 0.75] },
        { duration: 0.8, delay: stagger(0.04), ease: EASE_SILKY }
    );

    const data = getUniqueRandomNote();
    setTimeout(() => {
        document.getElementById("note-title").innerText = data.title;
        document.getElementById("note-text").innerText = data.text;
        modal.classList.add("show");
        motionPlay(modal, { opacity: [0, 1] }, { duration: 0.28, ease: "easeOut" });
        motionPlay("#modal-card", { opacity: [0, 1], scale: [0.9, 1.015, 1], y: [18, 0] }, SPRING_BOUNCY);
    }, 520);
}

function forceCloseModal() {
    const modal = document.getElementById("modal");
    const card = document.getElementById("modal-card");
    if (!modal.classList.contains("show")) return;

    if (prefersReducedMotion) {
        modal.classList.remove("show");
        return;
    }

    motionPlay(card, { opacity: [1, 0], scale: [1, 0.92], y: [0, 12] }, { duration: 0.24, ease: EASE_FOLD_CLOSE });
    const bgFade = motionPlay(modal, { opacity: [1, 0] }, { duration: 0.26, ease: "easeOut" });
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
   7. OPSI INTERAKTIF, BOUQUET 3D ASCII & FORM WISH
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

function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const DENSITY = " .:-=+*#%@";
    const COLS = 72;
    const ROWS = 72;
    const TOTAL_CELLS = COLS * ROWS;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    // Kecepatan putaran 3D lambat & anggun (kecilkan angka ini bila ingin lebih lambat lagi)
    const ROTATION_SPEED = 0.0055;

    const zBuffer = new Float32Array(TOTAL_CELLS);
    const charBuffer = new Array(TOTAL_CELLS);
    const colorBuffer = new Array(TOTAL_CELLS);

    const fallbackSources = [
        "static/bouquet.png",
        "static/bouqwet.png",
        "static/bouquet.jpg",
        "static/bouquet.webp",
        "static/buket.png"
    ];
    let srcIndex = 0;

    const img = new Image();
    img.onerror = () => {
        srcIndex++;
        if (srcIndex < fallbackSources.length) {
            img.src = fallbackSources[srcIndex];
        }
    };
    img.src = fallbackSources[0];

    img.onload = () => {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = COLS;
        offCanvas.height = ROWS;
        const offCtx = offCanvas.getContext("2d");
        offCtx.drawImage(img, 0, 0, COLS, ROWS);

        const pixels = offCtx.getImageData(0, 0, COLS, ROWS).data;

        let minX = COLS, maxX = 0, minY = ROWS, maxY = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const a = pixels[(y * COLS + x) * 4 + 3];
                if (a >= 40) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const spanX = Math.max(1, maxX - minX);
        const spanY = Math.max(1, maxY - minY);
        const midX = (minX + maxX) * 0.5;
        const midY = (minY + maxY) * 0.5;

        const points = [];

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const i = (y * COLS + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                if (a < 40) continue;

                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const baseCharIdx = Math.min(DENSITY.length - 1, Math.max(1, Math.floor(lum * DENSITY.length)));

                const nx = (x - midX) / (spanX * 0.5);
                const ny = (y - midY) / (spanY * 0.5);

                const heightFactor = Math.max(0, Math.min(1, 1 - (ny + 1) * 0.5));
                const coneWidth = 0.34 + 0.66 * Math.pow(heightFactor, 0.75);
                const radial = Math.min(1, Math.abs(nx) / coneWidth);
                const domeCurve = Math.sqrt(Math.max(0, 1 - radial * radial));

                const petalRelief = lum * 0.16 * heightFactor;
                const zFront = domeCurve * (0.26 + 0.36 * heightFactor) + petalRelief;
                const zBack = -(domeCurve * (0.2 + 0.28 * heightFactor) + 0.06);

                const flowerCenterY = -0.24;
                const fdx = nx;
                const fdy = ny - flowerCenterY;
                const bloomDist = Math.min(1.2, Math.hypot(fdx, fdy));
                const bloomAngle = Math.atan2(fdy, fdx);
                const angleNorm = (bloomAngle + Math.PI) / (Math.PI * 2);
                const bloomOrder = Math.min(0.95, bloomDist * 0.62 + angleNorm * 0.18 + Math.random() * 0.1);

                const cr = Math.min(255, r + 24);
                const cg = Math.min(255, g + 18);
                const cb = Math.min(255, b + 24);

                points.push({
                    wx: nx * 1.12,
                    wy: -ny * 1.18,
                    wz: zFront,
                    heightFactor,
                    bloomDist,
                    bloomAngle,
                    bloomOrder,
                    baseCharIdx,
                    r: cr,
                    g: cg,
                    b: cb,
                    isBack: false
                });

                if ((x + y) % 2 === 0) {
                    points.push({
                        wx: nx * 1.08,
                        wy: -ny * 1.16,
                        wz: zBack,
                        heightFactor,
                        bloomDist,
                        bloomAngle,
                        bloomOrder,
                        baseCharIdx: Math.max(1, baseCharIdx - 2),
                        r: Math.round(cr * 0.68),
                        g: Math.round(cg * 0.64),
                        b: Math.round(cb * 0.72),
                        isBack: true
                    });
                }
            }
        }

        const sparkles = Array.from({ length: 18 }, (_, idx) => ({
            angle: (idx / 18) * Math.PI * 2,
            radius: 0.45 + Math.random() * 0.65,
            y: -0.9 + Math.random() * 1.9,
            speed: 0.004 + Math.random() * 0.005,
            char: idx % 3 === 0 ? "✦" : (idx % 2 === 0 ? "*" : "·"),
            color: idx % 2 === 0 ? "#ffb8d8" : "#ffe082"
        }));

        let bloomProgress = prefersReducedMotion ? 1.3 : 0;
        let hasStarted = prefersReducedMotion;
        let angleY = 0;
        let spinBoost = 0;
        let pointerTiltX = 0;
        let rippleRadius = -1;
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
                bloomProgress = 0.06;
                rippleRadius = 0;
                spinBoost = 0.045;
            });
        }

        const optionsSection = document.getElementById("options-section");
        if (optionsSection && !prefersReducedMotion) {
            inView(optionsSection, () => {
                if (!hasStarted) {
                    hasStarted = true;
                    bloomProgress = 0;
                }
            }, { amount: 0.25 });
        } else {
            hasStarted = true;
        }

        function projectPoint(px3, py3, pz3, cosY, sinY, cosX, sinX) {
            const rx = px3 * cosY - pz3 * sinY;
            const rz1 = px3 * sinY + pz3 * cosY;

            const ry = py3 * cosX - rz1 * sinX;
            const rz = py3 * sinX + rz1 * cosX;

            const cameraZ = 3.55;
            const fov = 3.05;
            const depth = cameraZ - rz;
            if (depth <= 0.4) return null;

            const scale = fov / depth;
            const sx = Math.round(COLS * 0.5 + rx * scale * (COLS * 0.34));
            const sy = Math.round(ROWS * 0.5 - ry * scale * (ROWS * 0.34));

            if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) return null;
            return { sx, sy, rz };
        }

        function renderVolumetricBouquet() {
            const panel = document.getElementById("opt-content-1");
            if (!document.hidden && panel && panel.classList.contains("show")) {
                zBuffer.fill(-999);
                charBuffer.fill(null);

                if (hasStarted && bloomProgress < 1.35) {
                    bloomProgress = Math.min(1.35, bloomProgress + 0.013);
                }

                if (!prefersReducedMotion) {
                    angleY += ROTATION_SPEED + spinBoost;
                    spinBoost *= 0.94;
                    time += 0.028;
                }

                if (rippleRadius >= 0) {
                    rippleRadius += 0.026;
                    if (rippleRadius > 1.45) rippleRadius = -1;
                }

                const shimmerWave = ((time * 0.45) % 2.6) - 0.8;
                const viewPitch = -0.14 + pointerTiltX;
                const cosY = Math.cos(angleY);
                const sinY = Math.sin(angleY);
                const cosX = Math.cos(viewPitch);
                const sinX = Math.sin(viewPitch);

                for (const p of points) {
                    const rawLocal = (bloomProgress - p.bloomOrder) / 0.34;
                    if (rawLocal <= 0) continue;

                    const t = Math.min(1, rawLocal);
                    const ease = 1 - Math.pow(1 - t, 3);

                    const swirl = p.bloomAngle + (1 - ease) * 1.5;
                    const spread = (1 - ease) * 0.42;

                    const breath = !prefersReducedMotion
                        ? Math.sin(time * 1.55 - p.bloomDist * 3.8) * 0.032 * p.heightFactor
                        : 0;
                    const breezeX = !prefersReducedMotion
                        ? Math.sin(time * 1.2 + p.wy * 2.1) * 0.028 * p.heightFactor
                        : 0;

                    let ripplePush = 0;
                    if (rippleRadius >= 0) {
                        const dRipple = Math.abs(p.bloomDist - rippleRadius);
                        if (dRipple < 0.16) {
                            ripplePush = (1 - dRipple / 0.16) * 0.085;
                        }
                    }

                    const expand = 1 + breath + ripplePush;
                    const wx = p.wx * expand + Math.cos(swirl) * spread + breezeX;
                    const wy = p.wy * expand + Math.sin(swirl) * spread;
                    const wz = p.wz * expand;

                    const proj = projectPoint(wx, wy, wz, cosY, sinY, cosX, sinX);
                    if (!proj) continue;

                    const idx = proj.sy * COLS + proj.sx;
                    if (proj.rz <= zBuffer[idx]) continue;
                    zBuffer[idx] = proj.rz;

                    const diag = (p.wx + p.wy) * 0.35;
                    const shimmerDist = Math.abs(diag - shimmerWave);
                    const shimmer = !p.isBack && shimmerDist < 0.16 ? (1 - shimmerDist / 0.16) : 0;

                    let cIdx = p.baseCharIdx;
                    if (t < 0.4) cIdx = 1;
                    else if (t < 0.75) cIdx = Math.max(2, cIdx - 2);
                    if (shimmer > 0.35 || ripplePush > 0.03) {
                        cIdx = Math.min(DENSITY.length - 1, cIdx + 2);
                    }

                    const depthLight = Math.max(0.62, Math.min(1.22, 0.92 + proj.rz * 0.42));
                    const glowBoost = Math.round(shimmer * 55 + ripplePush * 450);

                    const r = Math.min(255, Math.round(p.r * depthLight) + glowBoost);
                    const g = Math.min(255, Math.round(p.g * depthLight) + glowBoost);
                    const b = Math.min(255, Math.round(p.b * depthLight) + glowBoost);

                    charBuffer[idx] = DENSITY[cIdx];
                    colorBuffer[idx] = `rgb(${r},${g},${b})`;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = `bold ${Math.ceil(cellH * 1.18)}px "Courier New", monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                for (let y = 0; y < ROWS; y++) {
                    const py = (y + 0.5) * cellH;
                    for (let x = 0; x < COLS; x++) {
                        const idx = y * COLS + x;
                        const ch = charBuffer[idx];
                        if (!ch) continue;

                        ctx.fillStyle = colorBuffer[idx];
                        ctx.fillText(ch, (x + 0.5) * cellW, py);
                    }
                }

                if (!prefersReducedMotion && bloomProgress > 0.4) {
                    ctx.font = 'bold 11px "Courier New", monospace';
                    for (const sp of sparkles) {
                        sp.y += sp.speed;
                        if (sp.y > 1.15) sp.y = -0.85;

                        const sx3 = Math.cos(sp.angle + time * 0.4) * sp.radius;
                        const sz3 = Math.sin(sp.angle + time * 0.4) * sp.radius;
                        const proj = projectPoint(sx3, sp.y, sz3, cosY, sinY, cosX, sinX);
                        if (!proj) continue;

                        const pulseAlpha = 0.35 + 0.55 * Math.sin(time * 2.5 + sp.angle * 3);
                        ctx.globalAlpha = Math.max(0.1, pulseAlpha);
                        ctx.fillStyle = sp.color;
                        ctx.fillText(sp.char, (proj.sx + 0.5) * cellW, (proj.sy + 0.5) * cellH);
                    }
                    ctx.globalAlpha = 1;
                }
            }

            requestAnimationFrame(renderVolumetricBouquet);
        }

        requestAnimationFrame(renderVolumetricBouquet);
    };
}

initAsciiBouquet();

function blowCandle() {
    const flame = document.getElementById("flame");
    const status = document.getElementById("wish-status");

    motionPlay("#cake-box", { scale: [1, 0.96, 1.025, 1] }, SPRING_SNAPPY);

    if (!flame.classList.contains("blown")) {
        flame.classList.add("blown");
        status.innerText = "Yeay! Sekarang tulis harapanmu di bawah ini 🎉✨";
    } else {
        flame.classList.remove("blown");
        status.innerText = "Tap the candle to blow it out ✨";
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

    if (FORMSPREE_URL.includes("GANTI_DENGAN_KODE_ANDA")) {
        feedback.style.color = "#a8ffcb";
        feedback.innerText = "Harapanmu tersimpan di semesta! ✨ (Pasang link Formspree agar masuk ke email)";
        input.value = "";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Sending... 🕊️";
    feedback.innerText = "";

    try {
        const response = await fetch(FORMSPREE_URL, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ subject: "🎂 New Birthday Wish From Lowfy!", wish: wishText })
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
    toggleMinimizePlayer: () => {
        const player = document.getElementById("mini-player");
        player.classList.toggle("minimized");
        motionPlay(player, { scale: [0.95, 1.02, 1] }, SPRING_SNAPPY);
    },
    unfoldNext: () => {
        setFoldCount(openFoldCount < TOTAL_FOLDS ? openFoldCount + 1 : 1, true);
    },
    foldPrev: () => {
        if (openFoldCount > 1) {
            setFoldCount(openFoldCount - 1, true);
        }
    },
    handleFoldClick: (foldNum, e) => {
        if (e) e.stopPropagation();
        if (foldNum > openFoldCount && openFoldCount < TOTAL_FOLDS) {
            setFoldCount(openFoldCount + 1, true);
        } else if (foldNum > 1 && foldNum <= openFoldCount && e?.target.closest(".fold-crease-bar")) {
            setFoldCount(foldNum - 1, true);
        }
    },
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