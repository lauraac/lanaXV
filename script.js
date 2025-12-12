// ================== CONFIGURACIÓN BÁSICA ==================
// ====== ESTADO GLOBAL DE AUDIO ======
let isMusicPlaying = false; // ¿está sonando el mp3?
let userMutedMusic = false; // ¿la usuaria apagó el mp3 a propósito?
let isVideoSoundOn = false; // ¿el video está con sonido?

// Fecha objetivo para la cuenta regresiva (ajusta hora si quieres)
const targetDate = new Date("2026-02-14T20:00:00"); // 8:00 pm

document.addEventListener("DOMContentLoaded", () => {
  setupCountdown();
  setupScrollButton();
  setupMusicToggle();
  setupVideoUnmute();
  setupRevealOnScroll();
  setupWhatsappShare();
  setupSparkles(); // ⭐ nuevo
});

// ================== CUENTA REGRESIVA ==================
function setupCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const update = () => {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const mins = Math.floor((totalSeconds / 60) % 60);
    const secs = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minsEl.textContent = String(mins).padStart(2, "0");
    secsEl.textContent = String(secs).padStart(2, "0");
  };

  update();
  setInterval(update, 1000);
}

// ================== BOTÓN SCROLL ABAJO ==================
function setupScrollButton() {
  const btn = document.getElementById("scrollDown");
  const nextSection = document.getElementById("countdown");
  if (!btn || !nextSection) return;

  btn.addEventListener("click", () => {
    nextSection.scrollIntoView({ behavior: "smooth" });
  });
}

// ================== MÚSICA DE FONDO (MP3) ==================
function setupMusicToggle() {
  const musicBtn = document.getElementById("playMusicBtn");
  const audio = document.getElementById("bgMusic");
  const video = document.getElementById("introVideo");
  if (!musicBtn || !audio) return;

  const markBtn = () => {
    if (isMusicPlaying) {
      musicBtn.classList.add("playing");
    } else {
      musicBtn.classList.remove("playing");
    }
  };

  const playMusic = async () => {
    try {
      await audio.play();
      isMusicPlaying = true;
      userMutedMusic = false; // porque la volvió a encender
      markBtn();
    } catch (err) {
      console.warn("No se pudo reproducir la música:", err);
    }
  };

  const pauseMusic = () => {
    audio.pause();
    isMusicPlaying = false;
    markBtn();
  };

  // ✅ Botón flotante ♪
  musicBtn.addEventListener("click", async () => {
    if (!isMusicPlaying) {
      // Si elige música, apagamos el audio del video
      if (video) {
        video.muted = true;
      }
      isVideoSoundOn = false;
      await playMusic();
    } else {
      pauseMusic();
      userMutedMusic = true; // la usuaria dijo: NO quiero música
    }
  });

  // ✅ Cuando entras a la invitación (sección "countdown"): auto-mp3
  const firstSection = document.getElementById("countdown");
  if (firstSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Solo auto-play si:
            // - no está sonando música
            // - la usuaria NO la apagó
            // - el video NO está con sonido
            if (!isMusicPlaying && !userMutedMusic && !isVideoSoundOn) {
              playMusic();
            }
            observer.disconnect(); // solo la primera vez
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(firstSection);
  }
}

// ================== VIDEO: CONTROLAR SONIDO Y MP3 ==================
function setupVideoUnmute() {
  const video = document.getElementById("introVideo");
  const hint = document.getElementById("tapToUnmute");
  const audio = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("playMusicBtn");
  if (!video) return;

  // Aseguramos que el video inicia muteado
  video.muted = true;

  const hideHint = () => {
    if (!hint) return;
    hint.style.opacity = "0";
    hint.style.transform = "translateY(10px)";
    setTimeout(() => (hint.style.display = "none"), 300);
  };

  // Funciones para música
  const playMusic = async () => {
    try {
      await audio.play();
      isMusicPlaying = true;
      userMutedMusic = false;
      musicBtn.classList.add("playing");
    } catch (e) {}
  };

  const pauseMusic = () => {
    audio.pause();
    isMusicPlaying = false;
    musicBtn.classList.remove("playing");
  };

  // ------- COMPORTAMIENTO AL TOCAR EL VIDEO -------
  const toggleVideoAudio = async () => {
    // Si el video está muteado → ACTIVAR audio del video y apagar mp3
    if (video.muted) {
      try {
        video.muted = false;
        await video.play(); // Activar audio
        isVideoSoundOn = true;

        // Nunca deben sonar los dos
        pauseMusic();
      } catch (e) {
        console.error("Error al activar sonido del video", e);
      }
    } else {
      // Si el video YA tenía sonido → mutearlo
      video.muted = true;
      isVideoSoundOn = false;

      // Si la usuaria NO apagó el mp3 manualmente → sonar mp3
      if (!userMutedMusic) {
        playMusic();
      }
    }

    hideHint();
  };

  // LISTENERS (ESTOS SÍ FUNCIONAN)
  video.addEventListener("click", toggleVideoAudio);
  video.addEventListener("touchend", toggleVideoAudio);
}

// ================== ANIMACIONES EN SCROLL (REVEAL) ==================
function setupRevealOnScroll() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          // Una vez visible, ya no se quita
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// ================== COMPARTIR POR WHATSAPP ==================
function setupWhatsappShare() {
  const shareBtn = document.getElementById("shareWhatsappBtn");
  if (!shareBtn) return;

  shareBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const urlInvitacion = window.location.href; // link actual
    const mensaje = `✨ Mis XV Años ✨\n\nTe comparto mi invitación premium para el 14 de febrero de 2026. Da clic para verla:\n${urlInvitacion}`;
    const encoded = encodeURIComponent(mensaje);
    const waUrl = `https://wa.me/?text=${encoded}`;

    window.open(waUrl, "_blank");
  });
}
