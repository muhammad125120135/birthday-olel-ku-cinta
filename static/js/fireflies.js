export function initFireflies() {
    const canvas = document.getElementById("fireflies-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    function createGlowSprite(r, g, b) {
        const sprite = document.createElement("canvas");
        sprite.width = 32;
        sprite.height = 32;
        const sCtx = sprite.getContext("2d");
        const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.4)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 32, 32);
        return sprite;
    }

    const pinkSprite = createGlowSprite(255, 130, 190);
    const goldSprite = createGlowSprite(255, 228, 150);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    const fireflies = Array.from({ length: 34 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 14 + 10,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42 - 0.1,
        alpha: Math.random(),
        va: Math.random() * 0.012 + 0.004,
        growing: Math.random() > 0.5,
        sprite: Math.random() > 0.45 ? pinkSprite : goldSprite
    }));

    function animateFireflies() {
        if (!document.hidden) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const f of fireflies) {
                f.x += f.vx;
                f.y += f.vy;
                f.alpha += f.growing ? f.va : -f.va;
                if (f.alpha >= 0.88) f.growing = false;
                if (f.alpha <= 0.12) f.growing = true;

                if (f.x < -20) f.x = canvas.width + 20;
                if (f.x > canvas.width + 20) f.x = -20;
                if (f.y < -20) f.y = canvas.height + 20;
                if (f.y > canvas.height + 20) f.y = -20;

                ctx.globalAlpha = f.alpha;
                ctx.drawImage(f.sprite, f.x - f.size / 2, f.y - f.size / 2, f.size, f.size);
            }
        }
        requestAnimationFrame(animateFireflies);
    }
    requestAnimationFrame(animateFireflies);
}