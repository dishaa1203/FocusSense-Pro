let startTime = null;
let idleTime = 0;
let idleStart = null;
let distractions = 0;
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let chart;

/* ---------------- PROFILE ---------------- */

const profileBtn = document.getElementById("profileBtn");

loadProfile();

profileBtn.onclick = saveProfile;

function saveProfile() {
  const profile = {
    name: username.value.trim(),
    preferred: preferredWork.value,
    goal: dailyGoal.value
  };

  if (!profile.name || !profile.goal) {
    profileMsg.textContent = "Please fill all fields ❌";
    profileMsg.style.color = "red";
    return;
  }

  localStorage.setItem("profile", JSON.stringify(profile));
  lockProfile(true);

  profileMsg.textContent = "Profile saved successfully ✅";
  profileMsg.style.color = "#22c55e";

  profileBtn.textContent = "Edit Profile";
  profileBtn.onclick = enableProfileEdit;
}

function enableProfileEdit() {
  lockProfile(false);
  profileMsg.textContent = "You can edit your profile ✏️";
  profileMsg.style.color = "#38bdf8";
  profileBtn.textContent = "Save Profile";
  profileBtn.onclick = saveProfile;
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  if (!profile) return;

  username.value = profile.name;
  preferredWork.value = profile.preferred;
  dailyGoal.value = profile.goal;

  lockProfile(true);
  profileBtn.textContent = "Edit Profile";
  profileBtn.onclick = enableProfileEdit;
}

function lockProfile(lock) {
  username.disabled = lock;
  preferredWork.disabled = lock;
  dailyGoal.disabled = lock;
}

/* ---------------- SESSION TRACKING ---------------- */

document.addEventListener("visibilitychange", () => {
  if (!startTime) return;

  if (document.hidden) {
    distractions++;
    idleStart = Date.now();
  } else if (idleStart) {
    idleTime += Date.now() - idleStart;
    idleStart = null;
  }
});

function startSession() {
  startTime = Date.now();
  idleTime = distractions = 0;
  output.innerHTML = "⏳ Session started. Stay focused!";
}

function endSession() {
  if (!startTime) return;

  const total = (Date.now() - startTime) / 60000;
  const idle = idleTime / 60000;
  const active = total - idle;

  const focusScore = Math.max(
    0,
    Math.round(active * 100 - idle * 30 - distractions * 10)
  );

  const session = {
    date: new Date().toLocaleDateString(),
    type: sessionType.value,
    focus: focusScore
  };

  sessions.push(session);
  localStorage.setItem("sessions", JSON.stringify(sessions));

  startTime = null;

  output.innerHTML = `<strong>Focus Score:</strong> ${focusScore}%`;
  renderChart();
  runCoach();
}

/* ---------------- CHART ---------------- */

function renderChart() {
  const last = sessions.slice(-7);
  if (chart) chart.destroy();

  chart = new Chart(focusChart, {
    type: "line",
    data: {
      labels: last.map(s => s.date),
      datasets: [{
        label: "Focus Score",
        data: last.map(s => s.focus),
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

/* ---------------- AI COACH ---------------- */

function runCoach() {
  if (sessions.length < 3) return;

  const avg = sessions.reduce((a, b) => a + b.focus, 0) / sessions.length;

  coach.textContent =
    avg < 60
      ? "🧠 Your focus drops early. Try 25–30 min sessions."
      : "🔥 Great consistency. Keep it up!";
}

/* ---------------- EXPORT ---------------- */

function exportCSV() {
  let csv = "Date,Type,Focus\n";
  sessions.forEach(s => {
    csv += `${s.date},${s.type},${s.focus}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "focus-report.csv";
  a.click();
}

/* ---------------- THEME ---------------- */

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
};
