// static/js/surprises.js
import { motionPlay, stagger, EASE_SILKY, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";
import { generateFlower3DPoints } from "./fireflies.js";

const FORMSPREE_URL = "https://formspree.io/f/GANTI_DENGAN_KODE_ANDA";
const RIBBON_Y = 78; // Titik ikatan pita (pusat lenturan tangkai saat tertiup angin)
let triggerBouquetWilt = null;
let triggerBouquetReset = null;

function build3DSakuraLavenderBouquet() {
    const items = [];
    const ASCII_CHARS = " .:-=+*#%@";

    // 1. Kertas Pembungkus Buket Berlapis (Ruffled Pastel Wrapping Paper 3D)
    const wrapTopY = 12;
    const wrapBottomY = 132;
    const rows = 18;
    const cols = 46;

    for (let r = 0; r <= rows; r++) {
        const u = r / rows; // 0 = kerah atas kertas, 1 = ujung pegangan bawah
        const y = wrapTopY + u * (wrapBottomY - wrapTopY);

        // Kerah atas melebar seperti kipas/corong, menyempit di pita (u ~ 0.55), lalu sedikit melebar di kaki
        let baseR;
        if (u < 0.55) {
            const topT = u / 0.55;
            baseR = 76 * (1 - topT * 0.72) + Math.pow(1 - topT, 2) * 14;
        } else {
            const botT = (u - 0.55) / 0.45;
            baseR = 21 + botT * 13;
        }

        for (let c = 0; c < cols; c++) {
            const a = (c / cols) * Math.PI * 2;
            // Lipatan gelombang kertas di tepi atas
            const ruffle = u < 0.35 ? Math.sin(a * 7) * 5.5 * (1 - u / 0.35) : Math.sin(a * 5) * 1.5;
            const highBackCollar = u < 0.28 && Math.sin(a) < 0
                ? Math.sin(a) * 18 * (1 - u / 0.28)
                : 0;

            const r = baseR + ruffle;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r * 0.78;
            const isEdge = r === 0 || r === rows;

            items.push({
                x,
                y: y + highBackCollar,
                z,
                part: "wrap",
                char: isEdge ? "~" : ASCII_CHARS[Math.floor(3 + Math.cos(a * 2) * 2)],
                color: Math.sin(a) < 0
                    ? "rgb(232, 206, 238)" // Lapisan dalam lilac lembut
                    : "rgb(252, 234, 244)", // Lapisan luar pink krem pastel
                orderNorm: 0.1 + u * 0.22,
                vx: Math.cos(a) * 0.9,
                vy: 0.8 + Math.random() * 0.9,
                vz: Math.sin(a) * 0.9
            });
        }
    }

    // 2. Pita Sutra Pink-Lilac di Leher Buket (Depan & Belakang untuk Rotasi 360°)
    for (let a = 0; a < Math.PI * 2; a += 0.16) {
        items.push({
            x: Math.cos(a) * 23,
            y: RIBBON_Y,
            z: Math.sin(a) * 19,
            part: "ribbon",
            char: "#",
            color: "rgb(255, 112, 175)",
            orderNorm: 0.26,
            vx: Math.cos(a) * 1.2,
            vy: 1.0,
            vz: Math.sin(a) * 1.2
        });
    }

    // Simpul kupu-kupu pita depan & belakang
    for (const zSide of [20, -20]) {
        for (let t = -1; t <= 1; t += 0.13) {
            const bx = t * 22;
            const by = RIBBON_Y + Math.sin(Math.abs(t) * Math.PI) * 7;
            items.push({
                x: bx, y: by - 3, z: zSide,
                part: "ribbon", char: "@", color: "rgb(255, 145, 198)",
                orderNorm: 0.28, vx: t * 1.4, vy: 1.0, vz: zSide * 0.15
            });
            items.push({
                x: bx, y: by + 3, z: zSide,
                part: "ribbon", char: "*", color: "rgb(236, 95, 162)",
                orderNorm: 0.28, vx: t * 1.4, vy: 1.2, vz: zSide * 0.15
            });
        }

        // Dua helai pita panjang menjuntai yang berkibar tertiup angin
        for (const side of [-1, 1]) {
            for (let s = 1; s <= 12; s++) {
                const st = s / 12;
                items.push({
                    x: side * (6 + st * 12),
                    y: RIBBON_Y + st * 46,
                    z: zSide + (side > 0 ? 1 : -1),
                    part: "ribbon_tail",
                    tailSide: side,
                    char: s === 12 ? "v" : "~",
                    color: "rgb(255, 128, 186)",
                    orderNorm: 0.3 + st * 0.1,
                    vx: side * 1.1,
                    vy: 1.3,
                    vz: zSide * 0.15
                });
            }
        }
    }

    // 3. Rangkaian 9 Bunga Sakura & Lavender 3D + Tangkai Lentur
    const bouquetFlowers = [
        // Lavender tinggi di belakang & samping (memberi siluet buket anggun)
        { type: "lavender", ox: -28, oy: -46, oz: -14, scale: 36, tiltX: 0.12, tiltZ: -0.26 },
        { type: "lavender", ox: 28, oy: -46, oz: -14, scale: 36, tiltX: 0.12, tiltZ: 0.26 },
        { type: "lavender", ox: 0, oy: -54, oz: -18, scale: 38, tiltX: 0.16, tiltZ: 0.04 },
        { type: "lavender", ox: -42, oy: -24, oz: 4, scale: 31, tiltX: -0.08, tiltZ: -0.42 },
        { type: "lavender", ox: 42, oy: -24, oz: 4, scale: 31, tiltX: -0.08, tiltZ: 0.42 },

        // Sakura mekar bertingkat di tengah & depan
        { type: "sakura", ox: 0, oy: -22, oz: 14, scale: 34, tiltX: -0.24, tiltZ: 0 },
        { type: "sakura", ox: -24, oy: -12, oz: 18, scale: 30, tiltX: -0.22, tiltZ: -0.28 },
        { type: "sakura", ox: 24, oy: -12, oz: 18, scale: 30, tiltX: -0.22, tiltZ: 0.28 },
        { type: "sakura", ox: 0, oy: 4, oz: 26, scale: 28, tiltX: -0.35, tiltZ: 0.06 }
    ];

    bouquetFlowers.forEach((b, bIdx) => {
        // Tangkai hijau lembut dari kepala bunga turun ke ikatan pita
        const steps = 14;
        for (let s = 0; s <= steps; s++) {
            const st = s / steps;
            items.push({
                x: b.ox * (1 - st * 0.82),
                y: b.oy + (RIBBON_Y - b.oy) * st,
                z: b.oz * (1 - st * 0.82),
                flowerIndex: bIdx,
                part: "stem",
                char: "|",
                color: "rgb(112, 206, 148)",
                orderNorm: 0.18 + st * 0.16,
                vx: (Math.random() - 0.5) * 0.7,
                vy: 1.0 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.7
            });
        }

        // Kepala bunga Sakura / Lavender 3D
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
                flowerIndex: bIdx,
                part: "flower",
                char: ASCII_CHARS[shadeIdx],
                sparkChar: pt.sparkChar,
                color: pt.color,
                orderNorm: 0.34 + pt.distNorm * 0.66,
                vx: pt.vx * 1.15 + (bIdx - 4) * 0.24,
                vy: pt.vy * 1.05,
                vz: pt.vz * 1.15
            });
        });
    });

    // 4. Kelopak Sakura Kecil Melayang Tertiup Angin di Sekitar Buket
    for (let p = 0; p < 10; p++) {
        const angle = (p / 10) * Math.PI * 2;
        const dist = 62 + (p % 3) * 18;
        items.push({
            x: Math.cos(angle) * dist,
            y: -45 + (p % 5) * 20,
            z: Math.sin(angle) * dist,
            petalPhase: p * 0.9,
            part: "ambient_petal",
            char: p % 2 === 0 ? "✿" : "·",
            color: p % 3 === 0 ? "rgb(205, 165, 255)" : "rgb(255, 195, 224)",
            orderNorm: 0.55 + (p / 10) * 0.4,
            vx: Math.cos(angle) * 1.5,
            vy: 0.6 + (p % 3) * 0.3,
            vz: Math.sin(angle) * 1.5
        });
    }

    return items;
}

function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Kanvas lebar agar kelopak yang bertebaran saat diklik tidak terpotong tepi kartu
    canvas.width = 620;
    canvas.height = 540;

    const model = build3DSakuraLavenderBouquet();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 28;

    let state = "blooming"; // "blooming" -> "idle" -> "wilting" -> "hidden"
    let stateProgress = 0;
    let rotY = 0;
    let windTime = 0;
    let wiltResetTimer = null;

    const TWO_PI = Math.PI * 2;
    const ROTATE_SPEED = 0.58;

    triggerBouquetReset = () => {
        if (wiltResetTimer) {
            clearTimeout(wiltResetTimer);
            wiltResetTimer = null;
        }
        state = "blooming";
        stateProgress = 0;
    };

    triggerBouquetWilt = () => {
        if (state === "wilting") return;
        if (wiltResetTimer) {
            clearTimeout(wiltResetTimer);
            wiltResetTimer = null;
        }
        state = "wilting";
        stateProgress = 0;
    };

    const targetObserve = document.getElementById("bouquet-box") || canvas;
    if ("IntersectionObserver" in window && targetObserve) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && state !== "wilting") {
                        triggerBouquetReset();
                    }
                });
            },
            { threshold: 0.15 }
        );
        observer.observe(targetObserve);
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

            if (state === "blooming") {
                stateProgress = Math.min(1, stateProgress + dt * 0.65);
                if (stateProgress >= 1) {
                    state = "idle";
                }
            } else if (state === "wilting") {
                stateProgress = Math.min(1, stateProgress + dt * 0.45);
                if (stateProgress >= 1) {
                    state = "hidden";
                    wiltResetTimer = setTimeout(() => {
                        triggerBouquetReset();
                        const msg = document.getElementById("bouquet-msg");
                        if (msg) msg.innerText = "Buket Sakura & Lavender segar kembali mekar untukmu 🌸💜";
                    }, 900);
                }
            }

            if (state !== "hidden") {
                rotY = (rotY + dt * ROTATE_SPEED) % TWO_PI;
                windTime += dt;

                // Hembusan angin lembut multi-gelombang
                const breezeStrength = 0.65 + 0.35 * Math.sin(windTime * 0.75);
                const globalWindX = Math.sin(windTime * 1.45) * breezeStrength;
                const globalWindZ = Math.cos(windTime * 1.15) * 0.65 * breezeStrength;

                const bloomEase = state === "blooming" ? 1 - Math.pow(1 - stateProgress, 3) : 1;
                const wiltT = state === "wilting" ? stateProgress : 0;
                const rotX = 0.16;

                const projected = [];

                for (const item of model) {
                    if (state === "blooming" && item.orderNorm > bloomEase * 1.05) continue;

                    let x = item.x;
                    let y = item.y;
                    let z = item.z;
                    let alpha = 1;
                    let char = item.char;
                    let color = item.color;

                    // Transisi masuk: mekar mengembang dari ikatan pita
                    if (state === "blooming") {
                        const grow = 0.2 + 0.8 * bloomEase;
                        x *= grow;
                        y = RIBBON_Y + (y - RIBBON_Y) * grow;
                        z *= grow;
                    }

                    // Animasi tertiup angin pada tangkai, kepala bunga, pita menjuntai, & kelopak melayang
                    if (item.part === "stem" || item.part === "flower") {
                        const heightAboveTie = Math.max(0, RIBBON_Y - y);
                        const flex = Math.pow(heightAboveTie / 110, 1.45);
                        const phase = (item.flowerIndex || 0) * 0.75;
                        const localSwayX = (globalWindX + Math.sin(windTime * 2.1 + phase) * 0.35) * 16 * flex;
                        const localSwayZ = (globalWindZ + Math.cos(windTime * 1.8 + phase) * 0.35) * 12 * flex;

                        x += localSwayX;
                        z += localSwayZ;
                        y += (Math.abs(localSwayX) + Math.abs(localSwayZ)) * 0.14;
                    } else if (item.part === "ribbon_tail") {
                        const dropDist = Math.max(0, y - RIBBON_Y);
                        const tailFlex = Math.pow(dropDist / 46, 1.35);
                        x += Math.sin(windTime * 2.4 - dropDist * 0.08 + item.tailSide) * 10 * tailFlex;
                        z += Math.cos(windTime * 2.0 - dropDist * 0.08) * 6 * tailFlex;
                    } else if (item.part === "ambient_petal") {
                        x += Math.sin(windTime * 1.3 + item.petalPhase) * 14 + globalWindX * 10;
                        y += Math.cos(windTime * 1.6 + item.petalPhase) * 9;
                        z += Math.sin(windTime * 1.1 + item.petalPhase) * 12;
                        alpha = 0.55 + 0.35 * Math.sin(windTime * 2.2 + item.petalPhase);
                    }

                    // Transisi saat diklik: tangkai melengkung layu, kelopak terurai tertiup angin
                    if (wiltT > 0) {
                        const droopAngle = wiltT * 0.82;
                        if (y < RIBBON_Y) {
                            const dy = y - RIBBON_Y;
                            y = RIBBON_Y + dy * Math.cos(droopAngle) + Math.abs(x) * wiltT * 0.3;
                            z += Math.abs(dy) * Math.sin(droopAngle) * 0.55;
                        }

                        if (item.part === "flower" || item.part === "ambient_petal") {
                            const disperse = Math.pow(wiltT, 1.2) * 64;
                            x += (item.vx + 0.65) * disperse; // ikut terbawa angin ke samping
                            y += item.vy * disperse + 48 * wiltT * wiltT;
                            z += item.vz * disperse;
                            if (wiltT > 0.25 && item.sparkChar) char = item.sparkChar;
                        }
                        alpha *= Math.max(0, 1 - Math.pow(wiltT, 1.3));
                    }

                    // Rotasi 3D 360° + proyeksi perspektif
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

        if (optionNumber === 1 && typeof triggerBouquetReset === "function") {
            triggerBouquetReset();
        }

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
            msg.innerText = "Kelopak Sakura & Lavender bertebaran tertiup angin... ✨🌸💜";
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