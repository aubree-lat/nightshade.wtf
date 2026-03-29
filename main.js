// nightshade.wtf — main.js

// ─── Playlists ───────────────────────────────────────────────────────────────
const playlists = {
  aubree: [
    { title: "Sesame Street",                artist: "Joey Trap",    coverurl: "/images/2time.jpg",           songurl: "/songs/SesameStreet.mp3" },
    { title: "Change (In the House of Flies)",artist: "Deftones",    coverurl: "/images/WhitePony.png", songurl: "/songs/change.mp3" },
    { title: "Black Hole Sun",               artist: "Soundgarden",  coverurl: "/images/BHS.png",       songurl: "/songs/BHS.mp3" },
    { title: "Hello Juliet",                 artist: "Clarion",      coverurl: "/images/Juliet.png",    songurl: "/songs/Juliet.mp3" },
    { title: "Floods",                       artist: "Pantera",      coverurl: "/images/Floods.png",    songurl: "/songs/Floods.mp3" },
    { title: "Freaking out the neighborhood",artist: "Mac DeMarco",  coverurl: "/images/ugh.webp",            songurl: "/songs/marc.mp3" },
  ],
  charlie: [
    { title: "Change (In the house of flies)",artist: "Deftones",   coverurl: "/images/WhitePony.png", songurl: "/songs/change.mp3" },
    { title: "10s",                           artist: "Pantera",     coverurl: "/images/10s.png",             songurl: "/songs/10s.mp3" },
    { title: "Black Hole Sun",                artist: "Soundgarden", coverurl: "/images/songs/BHS.png",       songurl: "/songs/BHS.mp3" },
  ],
};

// ─── Mobile Warning ──────────────────────────────────────────────────────────
(function () {
  const isMobile =
    /Android|webOS|iPhone|Mac OS|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

  if (isMobile) {
    const warning = document.getElementById('mobileWarning');
    warning.style.display = 'block';

    document.getElementById('continueBtn').addEventListener('click', () => {
      warning.style.transition = 'opacity 0.5s ease';
      warning.style.opacity = '0';
      setTimeout(() => (warning.style.display = 'none'), 500);
    });
  }
})();

// ─── State ───────────────────────────────────────────────────────────────────
let currentPage = 'loading';
let currentBio = null;
let currentPlaylist = [];
let currentIndex = 0;

// ─── Elements ────────────────────────────────────────────────────────────────
const audio         = new Audio();
const cover         = document.getElementById('cover');
const titleEl       = document.getElementById('title');
const artistEl      = document.getElementById('artist');
const playBtn       = document.getElementById('play');
const nextBtn       = document.getElementById('next');
const backBtnMedia  = document.getElementById('back');
const volumeEl      = document.getElementById('volume');
const progressEl    = document.getElementById('progress');
const progressTime  = document.getElementById('progressTime');
const volumePercent = document.getElementById('volumePercent');
const musicPlayer   = document.getElementById('musicPlayer');

// ─── Audio Init ──────────────────────────────────────────────────────────────
audio.volume = 0.3;
volumeEl.value = 0.3;
volumePercent.textContent = '30%';
volumeEl.style.setProperty('--volume', '30%');

// ─── Page Title Animation ────────────────────────────────────────────────────
const titles = {
  selection: 'aubree & charlie <3',
  aubree:    "aubree's home. <3",
  charlie:   "charlie's home. <3",
};

let titleIndex = 1;
let titleDirection = 1;
const titleSpeed = 120;
let currentTitle = titles.selection;

function updateTitle() {
  document.title = currentTitle.slice(0, Math.max(1, titleIndex));

  if (titleDirection === 1) {
    titleIndex++;
    if (titleIndex > currentTitle.length) { titleDirection = -1; titleIndex = currentTitle.length; }
  } else {
    titleIndex--;
    if (titleIndex <= 1) { titleDirection = 1; titleIndex = 1; }
  }

  setTimeout(updateTitle, titleSpeed);
}

updateTitle();

// ─── Background Video ────────────────────────────────────────────────────────
(function () {
  const bg = document.getElementById('bgVideo');
  if (bg && typeof bg.play === 'function') bg.play().catch(() => {});
})();

// ─── Music Helpers ───────────────────────────────────────────────────────────
function loadSong(index) {
  if (!currentPlaylist.length) return;
  const song = currentPlaylist[index];
  audio.src       = song.songurl;
  cover.src       = song.coverurl;
  titleEl.textContent  = song.title;
  artistEl.textContent = song.artist;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

audio.addEventListener('timeupdate', () => {
  const cur   = formatTime(audio.currentTime);
  const total = audio.duration ? formatTime(audio.duration) : '0:00';
  progressTime.textContent = `${cur} / ${total}`;
  if (audio.duration) {
    progressEl.value = (audio.currentTime / audio.duration) * 100;
    progressEl.style.setProperty('--progress', `${progressEl.value}%`);
  }
});

progressEl.addEventListener('input', e => {
  if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
});

volumeEl.addEventListener('input', e => {
  audio.volume = e.target.value;
  volumePercent.textContent = `${Math.round(e.target.value * 100)}%`;
  volumeEl.style.setProperty('--volume', `${e.target.value * 100}%`);
});

audio.addEventListener('ended', () => {
  if (!currentPlaylist.length) return;
  currentIndex = (currentIndex + 1) % currentPlaylist.length;
  loadSong(currentIndex);
  audio.play();
  playBtn.textContent = '||';
});

playBtn.addEventListener('click', () => {
  if (audio.paused) { audio.play(); playBtn.textContent = '||'; }
  else              { audio.pause(); playBtn.textContent = '▶'; }
});

nextBtn.addEventListener('click', () => {
  if (!currentPlaylist.length) return;
  currentIndex = (currentIndex + 1) % currentPlaylist.length;
  loadSong(currentIndex);
  audio.play();
  playBtn.textContent = '||';
});

backBtnMedia.addEventListener('click', () => {
  if (!currentPlaylist.length) return;
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  loadSong(currentIndex);
  audio.play();
  playBtn.textContent = '||';
});

// ─── Theme Switcher ──────────────────────────────────────────────────────────
/**
 * Apply a color theme to <body> and let CSS variables cascade.
 * Removes any existing theme- class, then adds the new one.
 * Also tweaks the background gradient on <html> for the deep bg.
 */
function applyTheme(theme) {
  document.body.classList.remove('theme-aubree', 'theme-charlie');
  if (theme) document.body.classList.add(`theme-${theme}`);
}

// ─── Page Navigation ─────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  setTimeout(() => document.getElementById(pageId).classList.add('active'), 50);
}

function showSelection() {
  currentPage = 'selection';
  currentTitle = titles.selection;
  titleIndex = 1;
  audio.pause();
  playBtn.textContent = '▶';
  applyTheme(null);    // back to purple/neutral

  setTimeout(() => musicPlayer.classList.remove('visible'), 300);
  showPage('selectionPage');
}

function showBio(person) {
  currentBio     = person;
  currentPage    = person;
  currentTitle   = titles[person];
  titleIndex     = 1;

  // Apply theme before page shows so transitions look right
  applyTheme(person);

  // Load playlist
  currentPlaylist = playlists[person];
  currentIndex    = 0;
  loadSong(currentIndex);

  const pageId          = person === 'aubree' ? 'aubreePage' : 'charliePage';
  const overlay         = document.getElementById(person === 'aubree' ? 'aubreeOverlay' : 'charlieOverlay');
  const animationText   = document.getElementById(person === 'aubree' ? 'aubreeAnimText' : 'charlieAnimText');

  showPage(pageId);
  overlay.classList.remove('hidden');

  const enterHandler = () => {
    overlay.querySelector('.clickEnter').style.opacity = '0';

    audio.currentTime = 0;
    audio.play().catch(() => {});
    playBtn.textContent = '||';

    const bgVideo = document.getElementById('bgVideo');
    if (bgVideo) {
      try { bgVideo.currentTime = 0; } catch (e) {}
      bgVideo.play().catch(() => {});
    }

    const words =
      person === 'aubree'
        ? [{ text: 'aubree.lat', time: 0 }, { text: ':3', time: 300 }]
        : [{ text: 'so awesome sauce', time: 0 }];

    animationText.innerHTML = '';
    words.forEach(wordObj => {
      const span = document.createElement('span');
      span.textContent = wordObj.text;
      animationText.appendChild(span);
      setTimeout(() => span.classList.add('visible'), wordObj.time);
      animationText.appendChild(document.createTextNode(' '));
    });

    setTimeout(() => {
      overlay.classList.add('hidden');
      setTimeout(() => musicPlayer.classList.add('visible'), 200);
    }, 1000);

    overlay.removeEventListener('click', enterHandler);
  };

  overlay.addEventListener('click', enterHandler);
}

// ─── Init — Loading Screen ───────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loadingScreen  = document.getElementById('loadingScreen');
  const loadingMessage = document.getElementById('loadingMessage');

  const messages = [
    'I love you.',
    'Loading... but like, not really.',
    'just a sec, maybe grab a snack?',
    ':3',
    "'charlie can you count down for me im almost finished...' aubree are you... AUBREE IM NOT HELPING YOU NUT. - charlie",
    'mental health matters',
    'trans rights are human rights!',
    'if you see this, you are valid and loved <3',
    'i hope you have a good day :)',
    'spread love, not hate. <3',
  ];

  loadingMessage.textContent = messages[Math.floor(Math.random() * messages.length)];

  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => showPage('selectionPage'), 800);
  }, 3000);
});

// ─── Console Art ─────────────────────────────────────────────────────────────
console.log(String.raw`
             _                     ___        _                _ _      
  __ _ _   _| |__  _ __ ___  ___  ( _ )   ___| |__   __ _ _ __| (_) ___ 
 / _\` | | | | '_ \| '__/ _ \/ _ \ / _ \/\/ __| '_ \ / _\` | '__| | |/ _ \
| (_| | |_| | |_) | | |  __/  __/| (_>  < (__| | | | (_| | |  | | |  __/
 \__,_|\__,_|_.__/|_|  \___|\___|  \___/\_\___|_| |_|\__,_|_|  |_|_|\___|
double bio site :3`);