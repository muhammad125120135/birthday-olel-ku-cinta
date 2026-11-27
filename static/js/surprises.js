import { motionPlay, inView, stagger, EASE_SILKY, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";
import { generateFlower3DPoints } from "./fireflies.js";

const FORMSPREE_URL = "https://formspree.io/f/GANTI_DENGAN_KODE_ANDA";
let triggerBouquetWilt = null;

function build3DBouquetModel() {
    const items = [];
    const ASCII_CHARS = " .:-=+*#%@";

    // 1. Kertas Pembungkus Buket (Kerucut & Lipatan Atas 3D)
    for (let u = 0; u <= 1; u += 0.055) {
        const y = 18 + u * 102;
        const coneR = (1 - u * 0.78) * 58;
        const flare = u < 0.25 ? Math.sin((0.25 - u) * Math.PI * 2) * 10 : 0;

        for (let a = 0; a < Math.PI * 2; a += 0.14) {
            const backRim = Math.sin(a) < 0 && u < 0.25 ? -18 * (0.25 - u) * 4 : 0;
            const r = coneR + flare + Math.sin(a * 5) * 2.5;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r * 0.72;

            items.push({
                x, y: y + backRim, z,
                part: "wrap",
                char: u < 0.08 ? "~" : ASCII_CHARS[Math.floor(4 + Math.cos(a) * 2)],
                color: Math.sin(a) < 0 ? "rgb(235, 195, 212)" : "rgb(252, 232, 240)",
                orderNorm: 0.15 + u * 0.2,
                vx: (Math.random() - 0.5) * 1.4,
                vy: 0.8 + Math.random() * 1.4,
                vz: (Math.random() - 0.5) * 1.4
            });
        }
    }

    // 2. Pita Pink di Leher Buket
    const ribbonY = 82;
    for (let a = 0; a < Math.PI * 2; a += 0.18) {
        items.push({
            x: Math.cos(a) * 26,
            y: ribbonY,
            z: Math.sin(a) * 20,
            part: "ribbon",
            char: "#",
            color: "rgb(255, 105, 165)",
            orderNorm: 0.25,
            vx: Math.cos(a) * 1.5,
            vy: 1.2,
            vz: Math.sin(a) * 1.5
        });
    }

    // Simpul kupu-kupu pita depan
    for (let t = -1; t <= 1; t += 0.12) {
        const bowX = t * 24;
        const bowY = ribbonY + Math.sin(Math.abs(t) * Math.PI) * 8;
        items.push({
            x: bowX, y: bowY - 4, z: 22,
            part: "ribbon", char: "@", color: "rgb(255, 130, 185)",
            orderNorm: 0.28, vx: t * 2, vy: 1.1, vz: 1.5
        });
        items.push({
            x: bowX, y: bowY + 4, z: 22,
            part: "ribbon", char: "*", color: "rgb(255, 90, 155)",
            orderNorm: 0.28, vx: t * 2, vy: 1.3, vz: 1.5
        });
    }

    // 3. Susunan 7 Bunga 3D (Matahari, Tulip, Anggrek) + Tangkainya
    const bouquetLayout = [
        { type: "sunflower", ox: 0, oy: -48, oz: 8, scale: 36, tiltX: -0.25, tiltZ: 0 },
        { type: "tulip", ox: -34, oy: -38, oz: 14, scale: 30, tiltX: -0.2, tiltZ: -0.35 },
        { type: "tulip", ox: 34, oy: -38, oz: 14, scale: 30, tiltX: -0.2, tiltZ: 0.35 },
        { type: "orchid", ox: -22, oy: -66, oz: -8, scale: 33, tiltX: -0.15, tiltZ: -0.2 },
        { type: "orchid", ox: 22, oy: -66, oz: -8, scale: 33, tiltX: -0.15, tiltZ: 0.2 },
        { type: "tulip", ox: -14, oy: -22, oz: 24, scale: 27, tiltX: -0.35, tiltZ: -0.15 },
        { type: "orchid", ox: 15, oy: -24, oz: 22, scale: 28, tiltX: -0.35, tiltZ: 0.18 }
    ];

    bouquetLayout.forEach((b, bIdx) => {
        // Tangkai melengkung dari kepala bunga masuk ke ikatan pita
        const steps = 16;
        for (let s = 0; s <= steps; s++) {
            const st = s / steps;
            const sx = b.ox * (1 - st * 0.85);
            const sy = b.oy + (ribbonY - b.oy) * st;
            const sz = b.oz * (1 - st * 0.85);
            items.push({
                x: sx, y: sy, z: sz,
                part: "stem",
                char: "|",
                color: "rgb(110, 210, 145)",
                orderNorm: 0.1 + st * 0.2,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 1.0 + Math.random(),
                vz: (Math.random() - 0.5) * 0.8
            });
        }

        // Kepala bunga 3D
        const flowerPts = generateFlower3DPoints(b.type, b.scale);
        flowerPts.forEach((pt) => {
            const y1 = pt.y * Math.cos(b.tiltX) - pt.z * Math.sin(b.tiltX);
            const z1 = pt.y * Math.sin(b.tiltX) + pt.z * Math.cos(b.tiltX);
            const x2 = pt.x * Math.cos(b.tiltZ) - y1 * Math.sin(b.tiltZ);
            const y2 = pt.x * Math.sin(b.tiltZ) + y1 * Math.cos(b.tiltZ);

            const shadeIdx = Math.min(ASCII_CHARS.length - 1, Math.max(1, Math.floor(pt.lum * ASCII_CHARS.length)));
            items.push({
                x: b.ox + x2,
                y: b.oy + y2,
                z: b.oz + z1,
                headCenterY: b.oy,
                part: "flower",
                distNorm: pt.distNorm,
                char: ASCII_CHARS[shadeIdx],
                sparkChar: pt.sparkChar,
                color: pt.color,
                orderNorm: 0.35 + pt.distNorm * 0.65,
                vx: pt.vx * 1.15 + (bIdx - 3) * 0.25,
                vy: pt.vy * 1.1,
                vz: pt.vz * 1.15
            });
        });
    });

    return items;
}

function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const model = build3DBouquetModel();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 12;

    let state = "blooming";
    let stateProgress = 0;
    let time = 0;

    triggerBouquetWilt = () => {
        if (state === "wilting") return;
        state = "wilting";
        stateProgress = 0;
    };

    const optionsSection = document.getElementById("options-section");
    if (optionsSection) {
        inView(optionsSection, () => {
            if (state === "hidden") {
                state = "blooming";
                stateProgress = 0;
            }
        }, { amount: 0.25 });
    }

    let lastTime = performance.now();

    function renderBouquetFrame(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const panel = document.getElementById("opt-content-1");
        if (!document.hidden && panel && panel.classList.contains("show")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            time += dt * 1.8;

            if (state === "blooming") {
                stateProgress = Math.min(1, stateProgress + dt * 0.62);
                if (stateProgress >= 1) state = "idle";
            } else if (state === "wilting") {
                stateProgress = Math.min(1, stateProgress + dt * 0.45);
                if (stateProgress >= 1) {
                    state = "hidden";
                    setTimeout(() => {
                        state = "blooming";
                        stateProgress = 0;
                        const msg = document.getElementById("bouquet-msg");
                        if (msg) msg.innerText = "A fresh bouquet bloomed again for you 🌸";
                    }, 900);
                }
            }

            if (state !== "hidden") {
                const bloomEase = state === "blooming" ? 1 - Math.pow(1 - stateProgress, 3) : 1;
                const wiltT = state === "wilting" ? stateProgress : 0;
                const rotY = Math.sin(time * 0.65) * 0.32;
                const rotX = 0.14 + Math.cos(time * 0.5) * 0.06;

                const projected = [];

                for (const item of model) {
                    if (state === "blooming" && item.orderNorm > bloomEase * 1.05) continue;

                    let x = item.x;
                    let y = item.y;
                    let z = item.z;
                    let alpha = 1;
                    let char = item.char;
                    let color = item.color;

                    if (state === "blooming") {
                        const grow = 0.25 + 0.75 * bloomEase;
                        x *= grow;
                        y = 40 + (y - 40) * grow;
                        z *= grow;
                    }

                    if (wiltT > 0) {
                        const droopAngle = wiltT * 0.85;
                        const pivotY = 82;
                        const dy = y - pivotY;
                        y = pivotY + dy * Math.cos(droopAngle) + Math.abs(x) * wiltT * 0.35;
                        z += Math.abs(dy) * Math.sin(droopAngle) * 0.6;

                        if (item.part === "flower") {
                            const disperse = Math.pow(wiltT, 1.25) * 58;
                            x += item.vx * disperse;
                            y += item.vy * disperse + 55 * wiltT * wiltT;
                            z += item.vz * disperse;
                            if (wiltT > 0.25 && item.sparkChar) char = item.sparkChar;
                            color = `rgba(235, 175, 195, ${Math.max(0, 1 - wiltT * 1.25)})`;
                        }
                        alpha = Math.max(0, 1 - Math.pow(wiltT, 1.3));
                    }

                    const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
                    const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
                    const x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
                    const z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

                    const fov = 340;
                    const scale = fov / (fov + z2);

                    projected.push({
                        px: cx + x2 * scale,
                        py: cy + y1 * scale,
                        z: z2,
                        scale,
                        alpha,
                        char,
                        color
                    });
                }

                projected.sort((a, b) => b.z - a.z);

                for (const p of projected) {
                    const fontSize = Math.max(7, Math.round(9.5 * p.scale));
                    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.fillText(p.char, p.px, p.py);
                }
            }
        }
        requestAnimationFrame(renderBouquetFrame);
    }

    requestAnimationFrame(renderBouquetFrame);
}

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

        if (typeof triggerBouquetWilt === "function") {
            triggerBouquetWilt();
        }

        motionPlay(
            "#bouquet-3d-wrap",
            { scale: [1, 1.05, 0.96, 1], y: [0, -6, 4, 0] },
            SPRING_BOUNCY
        );
        motionPlay("#bouquet-aura", { scale: [1, 1.25, 0.6], opacity: [0.8, 1, 0.2] }, { duration: 1.4, ease: EASE_SILKY });

        if (msg) {
            msg.innerText = "Kelopaknya terurai tertiup angin malam... ✨🌸";
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