// Появление элементов при прокрутке + небольшой интерактив.
const revealItems = document.querySelectorAll('.member-card, .music-section, .about-section');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// Поиск по каталогу участников.
const searchInput = document.querySelector('#member-search');
const memberCards = [...document.querySelectorAll('.member-card')];
const memberCount = document.querySelector('#member-count');
const emptyState = document.querySelector('#empty-state');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLocaleLowerCase('ru');
    let visibleCount = 0;

    memberCards.forEach((card) => {
      const searchable = `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase('ru');
      const matches = searchable.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    memberCount.textContent = String(visibleCount).padStart(2, '0');
    emptyState.hidden = visibleCount !== 0;
  });
}

// Общий плейлист сайта: файлы лежат в assets/music и доступны всем посетителям.
const audio = document.querySelector('#audio');
const playButton = document.querySelector('#play-button');
const prevButton = document.querySelector('#prev-button');
const nextButton = document.querySelector('#next-button');
const volumeInput = document.querySelector('#volume');
const progress = document.querySelector('#progress');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const trackTitle = document.querySelector('#track-title');
const trackSubtitle = document.querySelector('#track-subtitle');
const playlist = document.querySelector('#playlist');


const tracks = [
  { title: 'Подмышка break ver 01 Mr.tea chase music', src: 'music/track-01.mp3' },
  { title: '0тветка на дисс (shame chase music)', src: 'music/track-02.mp3' },
  { title: 'UMаксим ver. 01', src: 'music/track-03.mp3' }
];

let currentTrack = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updatePlaylistSelection() {
  playlist?.querySelectorAll('button[data-track]').forEach((button) => {
    const selected = Number(button.dataset.track) === currentTrack;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-current', selected ? 'true' : 'false');
  });
}

function loadTrack(index, autoplay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackSubtitle.textContent = `Трек ${currentTrack + 1} из ${tracks.length} · общий плейлист`;
  currentTime.textContent = '0:00';
  duration.textContent = '0:00';
  progress.value = '0';
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Воспроизвести');
  updatePlaylistSelection();
  audio.load();

  if (autoplay) {
    audio.play().then(() => {
      playButton.textContent = 'Ⅱ';
      playButton.setAttribute('aria-label', 'Пауза');
    }).catch(() => showToast('Нажми «Воспроизвести», чтобы запустить трек.'));
  }
}

playButton?.addEventListener('click', () => {
  if (audio.paused) {
    if (!audio.src) loadTrack(currentTrack);
    audio.play().then(() => {
      playButton.textContent = 'Ⅱ';
      playButton.setAttribute('aria-label', 'Пауза');
    }).catch(() => showToast('Не удалось запустить трек. Проверь, что файлы загружены на сайт.'));
  } else {
    audio.pause();
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Воспроизвести');
  }
});

prevButton?.addEventListener('click', () => loadTrack(currentTrack - 1, true));
nextButton?.addEventListener('click', () => loadTrack(currentTrack + 1, true));
playlist?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-track]');
  if (button) loadTrack(Number(button.dataset.track), true);
});

volumeInput?.addEventListener('input', () => {
  audio.volume = Number(volumeInput.value);
});
audio.volume = Number(volumeInput?.value ?? 0.75);

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progress.value = String((audio.currentTime / audio.duration) * 100);
  }
});
progress?.addEventListener('input', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});
audio.addEventListener('ended', () => loadTrack(currentTrack + 1, true));
loadTrack(0);

// Всплывающие сообщения и пасхалки.
const toast = document.querySelector('#toast');
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

const mascot = document.querySelector('#mascot');
let mascotClicks = 0;
mascot?.addEventListener('click', () => {
  mascotClicks += 1;
  mascot.classList.remove('mascot-pop');
  void mascot.offsetWidth;
  mascot.classList.add('mascot-pop');

  if (mascotClicks >= 5) {
    mascotClicks = 0;
    showToast('АНАЛ ОТКРЫТ: ты теперь копчёный пидор ');
    document.body.classList.toggle('secret-mode');
  } else {
    showToast(`Ещё ${5 - mascotClicks} нажатий до пиздеца...`);
  }
});

// Ещё одна пасхалка: последовательность ↑ ↑ ↓ ↓ ← → ← → B A.
const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let typedCode = [];
document.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea')) return;
  typedCode.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  typedCode = typedCode.slice(-secretCode.length);

  if (secretCode.every((key, index) => typedCode[index] === key)) {
    typedCode = [];
    document.body.classList.toggle('secret-mode');
    showToast('КОД ПРИНЯТ. РЕЖИМ ХАОСА АКТИВИРОВАН ✨');
  }
});
