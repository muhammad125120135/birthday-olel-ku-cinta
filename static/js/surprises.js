import { motionPlay, inView, stagger, EASE_SILKY, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";

const FORMSPREE_URL = "https://formspree.io/f/GANTI_DENGAN_KODE_ANDA";
export const BURST_FLOWER_IMAGES = [
    "static/flower 1.png",
    "static/flower 2.png",
    "static/flower 3.png",
    "static/flower 4.png",
    "static/flower 5.png"
];

export function initSurprises() {
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

    initAsciiBouquet();
}

function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const DENSITY = " .:-=+*#%@";
    const COLS = 66;
    const ROWS = 66;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    const img = new Image();
    img.src = "static/bouquet.png";

    img.onload = () => {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = COLS;
        offCanvas.height = ROWS;
        const offCtx = offCanvas.getContext("2d");
        offCtx.drawImage(img, 0, 0, COLS, ROWS);

        const pixels = offCtx.getImageData(0, 0, COLS, ROWS).data;
        const cells = [];

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const i = (y * COLS + x) * 4;
                const [r, g, b, a] = [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
                if (a < 40) continue;

                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const char = DENSITY[Math.min(DENSITY.length - 1, Math.floor(lum * DENSITY.length))];
                if (char === " ") continue;

                cells.push({
                    x, y,
                    normY: 1 - y / ROWS,
                    char,
                    color: `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 25)})`
                });
            }
        }

        let bloomProgress = 0;
        let hasStarted = false;
        let time = 0;

        const optionsSection = document.getElementById("options-section");
        if (optionsSection) {
            inView(optionsSection, () => {
                if (!hasStarted) {
                    hasStarted = true;
                    bloomProgress = 0;
                }
            }, { amount: 0.25 });
        } else {
            hasStarted = true;
        }

        function renderAsciiFrame() {
            const panel = document.getElementById("opt-content-1");
            if (!document.hidden && panel && panel.classList.contains("show")) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = `bold ${Math.ceil(cellH)}px "Courier New", monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                if (hasStarted && bloomProgress < 1) bloomProgress = Math.min(1, bloomProgress + 0.015);
                time += 0.035;

                for (const c of cells) {
                    if (c.normY > bloomProgress) continue;
                    const sway = Math.sin(time + c.y * 0.12) * (c.normY * 2.4);
                    ctx.fillStyle = c.color;
                    ctx.fillText(c.char, c.x * cellW + cellW / 2 + sway, c.y * cellH + cellH / 2);
                }
            }
            requestAnimationFrame(renderAsciiFrame);
        }

        const box = document.getElementById("bouquet-box");
        if (box) {
            box.addEventListener("click", () => {
                hasStarted = true;
                bloomProgress = 0.15;
            });
        }

        requestAnimationFrame(renderAsciiFrame);
    };
}

export const surpriseHandlers = {
    selectOption: (optionNumber, clickedBtn) => {
        document.querySelectorAll(".opt-btn").forEach((btn) => btn.classList.remove("active"));
        clickedBtn.classList.add("active");

        document.querySelectorAll(".opt-panel").forEach((panel) => panel.classList.remove("show"));
        const activePanel = document.getElementById("opt-content-" + optionNumber);
        activePanel.classList.add("show");

        motionPlay(activePanel, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, ease: EASE_SILKY });

        if (optionNumber === 2) {
            motionPlay(activePanel.querySelectorAll(".admire-card"), { opacity: [0, 1], x: [-14, 0] }, { duration: 0.48, delay: stagger(0.08), ease: EASE_SILKY });
        }
    },
    bloomBouquet: (event) => {
        if (event) event.stopPropagation();
        const msg = document.getElementById("bouquet-msg");
        const burstLayer = document.getElementById("flower-burst-layer");

        motionPlay("#bouquet-3d-wrap", { scale: [1, 1.12, 0.97, 1], y: [0, -12, 2, 0], rotate: [0, 3.5, -1.8, 0] }, SPRING_BOUNCY);
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
            const anim = motionPlay(
                particle,
                {
                    x: [0, Math.cos(angle) * distance],
                    y: [0, Math.sin(angle) * distance],
                    scale: [0.25, 0.85 + Math.random() * 0.5, 0.8],
                    rotate: [0, (Math.random() - 0.5) * 420],
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
    },
    blowCandle: () => {
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
    },
    sendWishToEmail: async () => {
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
};