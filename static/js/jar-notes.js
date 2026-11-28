import { motionPlay, prefersReducedMotion, EASE_SILKY, EASE_FOLD_CLOSE, SPRING_BOUNCY, stagger } from "./motion-utils.js";

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

export function forceCloseModal() {
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

export function pickNote() {
    const modal = document.getElementById("modal");
    if (modal.classList.contains("show")) forceCloseModal();

    motionPlay("#jar", { rotate: [0, -11, 11, -8, 7, -3.5, 2, 0], x: [0, -5, 5, -3.5, 3.5, -1.5, 0] }, { duration: 0.72, ease: "easeInOut" });

    document.querySelectorAll(".note-slip").forEach((slip, idx) => {
        const jumpY = -(50 + (idx % 3) * 15);
        const driftX = (idx % 2 === 0 ? 1 : -1) * (11 + (idx % 4) * 4);
        const spin = (idx % 2 === 0 ? 1 : -1) * (110 + idx * 12);

        motionPlay(slip, { y: [0, jumpY, jumpY * 0.32, 0], x: [0, driftX, -driftX * 0.35, 0], rotate: [0, spin, -spin * 0.2, 0] }, { duration: 0.9, delay: idx * 0.025, ease: EASE_SILKY });
    });

    motionPlay(".jar-sparkle", { scale: [1, 1.8, 1], y: [0, -22, 0], opacity: [0.7, 1, 0.75] }, { duration: 0.8, delay: stagger(0.04), ease: EASE_SILKY });

    const data = getUniqueRandomNote();
    setTimeout(() => {
        document.getElementById("note-title").innerText = data.title;
        document.getElementById("note-text").innerText = data.text;
        modal.classList.add("show");
        motionPlay(modal, { opacity: [0, 1] }, { duration: 0.28, ease: "easeOut" });
        motionPlay("#modal-card", { opacity: [0, 1], scale: [0.9, 1.015, 1], y: [18, 0] }, SPRING_BOUNCY);
    }, 520);
}

export const jarHandlers = {
    pickNote,
    forceCloseModal,
    closeModal: (e) => { if (e.target.id === "modal") forceCloseModal(); }
};

// ============================================================================
// ASCII ART INTERAKTIF UNTUK KEDUA GAMBAR DI SAMPING JAR
// ============================================================================
const PORTRAIT_ASCII_RAMP = " .:-=+*#%@";
const SPARKLE_CHARS = ["✦", "*", "·", "✿", "♥"];

function sampleImageToAsciiParticles(img, canvasW, canvasH, sideDir) {
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasW;
    offscreen.height = canvasH;
    const octx = offscreen.getContext("2d", { willReadFrequently: true });

    // Hitung skala proporsional agar foto tidak gepeng
    const scale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight) * 0.96;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    octx.drawImage(img, offsetX, offsetY, drawW, drawH);
    const { data } = octx.getImageData(0, 0, canvasW, canvasH);

    const cellW = 7;
    const cellH = 8.5;
    const particles = [];

    for (let y = 0; y < canvasH; y += cellH) {
        for (let x = 0; x < canvasW; x += cellW) {
            const px = Math.min(canvasW - 1, Math.floor(x + cellW * 0.5));
            const py = Math.min(canvasH - 1, Math.floor(y + cellH * 0.5));
            const idx = (py * canvasW + px) * 4;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a < 32) continue;

            // Angkat pencahayaan area gelap (seperti hijab hitam) agar tetap jelas di latar malam
            const boostR = Math.min(255, Math.round(r * 1.16 + 26));
            const boostG = Math.min(255, Math.round(g * 1.16 + 24));
            const boostB = Math.min(255, Math.round(b * 1.18 + 30));

            const lum = (0.299 * boostR + 0.587 * boostG + 0.114 * boostB) / 255;
            const charIdx = Math.min(
                PORTRAIT_ASCII_RAMP.length - 1,
                Math.max(1, Math.floor(lum * (PORTRAIT_ASCII_RAMP.length - 1)) + 1)
            );

            const normX = (px - canvasW / 2) / (canvasW / 2);
            const normY = (py - canvasH / 2) / (canvasH / 2);
            const radialAngle = Math.atan2(normY, normX) + (Math.random() - 0.5) * 0.7;
            const burstDist = 75 + Math.random() * 145;

            particles.push({
                tx: px,
                ty: py,
                char: PORTRAIT_ASCII_RAMP[charIdx],
                sparkChar: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
                color: `rgb(${boostR}, ${boostG}, ${boostB})`,
                lum,
                // Urutan muncul dari tengah & atas ke luar
                stagger: Math.min(0.45, Math.hypot(normX * 0.7, normY * 0.5) * 0.35 + Math.random() * 0.14),
                // Arah hamburan keluar saat diklik
                exitVx: Math.cos(radialAngle) * burstDist + sideDir * (28 + Math.random() * 45),
                exitVy: Math.sin(radialAngle) * burstDist - (35 + Math.random() * 65),
                // Arah datang masuk saat muncul kembali
                enterOx: (Math.random() - 0.5) * 180 + sideDir * 60,
                enterOy: -90 - Math.random() * 130,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    return particles;
}

function createInteractiveAsciiPortrait(wrapId, canvasId, sideDir) {
    const wrap = document.getElementById(wrapId);
    const canvas = document.getElementById(canvasId);
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    const W = 640;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Kanvas bayangan untuk menyimpan bentuk ASCII saat diam (1x gambar, bukan 4.000x per frame)
    const staticCanvas = document.createElement("canvas");
    staticCanvas.width = W;
    staticCanvas.height = H;
    const sctx = staticCanvas.getContext("2d");

    let particles = [];
    let state = "assembling";
    let progress = 0;
    let reenterTimer = null;
    let time = 0;

    function bakeStaticPortrait(list) {
        sctx.clearRect(0, 0, W, H);
        sctx.textAlign = "center";
        sctx.textBaseline = "middle";
        sctx.font = 'bold 8.5px "Courier New", monospace';
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            sctx.fillStyle = p.color;
            sctx.fillText(p.char, p.tx, p.ty);
        }
    }

    function triggerReplayCycle() {
        if (particles.length === 0) return;
        if (reenterTimer) {
            clearTimeout(reenterTimer);
            reenterTimer = null;
        }
        if (state !== "dissolving") {
            state = "dissolving";
            progress = 0;
        }
    }

    wrap.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerReplayCycle();
    });

    wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerReplayCycle();
        }
    });

    const img = new Image();
    img.src = canvas.dataset.src;
    img.onload = () => {
        particles = sampleImageToAsciiParticles(img, W, H, sideDir);
        bakeStaticPortrait(particles);
        state = "assembling";
        progress = 0;
    };

    const jarSection = document.getElementById("jar-section") || wrap;
    if ("IntersectionObserver" in window && jarSection) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && particles.length > 0 && state === "idle") {
                        state = "assembling";
                        progress = 0;
                    }
                });
            },
            { threshold: 0.18 }
        );
        observer.observe(jarSection);
    }

    let lastTime = performance.now();

    function renderLoop(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const rect = wrap.getBoundingClientRect();
        const isVisible = rect.bottom > -120 && rect.top < window.innerHeight + 120;

        if (!document.hidden && isVisible && particles.length > 0) {
            ctx.clearRect(0, 0, W, H);
            time += dt;

            if (state === "assembling") {
                progress = Math.min(1, progress + dt * 0.92);
                if (progress >= 1) {
                    state = "idle";
                }
            } else if (state === "dissolving") {
                progress = Math.min(1, progress + dt * 1.18);
                if (progress >= 1 && !reenterTimer) {
                    reenterTimer = setTimeout(() => {
                        reenterTimer = null;
                        state = "assembling";
                        progress = 0;
                    }, 220);
                }
            }

            const floatY = Math.sin(time * 2.0 + (sideDir > 0 ? 1.4 : 0)) * 3.5;

            if (state === "idle") {
                // Jauh lebih ringan: salin gambar utuh dari offscreen canvas
                ctx.drawImage(staticCanvas, 0, floatY);
            } else {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = 'bold 8.5px "Courier New", monospace';

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    let drawX = p.tx;
                    let drawY = p.ty + floatY;
                    let alpha = 1;
                    let char = p.char;

                    if (state === "assembling") {
                        const localT = Math.max(0, Math.min(1, (progress - p.stagger) / (1 - p.stagger)));
                        const ease = 1 - Math.pow(1 - localT, 3);
                        const inv = 1 - ease;

                        drawX = p.tx + p.enterOx * inv + Math.sin(time * 5 + p.phase) * 8 * inv;
                        drawY = p.ty + floatY + p.enterOy * inv;
                        alpha = ease;
                        if (localT < 0.45) char = p.sparkChar;
                    } else if (state === "dissolving") {
                        const easeOut = Math.pow(progress, 1.35);
                        drawX = p.tx + p.exitVx * easeOut + Math.sin(time * 6 + p.phase) * 10 * easeOut;
                        drawY = p.ty + floatY + p.exitVy * easeOut;
                        alpha = Math.max(0, 1 - Math.pow(progress, 1.15));
                        if (progress > 0.18) char = p.sparkChar;
                    }

                    if (alpha <= 0.01) continue;

                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = p.color;
                    ctx.fillText(char, drawX, drawY);
                }
                ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

function initCurvedRainbowLabels() {
    const pills = document.querySelectorAll(".wing-mini-pill");
    const letterGroups = [];

    pills.forEach((pill, pillIdx) => {
        const rawText = pill.textContent.trim();
        pill.setAttribute("aria-label", rawText);
        pill.innerHTML = "";

        const chars = Array.from(rawText);
        const spans = chars.map((ch) => {
            const span = document.createElement("span");
            span.className = "curved-rainbow-char";
            if (ch === " ") {
                span.innerHTML = "&nbsp;";
                span.style.width = "0.28em";
            } else {
                span.textContent = ch;
            }
            pill.appendChild(span);
            return span;
        });

        letterGroups.push({ spans, offsetPhase: pillIdx * 1.4 });
    });

    if (letterGroups.length === 0) return;

    let lastWaveFrame = 0;

    function animateRainbowWave(now) {
        // Batasi pembaruan ke ~30fps dan hentikan saat tidak terlihat di layar
        if (now - lastWaveFrame >= 32 && !document.hidden) {
            lastWaveFrame = now;
            const t = prefersReducedMotion ? 0 : now * 0.001;

            letterGroups.forEach(({ spans, offsetPhase }) => {
                const len = spans.length;
                for (let i = 0; i < len; i++) {
                    const span = spans[i];
                    const norm = len > 1 ? (i / (len - 1)) * 2 - 1 : 0;

                    const wavePhase = t * 2.0 - i * 0.32 + offsetPhase;
                    const waveSin = Math.sin(wavePhase);
                    const waveCos = Math.cos(wavePhase);

                    const archY = (norm * norm - 0.45) * 2.4;
                    const waveY = waveSin * 1.45;
                    const y = archY + waveY;
                    const rot = norm * 3.0 + waveCos * 1.3;

                    const hue = Math.round(((wavePhase * (180 / Math.PI)) % 360 + 360) % 360);
                    const lightness = Math.round(74 + waveSin * 5);

                    span.style.color = `hsl(${hue}, 92%, ${lightness}%)`;
                    span.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(1)}deg)`;
                }
            });
        }

        requestAnimationFrame(animateRainbowWave);
    }

    requestAnimationFrame(animateRainbowWave);
}

function initJarSideEnhancements() {
    createInteractiveAsciiPortrait("ascii-wing-left", "jar-ascii-canvas-left", -1);
    createInteractiveAsciiPortrait("ascii-wing-right", "jar-ascii-canvas-right", 1);
    initCurvedRainbowLabels();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJarSideEnhancements);
} else {
    initJarSideEnhancements();
}