/* ===== SCRIPT.JS – CSK PREDICTOR ===== */

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────

const CSK_PLAYERS = [
  { id:'dhoni',   name:'MS Dhoni',         role:'Wicket-Keeper',   emoji:'👑', rating:'10.0', avg:95,  sr:138, wickets:null, economy:null },
  { id:'ruturaj', name:'Ruturaj Gaikwad',  role:'Batsman',         emoji:'🏏', rating:'9.2',  avg:88,  sr:135, wickets:null, economy:null },
  { id:'jadeja',  name:'Ravindra Jadeja',  role:'All-Rounder',     emoji:'⚡', rating:'9.5',  avg:76,  sr:142, wickets:180,  economy:7.2  },
  { id:'deepak',  name:'Deepak Chahar',    role:'Bowler',          emoji:'🎯', rating:'8.7',  avg:null,sr:null, wickets:120, economy:7.8  },
  { id:'moeen',   name:'Moeen Ali',        role:'All-Rounder',     emoji:'🌟', rating:'8.8',  avg:70,  sr:148, wickets:85,  economy:7.5  },
  { id:'shivam',  name:'Shivam Dube',      role:'Batsman',         emoji:'💪', rating:'8.6',  avg:82,  sr:152, wickets:null, economy:null },
  { id:'rachin',  name:'Rachin Ravindra',  role:'All-Rounder',     emoji:'🎭', rating:'8.4',  avg:72,  sr:130, wickets:45,  economy:8.0  },
  { id:'pathirana',name:'Matheesha Pathirana',role:'Bowler',       emoji:'🔥', rating:'9.0',  avg:null,sr:null, wickets:95,  economy:7.1  },
];

const DHONI_QUOTES = [
  '"You don\'t need to be the best in the world, you need to be the best when it matters most."',
  '"Finishing a game is an art. You need to know which ball to hit and which to leave."',
  '"I have always believed that the process is more important than the result."',
  '"If you win, you win. If you lose, you learn."',
  '"I am very particular about maintaining calmness. When you are calm you can think clearly."',
  '"Champions don\'t panic. They assess, adapt, and execute."',
  '"Whistle Podu – because when CSK walks in, the game changes."',
];

const MATCH_DATA = [
  { result:'win',  teams:'CSK vs MI', date:'Apr 7, 2025', venue:'Chepauk',  score:'192/4', target:'MI 163', margin:'29 runs', aiScore:94 },
  { result:'win',  teams:'CSK vs RCB', date:'Apr 14, 2025', venue:'Chinnaswamy', score:'188/5', target:'RCB 175', margin:'13 runs', aiScore:88 },
  { result:'loss', teams:'CSK vs KKR', date:'Apr 21, 2025', venue:'Eden Gardens', score:'161/8', target:'KKR 164/3', margin:'7 wickets', aiScore:71 },
  { result:'win',  teams:'CSK vs SRH', date:'Apr 28, 2025', venue:'Chepauk', score:'208/4', target:'SRH 182', margin:'26 runs', aiScore:92 },
  { result:'win',  teams:'CSK vs DC', date:'May 5, 2025', venue:'Kotla', score:'175/6', target:'DC 171/7', margin:'4 runs', aiScore:85 },
];

const PLAYER_PREDICTIONS = {
  dhoni:   { runs:[54,38,72,21,48], sr:[152,131,168,98,139] },
  ruturaj: { runs:[88,42,67,93,55], sr:[135,122,140,148,128] },
  jadeja:  { runs:[45,30,62,18,40], sr:[140,118,155,92,138] },
  deepak:  { runs:[12,8,22,5,14],   sr:[100,90,115,80,105]  },
  moeen:   { runs:[52,28,75,35,60], sr:[148,120,160,115,145] },
  shivam:  { runs:[68,44,81,29,56], sr:[155,140,165,110,152] },
};

const OPPONENT_FACTOR = {
  mi:0.88, rcb:0.92, dc:0.95, kkr:0.85, srh:0.90, rr:0.93, pbks:0.96, gt:0.89, lsg:0.94
};

const VENUE_FACTOR = {
  chepauk:1.08, wankhede:0.94, eden:0.96, chinnaswamy:1.02, dharamsala:0.98, hyderabad:1.0
};

let currentQuoteIndex = 0;
let formRating = 4;
let selectedPhase = 'powerplay';
let dewActive = 'dew';

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  renderPlayers();
  renderMatches();
  initScrollAnimations();
  initCounters();
  initChart();
  updatePlayerStats();
});

// ──────────────────────────────────────────────
// PARTICLES
// ──────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: Math.random() > 0.5 ? 'rgba(255,193,7,' : 'rgba(0,102,204,',
      alpha: Math.random() * 0.5 + 0.1,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ──────────────────────────────────────────────
// NAVBAR
// ──────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = ['hero','predictor','players','stats','matches'];

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ──────────────────────────────────────────────
// PLAYERS
// ──────────────────────────────────────────────
function renderPlayers() {
  const grid = document.getElementById('playersGrid');
  grid.innerHTML = CSK_PLAYERS.map(p => `
    <div class="player-card animate-in" onclick="selectPlayer('${p.id}')">
      <span class="player-emoji">${p.emoji}</span>
      <div class="player-card-name">${p.name}</div>
      <div class="player-card-role">${p.role}</div>
      <div class="player-card-rating">⭐ ${p.rating}</div>
      <div class="player-card-stats">
        <div>
          <div class="player-card-stat-val">${p.avg || p.wickets || '-'}</div>
          <div>${p.avg ? 'Avg' : p.wickets ? 'Wkts' : '-'}</div>
        </div>
        <div>
          <div class="player-card-stat-val">${p.sr || p.economy || '-'}</div>
          <div>${p.sr ? 'SR' : p.economy ? 'Eco' : '-'}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function selectPlayer(id) {
  const sel = document.getElementById('playerSelect');
  if (sel) {
    sel.value = id;
    updatePlayerStats();
    scrollToSection('predictor');
  }
}

// ──────────────────────────────────────────────
// MATCHES
// ──────────────────────────────────────────────
function renderMatches() {
  const list = document.getElementById('matchesList');
  list.innerHTML = MATCH_DATA.map(m => `
    <div class="match-card animate-in">
      <div class="match-result-badge ${m.result}">${m.result === 'win' ? 'W' : 'L'}</div>
      <div class="match-info">
        <div class="match-teams">${m.teams}</div>
        <div class="match-details">📅 ${m.date} &nbsp;•&nbsp; 📍 ${m.venue}</div>
      </div>
      <div class="match-score">
        <div class="match-score-val">${m.score}</div>
        <div class="match-score-margin">${m.margin}</div>
      </div>
      <div class="match-ai-score">
        <div class="ai-score-label">AI Score</div>
        <div class="ai-score-val">${m.aiScore}%</div>
      </div>
    </div>
  `).join('');
}

// ──────────────────────────────────────────────
// PREDICTOR CONTROLS
// ──────────────────────────────────────────────
function updatePlayerStats() {
  // Visual feedback when player changes
  const sel = document.getElementById('playerSelect');
  if (!sel) return;
}

function selectPhase(btn, phase) {
  document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPhase = phase;
}

function selectToggle(group, activeId, inactiveId) {
  document.getElementById(activeId).classList.add('active');
  document.getElementById(inactiveId).classList.remove('active');
  dewActive = group;
}

function updateSliderDisplay(el, displayId) {
  document.getElementById(displayId).textContent = el.value;
}

function setForm(n) {
  formRating = n;
  const stars = document.querySelectorAll('.form-star');
  stars.forEach((s, i) => s.classList.toggle('active', i < n));
}

// ──────────────────────────────────────────────
// PREDICTION ENGINE
// ──────────────────────────────────────────────
function runPrediction() {
  const player = document.getElementById('playerSelect').value;
  const opponent = document.getElementById('opponentSelect').value;
  const venue = document.getElementById('venueSelect').value;
  const pitch = parseInt(document.getElementById('pitchSlider').value);
  const dew = document.getElementById('dewYes').classList.contains('active');

  // Show loading
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');
  let pct = 0;
  const fill = document.getElementById('loadingFill');
  const interval = setInterval(() => {
    pct += Math.random() * 8 + 2;
    if (pct > 100) pct = 100;
    fill.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.remove('active');
        fill.style.width = '0%';
        displayPrediction(player, opponent, venue, pitch, dew);
      }, 400);
    }
  }, 80);
}

function displayPrediction(player, opponent, venue, pitch, dew) {
  const pdata = CSK_PLAYERS.find(p => p.id === player);
  const oppFactor = OPPONENT_FACTOR[opponent] || 0.9;
  const venueFactor = VENUE_FACTOR[venue] || 1.0;
  const pitchFactor = 0.7 + (pitch / 10) * 0.6;
  const dewFactor = dew ? 1.05 : 1.0;
  const formFactor = 0.7 + (formRating / 5) * 0.6;
  const phaseFactor = selectedPhase === 'death' ? 1.2 : selectedPhase === 'powerplay' ? 1.05 : 0.95;

  const baseRuns = pdata.avg || 30;
  const baseSR = pdata.sr || 120;

  const predictedRuns = Math.round(baseRuns * oppFactor * venueFactor * pitchFactor * dewFactor * formFactor * phaseFactor);
  const predictedSR = Math.round(baseSR * oppFactor * venueFactor * pitchFactor * dewFactor * formFactor);
  const predictedBoundaries = Math.round(predictedRuns / 12 + Math.random() * 3);
  const confidence = Math.round(75 + (formRating / 5) * 15 + (pitch / 10) * 8 + Math.random() * 5);

  const attackPct = Math.min(Math.round(oppFactor * venueFactor * phaseFactor * 88), 100);
  const consistPct = Math.min(Math.round(formFactor * 90), 100);
  const pressurePct = pdata.id === 'dhoni' ? 99 : Math.min(Math.round((formFactor + pitchFactor) / 2 * 85), 100);
  const venuePct = Math.min(Math.round(venueFactor * 88), 100);

  const insights = [
    `${pdata.emoji} ${pdata.name} is predicted to score ${predictedRuns} runs with a SR of ${predictedSR}. ${dew ? 'Dew conditions favor batsmen tonight. ' : ''}${selectedPhase === 'death' ? 'Death-over specialist mode activated! 🔥' : ''}`,
    `Based on head-to-head history, ${pdata.name} has a strong record against ${opponent.toUpperCase()}. Venue factor is ${(venueFactor * 100).toFixed(0)}%.`,
    `AI Model confidence: ${confidence}%. Form factor (${formRating}/5 stars) and pitch score (${document.getElementById('pitchSlider').value}/10) are key drivers.`,
    pdata.id === 'dhoni' ? `👑 Thala mode: MS Dhoni thrives under pressure. His calm demeanor and experience give him a +12% pressure bonus automatically!` : `💡 ${pdata.name} shows great potential in ${selectedPhase} overs. Predicted impact score: ${Math.round(predictedRuns * predictedSR / 1000)}.`,
  ];

  // Update DOM
  document.getElementById('resultName').textContent = pdata.name;
  document.getElementById('resultVs').textContent = `vs ${opponent.toUpperCase()} at ${venue}`;
  document.getElementById('resultAvatar').textContent = pdata.emoji;
  document.getElementById('confValue').textContent = Math.min(confidence, 99) + '%';
  document.getElementById('predRuns').textContent = predictedRuns;
  document.getElementById('predSR').textContent = predictedSR;
  document.getElementById('predBoundaries').textContent = predictedBoundaries;

  // Bars
  setTimeout(() => {
    setBar('attackBar', 'attackPct', attackPct);
    setBar('consistBar', 'consistPct', consistPct);
    setBar('pressureBar', 'pressurePct', pressurePct);
    setBar('venueBar', 'venuePct', venuePct);
  }, 100);

  document.getElementById('insightText').textContent = insights[Math.floor(Math.random() * insights.length)];

  // Show result
  document.getElementById('resultPlaceholder').style.display = 'none';
  const rc = document.getElementById('resultContent');
  rc.style.display = 'block';
  rc.style.opacity = 0;
  setTimeout(() => { rc.style.transition = 'opacity 0.5s'; rc.style.opacity = 1; }, 50);
}

function setBar(barId, pctId, value) {
  document.getElementById(barId).style.width = value + '%';
  document.getElementById(pctId).textContent = value + '%';
}

function resetPrediction() {
  document.getElementById('resultContent').style.display = 'none';
  document.getElementById('resultPlaceholder').style.display = 'flex';
}

function sharePrediction() {
  const text = `🦁 CSK Predictor says: ${document.getElementById('resultName').textContent} will score ${document.getElementById('predRuns').textContent} runs with SR ${document.getElementById('predSR').textContent}! Whistle Podu! 🎺 #CSK #YelloveForever`;
  if (navigator.share) {
    navigator.share({ title: 'CSK Prediction', text }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text);
    alert('Prediction copied to clipboard! Share it! 🦁');
  }
}

// ──────────────────────────────────────────────
// QUOTES
// ──────────────────────────────────────────────
function nextQuote() {
  currentQuoteIndex = (currentQuoteIndex + 1) % DHONI_QUOTES.length;
  const el = document.getElementById('dhoniQuote');
  el.style.opacity = 0;
  setTimeout(() => {
    el.textContent = DHONI_QUOTES[currentQuoteIndex];
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = 1;
  }, 250);
}

// Auto-rotate quotes
setInterval(nextQuote, 8000);

// ──────────────────────────────────────────────
// SCROLL ANIMATIONS
// ──────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

  // Add animate-in to cards
  const cards = document.querySelectorAll('.predictor-card, .stats-card, .chart-container, .match-card, .player-card');
  cards.forEach(c => {
    c.classList.add('animate-in');
    observer.observe(c);
  });
}

// ──────────────────────────────────────────────
// COUNTER ANIMATION
// ──────────────────────────────────────────────
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const increment = target / 80;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString();
  }, 20);
}

// ──────────────────────────────────────────────
// CHART
// ──────────────────────────────────────────────
function initChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const runs    = [145, 178, 162, 195, 188, 210, 172, 203, 192, 208];
  const winRate = [60, 65, 70, 80, 75, 85, 72, 82, 88, 90];

  const W = canvas.parentElement.offsetWidth;
  const H = 300;
  canvas.width = W;
  canvas.height = H;

  const padL = 60, padR = 30, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxRuns = Math.max(...runs);
  const minRuns = Math.min(...runs);
  const maxWin  = 100;

  function getX(i) { return padL + (i / (labels.length - 1)) * chartW; }
  function getYRuns(v) { return padT + chartH - ((v - minRuns) / (maxRuns - minRuns + 20)) * chartH; }
  function getYWin(v) { return padT + chartH - (v / maxWin) * chartH; }

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padT + (i / 5) * chartH;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
  }

  // Runs area fill
  const gradRuns = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradRuns.addColorStop(0, 'rgba(255,193,7,0.3)');
  gradRuns.addColorStop(1, 'rgba(255,193,7,0.0)');
  ctx.beginPath();
  ctx.moveTo(getX(0), getYRuns(runs[0]));
  runs.forEach((v, i) => { if (i > 0) ctx.lineTo(getX(i), getYRuns(v)); });
  ctx.lineTo(getX(runs.length - 1), padT + chartH);
  ctx.lineTo(padL, padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradRuns;
  ctx.fill();

  // Runs line
  ctx.beginPath();
  ctx.strokeStyle = '#FFC107';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  runs.forEach((v, i) => { i === 0 ? ctx.moveTo(getX(i), getYRuns(v)) : ctx.lineTo(getX(i), getYRuns(v)); });
  ctx.stroke();

  // Win Rate line
  const gradWin = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradWin.addColorStop(0, 'rgba(0,102,204,0.2)');
  gradWin.addColorStop(1, 'rgba(0,102,204,0.0)');
  ctx.beginPath();
  ctx.moveTo(getX(0), getYWin(winRate[0]));
  winRate.forEach((v, i) => { if (i > 0) ctx.lineTo(getX(i), getYWin(v)); });
  ctx.lineTo(getX(winRate.length - 1), padT + chartH);
  ctx.lineTo(padL, padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradWin;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#0066CC';
  ctx.lineWidth = 2.5;
  winRate.forEach((v, i) => { i === 0 ? ctx.moveTo(getX(i), getYWin(v)) : ctx.lineTo(getX(i), getYWin(v)); });
  ctx.stroke();

  // Data points - Runs
  runs.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(getX(i), getYRuns(v), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFC107';
    ctx.fill();
    ctx.strokeStyle = '#060B14';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Labels
  ctx.fillStyle = 'rgba(168, 181, 204, 0.7)';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => { ctx.fillText(l, getX(i), H - 10); });

  // Y-axis labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = minRuns + ((maxRuns - minRuns) / 4) * (4 - i);
    const y = padT + (i / 4) * chartH;
    ctx.fillText(Math.round(v), padL - 8, y + 4);
  }
}

// ──────────────────────────────────────────────
// RESIZE CHART
// ──────────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initChart, 200);
});
