// ==============================================
// Halloween Birthday Party 🎃
// Compte à rebours + RSVP Google Sheets + compteur live
// ==============================================

// Date de la soirée : 31 octobre 2026 à 20h00, heure de Paris.
const partyDate = new Date("2026-10-31T20:00:00+01:00");

// URL publique Google Apps Script
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
      "<div style='grid-column:1/-1'><strong>🎃 C'EST CE SOIR ! 🎃</strong><span>Prépare ton costume</span></div>";
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
// Compteur des réponses (JSONP = compatible GitHub Pages)
// ==============================================

window.receiveRsvpStats = function(stats) {
  const yes = Number(stats.yes || 0);
  const no = Number(stats.no || 0);
  const total = Number(stats.total || (yes + no));

  const yesCount = document.getElementById("yesCount");
  const noCount = document.getElementById("noCount");
  const yesLabel = document.getElementById("yesLabel");
  const noLabel = document.getElementById("noLabel");
  const totalReplies = document.getElementById("totalReplies");

  if (yesCount) yesCount.textContent = yes;
  if (noCount) noCount.textContent = no;

  if (yesLabel) {
    yesLabel.textContent = yes === 1 ? "invité confirmé" : "invités confirmés";
  }

  if (noLabel) {
    noLabel.textContent = no === 1
      ? "ne pourra pas venir"
      : "ne pourront pas venir";
  }

  if (totalReplies) {
    if (total === 0) {
      totalReplies.textContent = "Aucune réponse pour le moment… sois le premier 👻";
    } else if (total === 1) {
      totalReplies.textContent = "1 réponse reçue pour le moment.";
    } else {
      totalReplies.textContent = `${total} réponses reçues pour le moment.`;
    }
  }
};

function loadRsvpStats() {
  const oldScript = document.getElementById("rsvp-stats-loader");
  if (oldScript) oldScript.remove();

  const statsScript = document.createElement("script");
  statsScript.id = "rsvp-stats-loader";
  statsScript.src =
    `${RSVP_ENDPOINT}?action=stats&callback=receiveRsvpStats&_=${Date.now()}`;

  statsScript.onerror = () => {
    const totalReplies = document.getElementById("totalReplies");
    if (totalReplies) {
      totalReplies.textContent = "👻 Impossible de charger le compteur pour le moment.";
    }
  };

  document.body.appendChild(statsScript);
}

loadRsvpStats();


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
    formStatus.textContent = "👻 Indique ton prénom avant de confirmer.";
    return;
  }

  if (!attendance) {
    formStatus.textContent = "🎃 Dis-nous si tu viens ou non.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "🦇 ENVOI EN COURS…";
  formStatus.textContent = "Transmission de ta réponse aux esprits… 👻";

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

    formStatus.textContent =
      `🎃 Merci ${name} ! Ta réponse a bien été envoyée.`;
    form.reset();

    submitButton.textContent = "✅ RÉPONSE ENVOYÉE";

    // Laisse le temps à Google Sheets d'enregistrer, puis rafraîchit le compteur.
    setTimeout(loadRsvpStats, 1200);

    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = "🎃 JE CONFIRME MA RÉPONSE 🎃";
    }, 3500);

  } catch (error) {
    console.error("Erreur RSVP :", error);

    formStatus.textContent =
      "😈 Oups… impossible d'envoyer la réponse. Réessaie dans quelques secondes.";

    submitButton.disabled = false;
    submitButton.textContent = "🎃 JE RÉESSAIE 🎃";
  }
});
