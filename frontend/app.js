/* ═══════════════════════════════════════════════════════════
   NIRNAY – Frontend Application Logic
   AI-based Traffic Risk Heatmap & Police Deployment
   ═══════════════════════════════════════════════════════════ */

// ── Configuration ─────────────────────────────────────────
const CONFIG = {
  API_BASE: localStorage.getItem('nirnay_api_base') || 'https://nienay.onrender.com',
  MAP_CENTER: [21.1458, 79.0882],  // Nagpur City center (Sitabuldi)
  MAP_ZOOM: 13,
  TILE_URL: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  TILE_ATTR: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  DEMO_CREDENTIALS: {
    citizen: { username: 'demo_citizen', password: 'citizen123' },
    police:  { username: 'demo_police',  password: 'nirnay2026' },
  },
  RISK_COLORS: {
    low:      { fill: '#3ecf8e', stroke: '#2da06d' },
    medium:   { fill: '#e6b422', stroke: '#c49a1c' },
    high:     { fill: '#f06533', stroke: '#c74f22' },
    critical: { fill: '#e0445c', stroke: '#b8364a' },
  },
};


// ── Application State ─────────────────────────────────────
const state = {
  role: 'citizen',         // 'citizen' | 'police'
  token: null,
  user: null,
  connected: false,
  junctions: [],           // from /api/risk-map
  selectedJunction: null,
  incidentCoords: null,    // { lat, lng } from map click
  detailPanelOpen: false,
  trendChart: null,        // Chart.js instance
};


// ── DOM References ────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let map, markersLayer, heatCircles = [];


// ══════════════════════════════════════════════════════════
//  INITIALIZATION
// ══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  bindEvents();
  checkConnection();
  // Auto-login as citizen for quick demo
  autoLogin('citizen');
});


// ── Map Init ──────────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: CONFIG.MAP_CENTER,
    zoom: CONFIG.MAP_ZOOM,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer(CONFIG.TILE_URL, {
    attribution: CONFIG.TILE_ATTR,
    maxZoom: 19,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Map click handler for incident reporting
  map.on('click', (e) => {
    if (state.role === 'citizen') {
      setIncidentCoords(e.latlng.lat, e.latlng.lng);
    }
  });
}


// ── Event Bindings ────────────────────────────────────────
function bindEvents() {
  // Role toggle
  $$('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => switchRole(btn.dataset.role));
  });

  // API config
  $('#btn-api-config').addEventListener('click', openApiConfigModal);

  // Incident form submit
  $('#incident-form').addEventListener('submit', handleIncidentSubmit);

  // Detail panel close
  $('#detail-panel-close').addEventListener('click', closeDetailPanel);

  // Quick login buttons
  $('#btn-login-citizen').addEventListener('click', () => autoLogin('citizen'));
  $('#btn-login-police').addEventListener('click', () => autoLogin('police'));

  // Refresh data
  $('#btn-refresh').addEventListener('click', refreshData);
}


// ══════════════════════════════════════════════════════════
//  API CLIENT
// ══════════════════════════════════════════════════════════

async function apiRequest(path, options = {}) {
  const url = `${CONFIG.API_BASE}${path}`;
  const headers = { ...options.headers };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  if (options.json) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.json);
    delete options.json;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      updateConnectionStatus(false);
    }
    throw err;
  }
}


// ── Health Check ──────────────────────────────────────────
async function checkConnection() {
  try {
    const data = await apiRequest('/api/health');
    updateConnectionStatus(true);
    return true;
  } catch {
    updateConnectionStatus(false);
    return false;
  }
}

function updateConnectionStatus(connected) {
  state.connected = connected;
  const badge = $('#connection-badge');
  const dot = badge.querySelector('.connection-dot');
  const text = badge.querySelector('.connection-text');

  if (connected) {
    badge.classList.remove('disconnected');
    text.textContent = 'Connected';
  } else {
    badge.classList.add('disconnected');
    text.textContent = 'Disconnected';
  }
}


// ── Auth ──────────────────────────────────────────────────
async function autoLogin(role) {
  const creds = CONFIG.DEMO_CREDENTIALS[role];
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      json: creds,
    });
    state.token = data.access_token;
    state.user = { username: data.username, role: data.role };
    updateUserUI();
    switchRole(role);
    showToast('success', 'Logged In', `Welcome, ${data.username}! (${data.role})`);
    refreshData();
  } catch (err) {
    showToast('error', 'Login Failed', err.message);
  }
}

function updateUserUI() {
  if (!state.user) return;
  const initials = state.user.username.substring(0, 2).toUpperCase();
  $('#user-avatar').textContent = initials;
  $('#user-name').textContent = state.user.username;
  const badge = $('#user-role-badge');
  badge.textContent = state.user.role;
  badge.className = `user-role-badge ${state.user.role}`;
}


// ══════════════════════════════════════════════════════════
//  ROLE SWITCHING
// ══════════════════════════════════════════════════════════

function switchRole(role) {
  state.role = role;

  // Update toggle buttons
  $$('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });

  // Toggle views
  $('#citizen-sidebar').style.display = role === 'citizen' ? 'flex' : 'none';
  $('#police-sidebar').style.display = role === 'police' ? 'flex' : 'none';

  // Close detail panel on switch
  closeDetailPanel();

  // Re-login if needed
  if (state.user && state.user.role !== role) {
    autoLogin(role);
  }
}


// ══════════════════════════════════════════════════════════
//  DATA LOADING
// ══════════════════════════════════════════════════════════

async function refreshData() {
  const ok = await checkConnection();
  if (!ok) {
    showToast('error', 'Connection Error', 'Cannot reach the backend API.');
    return;
  }

  try {
    await loadRiskMap();
    showToast('info', 'Data Refreshed', 'Risk map data updated successfully.');
  } catch (err) {
    showToast('error', 'Load Error', err.message);
  }
}


// ── Risk Map ──────────────────────────────────────────────
async function loadRiskMap() {
  const data = await apiRequest('/api/risk-map');
  state.junctions = data.junctions;
  renderHeatmapOnMap(data.junctions);
  renderJunctionList(data.junctions);
}

function renderHeatmapOnMap(junctions) {
  // Clear existing circles
  heatCircles.forEach(c => map.removeLayer(c));
  heatCircles = [];
  markersLayer.clearLayers();

  junctions.forEach(j => {
    const colors = CONFIG.RISK_COLORS[j.risk_level] || CONFIG.RISK_COLORS.low;
    const radius = mapScoreToRadius(j.risk_score);

    // Gradient circle
    const circle = L.circleMarker([j.latitude, j.longitude], {
      radius: radius,
      fillColor: colors.fill,
      fillOpacity: 0.35,
      color: colors.stroke,
      weight: 2,
      opacity: 0.8,
    }).addTo(map);

    // Popup content
    const popupHtml = buildJunctionPopup(j);
    circle.bindPopup(popupHtml, { maxWidth: 280, className: 'nirnay-popup' });

    circle.on('click', () => {
      openJunctionDetail(j.junction_id);
    });

    heatCircles.push(circle);

    // Score label marker
    const scoreIcon = L.divIcon({
      className: 'score-label',
      html: `<div style="
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: ${colors.fill};
        text-shadow: 0 0 6px ${colors.fill}40;
        text-align: center;
        pointer-events: none;
      ">${Math.round(j.risk_score)}</div>`,
      iconSize: [30, 20],
      iconAnchor: [15, 10],
    });

    L.marker([j.latitude, j.longitude], { icon: scoreIcon, interactive: false }).addTo(markersLayer);
  });
}

function mapScoreToRadius(score) {
  return Math.max(14, Math.min(40, score * 0.4));
}

function buildJunctionPopup(j) {
  const colors = CONFIG.RISK_COLORS[j.risk_level];
  const factors = (j.key_factors || []).slice(0, 3).map(f =>
    `<li>${f.replace('[DEMO] ', '')}</li>`
  ).join('');

  return `
    <div class="popup-content">
      <div class="popup-title">${j.junction_name.replace('[DEMO] ', '')}</div>
      <div class="popup-score">
        <span class="popup-score-value" style="color: ${colors.fill}">${Math.round(j.risk_score)}</span>
        <span class="risk-badge ${j.risk_level}">${j.risk_level.toUpperCase()}</span>
      </div>
      <ul class="popup-factors">${factors}</ul>
      <div class="popup-actions">
        <button class="btn btn-sm btn-primary" onclick="openJunctionDetail('${j.junction_id}')">
          View Details →
        </button>
      </div>
    </div>
  `;
}


// ── Junction List (Sidebar) ─────────────────────────────
function renderJunctionList(junctions) {
  const citizenList = $('#citizen-junction-list');
  const policeList = $('#police-junction-list');

  const html = junctions.map(j => {
    const colors = CONFIG.RISK_COLORS[j.risk_level];
    return `
      <div class="junction-item animate-in" data-junction-id="${j.junction_id}" onclick="onJunctionClick('${j.junction_id}')">
        <div class="score-circle ${j.risk_level}" style="width:40px;height:40px;font-size:0.8rem;">
          ${Math.round(j.risk_score)}
        </div>
        <div class="junction-info">
          <div class="junction-name">${j.junction_name.replace('[DEMO] ', '')}</div>
          <div class="junction-zone">${j.junction_id} · <span class="risk-badge ${j.risk_level}" style="font-size:0.6rem;padding:1px 6px;">${j.risk_level}</span></div>
        </div>
      </div>
    `;
  }).join('');

  if (citizenList) citizenList.innerHTML = html;
  if (policeList) policeList.innerHTML = html;
}

function onJunctionClick(junctionId) {
  const j = state.junctions.find(x => x.junction_id === junctionId);
  if (!j) return;

  // Pan map to junction
  map.flyTo([j.latitude, j.longitude], 15, { duration: 0.8 });

  // Highlight in sidebar
  $$('.junction-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.junctionId === junctionId);
  });

  openJunctionDetail(junctionId);
}


// ══════════════════════════════════════════════════════════
//  DETAIL PANEL
// ══════════════════════════════════════════════════════════

async function openJunctionDetail(junctionId) {
  state.selectedJunction = junctionId;

  const panel = $('#detail-panel');
  const content = $('#detail-panel-body');

  // Show loading
  panel.classList.add('open');
  state.detailPanelOpen = true;
  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:200px;">
      <div class="loading-spinner"></div>
    </div>
  `;

  try {
    // Load risk details
    const risk = await apiRequest(`/api/risk/${junctionId}`);
    const trend = await apiRequest(`/api/risk/${junctionId}/trend`);

    renderDetailPanel(risk, trend);
  } catch (err) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">${err.message}</div>
      </div>
    `;
  }
}

function renderDetailPanel(risk, trend) {
  const content = $('#detail-panel-body');
  const title = $('#detail-panel-title');

  title.textContent = risk.junction_name.replace('[DEMO] ', '');

  const colors = CONFIG.RISK_COLORS[risk.risk_level];

  // Build factor bars
  const factorBars = Object.entries(risk.factor_values).map(([name, detail]) => {
    const color = detail.raw_score > 70 ? CONFIG.RISK_COLORS.critical.fill :
                  detail.raw_score > 50 ? CONFIG.RISK_COLORS.high.fill :
                  detail.raw_score > 30 ? CONFIG.RISK_COLORS.medium.fill :
                  CONFIG.RISK_COLORS.low.fill;
    return `
      <div class="factor-bar-container">
        <div class="factor-bar-label">
          <span class="factor-bar-name">${name.replace(/_/g, ' ')}</span>
          <span class="factor-bar-value" style="color:${color}">${Math.round(detail.raw_score)}</span>
        </div>
        <div class="factor-bar">
          <div class="factor-bar-fill" style="width:${detail.raw_score}%;background:${color};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Key factors list
  const keyFactors = (risk.key_factors || []).map(f =>
    `<li style="font-size:0.78rem;color:var(--text-secondary);padding:3px 0;">▸ ${f.replace('[DEMO] ', '')}</li>`
  ).join('');

  content.innerHTML = `
    <div class="animate-slide-up">
      <!-- Score Header -->
      <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-xl);">
        <div class="score-circle ${risk.risk_level}">
          ${Math.round(risk.risk_score)}
        </div>
        <div>
          <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Risk Score</div>
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-top:4px;">
            <span class="risk-badge ${risk.risk_level}">${risk.risk_level.toUpperCase()}</span>
            <span style="font-size:0.72rem;color:var(--text-muted);">
              ${trend.trend_direction === 'INCREASING' ? '📈 Increasing' :
                trend.trend_direction === 'DECREASING' ? '📉 Decreasing' : '➡️ Stable'}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" style="margin-bottom:var(--space-lg);">
        <div class="stat-item">
          <div class="stat-label">Junction ID</div>
          <div class="stat-value" style="font-size:0.9rem;color:var(--accent-blue);">${risk.junction_id}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Coordinates</div>
          <div class="stat-value" style="font-size:0.75rem;">${risk.latitude.toFixed(4)}, ${risk.longitude.toFixed(4)}</div>
        </div>
      </div>

      <!-- Factor Breakdown -->
      <div class="glass-card" style="margin-bottom:var(--space-lg);">
        <div class="card-title" style="margin-bottom:var(--space-md);">
          <span class="icon">📊</span> Risk Factor Breakdown
        </div>
        ${factorBars}
      </div>

      <!-- Key Factors -->
      <div class="glass-card" style="margin-bottom:var(--space-lg);">
        <div class="card-title" style="margin-bottom:var(--space-sm);">
          <span class="icon">🔑</span> Key Factors
        </div>
        <ul style="list-style:none;padding:0;margin:0;">
          ${keyFactors}
        </ul>
      </div>

      <!-- Trend Chart -->
      <div class="glass-card" style="margin-bottom:var(--space-lg);">
        <div class="card-title" style="margin-bottom:var(--space-sm);">
          <span class="icon">📈</span> Risk Trend (Last 6 Hours)
        </div>
        <div class="trend-chart-container">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>

      ${state.role === 'police' ? renderDeploymentSection(risk) : ''}
    </div>
  `;

  // Render trend chart
  renderTrendChart(trend);
}

function renderDeploymentSection(risk) {
  return `
    <div class="glass-card">
      <div class="card-title" style="margin-bottom:var(--space-md);">
        <span class="icon">🚔</span> AI Deployment Recommendation
      </div>
      <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:var(--space-md);">
        Based on the current risk level of <strong style="color:${CONFIG.RISK_COLORS[risk.risk_level].fill}">${risk.risk_level.toUpperCase()}</strong>,
        AI recommends deploying officers to this junction.
      </p>
      <button class="btn btn-primary btn-sm" onclick="loadDeploymentRecommendation('${risk.junction_id}')">
        🤖 Get AI Recommendation
      </button>
      <div id="deployment-result" style="margin-top:var(--space-md);"></div>
    </div>
  `;
}


// ── Deployment Recommendation ─────────────────────────────
async function loadDeploymentRecommendation(junctionId) {
  const container = $('#deployment-result');
  container.innerHTML = '<div class="loading-spinner" style="margin:var(--space-md) auto;"></div>';

  try {
    const data = await apiRequest(`/api/deployment/recommend/${junctionId}`);

    if (data.recommended_officers.length === 0) {
      container.innerHTML = `
        <div style="font-size:0.8rem;color:var(--text-muted);text-align:center;padding:var(--space-md);">
          No officers available for deployment at this time.
        </div>
      `;
      return;
    }

    const officers = data.recommended_officers.map(o => `
      <div class="officer-item">
        <div class="officer-badge">👮</div>
        <div class="officer-info">
          <div class="officer-id">${o.officer_id}</div>
          <div class="officer-meta">${o.distance_km.toFixed(1)} km · ~${Math.round(o.estimated_response_minutes)} min</div>
        </div>
        <span class="officer-status available">AVAILABLE</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="animate-in">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:var(--space-sm);">
          Coverage Gap: ${data.coverage_gap} officers needed
        </div>
        ${officers}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="font-size:0.8rem;color:var(--status-error);">${err.message}</div>
    `;
  }
}


// ── Trend Chart ───────────────────────────────────────────
function renderTrendChart(trendData) {
  if (state.trendChart) {
    state.trendChart.destroy();
  }

  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const history = trendData.history || [];

  if (history.length === 0) {
    canvas.parentElement.innerHTML = `
      <div class="empty-state" style="height:100%;">
        <div class="empty-state-text">No trend data available</div>
      </div>
    `;
    return;
  }

  const labels = history.map((h, i) => `${i + 1}h ago`).reverse();
  const scores = history.map(h => h.risk_score).reverse();

  // Determine gradient colors based on latest score
  const latestScore = scores[scores.length - 1];
  const riskLevel = latestScore >= 80 ? 'critical' : latestScore >= 60 ? 'high' : latestScore >= 35 ? 'medium' : 'low';
  const lineColor = CONFIG.RISK_COLORS[riskLevel].fill;

  state.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Risk Score',
        data: scores,
        borderColor: lineColor,
        backgroundColor: lineColor + '15',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'hsl(225, 25%, 15%)',
          titleColor: '#fff',
          bodyColor: '#ccc',
          borderColor: 'hsla(225, 40%, 40%, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'hsla(225, 20%, 30%, 0.2)' },
          ticks: { color: 'hsl(215, 15%, 50%)', font: { size: 10 } },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'hsla(225, 20%, 30%, 0.2)' },
          ticks: { color: 'hsl(215, 15%, 50%)', font: { size: 10 } },
        },
      },
    },
  });
}


// ══════════════════════════════════════════════════════════
//  CITIZEN: INCIDENT REPORTING
// ══════════════════════════════════════════════════════════

let incidentMarker = null;

function setIncidentCoords(lat, lng) {
  state.incidentCoords = { lat, lng };
  $('#incident-lat').value = lat.toFixed(6);
  $('#incident-lng').value = lng.toFixed(6);

  // Place / move marker
  if (incidentMarker) {
    incidentMarker.setLatLng([lat, lng]);
  } else {
    const icon = L.divIcon({
      className: 'incident-pin',
      html: `<div style="
        width: 28px; height: 28px;
        background: linear-gradient(135deg, hsl(0, 80%, 55%), hsl(25, 95%, 55%));
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
      "><span style="transform:rotate(45deg);font-size:12px;">📍</span></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    incidentMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
    incidentMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setIncidentCoords(pos.lat, pos.lng);
    });
  }

  showToast('info', 'Location Set', `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
}

async function handleIncidentSubmit(e) {
  e.preventDefault();

  if (!state.token) {
    showToast('error', 'Not Logged In', 'Please log in to report an incident.');
    return;
  }

  const lat = parseFloat($('#incident-lat').value);
  const lng = parseFloat($('#incident-lng').value);
  const type = $('#incident-type').value;

  if (!lat || !lng) {
    showToast('warning', 'Missing Coordinates', 'Click on the map to set incident location.');
    return;
  }

  const formData = new FormData();
  formData.append('incident_type', type);
  formData.append('latitude', lat);
  formData.append('longitude', lng);

  const photoInput = $('#incident-photo');
  if (photoInput.files.length > 0) {
    formData.append('photo', photoInput.files[0]);
  }

  try {
    const data = await fetch(`${CONFIG.API_BASE}/api/incidents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` },
      body: formData,
    });

    const result = await data.json();

    if (!data.ok) {
      throw new Error(result.detail || `HTTP ${data.status}`);
    }

    showToast('success', 'Incident Reported!', result.message);

    // Clear form
    $('#incident-form').reset();
    state.incidentCoords = null;
    if (incidentMarker) {
      map.removeLayer(incidentMarker);
      incidentMarker = null;
    }
  } catch (err) {
    showToast('error', 'Report Failed', err.message);
  }
}


// ══════════════════════════════════════════════════════════
//  DETAIL PANEL CONTROLS
// ══════════════════════════════════════════════════════════

function closeDetailPanel() {
  $('#detail-panel').classList.remove('open');
  state.detailPanelOpen = false;
  state.selectedJunction = null;

  $$('.junction-item').forEach(el => el.classList.remove('selected'));
}


// ══════════════════════════════════════════════════════════
//  API CONFIG MODAL
// ══════════════════════════════════════════════════════════

function openApiConfigModal() {
  const overlay = $('#modal-overlay');
  $('#api-url-input').value = CONFIG.API_BASE;
  overlay.classList.add('active');
}

function closeApiConfigModal() {
  $('#modal-overlay').classList.remove('active');
}

function saveApiConfig() {
  const url = $('#api-url-input').value.replace(/\/+$/, '');
  if (!url) return;

  CONFIG.API_BASE = url;
  localStorage.setItem('nirnay_api_base', url);
  closeApiConfigModal();
  showToast('info', 'API Updated', `Backend URL set to: ${url}`);
  checkConnection();
}


// ══════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════

function showToast(type, title, message) {
  const container = $('#toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}
