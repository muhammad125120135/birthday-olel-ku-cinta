// static/js/surprises.js
import { motionPlay, inView, stagger, EASE_SILKY, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";
import { generateFlower3DPoints } from "./fireflies.js";

const FORMSPREE_URL = "https://formspree.io/f/GANTI_DENGAN_KODE_ANDA";
let triggerBasketWilt = null;

function build3DFlowerBasketModel() {
    const items = [];
    const ASCII_CHARS = " .:-=+*#%@";

    // 1. Keranjang Anyaman Rotan 3D (Woven Basket Body)
    const basketTopY = 24;
    const basketBottomY = 86;
    const rows = 14;
    const cols = 42;

    for (let r = 0; r <= rows; r++) {
        const u = r / rows; // 0 = bibir atas keranjang, 1 = dasar keranjang
        const y = basketTopY + u * (basketBottomY - basketTopY);
        const radiusX = 76 * (1 - u * 0.34);
        const radiusZ = 52 * (1 - u * 0.34);

        for (let c = 0; c < cols; c++) {
            const a = (c / cols) * Math.PI * 2;
            const isRim = r === 0 || r === 1;
            const weave = (r + c) % 2 === 0;

            items.push({
                x: Math.cos(a) * (isRim ? radiusX + 4 : radiusX),
                y,
                z: Math.sin(a) * (isRim ? radiusZ + 3 : radiusZ),
                part: "basket",
                char: isRim ? "@" : (weave ? "#" : "="),
                color: isRim
                    ? "rgb(236, 186, 132)"
                    : (weave ? "rgb(204, 148, 96)" : "rgb(168, 116, 72)"),
                orderNorm: 0.08 + u * 0.22,
                vx: Math.cos(a) * 0.7,
                vy: 0.9 + Math.random() * 0.6,
                vz: Math.sin(a) * 0.7
            });
        }
    }

    // Dasar keranjang
    for (let ring = 0.2; ring <= 1; ring += 0.28) {
        for (let a = 0; a < Math.PI * 2; a += 0.35) {
            items.push({
                x: Math.cos(a) * 48 * ring,
                y: basketBottomY,
                z: Math.sin(a) * 32 * ring,
                part: "basket",
                char: "+",
                color: "rgb(155, 105, 64)",
                orderNorm: 0.25,
                vx: 0,
                vy: 1.1,
                vz: 0
            });
        }
    }

    // 2. Pegangan Keranjang Melengkung (Arch Handle) & Pita Pink di Puncak Pegangan
    const handleSteps = 34;
    for (let i = 0; i <= handleSteps; i++) {
        const t = i / handleSteps; // 0 -> 1 dari kiri ke kanan
        const angle = Math.PI * (1 - t); // PI -> 0
        const hx = Math.cos(angle) * 74;
        const hy = basketTopY - Math.sin(angle) * 86;

        // Ketebalan kepang pegangan (2 untai)
        for (const offset of [-2.2, 2.2]) {
            items.push({
                x: hx,
                y: hy + offset,
                z: offset * 0.8,
                part: "handle",
                char: i % 2 === 0 ? "#" : "~",
                color: "rgb(224, 170, 116)",
                orderNorm: 0.15 + Math.sin(t * Math.PI) * 0.2,
                vx: Math.cos(angle) * 0.8,
                vy: 0.8,
                vz: (Math.random() - 0.5) * 0.8
            });
        }
    }

    // Pita Pink di Puncak Pegangan Keranjang
    const bowCenterY = basketTopY - 86;
    for (let t = -1; t <= 1; t += 0.14) {
        const bx = t * 20;
        const by = bowCenterY + Math.sin(Math.abs(t) * Math.PI) * 7;
        items.push({
            x: bx, y: by - 3, z: 4,
            part: "ribbon", char: "@", color: "rgb(255, 118, 178)",
            orderNorm: 0.32, vx: t * 1.4, vy: 1.0, vz: 0.9
        });
        items.push({
            x: bx, y: by + 3, z: 4,
            part: "ribbon", char: "*", color: "rgb(255, 85, 152)",
            orderNorm: 0.32, vx: t * 1.4, vy: 1.2, vz: 0.9
        });
    }

    // 3. Dedaunan Menjuntai di Tepi Bibir Keranjang
    const leafAngles = [-2.6, -2.1, -1.55, -0.95, -0.4, 0.35, 0.95, 1.55, 2.15, 2.65];
    leafAngles.forEach((la) => {
        for (let s = 0; s <= 5; s++) {
            const st = s / 5;
            const lx = Math.cos(la) * (76 + st * 14);
            const ly = basketTopY + st * 14 + Math.sin(st * Math.PI) * -4;
            const lz = Math.sin(la) * (52 + st * 10);
            items.push({
                x: lx, y: ly, z: lz,
                part: "leaf",
                char: st > 0.7 ? "v" : "~",
                color: "rgb(98, 198, 134)",
                orderNorm: 0.28 + st * 0.12,
                vx: Math.cos(la) * 1.1,
                vy: 1.3,
                vz: Math.sin(la) * 1.1
            });
        }
    });

    // 4. Rangkaian 8 Bunga 3D (Matahari, Tulip, Anggrek) di Dalam Keranjang
    const basketFlowers = [
        { type: "sunflower", ox: 0, oy: -20, oz: 6, scale: 34, tiltX: -0.22, tiltZ: 0 },
        { type: "tulip", ox: -38, oy: -12, oz: 12, scale: 28, tiltX: -0.18, tiltZ: -0.35 },
        { type: "tulip", ox: 38, oy: -12, oz: 12, scale: 28, tiltX: -0.18, tiltZ: 0.35 },
        { type: "orchid", ox: -24, oy: -34, oz: -12, scale: 30, tiltX: -0.12, tiltZ: -0.2 },
        { type: "orchid", ox: 24, oy: -34, oz: -12, scale: 30, tiltX: -0.12, tiltZ: 0.2 },
        { type: "tulip", ox: -16, oy: 2, oz: 24, scale: 25, tiltX: -0.32, tiltZ: -0.15 },
        { type: "orchid", ox: 17, oy: 0, oz: 22, scale: 26, tiltX: -0.32, tiltZ: 0.18 },
        { type: "sunflower", ox: 0, oy: -36, oz: -16, scale: 27, tiltX: -0.1, tiltZ: 0.08 }
    ];

    basketFlowers.forEach((b, bIdx) => {
        // Tangkai hijau masuk ke dalam keranjang
        const steps = 10;
        for (let s = 0; s <= steps; s++) {
            const st = s / steps;
            items.push({
                x: b.ox * (1 - st * 0.35),
                y: b.oy + (basketTopY + 14 - b.oy) * st,
                z: b.oz * (1 - st * 0.35),
                part: "stem",
                char: "|",
                color: "rgb(108, 208, 142)",
                orderNorm: 0.22 + st * 0.15,
                vx: (Math.random() - 0.5) * 0.7,
                vy: 1.0 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.7
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
                part: "flower",
                char: ASCII_CHARS[shadeIdx],
                sparkChar: pt.sparkChar,
                color: pt.color,
                orderNorm: 0.35 + pt.distNorm * 0.65,
                vx: pt.vx * 1.1 + (bIdx - 3.5) * 0.22,
                vy: pt.vy * 1.05,
                vz: pt.vz * 1.1
            });
        });
    });

    return items;
}

function initAsciiBouquet() {
    const canvas = document.getElementById("ascii-bouquet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const model = build3DFlowerBasketModel();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 14;

    let state = "blooming"; // "blooming" -> "idle" -> "wilting" -> "hidden" -> "blooming"
    let stateProgress = 0;
    let currentAngleRad = 0; // Memutar satu arah dari 0° sampai 30° (Math.PI / 6)
    const MAX_ANGLE_RAD = (30 * Math.PI) / 180; // 30 derajat

    triggerBasketWilt = () => {
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
                currentAngleRad = 0;
            }
        }, { amount: 0.25 });
    }

    let lastTime = performance.now();

    function renderBasketFrame(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const panel = document.getElementById("opt-content-1");
        if (!document.hidden && panel && panel.classList.contains("show")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

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
                        currentAngleRad = 0;
                        const msg = document.getElementById("bouquet-msg");
                        if (msg) msg.innerText = "A fresh flower basket bloomed again for you 🌸";
                    }, 900);
                }
            }

            // Memutar halus satu arah hingga berhenti di sudut 30 derajat (tidak bolak-balik)
            if (state !== "hidden" && currentAngleRad < MAX_ANGLE_RAD) {
                currentAngleRad = Math.min(MAX_ANGLE_RAD, currentAngleRad + dt * 0.28);
            }

            if (state !== "hidden") {
                const bloomEase = state === "blooming" ? 1 - Math.pow(1 - stateProgress, 3) : 1;
                const wiltT = state === "wilting" ? stateProgress : 0;

                // Ease-out pada rotasi 0° -> 30°
                const angleNorm = currentAngleRad / MAX_ANGLE_RAD;
                const rotY = MAX_ANGLE_RAD * (1 - Math.pow(1 - angleNorm, 2));
                const rotX = 0.22; // Sedikit menunduk agar isi keranjang terlihat jelas

                const projected = [];

                for (const item of model) {
                    if (state === "blooming" && item.orderNorm > bloomEase * 1.05) continue;

                    let x = item.x;
                    let y = item.y;
                    let z = item.z;
                    let alpha = 1;
                    let char = item.char;
                    let color = item.color;

                    // Transisi masuk: mekar mengembang dari dalam keranjang
                    if (state === "blooming") {
                        const grow = 0.22 + 0.78 * bloomEase;
                        x *= grow;
                        y = 32 + (y - 32) * grow;
                        z *= grow;
                    }

                    // Transisi saat diklik: tangkai & daun layu menunduk, kelopak terurai & menghilang
                    if (wiltT > 0) {
                        const droopAngle = wiltT * 0.78;
                        const pivotY = basketTopY + 12;
                        if (y < pivotY) {
                            const dy = y - pivotY;
                            y = pivotY + dy * Math.cos(droopAngle) + Math.abs(x) * wiltT * 0.28;
                            z += Math.abs(dy) * Math.sin(droopAngle) * 0.55;
                        }

                        if (item.part === "flower") {
                            const disperse = Math.pow(wiltT, 1.25) * 56;
                            x += item.vx * disperse;
                            y += item.vy * disperse + 52 * wiltT * wiltT;
                            z += item.vz * disperse;
                            if (wiltT > 0.25 && item.sparkChar) char = item.sparkChar;
                            color = `rgba(235, 175, 195, ${Math.max(0, 1 - wiltT * 1.25)})`;
                        }
                        alpha = Math.max(0, 1 - Math.pow(wiltT, 1.3));
                    }

                    // Rotasi 3D + proyeksi perspektif
                    const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
                    const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
                    const x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
                    const z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

                    const fov = 350;
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
        requestAnimationFrame(renderBasketFrame);
    }

    requestAnimationFrame(renderBasketFrame);
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

        if (typeof triggerBasketWilt === "function") {
            triggerBasketWilt();
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