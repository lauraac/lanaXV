// ============================
// CONFIG (cambia aquí)
// ============================

// Evento: 14 Feb 2026 (hora local)
const EVENT_DATE = new Date("2026-02-14T20:00:00");

// Pega aquí tu URL de Google Apps Script (para guardar en Google Sheets)
const GOOGLE_SHEETS_WEBAPP_URL = "PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT";

// Cambia por el link real del lugar
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n%20de%20eventos";
const WAZE_URL = "https://waze.com/ul?q=Sal%C3%B3n%20de%20eventos&navigate=yes";

// Contacto discreto del footer
const FOOTER_CONTACT_URL =
  "https://wa.me/521XXXXXXXXXX?text=Hola%20quiero%20informes%20de%20la%20invitaci%C3%B3n";

// ============================
// Helpers
// ============================
const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const toast = $("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add("hidden"), 2200);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ============================
// Intro video logic
// ============================
const intro = $("intro");
const introVideo = $("introVideo");
const btnEnableVideoAudio = $("btnEnableVideoAudio");
const btnSkipIntro = $("btnSkipIntro");
const tapHint = $("tapHint");

const main = $("main");
const bgMusic = $("bgMusic");
const musicToggle = $("musicToggle");
const musicText = $("musicText");
const musicDot = document.querySelector(".mini-btn__dot");

// Main hero video (secundario)
const mainVideo = $("mainVideo");

let userInteracted = false;
let musicOn = false;

function enterMain() {
  // Oculta intro
  intro.classList.add("hidden");
  document.body.classList.remove("no-scroll");

  // Muestra main
  main.classList.remove("hidden");

  // Intenta autoplay música (algunos navegadores lo bloquean)
  tryPlayMusic();

  // Intenta reproducir el video principal (muted para permitir autoplay)
  if (mainVideo) {
    mainVideo.muted = true;
    mainVideo.play().catch(() => {});
  }
}

function tryPlayMusic() {
  if (!bgMusic) return;

  bgMusic.volume = 0.9;

  bgMusic
    .play()
    .then(() => {
      musicOn = true;
      updateMusicUI();
    })
    .catch(() => {
      // Bloqueado: se activará con el primer toque del usuario
      musicOn = false;
      updateMusicUI();
      showToast("Toca cualquier parte para activar música ✨");
    });
}

function updateMusicUI() {
  if (!musicText) return;
  musicText.textContent = musicOn ? "Música: ON" : "Música: OFF";
  if (musicDot) musicDot.style.opacity = musicOn ? "1" : "0.45";
}

function markUserInteracted() {
  if (userInteracted) return;
  userInteracted = true;

  // Si música no pudo, ahora sí:
  if (!musicOn) {
    tryPlayMusic();
  }

  // Si quieres que el video principal también tenga audio cuando el usuario toque:
  // (déjalo muted si prefieres que solo sea visual)
}

window.addEventListener("pointerdown", markUserInteracted, { once: false });

// Reproducir intro video (muted por política)
if (introVideo) {
  introVideo.muted = true;
  introVideo.play().catch(() => {
    // si falla, no pasa nada
  });
}

// Activar audio del video intro
btnEnableVideoAudio?.addEventListener("click", async (e) => {
  e.preventDefault();
  userInteracted = true;

  try {
    introVideo.muted = false;
    await introVideo.play();
    tapHint?.classList.add("hidden");
    showToast("Audio activado 🔊");
  } catch (err) {
    // si el navegador lo bloquea, mostramos hint
    tapHint?.classList.remove("hidden");
    showToast("Toca la pantalla para activar audio 🎧");
  }
});

// Saltar intro
btnSkipIntro?.addEventListener("click", (e) => {
  e.preventDefault();
  enterMain();
});

// Cuando termine el video intro, entra al main
introVideo?.addEventListener("ended", () => {
  enterMain();
});

// ============================
// Música toggle
// ============================
musicToggle?.addEventListener("click", async () => {
  userInteracted = true;

  if (!musicOn) {
    try {
      await bgMusic.play();
      musicOn = true;
      updateMusicUI();
      showToast("Música ON ✨");
    } catch {
      showToast(
        "Tu navegador bloqueó el audio. Toca la pantalla e intenta de nuevo."
      );
    }
    return;
  }

  bgMusic.pause();
  musicOn = false;
  updateMusicUI();
  showToast("Música OFF");
});

// ============================
// Countdown
// ============================
function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();

  const daysEl = $("cdDays");
  const hoursEl = $("cdHours");
  const minsEl = $("cdMins");
  const secsEl = $("cdSecs");

  if (diff <= 0) {
    daysEl.textContent = "0";
    hoursEl.textContent = "00";
    minsEl.textContent = "00";
    secsEl.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  daysEl.textContent = String(days);
  hoursEl.textContent = pad2(hours);
  minsEl.textContent = pad2(mins);
  secsEl.textContent = pad2(secs);
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ============================
// Maps buttons
// ============================
$("openMaps")?.addEventListener("click", () => window.open(MAPS_URL, "_blank"));
$("openWaze")?.addEventListener("click", () => window.open(WAZE_URL, "_blank"));

// ============================
// Lightbox (galería premium)
// ============================
const lightbox = $("lightbox");
const lightboxImg = $("lightboxImg");
const closeLightbox = $("closeLightbox");

document.querySelectorAll(".g-item img").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.remove("hidden");
  });
});

closeLightbox?.addEventListener("click", () => {
  lightbox.classList.add("hidden");
  lightboxImg.src = "";
});

lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
  }
});

// ============================
// Hashtag copy
// ============================
$("copyHashtag")?.addEventListener("click", async () => {
  const text = "#MisXVDeLanaMood";
  try {
    await navigator.clipboard.writeText(text);
    showToast("Hashtag copiado ✨");
  } catch {
    showToast("No se pudo copiar. (Tu navegador lo bloqueó)");
  }
});

// ============================
// Footer contact
// ============================
const footerContact = $("footerContact");
if (footerContact) footerContact.href = FOOTER_CONTACT_URL;

// ============================
// RSVP -> Google Sheets (Apps Script)
// ============================
$("rsvpForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("rsvpStatus");
  status.textContent = "Enviando...";

  if (
    !GOOGLE_SHEETS_WEBAPP_URL ||
    GOOGLE_SHEETS_WEBAPP_URL.includes("PEGAR_AQUI")
  ) {
    status.textContent =
      "⚠️ Falta pegar tu URL de Google Apps Script en script.js (GOOGLE_SHEETS_WEBAPP_URL).";
    return;
  }

  const form = e.target;
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    attending: form.attending.value,
    guests: form.guests.value,
    message: form.message.value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Bad response");
    status.textContent = "✅ ¡Listo! Tu confirmación fue enviada.";
    form.reset();
  } catch (err) {
    status.textContent =
      "❌ No se pudo enviar. Revisa tu Apps Script (CORS / Deploy / permisos).";
  }
});
