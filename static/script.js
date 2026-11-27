import {
    animate, scroll, inView, stagger, press, hover,
    prefersReducedMotion, EASE_SILKY, SPRING_SNAPPY,
    motionPlay, applySmoothFloat
} from "./js/motion-utils.js";
import { initFireflies } from "./js/fireflies.js";
import { initAudioPlayer, playerHandlers } from "./js/audio-player.js";
import { initFolds, envelopeFoldHandlers } from "./js/envelope-folds.js";
import { jarHandlers } from "./js/jar-notes.js";
import { BURST_FLOWER_IMAGES, initSurprises, surpriseHandlers } from "./js/surprises.js";

// Preload aset gambar
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

// Inisialisasi scroll, float, dan gesture global
if (!prefersReducedMotion) {
    scroll(animate("#scroll-progress", { scaleX: [0, 1] }, { ease: "linear" }));
    scroll(animate(".header-cutout-badge", { y: [-6, 14] }, { ease: "linear" }), { target: document.querySelector(".header-area"), offset: ["start end", "end start"] });
    scroll(animate(".left-wing", { y: [18, -18] }, { ease: "linear" }), { target: document.getElementById("jar-section"), offset: ["start end", "end start"] });
    scroll(animate(".right-wing", { y: [18, -18] }, { ease: "linear" }), { target: document.getElementById("jar-section"), offset: ["start end", "end start"] });

    applySmoothFloat(".header-cutout-img", { rotate: [-2.2, 2.5], y: [0, -9], scale: [1, 1.025] }, 4.2, 0);
    applySmoothFloat(".left-wing .jar-side-photo", { rotate: [-3.2, 1.2], y: [0, -11], scale: [1, 1.028] }, 4.6, 0);
    applySmoothFloat(".right-wing .jar-side-photo", { rotate: [3.2, -1.2], y: [0, -11], scale: [1, 1.028] }, 4.6, 0.7);

    motionPlay("#envelope-card", { opacity: [0, 1], y: [24, 0], scale: [0.95, 1] }, { duration: 0.75, ease: EASE_SILKY });
    hover("#envelope-card", (el) => {
        motionPlay(el, { y: -7, scale: 1.025 }, SPRING_SNAPPY);
        return () => motionPlay(el, { y: 0, scale: 1 }, SPRING_SNAPPY);
    });

    press(".btn-glass-pink, .opt-btn, .btn-paper-nav, .btn-circle-play, .btn-speed", (el) => {
        motionPlay(el, { scale: 0.94 }, { type: "spring", stiffness: 480, damping: 26 });
        return () => motionPlay(el, { scale: 1 }, SPRING_SNAPPY);
    });

    inView(".motion-section", (section) => {
        const items = section.querySelectorAll(".motion-item");
        motionPlay(items, { opacity: [0, 1], y: [24, 0], scale: [0.98, 1] }, { duration: 0.65, delay: stagger(0.08), ease: EASE_SILKY });
    }, { amount: 0.14 });
}

// Efek kaca interaktif 3D tilt
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

// Jalankan setiap modul
initFireflies();
initAudioPlayer();
initFolds();
initSurprises();

// Ekspor handler ke global window agar onclick di HTML tetap berjalan
Object.assign(window, {
    ...playerHandlers,
    ...envelopeFoldHandlers,
    ...jarHandlers,
    ...surpriseHandlers
});