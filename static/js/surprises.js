// static/js/surprises.js
import { motionPlay, stagger, EASE_SILKY, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";
import { generateFlower3DPoints } from "./fireflies.js";

const FORMSPREE_URL = "https://formspree.io/f/GANTI_DENGAN_KODE_ANDA";
const RIBBON_Y = 78;

let triggerBouquetWilt = null;
let triggerBouquetReset = null;
let triggerCakeBlowToggle = null;
let triggerCakeEntrance = null;

// ============================================================================
// 1. MODEL 3D BUKET SAKURA & LAVENDER
// ============================================================================
function build3DSakuraLavenderBouquet() {
    const items = [];
    const ASCII_CHARS = " .:-=+*#%@";

    const wrapTopY = 12;
    const wrapBottomY = 132;
    const rows = 18;
    const cols = 46;

    for (let r = 0; r <= rows; r++) {
        const u = r / rows;
        const y = wrapTopY + u * (wrapBottomY - wrapTopY);

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
            const ruffle = u < 0.35 ? Math.sin(a * 7) * 5.5 * (1 - u / 0.35) : Math.sin(a * 5) * 1.5;
            const highBackCollar = u < 0.28 && Math.sin(a) < 0
                ? Math.sin(a) * 18 * (1 - u / 0.28)
                : 0;

            const rVal = baseR + ruffle;
            const x = Math.cos(a) * rVal;
            const z = Math.sin(a) * rVal * 0.78;
            const isEdge = r === 0 || r === rows;

            items.push({
                x,
                y: y + highBackCollar,
                z,
                part: "wrap",
                char: isEdge ? "~" : ASCII_CHARS[Math.floor(3 + Math.cos(a * 2) * 2)],
                color: Math.sin(a) < 0
                    ? "rgb(232, 206, 238)"
                    : "rgb(252, 234, 244)",
                orderNorm: 0.1 + u * 0.22,
                vx: Math.cos(a) * 0.9,
                vy: 0.8 + Math.random() * 0.9,
                vz: Math.sin(a) * 0.9
            });
        }
    }

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

    const bouquetFlowers = [
        { type: "lavender", ox: -28, oy: -46, oz: -14, scale: 36, tiltX: 0.12, tiltZ: -0.26 },
        { type: "lavender", ox: 28, oy: -46, oz: -14, scale: 36, tiltX: 0.12, tiltZ: 0.26 },
        { type: "lavender", ox: 0, oy: -54, oz: -18, scale: 38, tiltX: 0.16, tiltZ: 0.04 },
        { type: "lavender", ox: -42, oy: -24, oz: 4, scale: 31, tiltX: -0.08, tiltZ: -0.42 },
        { type: "lavender", ox: 42, oy: -24, oz: 4, scale: 31, tiltX: -0.08, tiltZ: 0.42 },
        { type: "sakura", ox: 0, oy: -22, oz: 14, scale: 34, tiltX: -0.24, tiltZ: 0 },
        { type: "sakura", ox: -24, oy: -12, oz: 18, scale: 30, tiltX: -0.22, tiltZ: -0.28 },
        { type: "sakura", ox: 24, oy: -12, oz: 18, scale: 30, tiltX: -0.22, tiltZ: 0.28 },
        { type: "sakura", ox: 0, oy: 4, oz: 26, scale: 28, tiltX: -0.35, tiltZ: 0.06 }
    ];

    bouquetFlowers.forEach((b, bIdx) => {
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

    canvas.width = 620;
    canvas.height = 540;

    const model = build3DSakuraLavenderBouquet();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 28;

    let state = "blooming";
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
                if (stateProgress >= 1) state = "idle";
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

                    if (state === "blooming") {
                        const grow = 0.2 + 0.8 * bloomEase;
                        x *= grow;
                        y = RIBBON_Y + (y - RIBBON_Y) * grow;
                        z *= grow;
                    }

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

                    if (wiltT > 0) {
                        const droopAngle = wiltT * 0.82;
                        if (y < RIBBON_Y) {
                            const dy = y - RIBBON_Y;
                            y = RIBBON_Y + dy * Math.cos(droopAngle) + Math.abs(x) * wiltT * 0.3;
                            z += Math.abs(dy) * Math.sin(droopAngle) * 0.55;
                        }

                        if (item.part === "flower" || item.part === "ambient_petal") {
                            const disperse = Math.pow(wiltT, 1.2) * 64;
                            x += (item.vx + 0.65) * disperse;
                            y += item.vy * disperse + 48 * wiltT * wiltT;
                            z += item.vz * disperse;
                            if (wiltT > 0.25 && item.sparkChar) char = item.sparkChar;
                        }
                        alpha *= Math.max(0, 1 - Math.pow(wiltT, 1.3));
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
                    const fontSize = Math.max(8, Math.round(9.5 * p.scale));
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

// ============================================================================
// 2. MODEL 3D FLOATING STARLIGHT CAKE DENGAN CINCIN ORBIT
// ============================================================================
function build3DStarlightCakeModel() {
    const bodyPoints = [];
    const orbitPoints = [];

    const cakeRadius = 52;
    const cakeTopY = 2;
    const cakeBottomY = 48;

    // A. Piring Kaca Melayang di Bawah Kue
    const plateY = 62;
    for (let ring = 0.25; ring <= 1.0; ring += 0.25) {
        const r = ring * 74;
        const steps = Math.max(14, Math.round(ring * 48));
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            const isRim = ring >= 0.95;
            bodyPoints.push({
                x: Math.cos(a) * r,
                y: plateY + (isRim ? -2 : 0),
                z: Math.sin(a) * r,
                part: "plate",
                char: isRim ? "=" : "·",
                color: isRim ? "rgb(215, 225, 255)" : "rgb(175, 190, 235)",
                orderNorm: 0.05 + ring * 0.1
            });
        }
    }

    // B. Permukaan Atas Kue (Cream Topping)
    for (let ring = 0.15; ring <= 1.0; ring += 0.21) {
        const r = ring * cakeRadius;
        const steps = Math.max(12, Math.round(ring * 40));
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            bodyPoints.push({
                x: Math.cos(a) * r,
                y: cakeTopY,
                z: Math.sin(a) * r,
                part: "cake_top",
                char: ring > 0.8 ? "@" : "+",
                color: "rgb(255, 238, 248)",
                orderNorm: 0.35 + ring * 0.15
            });
        }
    }

    // C. Dinding Silinder Kue & Lelehan Krim Pastel (Drip Frosting)
    const rows = 11;
    const cols = 44;
    for (let r = 0; r <= rows; r++) {
        const u = r / rows;
        const y = cakeTopY + u * (cakeBottomY - cakeTopY);

        for (let c = 0; c < cols; c++) {
            const a = (c / cols) * Math.PI * 2;
            const dripLimit = 0.26 + 0.18 * Math.sin(a * 7) + 0.08 * Math.cos(a * 3);
            const isDrip = u <= dripLimit;
            const isCreamLayer = Math.abs(u - 0.56) < 0.07;

            let char = "#";
            let color = "rgb(252, 185, 214)"; // Bolu stroberi pastel

            if (isDrip) {
                char = u > dripLimit - 0.08 ? "~" : "@";
                color = "rgb(255, 242, 250)"; // Lelehan krim putih-pink
            } else if (isCreamLayer) {
                char = "=";
                color = "rgb(225, 195, 255)"; // Lapisan krim lilac di tengah kue
            }

            bodyPoints.push({
                x: Math.cos(a) * (isDrip ? cakeRadius + 1.2 : cakeRadius),
                y,
                z: Math.sin(a) * (isDrip ? cakeRadius + 1.2 : cakeRadius),
                part: "cake_body",
                char,
                color,
                orderNorm: 0.15 + (1 - u) * 0.25
            });
        }
    }

    // D. Mutiara Gula di Pinggir Bawah & Atas Kue
    const pearlCount = 26;
    for (let i = 0; i < pearlCount; i++) {
        const a = (i / pearlCount) * Math.PI * 2;
        bodyPoints.push({
            x: Math.cos(a) * (cakeRadius + 2.5),
            y: cakeBottomY,
            z: Math.sin(a) * (cakeRadius + 2.5),
            part: "pearl",
            char: "o",
            color: i % 2 === 0 ? "rgb(255, 224, 130)" : "rgb(255, 155, 205)",
            orderNorm: 0.2
        });
    }

    // E. 8 Pusaran Krim Kocok (Whipped Cream Swirls) di Atas Kue
    const swirlCount = 8;
    for (let s = 0; s < swirlCount; s++) {
        const sa = (s / swirlCount) * Math.PI * 2;
        const sx = Math.cos(sa) * (cakeRadius * 0.72);
        const sz = Math.sin(sa) * (cakeRadius * 0.72);

        for (let h = 0; h < 3; h++) {
            const subR = (2 - h) * 2.5;
            for (let k = 0; k < 4; k++) {
                const ka = (k / 4) * Math.PI * 2 + h;
                bodyPoints.push({
                    x: sx + Math.cos(ka) * subR,
                    y: cakeTopY - 2 - h * 2.5,
                    z: sz + Math.sin(ka) * subR,
                    part: "swirl",
                    char: h === 2 ? "*" : "@",
                    color: s % 2 === 0 ? "rgb(255, 142, 196)" : "rgb(255, 245, 252)",
                    orderNorm: 0.52 + h * 0.05
                });
            }
        }
    }

    // F. Lilin Ulang Tahun Bergaris di Tengah Kue
    const candleTopY = -34;
    for (let cy = cakeTopY; cy >= candleTopY; cy -= 3.2) {
        const stepIdx = Math.round((cakeTopY - cy) / 3.2);
        for (let c = 0; c < 10; c++) {
            const a = (c / 10) * Math.PI * 2;
            const isStripe = (stepIdx + c) % 3 === 0;
            bodyPoints.push({
                x: Math.cos(a) * 4.5,
                y: cy,
                z: Math.sin(a) * 4.5,
                part: "candle",
                char: isStripe ? "/" : "|",
                color: isStripe ? "rgb(255, 108, 175)" : "rgb(255, 248, 252)",
                orderNorm: 0.65 + ((cakeTopY - cy) / (cakeTopY - candleTopY)) * 0.2
            });
        }
    }

    // Sumbu lilin
    bodyPoints.push({
        x: 0,
        y: candleTopY - 3,
        z: 0,
        part: "wick",
        char: "|",
        color: "rgb(140, 115, 130)",
        orderNorm: 0.88
    });

    // G. Cincin Orbit Bintang & Hati Miring (Saturn-like Starlight Ring)
    const orbitCount = 54;
    for (let i = 0; i < orbitCount; i++) {
        const a = (i / orbitCount) * Math.PI * 2;
        const radialOffset = ((i % 3) - 1) * 7.5;
        const isHeart = i % 9 === 0;
        const isBigStar = i % 4 === 0 && !isHeart;

        let char = "·";
        let color = "rgb(210, 180, 255)";
        if (isHeart) {
            char = "♥";
            color = "rgb(255, 128, 192)";
        } else if (isBigStar) {
            char = "✦";
            color = "rgb(255, 226, 118)";
        } else if (i % 2 === 0) {
            char = "*";
            color = "rgb(255, 182, 224)";
        }

        orbitPoints.push({
            angle: a,
            baseRadius: 88 + radialOffset,
            yOffset: Math.sin(i * 1.7) * 2.5,
            char,
            color,
            twinklePhase: i * 0.6,
            orderNorm: 0.4 + (i / orbitCount) * 0.55
        });
    }

    return { bodyPoints, orbitPoints, wickY: candleTopY - 4 };
}

function initAsciiCake() {
    const cakeBox = document.getElementById("cake-box");
    if (!cakeBox) return;

    // Pastikan canvas 3D terpasang di dalam #cake-box (menggantikan kue statis lama)
    let canvas = document.getElementById("ascii-cake-canvas");
    if (!canvas) {
        cakeBox.innerHTML = "";
        canvas = document.createElement("canvas");
        canvas.id = "ascii-cake-canvas";
        cakeBox.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 480;
    canvas.height = 430;

    const { bodyPoints, orbitPoints, wickY } = build3DStarlightCakeModel();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 12;

    let flameLit = true;
    let entranceProgress = 0;
    let ringPulse = 0; // Gelombang mekar cincin orbit saat lilin ditiup
    let rotY = 0;
    let orbitSpin = 0;
    let time = 0;
    const smokeParticles = [];

    function spawnSmokePuff() {
        smokeParticles.push({
            x: (Math.random() - 0.5) * 3,
            y: wickY - 2,
            z: (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 8,
            vy: -(18 + Math.random() * 14),
            phase: Math.random() * Math.PI * 2,
            age: 0,
            life: 2.2 + Math.random() * 1.1,
            char: ["~", "(", ")", "·", "°"][Math.floor(Math.random() * 5)]
        });
    }

    triggerCakeEntrance = () => {
        entranceProgress = 0;
    };

    triggerCakeBlowToggle = () => {
        flameLit = !flameLit;
        if (!flameLit) {
            // Lilin ditiup: cincin orbit memancarkan gelombang & asap mengepul naik
            ringPulse = 1;
            for (let i = 0; i < 14; i++) {
                setTimeout(() => spawnSmokePuff(), i * 110);
            }
        } else {
            // Lilin dinyalakan kembali
            ringPulse = 0.45;
            smokeParticles.length = 0;
        }
        return flameLit;
    };

    const targetObserve = cakeBox;
    if ("IntersectionObserver" in window && targetObserve) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entranceProgress === 0) {
                        entranceProgress = 0.01;
                    }
                });
            },
            { threshold: 0.2 }
        );
        observer.observe(targetObserve);
    } else {
        entranceProgress = 1;
    }

    let lastTime = performance.now();

    function renderCakeFrame(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const panel = document.getElementById("opt-content-3");
        if (!document.hidden && panel && panel.classList.contains("show")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            time += dt;
            rotY = (rotY + dt * 0.55) % (Math.PI * 2);
            orbitSpin = (orbitSpin + dt * 0.95) % (Math.PI * 2);

            if (entranceProgress < 1) {
                entranceProgress = Math.min(1, entranceProgress + dt * 0.85);
            }
            if (ringPulse > 0) {
                ringPulse = Math.max(0, ringPulse - dt * 0.75);
            }

            const easeIn = 1 - Math.pow(1 - entranceProgress, 3);
            const hoverY = Math.sin(time * 2.1) * 5.5; // Efek kue melayang lembut
            const rotX = 0.26;
            const fov = 330;

            const projected = [];

            // 1. Render Badan Kue, Krim, Piring, & Lilin
            for (const pt of bodyPoints) {
                if (pt.orderNorm > easeIn * 1.05) continue;

                const grow = 0.35 + 0.65 * easeIn;
                const x = pt.x * grow;
                const y = pt.y * grow + hoverY;
                const z = pt.z * grow;

                const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
                const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
                const x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
                const z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

                const scale = fov / (fov + z2);
                projected.push({
                    px: cx + x2 * scale,
                    py: cy + y1 * scale,
                    z: z2,
                    scale,
                    alpha: easeIn,
                    char: pt.char,
                    color: pt.color,
                    glow: null
                });
            }

            // 2. Render Cincin Orbit Bintang & Hati Miring
            const pulseExpand = Math.sin(ringPulse * Math.PI) * 34;
            const ringTiltZ = -0.24;
            const ringTiltX = 0.34;

            for (const op of orbitPoints) {
                if (op.orderNorm > easeIn * 1.05) continue;

                const a = op.angle + orbitSpin;
                const r = (op.baseRadius + pulseExpand) * (0.4 + 0.6 * easeIn);

                // Posisi di bidang datar cincin
                const rx0 = Math.cos(a) * r;
                const ry0 = op.yOffset;
                const rz0 = Math.sin(a) * r;

                // Miringkan bidang cincin seperti cincin Saturnus
                const ry1 = ry0 * Math.cos(ringTiltX) - rz0 * Math.sin(ringTiltX);
                const rz1 = ry0 * Math.sin(ringTiltX) + rz0 * Math.cos(ringTiltX);
                const rx2 = rx0 * Math.cos(ringTiltZ) - ry1 * Math.sin(ringTiltZ);
                const ry2 = rx0 * Math.sin(ringTiltZ) + ry1 * Math.cos(ringTiltZ) + hoverY * 0.7;

                const scale = fov / (fov + rz1);
                const twinkle = 0.65 + 0.35 * Math.sin(time * 3.5 + op.twinklePhase);

                projected.push({
                    px: cx + rx2 * scale,
                    py: cy + ry2 * scale,
                    z: rz1,
                    scale: scale * (1 + ringPulse * 0.25),
                    alpha: easeIn * twinkle,
                    char: op.char,
                    color: op.color,
                    glow: op.char === "✦" || op.char === "♥" ? op.color : null
                });
            }

            // 3. Render Api Lilin (jika menyala) atau Asap Mengepul (jika ditiup)
            if (flameLit && easeIn > 0.75) {
                const flameSway = Math.sin(time * 9) * 1.8 + Math.cos(time * 14) * 0.9;
                const flameFlicker = 0.9 + 0.15 * Math.sin(time * 16);

                const flameLayers = [
                    { dy: -3, r: 3.2, char: "@", color: "rgb(255, 250, 215)" },
                    { dy: -7, r: 4.0, char: "#", color: "rgb(255, 212, 92)" },
                    { dy: -11, r: 3.0, char: "*", color: "rgb(255, 148, 82)" },
                    { dy: -15, r: 1.6, char: "^", color: "rgb(255, 108, 120)" },
                    { dy: -19, r: 0.4, char: "·", color: "rgb(255, 220, 140)" }
                ];

                flameLayers.forEach((fl, idx) => {
                    const steps = fl.r > 1 ? 6 : 1;
                    for (let s = 0; s < steps; s++) {
                        const sa = (s / steps) * Math.PI * 2 + time * 4;
                        const fx = Math.cos(sa) * fl.r + flameSway * (idx * 0.28);
                        const fy = wickY + fl.dy * flameFlicker + hoverY;
                        const fz = Math.sin(sa) * fl.r;

                        const y1 = fy * Math.cos(rotX) - fz * Math.sin(rotX);
                        const z1 = fy * Math.sin(rotX) + fz * Math.cos(rotX);
                        const scale = fov / (fov + z1);

                        projected.push({
                            px: cx + fx * scale,
                            py: cy + y1 * scale,
                            z: z1 - 4,
                            scale: scale * 1.08,
                            alpha: 0.95,
                            char: fl.char,
                            color: fl.color,
                            glow: "rgba(255, 200, 95, 0.9)"
                        });
                    }
                });
            }

            // Update & render partikel asap saat lilin padam
            for (let i = smokeParticles.length - 1; i >= 0; i--) {
                const sp = smokeParticles[i];
                sp.age += dt;
                if (sp.age >= sp.life) {
                    smokeParticles.splice(i, 1);
                    continue;
                }
                const st = sp.age / sp.life;
                const sx = sp.x + Math.sin(time * 4 + sp.phase) * (4 + st * 14) + sp.vx * st;
                const sy = sp.y + sp.vy * sp.age + hoverY;
                const sz = sp.z + Math.cos(time * 3.5 + sp.phase) * 5;

                const y1 = sy * Math.cos(rotX) - sz * Math.sin(rotX);
                const z1 = sy * Math.sin(rotX) + sz * Math.cos(rotX);
                const scale = fov / (fov + z1);

                projected.push({
                    px: cx + sx * scale,
                    py: cy + y1 * scale,
                    z: z1,
                    scale: scale * (0.9 + st * 0.4),
                    alpha: (1 - st) * 0.78,
                    char: sp.char,
                    color: "rgb(218, 212, 238)",
                    glow: null
                });
            }

            projected.sort((a, b) => b.z - a.z);

            for (const p of projected) {
                const fontSize = Math.max(8, Math.round(10 * p.scale));
                ctx.font = `bold ${fontSize}px "Courier New", monospace`;
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                if (p.glow) {
                    ctx.shadowColor = p.glow;
                    ctx.shadowBlur = 10;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fillText(p.char, p.px, p.py);
            }
            ctx.shadowBlur = 0;
        }
        requestAnimationFrame(renderCakeFrame);
    }

    requestAnimationFrame(renderCakeFrame);
}

// ============================================================================
// 3. INISIALISASI & HANDLER INTERAKSI SURPRISES
// ============================================================================
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
    initAsciiCake();
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

        if (optionNumber === 3 && typeof triggerCakeEntrance === "function") {
            triggerCakeEntrance();
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
        motionPlay("#cake-box", { scale: [1, 0.96, 1.03, 1] }, SPRING_SNAPPY);

        const isLit = typeof triggerCakeBlowToggle === "function"
            ? triggerCakeBlowToggle()
            : !(flame && !flame.classList.contains("blown"));

        if (!isLit) {
            if (flame) flame.classList.add("blown");
            if (status) status.innerText = "Yeay! Sekarang tulis harapanmu di bawah ini 🎉✨";
        } else {
            if (flame) flame.classList.remove("blown");
            if (status) status.innerText = "Tap the candle to blow it out ✨";
        }
        if (status) {
            motionPlay(status, { scale: [0.94, 1.03, 1], opacity: [0.6, 1] }, SPRING_SNAPPY);
        }
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