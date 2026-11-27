// static/js/fireflies.js
const ASCII_SHADES = " .:-=+*#%@";
const FIREFLY_CHARS = ["✦", "·", "*", "+", "°"];

function project3D(x, y, z, cx, cy, fov = 320) {
    const scale = fov / (fov + z);
    return {
        px: cx + x * scale,
        py: cy + y * scale,
        scale,
        z
    };
}

function rotate3D(x, y, z, rx, ry, rz) {
    // Rotasi X
    const y1 = y * Math.cos(rx) - z * Math.sin(rx);
    const z1 = y * Math.sin(rx) + z * Math.cos(rx);
    // Rotasi Y
    const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    // Rotasi Z
    const x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    const y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    return { x: x3, y: y3, z: z2 };
}

// Generator titik 3D parametrik untuk Tulip, Anggrek, dan Matahari
export function generateFlower3DPoints(species, radius = 58) {
    const points = [];

    if (species === "tulip") {
        const petals = 6;
        for (let p = 0; p < petals; p++) {
            const baseAngle = (p / petals) * Math.PI * 2 + (p % 2) * 0.25;
            const layerOffset = (p % 2) * 0.14;
            for (let u = 0; u <= 1; u += 0.1) {
                for (let v = -1; v <= 1; v += 0.22) {
                    const width = Math.sin(u * Math.PI) * 0.44;
                    const theta = baseAngle + v * width;
                    const cupR = radius * (0.22 + Math.sin(u * Math.PI * 0.82) * (0.58 - layerOffset));
                    const height = -radius * (u * 1.15 - 0.45);
                    const curl = Math.pow(u, 2.2) * 10;

                    const x = Math.cos(theta) * (cupR - curl);
                    const z = Math.sin(theta) * (cupR - curl);
                    const y = height;

                    const lum = 0.35 + u * 0.55 + (1 - Math.abs(v)) * 0.1;
                    const color = u < 0.35
                        ? "rgb(255, 215, 165)"
                        : `rgb(${Math.round(235 + u * 20)}, ${Math.round(95 + (1 - Math.abs(v)) * 55)}, ${Math.round(155 + u * 45)})`;

                    points.push({ x, y, z, lum, color, distNorm: u });
                }
            }
        }
    } else if (species === "orchid") {
        // 5 Kelopak utama + 1 bibir tengah (labellum)
        const petalConfigs = [
            { angle: -Math.PI / 2, len: 1.0, wid: 0.42, tilt: 0.25, isLip: false },
            { angle: -Math.PI / 2 + 1.15, len: 0.95, wid: 0.55, tilt: 0.15, isLip: false },
            { angle: -Math.PI / 2 - 1.15, len: 0.95, wid: 0.55, tilt: 0.15, isLip: false },
            { angle: Math.PI / 2 + 0.55, len: 0.9, wid: 0.38, tilt: 0.2, isLip: false },
            { angle: Math.PI / 2 - 0.55, len: 0.9, wid: 0.38, tilt: 0.2, isLip: false },
            { angle: Math.PI / 2, len: 0.65, wid: 0.52, tilt: -0.65, isLip: true }
        ];

        petalConfigs.forEach((cfg) => {
            for (let u = 0.08; u <= 1; u += 0.11) {
                for (let v = -1; v <= 1; v += 0.25) {
                    const spread = Math.sin(u * Math.PI) * cfg.wid;
                    const a = cfg.angle + v * spread;
                    const r = u * radius * cfg.len;
                    const waveZ = Math.sin(u * Math.PI * 1.5) * 14 * cfg.tilt + (cfg.isLip ? Math.cos(v * 2) * 8 : 0);

                    const x = Math.cos(a) * r;
                    const y = Math.sin(a) * r;
                    const z = waveZ;

                    const lum = 0.4 + u * 0.5;
                    const color = cfg.isLip
                        ? `rgb(255, ${Math.round(70 + (1 - u) * 90)}, ${Math.round(165 + u * 70)})`
                        : `rgb(${Math.round(230 + (1 - u) * 25)}, ${Math.round(165 + (1 - u) * 75)}, 255)`;

                    points.push({ x, y, z, lum, color, distNorm: u });
                }
            }
        });
    } else {
        // Matahari (Sunflower): Inti spiral + 22 kelopak emas
        const coreCount = 55;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < coreCount; i++) {
            const t = i / coreCount;
            const r = Math.sqrt(t) * (radius * 0.36);
            const theta = i * goldenAngle;
            points.push({
                x: Math.cos(theta) * r,
                y: Math.sin(theta) * r,
                z: (1 - t) * 9,
                lum: 0.45 + t * 0.45,
                color: `rgb(${Math.round(125 + t * 80)}, ${Math.round(70 + t * 50)}, 35)`,
                distNorm: t * 0.35
            });
        }

        const petals = 22;
        for (let p = 0; p < petals; p++) {
            const baseA = (p / petals) * Math.PI * 2;
            const zLayer = (p % 2 === 0 ? 1 : -1) * 3.5;
            for (let u = 0.32; u <= 1.05; u += 0.13) {
                for (let v = -1; v <= 1; v += 0.5) {
                    const taper = (1 - (u - 0.32) / 0.75) * 0.14;
                    const a = baseA + v * taper;
                    const r = u * radius;
                    points.push({
                        x: Math.cos(a) * r,
                        y: Math.sin(a) * r,
                        z: zLayer + Math.sin(u * Math.PI) * 6,
                        lum: 0.5 + u * 0.45,
                        color: `rgb(255, ${Math.round(195 + u * 45)}, ${Math.round(55 + (1 - u) * 60)})`,
                        distNorm: u
                    });
                }
            }
        }
    }

    // Vektor ledakan kembang api untuk setiap titik
    return points.map((pt) => {
        const len = Math.hypot(pt.x, pt.y, pt.z) || 1;
        const burstSpeed = 1.6 + Math.random() * 2.4;
        return {
            ...pt,
            vx: (pt.x / len) * burstSpeed + (Math.random() - 0.5) * 0.9,
            vy: (pt.y / len) * burstSpeed - 0.45 + (Math.random() - 0.5) * 0.9,
            vz: (pt.z / len) * burstSpeed + (Math.random() - 0.5) * 0.9,
            sparkChar: ["*", "✦", "+", "·", "✿"][Math.floor(Math.random() * 5)]
        };
    });
}

export function initFireflies() {
    const canvas = document.getElementById("fireflies-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const SPECIES_LIST = ["tulip", "orchid", "sunflower"];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    // 1. Partikel Kunang-Kunang ASCII Bertebaran
    const fireflyCount = window.innerWidth < 520 ? 28 : 44;
    const fireflies = Array.from({ length: fireflyCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.42 - 0.12,
        alpha: Math.random(),
        va: Math.random() * 0.015 + 0.005,
        growing: Math.random() > 0.5,
        size: Math.floor(Math.random() * 6) + 9,
        char: FIREFLY_CHARS[Math.floor(Math.random() * FIREFLY_CHARS.length)],
        color: Math.random() > 0.45 ? "rgb(255, 148, 200)" : "rgb(255, 228, 150)",
        glow: Math.random() > 0.45 ? "rgba(255, 126, 179, 0.75)" : "rgba(255, 215, 120, 0.75)"
    }));

    // 2. Bunga 3D Math ASCII Mekar & Kembang Api
    function spawnFloatingFlower(staggerProgress = 0) {
        const species = SPECIES_LIST[Math.floor(Math.random() * SPECIES_LIST.length)];
        const radius = window.innerWidth < 520 ? 38 : 54;
        const margin = 90;
        return {
            species,
            cx: margin + Math.random() * Math.max(120, canvas.width - margin * 2),
            cy: margin + Math.random() * Math.max(120, canvas.height - margin * 2),
            rx: (Math.random() - 0.5) * 0.7,
            ry: Math.random() * Math.PI * 2,
            rz: (Math.random() - 0.5) * 0.4,
            vry: (Math.random() > 0.5 ? 1 : -1) * (0.008 + Math.random() * 0.008),
            age: staggerProgress,
            lifeSpan: 7.5 + Math.random() * 2.5,
            points: generateFlower3DPoints(species, radius)
        };
    }

    const totalBgFlowers = window.innerWidth < 520 ? 4 : 6;
    const bgFlowers = Array.from({ length: totalBgFlowers }, (_, idx) =>
        spawnFloatingFlower((idx / totalBgFlowers) * 6.5)
    );

    let lastTime = performance.now();

    function animateBackground(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!document.hidden) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // --- LAYER A: KUNANG-KUNANG ASCII BERTEBARAN ---
            for (const f of fireflies) {
                f.x += f.vx;
                f.y += f.vy;
                f.alpha += f.growing ? f.va : -f.va;
                if (f.alpha >= 0.92) f.growing = false;
                if (f.alpha <= 0.14) f.growing = true;

                if (f.x < -16) f.x = canvas.width + 16;
                if (f.x > canvas.width + 16) f.x = -16;
                if (f.y < -16) f.y = canvas.height + 16;
                if (f.y > canvas.height + 16) f.y = -16;

                ctx.save();
                ctx.globalAlpha = f.alpha;
                ctx.font = `bold ${f.size}px "Courier New", monospace`;
                ctx.fillStyle = f.color;
                ctx.shadowColor = f.glow;
                ctx.shadowBlur = 8;
                ctx.fillText(f.char, f.x, f.y);
                ctx.restore();
            }

            // --- LAYER B: BUNGA 3D MATH ASCII MEKAR & KEMBANG API ---
            for (let i = 0; i < bgFlowers.length; i++) {
                const fl = bgFlowers[i];
                fl.age += dt;
                fl.ry += fl.vry;
                fl.cy -= dt * 6;

                const t = fl.age / fl.lifeSpan;
                if (t >= 1) {
                    bgFlowers[i] = spawnFloatingFlower(0);
                    continue;
                }

                const bloomRatio = t < 0.42
                    ? 1 - Math.pow(1 - t / 0.42, 3)
                    : 1;
                const fireworkProgress = t > 0.62 ? (t - 0.62) / 0.38 : 0;
                const globalAlpha = t < 0.12
                    ? t / 0.12
                    : fireworkProgress > 0
                        ? Math.max(0, 1 - Math.pow(fireworkProgress, 1.35))
                        : 0.85;

                const rendered = [];

                for (const pt of fl.points) {
                    if (pt.distNorm > bloomRatio * 1.08) continue;

                    const localGrow = Math.min(1, bloomRatio * 1.15);
                    let x = pt.x * localGrow;
                    let y = pt.y * localGrow;
                    let z = pt.z * localGrow;

                    if (fireworkProgress > 0) {
                        const burstT = fireworkProgress * 36;
                        x += pt.vx * burstT;
                        y += pt.vy * burstT + 0.5 * 22 * fireworkProgress * fireworkProgress;
                        z += pt.vz * burstT;
                    }

                    const rot = rotate3D(x, y, z, fl.rx, fl.ry, fl.rz);
                    const proj = project3D(rot.x, rot.y, rot.z, fl.cx, fl.cy, 340);

                    const shadeIdx = Math.min(
                        ASCII_SHADES.length - 1,
                        Math.max(1, Math.floor(pt.lum * ASCII_SHADES.length))
                    );
                    const char = fireworkProgress > 0.18 ? pt.sparkChar : ASCII_SHADES[shadeIdx];

                    rendered.push({
                        ...proj,
                        char,
                        color: pt.color
                    });
                }

                rendered.sort((a, b) => b.z - a.z);

                for (const item of rendered) {
                    const fontSize = Math.max(8, Math.round(11 * item.scale));
                    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
                    ctx.globalAlpha = globalAlpha * Math.min(1, item.scale);
                    ctx.fillStyle = item.color;
                    ctx.fillText(item.char, item.px, item.py);
                }
            }
        }
        requestAnimationFrame(animateBackground);
    }

    requestAnimationFrame(animateBackground);
}