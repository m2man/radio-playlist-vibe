let playlist = [];
let currentIndex = 0;
let player;

// load JSON first
async function loadPlaylist() {
  const res = await fetch("playlist.json");
  playlist = await res.json();

  // random start
  currentIndex = Math.floor(Math.random() * playlist.length);

  initPlayer();
}

// init Vimeo player
function initPlayer() {
  player = new Vimeo.Player("player", {
    id: playlist[currentIndex].id,
    width: 0
  });

  updateTitle();

  player.on("ended", next);

  startProgressLoop();
}

// update title
function updateTitle() {
  document.getElementById("title").textContent =
    playlist[currentIndex].title;
}

// load video
function loadVideo() {
  const video = playlist[currentIndex];

  player.loadVideo(video.id).then(() => {
    updateTitle();
    player.play();
  }).catch(next); // skip broken
}

// controls
function playPause() {
  player.getPaused().then(paused => {
    paused ? player.play() : player.pause();
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

// progress
function startProgressLoop() {
  setInterval(async () => {
    try {
      const current = await player.getCurrentTime();
      const duration = await player.getDuration();

      if (!duration) return;

      document.getElementById("progress").style.width =
        (current / duration) * 100 + "%";

      document.getElementById("current").textContent = format(current);
      document.getElementById("duration").textContent = format(duration);
    } catch {}
  }, 500);
}

// seek
document.getElementById("progressContainer").onclick = async (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;

  const duration = await player.getDuration();
  player.setCurrentTime(duration * percent);
};

// format time
function format(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// start app
loadPlaylist();
