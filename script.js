// ============================
// CONFIG (cambia aquí)
// ============================

// Evento: 14 Feb 2026 (hora local)
const EVENT_DATE = new Date("2026-02-14T20:00:00");

// Pega aquí tu URL de Google Apps Script (para guardar en Google Sheets)
const GOOGLE_SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxd_zZVNpvSQ3z4_kAOLZwM1EnnpwkA4UVuDJZ-nhr1rAA5kSoIeitBQNPf0ZmunoFHZg/exec";

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
// Intro video logic (ÚNICO Y CORRECTO)
// ============================
const intro = $("intro");
const introVideo = $("introVideo");
const btnEnableVideoAudio = $("btnEnableVideoAudio");
const btnSkipIntro = $("btnSkipIntro");
const tapHint = $("tapHint");

// Reproducir intro muted (permitido)
introVideo.muted = true;
introVideo.volume = 1;
introVideo.play().catch(() => {});

btnEnableVideoAudio.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation(); // 👈 MUY IMPORTANTE EN MÓVIL

  try {
    introVideo.muted = false;
    introVideo.volume = 1;
    await introVideo.play();

    // 👇 OCULTAR BOTÓN DESPUÉS DEL PRIMER TOQUE
    btnEnableVideoAudio.classList.add("fade-out");

    console.log("🔊 Audio activado y botón oculto");
  } catch (err) {
    console.error("❌ Error activando audio", err);
  }
});
function stopIntroAudio() {
  const v = document.getElementById("introVideo");
  if (!v) return;

  // cortar audio inmediato
  v.pause();
  v.muted = true;
  v.currentTime = 0; // opcional: reinicia el video para la próxima
}

// Saltar intro
btnSkipIntro.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  stopIntroAudio(); // ✅ corta el audio del video si estaba sonando
  enterMain(); // ✅ pasa al main
});

// Cuando termina el video
introVideo.addEventListener("ended", () => {
  stopIntroAudio(); // ✅ por seguridad
  enterMain();
});

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
function enterMain() {
  stopIntroAudio(); // ✅ por si acaso

  const intro = document.getElementById("intro");
  const main = document.getElementById("main");

  intro.classList.add("hidden");
  document.body.classList.remove("no-scroll");
  main.classList.remove("hidden");

  const bgMusic = document.getElementById("bgMusic");
  if (bgMusic) {
    bgMusic.volume = 0.9;
    bgMusic.play().catch(() => {});
  }
}

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicText = document.getElementById("musicText");

let musicOn = false;

function updateMusicUI() {
  if (!musicText || !musicToggle) return;
  musicText.textContent = musicOn ? "Música" : "Música";
  musicToggle.classList.toggle("is-off", !musicOn);
}

const music = document.getElementById("bgMusic");
const btn = document.getElementById("musicToggle");

let musicEnabled = false;
async function playMusic() {
  try {
    await music.play();
    musicEnabled = true;
    btn.classList.add("is-playing");
    musicText.textContent = "Música";
  } catch (e) {
    // si el navegador bloquea autoplay, se activa cuando el usuario toque
  }
}

function pauseMusic() {
  music.pause();
  btn.classList.remove("is-playing");
}

btn.addEventListener("click", async () => {
  // primer toque: intenta reproducir
  if (!musicEnabled || music.paused) {
    await playMusic();
  } else {
    pauseMusic();
  }
});

// Estado inicial UI
updateMusicUI();

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
window.addEventListener("load", () => {
  const v = document.getElementById("mainVideo");
  if (!v) return;

  v.muted = true; // obligatorio para autoplay
  v.playsInline = true;

  const tryPlay = () => v.play().catch(() => {});

  // intenta al cargar
  tryPlay();

  // intenta de nuevo cuando ya cargó suficiente
  v.addEventListener("canplay", tryPlay);

  // y si falla por políticas, se activa en el primer toque del usuario
  document.addEventListener("touchstart", tryPlay, {
    once: true,
    passive: true,
  });
  document.addEventListener("click", tryPlay, { once: true });
});

// ===== GALERÍA PRO: carrusel + dots + caption + autoplay + swipe =====
(function galleryPro() {
  const track = document.querySelector("#gallery .gpro-track");
  const caption = document.getElementById("gproCaption");
  const dotsWrap = document.getElementById("gproDots");
  const btnPrev = document.querySelector("#gallery .gpro-prev");
  const btnNext = document.querySelector("#gallery .gpro-next");
  if (!track || !caption || !dotsWrap || !btnPrev || !btnNext) return;
  // ✅ Evitar que tocar el carrusel dispare el handler global (no romper video/audio)
  ["pointerdown", "touchstart", "mousedown", "click"].forEach((evt) => {
    track.addEventListener(evt, (e) => e.stopPropagation(), { passive: true });
  });

  const slides = Array.from(track.querySelectorAll(".gpro-slide"));
  const total = slides.length;

  // Crear dots
  dotsWrap.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "gpro-dot";
    b.setAttribute("aria-label", `Ir a foto ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function nearestIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0,
      bestDist = Infinity;
    slides.forEach((s, i) => {
      const left = s.offsetLeft + s.clientWidth / 2;
      const d = Math.abs(left - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function updateUI(i) {
    const step = slides[i].getAttribute("data-step") || String(i + 1);
    const label = slides[i].getAttribute("data-label") || "";
    caption.textContent = `Foto ${step}/12 · ${label}`.trim();

    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
  }

  function goTo(i) {
    const s = slides[i];
    if (!s) return;
    track.scrollTo({
      left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2,
      behavior: "smooth",
    });
    updateUI(i);
    current = i;
  }

  // Botones
  btnPrev.addEventListener("click", () => goTo((current - 1 + total) % total));
  btnNext.addEventListener("click", () => goTo((current + 1) % total));

  // Lightbox (usa el tuyo)
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  slides.forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img || !lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightbox.classList.remove("hidden");
    });
  });

  // Detectar scroll para actualizar caption/dots
  let raf = null;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      current = nearestIndex();
      updateUI(current);
    });
  });

  // Autoplay suave (se pausa si el usuario interactúa)
  let current = 0;
  let autoplay = setInterval(() => goTo((current + 1) % total), 3500);

  function pauseAutoplay() {
    clearInterval(autoplay);
    autoplay = null;
  }
  function resumeAutoplay() {
    if (autoplay) return;
    autoplay = setInterval(() => goTo((current + 1) % total), 3500);
  }

  ["touchstart", "mousedown", "pointerdown", "wheel"].forEach((evt) => {
    track.addEventListener(evt, pauseAutoplay, { passive: true });
  });
  track.addEventListener("touchend", () => setTimeout(resumeAutoplay, 2500), {
    passive: true,
  });
  track.addEventListener("mouseup", () => setTimeout(resumeAutoplay, 2500));

  // Inicial
  requestAnimationFrame(() => {
    goTo(0);
    updateUI(0);
  });
})();

// ===== Corazón globo: aparece en zonas seguras (no tapa el hero/video ni botones) =====
(function heartBalloonSafe() {
  const btn = document.getElementById("heartBalloon");
  if (!btn) return;

  const SAFE_MARGIN = 12; // margen general
  const SIZE = 64; // debe coincidir con el CSS
  const MOVE_EVERY_MS = 5200;

  // elementos que NO debe tapar
  const blockersSelectors = [
    ".hero", // todo el hero (incluye video)
    "#mainVideo", // por si cambia
    ".hero__cta", // botones del hero
    ".topbar", // barra superior
    "#musicToggle", // botón música flotante
    "#intro", // por si está visible
  ];

  function rect(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // ignorar elementos no visibles / sin tamaño
    if (r.width === 0 || r.height === 0) return null;
    return r;
  }

  function getBlockRects() {
    const rects = [];
    blockersSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = rect(el);
        if (r) rects.push(r);
      });
    });
    return rects;
  }

  function intersects(a, b) {
    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );
  }

  function pickSafePosition() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // área donde puede aparecer el globo
    const minX = SAFE_MARGIN;
    const maxX = vw - SIZE - SAFE_MARGIN;
    const minY = SAFE_MARGIN + 60; // evitar top
    const maxY = vh - SIZE - SAFE_MARGIN - 20; // evitar fondo

    const blocks = getBlockRects();

    // intentos random
    for (let i = 0; i < 60; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      const candidate = {
        left: x,
        top: y,
        right: x + SIZE,
        bottom: y + SIZE,
      };

      // si choca con algo, intenta otra
      const collision = blocks.some((b) => intersects(candidate, b));
      if (!collision) return { x, y };
    }

    // fallback: esquina superior izquierda segura
    return { x: minX, y: minY + 80 };
  }

  function moveBalloon() {
    // solo si está visible y no reventado
    if (btn.classList.contains("pop")) return;

    const { x, y } = pickSafePosition();
    btn.style.left = `${Math.round(x)}px`;
    btn.style.top = `${Math.round(y)}px`;
  }

  function spawnParticles(x, y) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "heart-particle";

      const angle = Math.random() * Math.PI * 2;
      const power = 50 + Math.random() * 90;
      const dx = Math.cos(angle) * power;
      const dy = Math.sin(angle) * power - (30 + Math.random() * 30);

      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.setProperty("--dx", dx.toFixed(1) + "px");
      p.style.setProperty("--dy", dy.toFixed(1) + "px");

      const size = 6 + Math.random() * 7;
      p.style.width = size + "px";
      p.style.height = size + "px";

      const r = Math.random();
      if (r < 0.2) p.style.background = "rgba(255,255,255,0.85)";
      else if (r < 0.45) p.style.background = "rgba(255, 43, 106, 0.85)";
      else p.style.background = "rgba(138, 0, 35, 0.85)";

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  // Reventar
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btn.classList.contains("pop")) return;

    if (navigator.vibrate) navigator.vibrate([25, 25, 40]);

    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    btn.classList.add("pop");
    spawnParticles(cx, cy);

    // reaparece y se reubica
    setTimeout(() => {
      btn.classList.remove("pop");
      moveBalloon();
    }, 1700);
  });

  // mover cada cierto tiempo, y al resize/orientación
  let timer = null;
  function start() {
    moveBalloon();
    clearInterval(timer);
    timer = setInterval(moveBalloon, MOVE_EVERY_MS);
  }

  window.addEventListener("resize", () => {
    // espera poquito para que el layout se acomode
    clearTimeout(window.__heartResizeTO);
    window.__heartResizeTO = setTimeout(start, 250);
  });

  // iniciar cuando ya cargó (por tamaños correctos del hero/video)
  window.addEventListener("load", start);
})();
