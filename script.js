// ==============================================
// Sweet 16 de Méline - Halloween House Party
// ==============================================

const partyDate = new Date("2026-10-31T20:30:00+01:00");
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbxOnIISLWovgibKJQu_s9knGCBlnbYwBCMqVKmLod019vXMoeVYa_X0dd8H_Iro_1Pu/exec";

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date();
  const diff = partyDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML =
      "<div style='grid-column:1/-1'><strong>🩸 C'EST CE SOIR 🩸</strong><span>Prépare ton déguisement et ta meilleure mauvaise idée</span></div>";
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ==============================================
// Compteur des réponses
// Chargé par JSONP depuis index.html
// ==============================================

let currentStats = { yes: 0, no: 0, total: 0 };
let statsLoaded = false;

window.receiveRsvpStats = function(stats) {
  const yes = Number(stats.yes || 0);
  const no = Number(stats.no || 0);
  const total = Number(stats.total || (yes + no));

  currentStats = { yes, no, total };
  statsLoaded = true;
  renderRsvpStats();
};

window.counterLoadFailed = function() {
  const totalReplies = document.getElementById("totalReplies");
  if (totalReplies) {
    totalReplies.textContent = "💀 Impossible de charger le compteur pour le moment.";
  }
};

function renderRsvpStats() {
  const yesCount = document.getElementById("yesCount");
  const noCount = document.getElementById("noCount");
  const yesLabel = document.getElementById("yesLabel");
  const noLabel = document.getElementById("noLabel");
  const totalReplies = document.getElementById("totalReplies");

  if (yesCount) yesCount.textContent = currentStats.yes;
  if (noCount) noCount.textContent = currentStats.no;

  if (yesLabel) {
    yesLabel.textContent = currentStats.yes === 1
      ? "invité confirmé"
      : "invités confirmés";
  }

  if (noLabel) {
    noLabel.textContent = currentStats.no === 1
      ? "ne pourra pas venir"
      : "ne pourront pas venir";
  }

  if (totalReplies) {
    if (currentStats.total === 0) {
      totalReplies.textContent = "Aucune réponse pour le moment… sois le premier à survivre.";
    } else if (currentStats.total === 1) {
      totalReplies.textContent = "1 réponse reçue pour le moment.";
    } else {
      totalReplies.textContent = `${currentStats.total} réponses reçues pour le moment.`;
    }
  }
}

function addLocalResponseToCounter(attendance) {
  if (!statsLoaded) return;

  if (attendance === "Oui") currentStats.yes += 1;
  if (attendance === "Non") currentStats.no += 1;
  currentStats.total += 1;

  renderRsvpStats();
}

// ==============================================
// Formulaire RSVP
// ==============================================

const form = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const attendance = String(formData.get("attendance") || "").trim();
  const costume = String(formData.get("costume") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name) {
    formStatus.textContent = "💀 Mets ton prénom avant de disparaître.";
    return;
  }

  if (!attendance) {
    formStatus.textContent = "🩸 Dis-nous si tu viens ou non.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "🩸 ENVOI EN COURS…";
  formStatus.textContent = "Transmission aux ténèbres en cours…";

  const body = new URLSearchParams();
  body.append("name", name);
  body.append("attendance", attendance);
  body.append("costume", costume);
  body.append("message", message);

  try {
    await fetch(RSVP_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: body.toString()
    });

    formStatus.textContent = `🩸 Merci ${name} ! Ta réponse a bien été enregistrée.`;
    form.reset();
    addLocalResponseToCounter(attendance);

    submitButton.textContent = "✅ RÉPONSE ENVOYÉE";

    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = "🩸 JE CONFIRME MA PRÉSENCE 🩸";
    }, 3500);

  } catch (error) {
    console.error("Erreur RSVP :", error);
    formStatus.textContent = "💀 Oups… impossible d'envoyer la réponse. Réessaie dans quelques secondes.";
    submitButton.disabled = false;
    submitButton.textContent = "🩸 JE RÉESSAIE 🩸";
  }
});


// ==============================================
// Ambiance sonore V2.1
// Les navigateurs bloquent généralement l'autoplay sonore,
// donc la lecture démarre au premier clic sur le bouton.
// ==============================================

const horrorAmbience = document.getElementById("horrorAmbience");
const soundToggle = document.getElementById("soundToggle");
const soundLabel = document.getElementById("soundLabel");

if (horrorAmbience && soundToggle && soundLabel) {
  horrorAmbience.volume = 0.33;

  soundToggle.addEventListener("click", async () => {
    if (horrorAmbience.paused) {
      try {
        await horrorAmbience.play();
        soundToggle.classList.add("active");
        soundToggle.setAttribute("aria-pressed", "true");
        soundLabel.textContent = "COUPER L’AMBIANCE SONORE";
      } catch (err) {
        console.error("Lecture audio impossible :", err);
        soundLabel.textContent = "CLIQUE ENCORE, LE FANTÔME DORT";
      }
    } else {
      horrorAmbience.pause();
      soundToggle.classList.remove("active");
      soundToggle.setAttribute("aria-pressed", "false");
      soundLabel.textContent = "ACTIVER L’AMBIANCE SONORE";
    }
  });
}


// ==============================================
// V2.2 — Screamer premium au clic
// ==============================================

const screamerTrigger = document.getElementById("screamerTrigger");
const screamerOverlay = document.getElementById("screamerOverlay");
const screamerAudio = document.getElementById("screamerAudio");

let screamerRunning = false;

function cleanupScreamer() {
  document.documentElement.classList.remove("screamer-lock");
  document.body.classList.remove("screamer-lock", "screamer-glitch", "screamer-shake");

  screamerOverlay.classList.remove("active", "stage-glitch", "stage-face");
  screamerOverlay.setAttribute("aria-hidden", "true");

  if (screamerAudio) {
    screamerAudio.pause();
    screamerAudio.currentTime = 0;
  }

  screamerRunning = false;
}

async function runScreamer() {
  if (screamerRunning) return;
  screamerRunning = true;

  document.documentElement.classList.add("screamer-lock");
  document.body.classList.add("screamer-lock", "screamer-glitch");

  screamerOverlay.classList.add("active", "stage-glitch");
  screamerOverlay.setAttribute("aria-hidden", "false");

  // Le clic de l'utilisateur autorise la lecture audio dans les navigateurs.
  if (screamerAudio) {
    screamerAudio.currentTime = 0;
    screamerAudio.volume = 0.72;
    try {
      await screamerAudio.play();
    } catch (err) {
      console.warn("Audio screamer bloqué :", err);
    }
  }

  // Petit bug + tension.
  setTimeout(() => {
    document.body.classList.remove("screamer-glitch");
    document.body.classList.add("screamer-shake");
    screamerOverlay.classList.add("stage-face");
  }, 520);

  // Disparition automatique.
  setTimeout(() => {
    screamerOverlay.style.transition = "opacity .26s ease";
    screamerOverlay.style.opacity = "0";
  }, 3050);

  setTimeout(() => {
    screamerOverlay.style.transition = "";
    screamerOverlay.style.opacity = "";
    cleanupScreamer();
  }, 3380);
}

if (screamerTrigger && screamerOverlay) {
  screamerTrigger.addEventListener("click", runScreamer);
}

// Sécurité : Échap ferme immédiatement.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && screamerRunning) {
    cleanupScreamer();
  }
});
