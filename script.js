let player;
let isReady = false;

// default playlist
let currentPlaylist = "RD5JbH71fboA8";

// elements
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");
const currentEl = document.getElementById("current");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("title");

// extract playlist ID
function extractPlaylistId(input) {
  const match = input.match(/[?&]list=([^&]+)/);
  return match ? match[1] : input.trim();
}

// init player
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    playerVars: {
      listType: "playlist",
      list: currentPlaylist,
      autoplay: 0,
      origin: window.location.origin
    },
    events: {
      onReady: () => {
        isReady = true;
        updateTitle();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) {
          updateTitle();
        }
      }
    }
  });
}

// update title
function updateTitle() {
  if (!isReady) return;

  const data = player.getVideoData();
  if (data && data.title) {
    titleEl.textContent = data.title;
  }
}

// load new playlist
function loadPlaylist() {
  if (!isReady) return;

  const input = document.getElementById("playlistInput").value;
  if (!input) return;

  const id = extractPlaylistId(input);

  player.loadPlaylist({
    list: id,
    listType: "playlist"
  });

  document.getElementById("status").textContent = "Loaded";
}

// controls
function playPause() {
  if (!isReady) return;

  const state = player.getPlayerState();

  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function next() {
  if (!isReady) return;
  player.nextVideo();
}

function prev() {
  if (!isReady) return;
  player.previousVideo();
}

// progress update loop
setInterval(() => {
  if (!isReady) return;

  const duration = player.getDuration();
  const current = player.getCurrentTime();

  if (!duration) return;

  const percent = (current / duration) * 100;
  progress.style.width = percent + "%";

  currentEl.textContent = format(current);
  durationEl.textContent = format(duration);

}, 500);

// seek
progressContainer.onclick = (e) => {
  if (!isReady) return;

  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;

  const duration = player.getDuration();
  player.seekTo((clickX / width) * duration, true);
};

// format time
function format(t) {
  if (!t) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}