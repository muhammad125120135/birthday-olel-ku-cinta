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
    const y1 = y * Math.cos(rx) - z * Math.sin(rx);
    const z1 = y * Math.sin(rx) + z * Math.cos(rx);
    const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    const x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    const y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    return { x: x3, y: y3, z: z2 };
}

export function generateFlower3DPoints(species, radius = 58) {
    const points = [];

    if (species === "sakura") {
        // Sakura: 5 kelopak pink pastel dengan lekukan khas di ujung kelopak
        const petals = 5;
        for (let p = 0; p < petals; p++) {
            const baseA = (p / petals) * Math.PI * 2 - Math.PI / 2;
            for (let u = 0.14; u <= 1; u += 0.11) {
                for (let v = -1; v <= 1; v += 0.22) {
                    const width = Math.sin(u * Math.PI * 0.84) * 0.44;
                    const notch = u > 0.72 ? (u - 0.72) * 1.55 * (1 - Math.abs(v)) : 0;
                    const effectiveU = Math.max(0.12, u - notch);
                    const a = baseA + v * width;
                    const r = effectiveU * radius;
                    const z = Math.sin(effectiveU * Math.PI) * 9 - Math.abs(v) * 4;

                    const lum = 0.48 + effectiveU * 0.48;
                    const color = effectiveU < 0.36
                        ? "rgb(245, 92, 158)"
                        : `rgb(255, ${Math.round(178 + effectiveU * 58)}, ${Math.round(212 + effectiveU * 38)})`;

                    points.push({
                        x: Math.cos(a) * r,
                        y: Math.sin(a) * r,
                        z,
                        lum,
                        color,
                        distNorm: effectiveU
                    });
                }
            }
        }
        // Benang sari emas di pusat Sakura
        for (let s = 0; s < 14; s++) {
            const sa = (s / 14) * Math.PI * 2;
            const sr = radius * 0.22;
            points.push({
                x: Math.cos(sa) * sr,
                y: Math.sin(sa) * sr,
                z: 11,
                lum: 0.92,
                color: "rgb(255, 224, 108)",
                distNorm: 0.2
            });
        }
    } else if (species === "lavender") {
        // Lavender: Tangkai kuntum ungu-violet bertingkat yang menjulang
        const florets = 52;
        const goldenAngle = 2.39996;
        for (let i = 0; i < florets; i++) {
            const t = i / florets; // 0 = puncak runcing, 1 = pangkal bawah
            const theta = i * goldenAngle;
            const spikeRadius = radius * 0.35 * Math.sin(Math.pow(t, 0.72) * Math.PI * 0.9);
            const y = -radius * 1.25 + t * radius * 1.72;

            for (let b = 0; b < 3; b++) {
                const subA = theta + (b - 1) * 0.48;
                const subR = spikeRadius * (0.65 + (b % 2) * 0.35);
                points.push({
                    x: Math.cos(subA) * subR,
                    y: y + (b - 1) * 2.4,
                    z: Math.sin(subA) * subR,
                    lum: 0.45 + (1 - t) * 0.5,
                    color: `rgb(${Math.round(168 + (1 - t) * 58)}, ${Math.round(108 + (1 - t) * 72)}, 255)`,
                    distNorm: t
                });
            }
        }
    } else if (species === "rose") {
        const petals = 18;
        const goldenAngle = 2.39996;
        for (let p = 0; p < petals; p++) {
            const pNorm = p / petals;
            const baseAngle = p * goldenAngle;
            const layerRadius = radius * (0.18 + pNorm * 0.68);
            const cupHeight = radius * (0.42 - pNorm * 0.25);

            for (let u = 0.15; u <= 1; u += 0.16) {
                for (let v = -1; v <= 1; v += 0.33) {
                    const spread = (0.35 + pNorm * 0.25) * Math.sin(u * Math.PI * 0.85);
                    const theta = baseAngle + v * spread;
                    const curlOut = Math.pow(u, 2.4) * (8 + pNorm * 10);
                    const r = layerRadius * (0.55 + u * 0.45) + curlOut;

                    const x = Math.cos(theta) * r;
                    const z = Math.sin(theta) * r;
                    const y = -cupHeight * Math.sin(u * Math.PI * 0.75) + Math.pow(u, 3) * 8;

                    const lum = 0.3 + pNorm * 0.35 + u * 0.35;
                    const color = `rgb(255, ${Math.round(55 + pNorm * 85 + u * 35)}, ${Math.round(105 + pNorm * 65 + u * 30)})`;

                    points.push({ x, y, z, lum, color, distNorm: Math.min(1, pNorm * 0.7 + u * 0.3) });
                }
            }
        }
    } else if (species === "lily") {
        const petals = 6;
        for (let p = 0; p < petals; p++) {
            const baseA = (p / petals) * Math.PI * 2;
            const zOffset = (p % 2 === 0 ? 1 : -1) * 3;
            for (let u = 0.1; u <= 1.05; u += 0.11) {
                for (let v = -1; v <= 1; v += 0.28) {
                    const width = Math.sin(u * Math.PI) * 0.3;
                    const a = baseA + v * width;
                    const r = u * radius * 1.08;
                    const recurveZ = zOffset + Math.sin(u * Math.PI * 0.7) * 14 - Math.pow(u, 2.4) * 24;

                    const isMidrib = Math.abs(v) < 0.35;
                    const lum = 0.45 + u * 0.5;
                    const color = isMidrib && u < 0.75
                        ? `rgb(255, ${Math.round(95 + u * 90)}, ${Math.round(170 + u * 60)})`
                        : `rgb(255, ${Math.round(225 + u * 28)}, ${Math.round(240 + u * 15)})`;

                    points.push({
                        x: Math.cos(a) * r,
                        y: Math.sin(a) * r,
                        z: recurveZ,
                        lum,
                        color,
                        distNorm: Math.min(1, u)
                    });
                }
            }
        }
    } else if (species === "tulip") {
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
        // Matahari (Sunflower) untuk latar belakang
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

    return points.map((pt) => {
        const len = Math.hypot(pt.x, pt.y, pt.z) || 1;
        const spreadSpeed = 1.15 + Math.random() * 1.35;
        return {
            ...pt,
            vx: (pt.x / len) * spreadSpeed,
            vy: (pt.y / len) * spreadSpeed,
            vz: (pt.z / len) * spreadSpeed,
            sparkChar: ["*", "✦", "+", "·", "✿"][Math.floor(Math.random() * 5)]
        };
    });
}

export function initFireflies() {
    const canvas = document.getElementById("fireflies-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const SPECIES_LIST = ["orchid", "sunflower"];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    let lastScrollY = window.scrollY;
    let smoothScrollY = window.scrollY;
    let scrollImpulse = 0;

    window.addEventListener("scroll", () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;
        scrollImpulse = Math.max(-45, Math.min(45, scrollImpulse + delta * 0.35));
    }, { passive: true });

    function wrapCoord(val, max, pad = 60) {
        const span = max + pad * 2;
        return ((((val + pad) % span) + span) % span) - pad;
    }

    const fireflyCount = window.innerWidth < 520 ? 22 : 34;
    const fireflies = Array.from({ length: fireflyCount }, () => {
        const depth = 0.25 + Math.random() * 0.85;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.42,
            vy: (Math.random() - 0.5) * 0.38 - 0.1,
            depth,
            alpha: Math.random(),
            va: Math.random() * 0.015 + 0.005,
            growing: Math.random() > 0.5,
            size: Math.round((Math.random() * 5 + 8) * (0.75 + depth * 0.35)),
            char: FIREFLY_CHARS[Math.floor(Math.random() * FIREFLY_CHARS.length)],
            color: Math.random() > 0.45 ? "rgb(255, 148, 200)" : "rgb(255, 228, 150)",
            glow: Math.random() > 0.45 ? "rgba(255, 126, 179, 0.75)" : "rgba(255, 215, 120, 0.75)"
        };
    });

    function spawnFloatingFlower(existingFlowers = [], staggerProgress = 0) {
        const species = SPECIES_LIST[Math.floor(Math.random() * SPECIES_LIST.length)];
        const radius = window.innerWidth < 520 ? 36 : 52;
        const margin = window.innerWidth < 520 ? 68 : 95;
        const minSeparation = window.innerWidth < 520 ? 155 : 240;

        let bestCx = margin + Math.random() * Math.max(100, canvas.width - margin * 2);
        let bestBaseY = margin + Math.random() * Math.max(100, canvas.height - margin * 2);
        const parallaxFactor = 0.24 + Math.random() * 0.36;
        let maxNearestDist = -1;

        for (let attempt = 0; attempt < 25; attempt++) {
            const candCx = margin + Math.random() * Math.max(100, canvas.width - margin * 2);
            const candBaseY = margin + Math.random() * Math.max(100, canvas.height - margin * 2);
            const candScreenY = wrapCoord(candBaseY - smoothScrollY * parallaxFactor, canvas.height, 85);

            let nearestDist = Infinity;
            for (const other of existingFlowers) {
                if (!other) continue;
                const otherScreenY = wrapCoord(other.baseY - smoothScrollY * other.parallaxFactor, canvas.height, 85);
                const d = Math.hypot(candCx - other.cx, candScreenY - otherScreenY);
                if (d < nearestDist) nearestDist = d;
            }

            if (nearestDist > maxNearestDist) {
                maxNearestDist = nearestDist;
                bestCx = candCx;
                bestBaseY = candBaseY;
            }
            if (nearestDist >= minSeparation) break;
        }

        return {
            species,
            cx: bestCx,
            baseY: bestBaseY,
            parallaxFactor,
            rx: -0.18,
            ry: (Math.random() - 0.5) * 0.35,
            rz: (Math.random() - 0.5) * 0.45,
            age: staggerProgress,
            lifeSpan: 5.2 + Math.random() * 1.4,
            points: generateFlower3DPoints(species, radius)
        };
    }

    const totalBgFlowers = window.innerWidth < 520 ? 2 : 3;
    const bgFlowers = [];
    for (let idx = 0; idx < totalBgFlowers; idx++) {
        bgFlowers.push(spawnFloatingFlower(bgFlowers, (idx / totalBgFlowers) * 4.4));
    }

    let lastTime = performance.now();

    function animateBackground(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        smoothScrollY += (lastScrollY - smoothScrollY) * 0.14;
        scrollImpulse *= 0.9;

        if (!document.hidden) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (const f of fireflies) {
                f.x += f.vx + Math.sin(now * 0.001 + f.depth * 6) * 0.12;
                f.y += f.vy - scrollImpulse * f.depth * 0.12;
                f.alpha += f.growing ? f.va : -f.va;
                if (f.alpha >= 0.92) f.growing = false;
                if (f.alpha <= 0.14) f.growing = true;

                const drawX = wrapCoord(f.x, canvas.width, 18);
                const drawY = wrapCoord(f.y - smoothScrollY * f.depth * 0.45, canvas.height, 18);

                ctx.save();
                ctx.globalAlpha = f.alpha;
                ctx.font = `bold ${f.size}px "Courier New", monospace`;
                ctx.fillStyle = f.color;
                ctx.shadowColor = f.glow;
                ctx.shadowBlur = 8;
                ctx.fillText(f.char, drawX, drawY);
                ctx.restore();
            }

            for (let i = 0; i < bgFlowers.length; i++) {
                const fl = bgFlowers[i];
                fl.age += dt;
                fl.baseY -= dt * 5;

                const t = fl.age / fl.lifeSpan;
                if (t >= 1) {
                    const others = bgFlowers.filter((_, idx) => idx !== i);
                    bgFlowers[i] = spawnFloatingFlower(others, 0);
                    continue;
                }

                const drawCx = fl.cx + Math.sin(smoothScrollY * 0.003 + i) * 14;
                const drawCy = wrapCoord(fl.baseY - smoothScrollY * fl.parallaxFactor, canvas.height, 85);

                const bloomT = Math.min(1, t / 0.42);
                const bloomRatio = Math.sin(bloomT * Math.PI * 0.5);

                const expandT = t > 0.35 ? (t - 0.35) / 0.65 : 0;
                const expandMotion = expandT * (0.45 + 0.55 * expandT);

                const fadeOutT = t > 0.42 ? (t - 0.42) / 0.58 : 0;
                const globalAlpha = t < 0.12
                    ? (t / 0.12) * 0.82
                    : fadeOutT > 0
                        ? Math.max(0, 0.82 * (1 - Math.pow(fadeOutT, 1.2)))
                        : 0.82;

                const rendered = [];

                for (const pt of fl.points) {
                    if (pt.distNorm > bloomRatio * 1.06) continue;

                    const baseScale = 0.15 + 0.85 * bloomRatio;
                    const outwardExpand = 1 + expandMotion * 0.72;
                    const drift = expandMotion * 22;

                    const x = pt.x * baseScale * outwardExpand + pt.vx * drift;
                    const y = pt.y * baseScale * outwardExpand + pt.vy * drift;
                    const z = pt.z * baseScale * outwardExpand + pt.vz * drift;

                    const dynamicTiltX = fl.rx + scrollImpulse * 0.004;
                    const rot = rotate3D(x, y, z, dynamicTiltX, fl.ry, fl.rz);
                    const proj = project3D(rot.x, rot.y, rot.z, drawCx, drawCy, 340);

                    const shadeIdx = Math.min(
                        ASCII_SHADES.length - 1,
                        Math.max(1, Math.floor(pt.lum * ASCII_SHADES.length))
                    );
                    const char = expandT > 0.3 ? pt.sparkChar : ASCII_SHADES[shadeIdx];

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