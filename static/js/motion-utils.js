import { animate, scroll, inView, stagger, press, hover } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

export { animate, scroll, inView, stagger, press, hover };

export const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const EASE_SILKY = [0.22, 1, 0.36, 1];
export const EASE_FOLD_CLOSE = [0.32, 0, 0.2, 1];
export const SPRING_SNAPPY = { type: "spring", stiffness: 340, damping: 26 };
export const SPRING_BOUNCY = { type: "spring", stiffness: 250, damping: 20 };

export function motionPlay(target, keyframes, options) {
    if (!target || prefersReducedMotion) return null;
    try {
        return animate(target, keyframes, options);
    } catch (_) {
        return null;
    }
}

export function cancelActiveAnimations(el) {
    if (!el || typeof el.getAnimations !== "function") return;
    el.getAnimations().forEach((anim) => anim.cancel());
}

export function applySmoothFloat(selector, frames, duration = 4.4, delayOffset = 0) {
    if (prefersReducedMotion) return;
    document.querySelectorAll(selector).forEach((el, idx) => {
        motionPlay(el, frames, {
            duration,
            delay: delayOffset + idx * 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
        });
    });
}