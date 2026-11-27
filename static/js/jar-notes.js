import { motionPlay, prefersReducedMotion, EASE_SILKY, EASE_FOLD_CLOSE, SPRING_BOUNCY, stagger } from "./motion-utils.js";

const NOTES_LIST = [
    { title: "Laughter", text: "Our best memories always start with a random laugh that lasts way too long." },
    { title: "Dreams", text: "Keep chasing every goal you have—I'm cheering for you from here." },
    { title: "New Chapter", text: "A brand new year of your life is starting. Wishing you peace, joy, and growth." },
    { title: "Stay Soft", text: "You don't have to rush everything. Take it one step at a time." },
    { title: "Proud of You", text: "Look how far you've come. Even on quiet days, you are doing amazing." },
    { title: "Little Things", text: "May your coffee be warm, your playlists hit right, and your heart feel light." }
];

let remainingNotes = [];
let lastShownTitle = null;

function getUniqueRandomNote() {
    if (remainingNotes.length === 0) {
        remainingNotes = [...NOTES_LIST];
        for (let i = remainingNotes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingNotes[i], remainingNotes[j]] = [remainingNotes[j], remainingNotes[i]];
        }
        if (remainingNotes.length > 1 && remainingNotes[remainingNotes.length - 1].title === lastShownTitle) {
            [remainingNotes[0], remainingNotes[remainingNotes.length - 1]] =
                [remainingNotes[remainingNotes.length - 1], remainingNotes[0]];
        }
    }
    const note = remainingNotes.pop();
    lastShownTitle = note.title;
    return note;
}

export function forceCloseModal() {
    const modal = document.getElementById("modal");
    const card = document.getElementById("modal-card");
    if (!modal.classList.contains("show")) return;

    if (prefersReducedMotion) {
        modal.classList.remove("show");
        return;
    }

    motionPlay(card, { opacity: [1, 0], scale: [1, 0.92], y: [0, 12] }, { duration: 0.24, ease: EASE_FOLD_CLOSE });
    const bgFade = motionPlay(modal, { opacity: [1, 0] }, { duration: 0.26, ease: "easeOut" });
    if (bgFade && bgFade.finished) {
        bgFade.finished.then(() => {
            modal.classList.remove("show");
            modal.style.opacity = "";
            card.style.opacity = "";
            card.style.transform = "";
        });
    } else {
        modal.classList.remove("show");
    }
}

export function pickNote() {
    const modal = document.getElementById("modal");
    if (modal.classList.contains("show")) forceCloseModal();

    motionPlay("#jar", { rotate: [0, -11, 11, -8, 7, -3.5, 2, 0], x: [0, -5, 5, -3.5, 3.5, -1.5, 0] }, { duration: 0.72, ease: "easeInOut" });

    document.querySelectorAll(".note-slip").forEach((slip, idx) => {
        const jumpY = -(50 + (idx % 3) * 15);
        const driftX = (idx % 2 === 0 ? 1 : -1) * (11 + (idx % 4) * 4);
        const spin = (idx % 2 === 0 ? 1 : -1) * (110 + idx * 12);

        motionPlay(slip, { y: [0, jumpY, jumpY * 0.32, 0], x: [0, driftX, -driftX * 0.35, 0], rotate: [0, spin, -spin * 0.2, 0] }, { duration: 0.9, delay: idx * 0.025, ease: EASE_SILKY });
    });

    motionPlay(".jar-sparkle", { scale: [1, 1.8, 1], y: [0, -22, 0], opacity: [0.7, 1, 0.75] }, { duration: 0.8, delay: stagger(0.04), ease: EASE_SILKY });

    const data = getUniqueRandomNote();
    setTimeout(() => {
        document.getElementById("note-title").innerText = data.title;
        document.getElementById("note-text").innerText = data.text;
        modal.classList.add("show");
        motionPlay(modal, { opacity: [0, 1] }, { duration: 0.28, ease: "easeOut" });
        motionPlay("#modal-card", { opacity: [0, 1], scale: [0.9, 1.015, 1], y: [18, 0] }, SPRING_BOUNCY);
    }, 520);
}

export const jarHandlers = {
    pickNote,
    forceCloseModal,
    closeModal: (e) => { if (e.target.id === "modal") forceCloseModal(); }
};