// Date de la soirée : 31 octobre 2026 à 20h00, heure de Paris.
const partyDate = new Date("2026-10-31T20:00:00+01:00");

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

// Étape suivante : nous remplacerons ceci par l'envoi vers Google Sheets.
const form = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  formStatus.textContent =
    `🎃 Merci ${name || ""} ! Le formulaire sera relié à Google Sheets à l'étape suivante.`;
});
