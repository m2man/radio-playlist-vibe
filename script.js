let playlist = [];
let currentIndex = 0;
let nextIndex = null;
let player;

// elements
const titleEl = document.getElementById("title");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");
const currentEl = document.getElementById("current");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("playBtn");

// =========================
// LOAD PLAYLIST
// =========================
async function loadPlaylist() {
  const saved = localStorage.getItem("playlist");

  if (saved) {
    playlist = JSON.parse(saved);
    console.log("Loaded playlist from localStorage");
  } else {
    const res = await fetch("playlist.json");
    playlist = await res.json();
    console.log("Loaded default playlist.json");
  }

  currentIndex = Math.floor(Math.random() * playlist.length);

  initPlayer();
}

// =========================
// INIT PLAYER (ONLY ONCE)
// =========================
function initPlayer() {
  player = new Vimeo.Player("player", {
    id: playlist[currentIndex].id,
    width: 0
  });

  updateTitle();

  player.on("ended", next);

  startProgressLoop();

}

// =========================
// UPDATE TITLE
// =========================
function updateTitle() {
  titleEl.textContent = playlist[currentIndex].title;
}

// =========================
// LOAD VIDEO
// =========================
function loadVideo() {
  titleEl.textContent = "Loading...";

  player.loadVideo(playlist[currentIndex].id)
    .then(() => {
      updateTitle();
      player.play();
      playBtn.textContent = "❚❚";
    })
    .catch(() => {
      console.log("Skip broken video");
      next();
    });
}


// =========================
// CONTROLS
// =========================
function playPause() {
  player.getPaused().then(paused => {
    if (paused) {
      player.play();
      playBtn.textContent = "❚❚";
    } else {
      player.pause();
      playBtn.textContent = "▶";
    }
  });
}

function next() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadVideo();
}

function prev() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadVideo();
}

// =========================
// PROGRESS LOOP
// =========================
function startProgressLoop() {
  setInterval(async () => {
    try {
      const current = await player.getCurrentTime();
      const duration = await player.getDuration();

      if (!duration) return;

      progress.style.width = (current / duration) * 100 + "%";

      currentEl.textContent = format(current);
      durationEl.textContent = format(duration);
    } catch {}
  }, 500);
}

// =========================
// SEEK
// =========================
progressContainer.onclick = async (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;

  const duration = await player.getDuration();
  player.setCurrentTime(duration * percent);
};

// =========================
// FORMAT TIME
// =========================
function format(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// =========================
// FILE UPLOAD (JSON)
// =========================
document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data)) {
        alert("Invalid JSON format");
        return;
      }

      const valid = data.every(v => v.id && v.title);
      if (!valid) {
        alert("Each item must have {id, title}");
        return;
      }

      playlist = data;

      // 💾 save to localStorage
      localStorage.setItem("playlist", JSON.stringify(data));

      currentIndex = Math.floor(Math.random() * playlist.length);

      titleEl.textContent = "Loaded: " + file.name;

      loadVideo();

      console.log("Playlist loaded from file");

    } catch (err) {
      alert("Invalid JSON file");
    }
  };

  reader.readAsText(file);
});

// =========================
// START APP
// =========================
loadPlaylist();