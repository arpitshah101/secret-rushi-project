/*
  Editable ROWS array: must contain exactly 5 strings. Each string should be length 5.
  Each char corresponds to one tile in the 5x5 grid. The script will sanitize (pad/truncate) as needed.
*/

const ROWS = [
  'RUSHI',
  'WILL',
  'YOU',
  'MARRY',
  'ME?'
];

const beginBtn = document.getElementById('beginBtn');
const welcomeEl = document.getElementById('welcome');
const gridWrap = document.getElementById('gridWrap');
const gridEl = document.getElementById('grid');
const topbar = document.getElementById('topbar');
const statusRow = document.getElementById('statusRow');
const wordCountEl = document.getElementById('wordCount');

const TOTAL_WORDS = 1; // per request: total words is 1
let foundWords = 0;

// --- Flip timing configuration (single var to control speed) ---
// Change FLIP_MS to make the tile flip animation slower (higher value) or faster (lower value).
// This single value controls the CSS transform duration and the inter-tile delay used by the cascade.
const FLIP_MS = 1000; // ms — increase to slow the animation (default: 1000)
const INTER_TILE_DELAY = Math.max(40, Math.round(FLIP_MS * 0.25));

// update CSS variable so animations use the same duration
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.style.setProperty('--flip-duration', `${FLIP_MS}ms`);
}

function updateWordCount(count) {
  foundWords = count;
  if (wordCountEl) wordCountEl.textContent = `${foundWords} / ${TOTAL_WORDS} words`;
}

function sanitizeRows(rows) {
  const sanitized = [];
  for (let i = 0; i < 5; i++) {
    let r = (rows[i] || '').toString();
    // pad or truncate to length 5
    if (r.length < 5) r = r.padEnd(5, ' ');
    if (r.length > 5) r = r.slice(0, 5);
    sanitized.push(r);
  }
  return sanitized;
}

function buildGrid(rows) {
  gridEl.innerHTML = '';
  const sanitized = sanitizeRows(rows);

  // build tiles left-to-right, top-to-bottom
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const char = sanitized[row][col] || ' ';
      const tile = document.createElement('div');
      tile.className = 'tile';

      const front = document.createElement('div');
      front.className = 'front';
      front.textContent = '';

      const back = document.createElement('div');
      back.className = 'back';
      back.textContent = char;

      // mark tiles with no visible character so they remain grey and don't flip
      if (!char.trim()) {
        tile.classList.add('blank');
      }

      tile.appendChild(front);
      tile.appendChild(back);
      gridEl.appendChild(tile);
    }
  }
}

function flipTilesCascade(delayMs) {
  if (!delayMs) delayMs = INTER_TILE_DELAY;
  const tiles = Array.from(document.querySelectorAll('.tile'));

  // compute indices of tiles that will flip (have a non-blank char)
  const flipIndices = tiles
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => {
      const back = t.querySelector('.back');
      return back && back.textContent && back.textContent.trim() !== '';
    })
    .map(({ idx }) => idx);

  // flip them in sequence
  flipIndices.forEach((idx) => {
    const t = tiles[idx];
    setTimeout(() => t.classList.add('flipped'), idx * delayMs);
  });

  // return a promise that resolves when the last flip animation should be finished
  if (flipIndices.length === 0) {
    return Promise.resolve();
  }

  const lastIndex = Math.max(...flipIndices);
  const waitMs = lastIndex * delayMs + FLIP_MS; // include transform duration
  return new Promise((resolve) => setTimeout(resolve, waitMs));
}

beginBtn.addEventListener('click', () => {
  const name = window.prompt('Please enter your name:');
  if (!name) return; // abort if user cancelled

  // exact match per requirements. If you'd like case-insensitive match, change to .trim().toLowerCase() compare.
  if (name === 'Rushi') {
    // reveal the statusRow and adjust layout
    if (statusRow) statusRow.classList.remove('hidden');
    // initialize to 0 words shown while tiles reveal
    updateWordCount(0);

    welcomeEl.classList.add('hidden');
    gridWrap.classList.remove('hidden');
    buildGrid(ROWS);

    // give a slight delay for layout, then flip with cascade using configured delays
    setTimeout(() => {
      flipTilesCascade().then(() => {
        // after reveal finished, update found words to 1
        updateWordCount(1);
      });
    }, 340);
  } else {
    // redirect to squaredle.app when not Rushi
    window.location.href = 'https://squaredle.app/';
  }

  // -----------------------------
  // Fireworks (celebration) overlay
  // -----------------------------

  const fireworksCanvas = document.getElementById('fireworksCanvas');
  let fwCtx = null;
  let fwW = 0;
  let fwH = 0;
  let fwParticles = [];
  let fwTexts = [];
  let fwAnimId = null;

  function resizeCanvas() {
    if (!fireworksCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    fwW = window.innerWidth;
    fwH = window.innerHeight;
    fireworksCanvas.width = Math.round(fwW * dpr);
    fireworksCanvas.height = Math.round(fwH * dpr);
    fireworksCanvas.style.width = fwW + 'px';
    fireworksCanvas.style.height = fwH + 'px';
    if (!fwCtx) fwCtx = fireworksCanvas.getContext('2d');
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomRange(min, max) { return Math.random() * (max - min) + min; }

  function makeParticle(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(1.8, 6.6);
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(40, 90),
      age: 0,
      color,
      size: randomRange(2, 5),
    };
  }

  function spawnBurst(x, y, count = 28) {
    const colors = ['#ff4d4f', '#ff7a7a', '#ffdf5d', '#ffd166', '#ff6bcb'];
    for (let i = 0; i < count; i++) fwParticles.push(makeParticle(x, y, colors[i % colors.length]));
  }

  function spawnFloatingText(text, x, y) {
    fwTexts.push({ text, x, y, vy: -0.6 - Math.random() * 0.4, alpha: 1, age: 0, life: 160 });
  }

  function stepFireworks() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fwW, fwH);

    // update particles
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.age++;
      p.vy += 0.06; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.age++; // faster decay
      const lifeFrac = 1 - p.age / p.life;
      if (lifeFrac <= 0) { fwParticles.splice(i, 1); continue; }
      fwCtx.globalAlpha = Math.max(0, lifeFrac);
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size * lifeFrac + 0.5, 0, Math.PI * 2);
      fwCtx.fill();
    }

    // floating texts
    fwCtx.globalAlpha = 1;
    for (let i = fwTexts.length - 1; i >= 0; i--) {
      const t = fwTexts[i];
      t.y += t.vy;
      t.age++;
      t.alpha = Math.max(0, 1 - t.age / t.life);
      if (t.alpha <= 0) { fwTexts.splice(i, 1); continue; }
      fwCtx.save();
      fwCtx.globalAlpha = t.alpha;
      fwCtx.font = '700 42px Inter, system-ui, -apple-system, Arial';
      fwCtx.fillStyle = '#e83e3e';
      fwCtx.strokeStyle = 'rgba(255,255,255,0.12)';
      fwCtx.lineWidth = 4;
      fwCtx.strokeText(t.text, t.x, t.y);
      fwCtx.fillText(t.text, t.x, t.y);
      fwCtx.restore();
    }

    // loop
    if (fwParticles.length > 0 || fwTexts.length > 0) {
      fwAnimId = requestAnimationFrame(stepFireworks);
    } else {
      fwAnimId = null;
      // clear the canvas for neatness
      fwCtx.clearRect(0, 0, fwW, fwH);
      // undim the main app when fireworks are finished
      const mainApp = document.querySelector('main#app');
      if (mainApp) mainApp.classList.remove('dimmed');
    }
  }

  function triggerCelebration() {
    // make sure canvas is sized
    resizeCanvas();

    // dim the main app so fireworks / words are clearer
    const mainApp = document.querySelector('main#app');
    if (mainApp) mainApp.classList.add('dimmed');

    // spawn several staggered bursts across the top half of the screen
    const bursts = 60;
    for (let i = 0; i < bursts; i++) {
      const delay = i * 110;
      setTimeout(() => {
        const x = randomRange(80, fwW - 80);
        const y = randomRange(100, fwH * 0.5);
        spawnBurst(x, y, Math.round(randomRange(18, 36)));
        // also spawn celebratory words occasionally
        if (Math.random() > 0.5) spawnFloatingText(['YES!!', 'ILOVEYOU', 'YAY', 'HAHAHEHE', 'WAHOO!!'][Math.floor(Math.random() * 4)], x - 20, y + 10);

        if (!fwAnimId) fwAnimId = requestAnimationFrame(stepFireworks);
      }, delay);
    }
  }

  // wire the Yes buttons to trigger celebration
  const yesPrimaryBtn = document.getElementById('yesPrimary');
  const yesSoftBtn = document.getElementById('yesSoft');
  if (yesPrimaryBtn) yesPrimaryBtn.addEventListener('click', () => triggerCelebration());
  if (yesSoftBtn) yesSoftBtn.addEventListener('click', () => triggerCelebration());

  // ensure canvas resizes with the window
  window.addEventListener('resize', () => resizeCanvas());
  // initialize canvas size quietly
  setTimeout(resizeCanvas, 0);
});
