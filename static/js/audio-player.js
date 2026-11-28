import { motionPlay, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion-utils.js";

const bgMusic = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause-btn");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const volumeSlider = document.getElementById("volume-slider");
const volumeBtn = document.getElementById("volume-btn");

const PLAY_ICON_HTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"></polygon></svg>';
const PAUSE_ICON_HTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';

const speedRates = [1, 1.25, 1.5, 0.75];
let currentSpeedIndex = 0;
let userVolume = 0.7;
let previousVolume = 0.7;
let isAutoFadingOut = false;
let volumeFadeTimer = null;

// Web Audio API Auto Volume Normalizer
let audioCtx = null;
let agcGainNode = null;
let analyserNode = null;
let rmsBuffer = null;

const playlist = [
    { title: "24/7", artist: "Romaria", filename: "romaria.mp3", cover: "🌸", bg: "rgba(255, 126, 179, 0.25)" },
    { title: "Remaja", artist: "HIVI!", filename: "remaja.mp3", cover: "🌷", bg: "rgba(232, 93, 149, 0.25)" },
    { title: "SPEED DIAL #1", artist: "Paul Partohap", filename: "speed dial.mp3", cover: "✨", bg: "rgba(181, 131, 255, 0.25)" },
    { title: "the space between us", artist: "siopaolo", filename: "the space between us.mp3", cover: "🌙", bg: "rgba(120, 179, 255, 0.25)" },
    { title: "RECIPE OF US", artist: "Paul Partohap", filename: "recipe of us.mp3", cover: "🕯️", bg: "rgba(255, 209, 102, 0.25)" }
];
let currentTrackIndex = 0;

function ensureVolumeNormalizer() {
    if (audioCtx) {
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
        return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !bgMusic) return;

    try {
        audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaElementSource(bgMusic);

        agcGainNode = audioCtx.createGain();
        agcGainNode.gain.value = 0.9;

        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
        compressor.knee.setValueAtTime(14, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.015, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 1024;
        rmsBuffer = new Float32Array(analyserNode.fftSize);

        source.connect(analyserNode);
        source.connect(agcGainNode);
        agcGainNode.connect(compressor);
        compressor.connect(audioCtx.destination);

        const TARGET_TRACK_RMS = 0.15; // Standar kenyaringan asli file lagu
        const MIN_GAIN = 0.38;         // Batas pengecilan untuk lagu sangat keras
        const MAX_GAIN = 2.3;          // Batas penguatan untuk lagu sangat pelan

        setInterval(() => {
            if (bgMusic.paused || bgMusic.ended || !audioCtx || audioCtx.state !== "running") return;
            if (bgMusic.volume < 0.05) return; // Abaikan saat sedang fade-in / fade-out

            analyserNode.getFloatTimeDomainData(rmsBuffer);
            let sumSquares = 0;
            for (let i = 0; i < rmsBuffer.length; i++) {
                sumSquares += rmsBuffer[i] * rmsBuffer[i];
            }
            const rawRms = Math.sqrt(sumSquares / rmsBuffer.length);

            // Hitung kenyaringan murni lagu tanpa terpengaruh posisi slider volume user
            const intrinsicTrackRms = rawRms / bgMusic.volume;
            if (intrinsicTrackRms < 0.014) return; // Lewati bagian hening/intro sepi

            const idealGain = Math.min(MAX_GAIN, Math.max(MIN_GAIN, TARGET_TRACK_RMS / intrinsicTrackRms));
            agcGainNode.gain.setTargetAtTime(idealGain, audioCtx.currentTime, 0.35);
        }, 120);
    } catch (_) {
        audioCtx = null;
    }
}

function stopVolumeFade() {
    if (volumeFadeTimer !== null) {
        clearInterval(volumeFadeTimer);
        volumeFadeTimer = null;
    }
}

function updatePlayButtonUI(isPlaying) {
    playPauseBtn.innerHTML = isPlaying ? PAUSE_ICON_HTML : PLAY_ICON_HTML;
    playPauseBtn.classList.toggle("is-playing", isPlaying);
    motionPlay(playPauseBtn, { scale: [0.88, 1.06, 1] }, SPRING_SNAPPY);
}

function applyPlaybackRate(rate) {
    bgMusic.defaultPlaybackRate = rate;
    bgMusic.playbackRate = rate;
}

function fadeVolumeTo(targetVol, durationMs = 450, onDone = null) {
    stopVolumeFade();
    const clampedTarget = Math.max(0, Math.min(1, targetVol));
    const startVol = bgMusic.volume;
    const diff = clampedTarget - startVol;

    if (Math.abs(diff) < 0.01 || durationMs <= 0) {
        bgMusic.volume = clampedTarget;
        if (typeof onDone === "function") onDone();
        return;
    }

    const steps = Math.max(4, Math.round(durationMs / 35));
    let currentStep = 0;

    volumeFadeTimer = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.max(0, Math.min(1, startVol + diff * (currentStep / steps)));
        if (currentStep >= steps) {
            stopVolumeFade();
            bgMusic.volume = clampedTarget;
            if (typeof onDone === "function") onDone();
        }
    }, 35);
}

function setTrackSource(index) {
    const track = playlist[index];
    bgMusic.src = "static/" + encodeURIComponent(track.filename);
    bgMusic.load();
    bgMusic.volume = userVolume;
    applyPlaybackRate(speedRates[currentSpeedIndex]);

    if (agcGainNode && audioCtx) {
        agcGainNode.gain.setValueAtTime(0.9, audioCtx.currentTime);
    }

    playerTitle.innerText = track.title;
    playerArtist.innerText = track.artist;
    playerCover.innerText = track.cover;
    playerCover.style.backgroundColor = track.bg;
    isAutoFadingOut = false;

    const progressBar = document.getElementById("player-progress-bar");
    if (progressBar) progressBar.style.width = "0%";
    motionPlay(playerCover, { scale: [0.85, 1.08, 1], rotate: [-10, 4, 0] }, SPRING_BOUNCY);
}

export function playCurrentTrackDirect(withFadeIn = true) {
    ensureVolumeNormalizer();
    stopVolumeFade();
    applyPlaybackRate(speedRates[currentSpeedIndex]);
    bgMusic.volume = withFadeIn ? 0 : userVolume;

    const p = bgMusic.play();
    if (p && typeof p.then === "function") {
        p.then(() => {
            applyPlaybackRate(speedRates[currentSpeedIndex]);
            if (withFadeIn) fadeVolumeTo(userVolume, 550);
        }).catch(() => {
            bgMusic.volume = userVolume;
            updatePlayButtonUI(false);
        });
    } else if (withFadeIn) {
        fadeVolumeTo(userVolume, 550);
    }
}

export function pauseCurrentTrackSmooth(onPaused = null) {
    if (bgMusic.paused) {
        stopVolumeFade();
        bgMusic.volume = userVolume;
        updatePlayButtonUI(false);
        if (typeof onPaused === "function") onPaused();
        return;
    }
    fadeVolumeTo(0, 350, () => {
        bgMusic.pause();
        bgMusic.volume = userVolume;
        if (typeof onPaused === "function") onPaused();
    });
}

export function initAudioPlayer() {
    bgMusic.addEventListener("play", () => updatePlayButtonUI(true));
    bgMusic.addEventListener("pause", () => updatePlayButtonUI(false));
    bgMusic.addEventListener("ended", () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        setTrackSource(currentTrackIndex);
        playCurrentTrackDirect(true);
    });
    bgMusic.addEventListener("timeupdate", () => {
        const targetRate = speedRates[currentSpeedIndex];
        if (Math.abs(bgMusic.playbackRate - targetRate) > 0.01) applyPlaybackRate(targetRate);

        if (bgMusic.duration && !Number.isNaN(bgMusic.duration)) {
            const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
            const progressBar = document.getElementById("player-progress-bar");
            if (progressBar) progressBar.style.width = percent + "%";

            if (!bgMusic.paused && !isAutoFadingOut && bgMusic.duration - bgMusic.currentTime <= 2.5) {
                isAutoFadingOut = true;
                fadeVolumeTo(0, 2200);
            }
        }
    });

    setTrackSource(currentTrackIndex);
}

export const playerHandlers = {
    toggleMusic: (e) => {
        if (e) e.stopPropagation();
        bgMusic.paused ? playCurrentTrackDirect(true) : pauseCurrentTrackSmooth();
    },
    nextTrack: (e) => {
        if (e) e.stopPropagation();
        const nextIdx = (currentTrackIndex + 1) % playlist.length;
        const wasPlaying = !bgMusic.paused;
        const switchAndPlay = () => {
            currentTrackIndex = nextIdx;
            setTrackSource(currentTrackIndex);
            wasPlaying ? playCurrentTrackDirect(true) : updatePlayButtonUI(false);
        };
        wasPlaying ? fadeVolumeTo(0, 300, switchAndPlay) : switchAndPlay();
    },
    cycleSpeed: (e) => {
        if (e) e.stopPropagation();
        currentSpeedIndex = (currentSpeedIndex + 1) % speedRates.length;
        const rate = speedRates[currentSpeedIndex];
        applyPlaybackRate(rate);
        const btn = document.getElementById("speed-btn");
        if (btn) btn.innerText = rate + "x";
    },
    seekTrack: (e) => {
        if (e) e.stopPropagation();
        if (!bgMusic.duration || Number.isNaN(bgMusic.duration)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        bgMusic.currentTime = ratio * bgMusic.duration;
    },
    changeVolume: (val) => {
        stopVolumeFade();
        userVolume = parseFloat(val);
        bgMusic.volume = userVolume;
        if (userVolume > 0) {
            previousVolume = userVolume;
            volumeBtn.innerText = userVolume < 0.4 ? "🔉" : "🔊";
        } else {
            volumeBtn.innerText = "🔇";
        }
    },
    toggleMute: (e) => {
        if (e) e.stopPropagation();
        const target = userVolume > 0 ? 0 : (previousVolume > 0 ? previousVolume : 0.7);
        volumeSlider.value = target;
        playerHandlers.changeVolume(target);
    },
    toggleMinimizePlayer: () => {
        const player = document.getElementById("mini-player");
        player.classList.toggle("minimized");
        motionPlay(player, { scale: [0.95, 1.02, 1] }, SPRING_SNAPPY);
    }
};