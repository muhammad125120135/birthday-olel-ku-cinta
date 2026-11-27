import { motionPlay, cancelActiveAnimations, prefersReducedMotion, EASE_SILKY, EASE_FOLD_CLOSE, stagger } from "./motion-utils.js";
import { playCurrentTrackDirect } from "./audio-player.js";

let isEnvelopeOpened = false;
const TOTAL_FOLDS = 9;
let openFoldCount = 1;

function setFoldStateClasses(foldEl, foldNum, currentOpenCount) {
    const actionSpan = foldEl.querySelector(".crease-action");
    foldEl.classList.remove("is-open", "is-next-folded", "is-stacked-folded");

    if (foldNum <= currentOpenCount) {
        foldEl.classList.add("is-open");
        if (actionSpan?.dataset.openText) actionSpan.innerText = actionSpan.dataset.openText;
    } else if (foldNum === currentOpenCount + 1) {
        foldEl.classList.add("is-next-folded");
        if (actionSpan?.dataset.closedText) actionSpan.innerText = actionSpan.dataset.closedText;
    } else {
        foldEl.classList.add("is-stacked-folded");
        if (actionSpan?.dataset.closedText) actionSpan.innerText = actionSpan.dataset.closedText;
    }
}

function updateFoldControlsUI(currentOpenCount) {
    const badge = document.getElementById("fold-counter-badge");
    if (badge) badge.innerText = `Lipatan ${currentOpenCount} / ${TOTAL_FOLDS}`;

    const prevBtn = document.getElementById("btn-prev-fold");
    const nextBtn = document.getElementById("btn-next-fold");
    if (prevBtn) prevBtn.disabled = currentOpenCount <= 1;
    if (nextBtn) {
        nextBtn.innerText = currentOpenCount < TOTAL_FOLDS
            ? `Buka Lipatan ${currentOpenCount + 1} ↓`
            : "Lipat Kembali dari Awal ↺";
    }
}

function animateOpenFold(foldEl, delaySec = 0) {
    const content = foldEl.querySelector(".fold-content");
    const shadow = foldEl.querySelector(".fold-shadow-veil");
    if (!content) return;

    cancelActiveAnimations(foldEl);
    cancelActiveAnimations(content);
    cancelActiveAnimations(shadow);

    const startHeight = content.getBoundingClientRect().height;
    content.style.height = "auto";
    content.style.overflow = "hidden";
    const targetHeight = content.scrollHeight;

    if (prefersReducedMotion) {
        content.style.height = "auto";
        content.style.overflow = "";
        content.style.opacity = "";
        return;
    }

    content.style.height = `${startHeight}px`;
    content.style.opacity = startHeight > 4 ? "0.7" : "0";

    const foldAnim = motionPlay(foldEl, { rotateX: [-74, 3, 0], scaleY: [0.94, 1.005, 1] }, { duration: 0.65, delay: delaySec, ease: EASE_SILKY });
    motionPlay(shadow, { opacity: [0.75, 0.2, 0] }, { duration: 0.65, delay: delaySec, ease: EASE_SILKY });
    const contentAnim = motionPlay(content, { height: [`${startHeight}px`, `${targetHeight}px`], opacity: [startHeight > 4 ? 0.7 : 0, 1] }, { duration: 0.58, delay: delaySec, ease: EASE_SILKY });

    if (contentAnim && contentAnim.finished) {
        contentAnim.finished.then(() => {
            if (foldEl.classList.contains("is-open")) {
                content.style.height = "auto";
                content.style.overflow = "";
                content.style.opacity = "";
                foldEl.style.transform = "";
            }
        }).catch(() => {});
    } else if (!foldAnim) {
        content.style.height = "auto";
        content.style.overflow = "";
    }
}

function animateCloseFold(foldEl, foldNum, finalOpenCount, delaySec = 0) {
    const content = foldEl.querySelector(".fold-content");
    const shadow = foldEl.querySelector(".fold-shadow-veil");

    if (!content || prefersReducedMotion) {
        setFoldStateClasses(foldEl, foldNum, finalOpenCount);
        return;
    }

    cancelActiveAnimations(foldEl);
    cancelActiveAnimations(content);
    cancelActiveAnimations(shadow);

    foldEl.classList.remove("is-next-folded", "is-stacked-folded");
    foldEl.classList.add("is-open");

    const startHeight = content.getBoundingClientRect().height || content.scrollHeight;
    content.style.height = `${startHeight}px`;
    content.style.overflow = "hidden";
    content.style.opacity = "1";

    motionPlay(shadow, { opacity: [0, 0.65, 0] }, { duration: 0.48, delay: delaySec, ease: EASE_FOLD_CLOSE });
    motionPlay(foldEl, { rotateX: [0, -76], scaleY: [1, 0.94] }, { duration: 0.48, delay: delaySec, ease: EASE_FOLD_CLOSE });
    const closeAnim = motionPlay(content, { height: [`${startHeight}px`, "0px"], opacity: [1, 0] }, { duration: 0.45, delay: delaySec, ease: EASE_FOLD_CLOSE });

    if (closeAnim && closeAnim.finished) {
        closeAnim.finished.then(() => {
            if (foldNum > openFoldCount) {
                content.style.height = "";
                content.style.overflow = "";
                content.style.opacity = "";
                foldEl.style.transform = "";
                setFoldStateClasses(foldEl, foldNum, openFoldCount);

                if (foldNum === openFoldCount + 1) {
                    motionPlay(foldEl, { rotateX: [-26, -15], y: [-3, 0] }, { duration: 0.35, ease: EASE_SILKY });
                }
            }
        }).catch(() => {});
    } else {
        setFoldStateClasses(foldEl, foldNum, finalOpenCount);
    }
}

function setFoldCount(targetCount, scrollToNewFold = false) {
    const clampedTarget = Math.max(1, Math.min(TOTAL_FOLDS, targetCount));
    const prevCount = openFoldCount;
    openFoldCount = clampedTarget;

    updateFoldControlsUI(openFoldCount);

    document.querySelectorAll(".paper-fold").forEach((foldEl) => {
        const foldNum = parseInt(foldEl.dataset.fold, 10);

        if (foldNum > prevCount && foldNum <= openFoldCount) {
            setFoldStateClasses(foldEl, foldNum, openFoldCount);
            animateOpenFold(foldEl, (foldNum - prevCount - 1) * 0.06);
        } else if (foldNum <= prevCount && foldNum > openFoldCount) {
            const reverseIdx = prevCount - foldNum;
            animateCloseFold(foldEl, foldNum, openFoldCount, reverseIdx * 0.045);
        } else {
            setFoldStateClasses(foldEl, foldNum, openFoldCount);
        }
    });

    if (scrollToNewFold) {
        const targetFold = document.querySelector(`.paper-fold[data-fold="${openFoldCount}"]`);
        if (targetFold) {
            setTimeout(() => {
                targetFold.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 180);
        }
    }
}

export function initFolds() {
    document.querySelectorAll(".paper-fold").forEach((foldEl) => {
        setFoldStateClasses(foldEl, parseInt(foldEl.dataset.fold, 10), openFoldCount);
    });
    updateFoldControlsUI(openFoldCount);
}

export const envelopeFoldHandlers = {
    openGift: (event) => {
        if (event) event.stopPropagation();
        if (isEnvelopeOpened) return;
        isEnvelopeOpened = true;

        const overlay = document.getElementById("envelope-overlay");
        const main = document.getElementById("main-content");
        const miniPlayer = document.getElementById("mini-player");

        playCurrentTrackDirect(true);

        motionPlay("#wax-seal", { scale: [1, 1.25, 0], opacity: [1, 1, 0] }, { duration: 0.42, ease: EASE_SILKY });
        motionPlay("#env-flap-top", { rotateX: [0, 180] }, { duration: 0.7, delay: 0.14, ease: EASE_SILKY });

        setTimeout(() => {
            const flap = document.getElementById("env-flap-top");
            if (flap) flap.style.zIndex = "1";
            motionPlay("#env-letter-peek", { y: [-14, -84] }, { duration: 0.78, ease: EASE_SILKY });
        }, 340);

        setTimeout(() => {
            const liftAnim = motionPlay(overlay, { y: ["0%", "-100%"], opacity: [1, 0] }, { duration: 0.95, ease: [0.65, 0, 0.35, 1] });
            if (liftAnim && liftAnim.finished) {
                liftAnim.finished.then(() => {
                    overlay.style.pointerEvents = "none";
                    overlay.style.display = "none";
                });
            } else {
                overlay.classList.add("opened");
            }

            main.classList.add("visible");
            miniPlayer.classList.add("show-player");
            motionPlay(miniPlayer, { y: [32, 0], opacity: [0, 1] }, { duration: 0.65, ease: EASE_SILKY });
            motionPlay(".hero-stagger", { opacity: [0, 1], y: [26, 0], scale: [0.97, 1] }, { duration: 0.75, delay: stagger(0.12), ease: EASE_SILKY });
        }, 1050);
    },
    unfoldNext: () => setFoldCount(openFoldCount < TOTAL_FOLDS ? openFoldCount + 1 : 1, true),
    foldPrev: () => { if (openFoldCount > 1) setFoldCount(openFoldCount - 1, true); },
    handleFoldClick: (foldNum, e) => {
        if (e) e.stopPropagation();
        if (foldNum > openFoldCount && openFoldCount < TOTAL_FOLDS) {
            setFoldCount(openFoldCount + 1, true);
        } else if (foldNum > 1 && foldNum <= openFoldCount && e?.target.closest(".fold-crease-bar")) {
            setFoldCount(foldNum - 1, true);
        }
    }
};