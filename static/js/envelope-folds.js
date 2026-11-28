import { motionPlay, prefersReducedMotion, EASE_SILKY, stagger } from "./motion-utils.js";
import { playCurrentTrackDirect } from "./audio-player.js";

let isEnvelopeOpened = false;

// ============================================================================
// DATA HALAMAN SCRAPBOOK (TEKS 100% UTUH, HANYA DI HALAMAN KIRI)
// ============================================================================
const SCRAPBOOK_SPREADS = [
    {
        tag: "Bagian 01",
        greeting: "HAIII SAYANG QU YANG SANGAT SANGAT CANTIK DAN LUCU.",
        paragraphs: [
            "HAPPY BIRTHDAY LOWFY! Hari ini, tepatnya di tanggal 12 Desember 2026, kamu uda menyentuh umur 19 tahun looo.. waktu beneran jalan kaya mobil racing aja. Nggak ada rasanya yaa.. sekarang kamu uda nyentuh umur 19, dan itu hampir 20 yaa.. WOW.. beneran uda masuk dalam fase baru di mana kamu uda pelan-pelan mulai menghadapi dunia yang bener-bener jauh lebih luas dari yang kemarin-kemarin."
        ]
    },
    {
        tag: "Bagian 02 • 1/2",
        paragraphs: [
            "Kalo boleh jujur, akhir-akhir ini aku sering banget kepikiran sama kamu. Kaya berat banget nggak sih jalanin hari-hari kamu sekarang? terutama kamu sekarang uda masuk dan mulai adaptasi di kehidupan perkuliahan ini? Aku tau kok kalo dunia kuliah itu nggak semudah yang di bayangin."
        ]
    },
    {
        tag: "Bagian 02 • 2/2",
        paragraphs: [
            "Yang pasti banyak banget hal-hal baru yang mungkin bikin kamu kaget, dari tugas-tugas yang selalu datang tanpa lampu merah, jadwal yang lumayan padat, atau ada beberapa momen di mana kamu kaya ngerasa capek banget mulai dari fisik atau pikiran kamu. Juga kadang mungkin ada hari di mana kamu ngerasa riwueh banget, pengen ngeluh, bahkan kaya kamu mungkin ngerasa meragukan diri kamu sendiri."
        ]
    },
    {
        tag: "Bagian 03 • 1/2",
        paragraphs: [
            "Setiap kali kamu ngerasain hari kamu berat, iki cuma mau kamu ingat satu hal sayang.. kamu nggak sendirian. Iki selalu berharap supaya kamu selalu punya kesabaran dan kesehatan buat jalanin semuanya badai yang datang, yang pastinya bareng sama iki."
        ]
    },
    {
        tag: "Bagian 03 • 2/2",
        paragraphs: [
            "Iki pasti bakal selalu temani hari-hari kamu.. enggak cuman di hari-hari di mana kamu lagi senang atau bahagia, tapi juga di hari-hari kamu dimana lagi capek-capeknya, sedih, atau kamu butuh tempat buat bersandar. Iki bakal selalu terus ada di sisi kamu, dengerin semua cerita kamu tentang apapun itu, dan jalanin semuanya sama-sama sampai tahun-tahun selanjutnya."
        ]
    },
    {
        tag: "Bagian 04",
        paragraphs: [
            "Intinya, iki beneran bangga banget sama kamu, olel. Bangga karena kamu sendiri uda mau berusaha sejauh ini, bangga karena kamu tetap bertahan meskipun kadang rasanya pasti cape dan lelah banget di kamu nya, dan bangga bisa punya pasangan sehebat, sekuat, dan secantik kamu di kondisi apapun."
        ]
    },
    {
        tag: "Bagian 05",
        paragraphs: [
            "Di umur kamu yang uda menyentuh 19 tahun ini, aku selalu doain yang terbaik buat kamu. Semoga apa pun yang kamu mau, semua impian yang diam-diam kamu simpan di dalam hati dan pikiran kamu, dan segala rencana baik yang sedang kamu susun bisa satu per satu tercapai dengan bertahap. Semoga semesta selalu berpihak sama kamu, dan segala hal baik dari orang-orang yang ada di sekitar kamu selalu membawakan hal-hal baik, energi yang positif, dan menyenangkan buat kamu."
        ]
    },
    {
        tag: "Bagian 06",
        paragraphs: [
            "Dan... kalo nanti kamu ketemu sama hari yang rasanya bener-bener buruk atau apes banget, hari di mana semuanya bakal terasa berat banget dan kamu nggak menemukan satu pun hal baik yang ada, jangan pernah kepikiran buat pendam itu sendirian okeyy? Kamu punya tempat pulang yang banyak termasuk aku (harus aku). Walau kamu nggak menemukan hal baiknya, aku bakal kasih kamu seluruh dunia buat peluk kamu se erat-eratnya sampai semua rasa cape dan sedih kamu hilang.. sampai kamu balik merasa aman dan nyaman lagi.."
        ]
    },
    {
        tag: "Bagian 07 • Penutup",
        paragraphs: [
            "Selamat ulang tahun yang ke-19 ya andiyashafa ku cinta. Aku bener-bener terima kasih uda lahir di dunia ini, terima kasih uda bertahan sampai hari ini sampai detik ini, juga terima kasih sudah kasih kesempatan buat iki jadi bagian dari perjalanan hidup kamu."
        ],
        closing: {
            lines: [
                "Once again, happy 19th birthday, lowfy.",
                "I love you so much, today, tomorrow, and always. ♥"
            ],
            signature: "— Yours, Iki"
        }
    }
];

const TOTAL_SPREADS = SCRAPBOOK_SPREADS.length;
let currentSpread = 0;
let isFlipping = false;

function buildLeftPageHTML(index) {
    const data = SCRAPBOOK_SPREADS[index];
    const greetingHTML = data.greeting
        ? `<p class="scrapbook-greeting">${data.greeting}</p>`
        : "";
    const paragraphsHTML = data.paragraphs
        .map((p) => `<p class="scrapbook-paragraph">${p}</p>`)
        .join("");
    const closingHTML = data.closing
        ? `<div class="scrapbook-closing-box">
               <p class="scrapbook-closing-text">${data.closing.lines.join("<br>")}</p>
               <span class="scrapbook-signature">${data.closing.signature}</span>
           </div>`
        : "";
    const cornerCurl = index > 0 ? '<div class="page-corner-curl"></div>' : "";

    return `
        <div class="page-lace-border"></div>
        <div class="scrapbook-left-inner">
            <div class="scrapbook-left-header">
                <span>12.12.2026</span>
                <span class="scrapbook-chapter-pill">${data.tag}</span>
            </div>
            <div class="scrapbook-text-body">
                ${greetingHTML}
                ${paragraphsHTML}
                ${closingHTML}
            </div>
            <div class="scrapbook-left-footer">
                <span>For Lowfy ♥</span>
                <span>${index + 1} / ${TOTAL_SPREADS}</span>
            </div>
        </div>
        ${cornerCurl}
    `;
}

function buildRightPageHTML(index) {
    // Halaman kanan sengaja dibiarkan kosong dahulu; slot siap diisi desain per halaman nanti
    return `
        <div class="page-lace-border"></div>
        <div class="scrapbook-right-inner">
            <div class="scrapbook-right-slot" data-spread="${index + 1}"></div>
        </div>
        <div class="page-corner-curl"></div>
    `;
}

function updateScrapbookControlsUI() {
    const badge = document.getElementById("fold-counter-badge");
    if (badge) badge.innerText = `Halaman ${currentSpread + 1} / ${TOTAL_SPREADS}`;

    const prevBtn = document.getElementById("btn-prev-fold");
    const nextBtn = document.getElementById("btn-next-fold");
    if (prevBtn) prevBtn.disabled = currentSpread <= 0;
    if (nextBtn) {
        nextBtn.innerText = currentSpread < TOTAL_SPREADS - 1
            ? "Berikutnya →"
            : "Awal Buku ↺";
    }
}

function renderStaticSpread(index) {
    const baseLeft = document.getElementById("scrapbook-base-left");
    const baseRight = document.getElementById("scrapbook-base-right");
    if (baseLeft) baseLeft.innerHTML = buildLeftPageHTML(index);
    if (baseRight) baseRight.innerHTML = buildRightPageHTML(index);
    updateScrapbookControlsUI();
}

function flipToSpread(targetIndex) {
    if (isFlipping || targetIndex === currentSpread) return;
    if (targetIndex < 0 || targetIndex >= TOTAL_SPREADS) return;

    const baseLeft = document.getElementById("scrapbook-base-left");
    const baseRight = document.getElementById("scrapbook-base-right");
    const flipLeaf = document.getElementById("scrapbook-flip-leaf");
    const flipFront = document.getElementById("scrapbook-flip-front");
    const flipBack = document.getElementById("scrapbook-flip-back");
    const flipShade = document.getElementById("scrapbook-flip-shade");

    if (!baseLeft || !baseRight || !flipLeaf || !flipFront || !flipBack || prefersReducedMotion) {
        currentSpread = targetIndex;
        renderStaticSpread(currentSpread);
        return;
    }

    isFlipping = true;
    const isForward = targetIndex > currentSpread;

    if (isForward) {
        // Halaman kanan terangkat & membalik 180 derajat ke kiri
        flipLeaf.style.left = "50%";
        flipLeaf.style.transformOrigin = "left center";
        flipLeaf.style.transform = "rotateY(0deg)";

        flipFront.className = "flip-face flip-front is-right-style";
        flipFront.innerHTML = buildRightPageHTML(currentSpread);

        flipBack.className = "flip-face flip-back is-left-style";
        flipBack.innerHTML = buildLeftPageHTML(targetIndex);

        // Siapkan halaman kanan baru di bawah lembar yang sedang terangkat
        baseRight.innerHTML = buildRightPageHTML(targetIndex);
        flipLeaf.classList.add("is-flipping");

        if (flipShade) {
            motionPlay(flipShade, { opacity: [0, 0.55, 0] }, { duration: 0.72, ease: "easeInOut" });
        }

        const anim = motionPlay(
            flipLeaf,
            { rotateY: ["0deg", "-180deg"] },
            { duration: 0.72, ease: [0.34, 0.04, 0.24, 1] }
        );

        const finishForward = () => {
            currentSpread = targetIndex;
            baseLeft.innerHTML = buildLeftPageHTML(currentSpread);
            flipLeaf.classList.remove("is-flipping");
            flipLeaf.style.transform = "";
            updateScrapbookControlsUI();
            isFlipping = false;
        };

        if (anim && anim.finished) {
            anim.finished.then(finishForward).catch(finishForward);
        } else {
            finishForward();
        }
    } else {
        // Halaman kiri terangkat & membalik 180 derajat kembali ke kanan
        flipLeaf.style.left = "0%";
        flipLeaf.style.transformOrigin = "right center";
        flipLeaf.style.transform = "rotateY(0deg)";

        flipFront.className = "flip-face flip-front is-left-style";
        flipFront.innerHTML = buildLeftPageHTML(currentSpread);

        flipBack.className = "flip-face flip-back is-right-style";
        flipBack.innerHTML = buildRightPageHTML(targetIndex);

        // Siapkan halaman kiri sebelumnya di bawah lembar yang sedang terangkat
        baseLeft.innerHTML = buildLeftPageHTML(targetIndex);
        flipLeaf.classList.add("is-flipping");

        if (flipShade) {
            motionPlay(flipShade, { opacity: [0, 0.55, 0] }, { duration: 0.72, ease: "easeInOut" });
        }

        const anim = motionPlay(
            flipLeaf,
            { rotateY: ["0deg", "180deg"] },
            { duration: 0.72, ease: [0.34, 0.04, 0.24, 1] }
        );

        const finishBackward = () => {
            currentSpread = targetIndex;
            baseRight.innerHTML = buildRightPageHTML(currentSpread);
            flipLeaf.classList.remove("is-flipping");
            flipLeaf.style.transform = "";
            updateScrapbookControlsUI();
            isFlipping = false;
        };

        if (anim && anim.finished) {
            anim.finished.then(finishBackward).catch(finishBackward);
        } else {
            finishBackward();
        }
    }
}

export function initFolds() {
    renderStaticSpread(currentSpread);

    // Dukungan geser (swipe) kiri/kanan pada scrapbook di layar sentuh & mouse
    const bookEl = document.getElementById("scrapbook-book");
    if (!bookEl) return;

    let touchStartX = 0;
    let touchStartY = 0;

    bookEl.addEventListener("touchstart", (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    bookEl.addEventListener("touchend", (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            if (dx < 0 && currentSpread < TOTAL_SPREADS - 1) {
                flipToSpread(currentSpread + 1);
            } else if (dx > 0 && currentSpread > 0) {
                flipToSpread(currentSpread - 1);
            }
        }
    }, { passive: true });
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
    nextSpread: () => {
        if (currentSpread < TOTAL_SPREADS - 1) {
            flipToSpread(currentSpread + 1);
        }
    },
    prevSpread: () => {
        if (currentSpread > 0) {
            flipToSpread(currentSpread - 1);
        }
    },
    unfoldNext: () => {
        if (currentSpread < TOTAL_SPREADS - 1) {
            flipToSpread(currentSpread + 1);
        } else {
            flipToSpread(0);
        }
    },
    foldPrev: () => {
        if (currentSpread > 0) {
            flipToSpread(currentSpread - 1);
        }
    },
    handleFoldClick: () => {}
};