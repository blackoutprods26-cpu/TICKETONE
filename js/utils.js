// ==============================
// TICKETONE — Utility Functions
// ==============================

// ── ID Generation ─────────────────────────────────────────────────────
function generateTicketId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'TKT-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// ── Date & Time Formatting ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5) + 'h';
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

// ── Toast Notifications ────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--show'));

  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal Control ──────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('modal--open');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('modal--open');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal--open').forEach(m => {
      m.classList.remove('modal--open');
      document.body.style.overflow = '';
    });
  }
});

// ── Loading Overlay ────────────────────────────────────────────────────
function showLoading(text = 'Cargando...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-box">
        <div class="loading-spinner"></div>
        <p id="loading-text">${text}</p>
      </div>`;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loading-text').textContent = text;
  }
  overlay.classList.add('loading--active');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('loading--active');
}

// ── CSV Export ─────────────────────────────────────────────────────────
function exportToCSV(data, filename) {
  if (!data || !data.length) { showToast('No hay datos para exportar', 'warning'); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Capacity Helpers ───────────────────────────────────────────────────
function getCapacityColor(remaining, capacity) {
  const pct = (remaining / capacity) * 100;
  if (pct === 0) return 'var(--danger)';
  if (pct <= 20) return 'var(--warning)';
  return 'var(--success)';
}

function getCapacityLabel(remaining) {
  if (remaining === 0) return 'Agotado';
  if (remaining <= 20) return `¡Solo quedan ${remaining}!`;
  return `${remaining} disponibles`;
}

// ── URL Params ─────────────────────────────────────────────────────────
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ── Dark Mode ──────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('to_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeToggle(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('to_theme', next);
  updateThemeToggle(next);
}

function updateThemeToggle(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── Sanitize ───────────────────────────────────────────────────────────
function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Debounce ───────────────────────────────────────────────────────────
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── QR Code URL (for emails via external service) ──────────────────────
function getQrUrl(ticketId, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(ticketId)}&color=1A6EF7&bgcolor=03061A`;
}

// ── Generate QR inline (canvas) ────────────────────────────────────────
function generateQRCanvas(containerId, text, size = 200) {
  const container = document.getElementById(containerId);
  if (!container || typeof QRCode === 'undefined') return;
  container.innerHTML = '';
  new QRCode(container, {
    text: text,
    width: size,
    height: size,
    colorDark: '#1A6EF7',
    colorLight: '#03061A',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ── PDF Ticket Download ────────────────────────────────────────────────
async function downloadTicketPDF(ticket, event) {
  if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    showToast('Librería PDF no disponible', 'error');
    return;
  }
  const { jsPDF: PDF } = window.jspdf || { jsPDF };
  const doc = new PDF({ orientation: 'portrait', unit: 'mm', format: [90, 150] });

  // Background
  doc.setFillColor(3, 6, 26);
  doc.rect(0, 0, 90, 150, 'F');

  // Header bar
  doc.setFillColor(26, 110, 247);
  doc.rect(0, 0, 90, 22, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TICKETONE', 45, 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Entrada Gratuita', 45, 17, { align: 'center' });

  // Event name
  doc.setTextColor(232, 238, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(ticket.eventName || event?.title || '', 78);
  doc.text(lines, 45, 32, { align: 'center' });

  // Divider dots
  doc.setDrawColor(26, 110, 247);
  doc.setLineDashPattern([1, 2], 0);
  doc.line(5, 50, 85, 50);
  doc.setLineDashPattern([], 0);

  // Info fields
  doc.setTextColor(143, 163, 201);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const infoY = [60, 70, 80, 90];
  const labels = ['FECHA', 'HORA', 'LUGAR', 'TITULAR'];
  const values = [
    formatDate(event?.date || ticket.eventDate),
    formatTime(event?.time || ticket.eventTime),
    event?.location || ticket.eventLocation || '',
    ticket.name || ''
  ];

  labels.forEach((lbl, i) => {
    doc.setTextColor(74, 96, 128);
    doc.text(lbl, 7, infoY[i]);
    doc.setTextColor(232, 238, 255);
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(values[i], 60), 7, infoY[i] + 4);
    doc.setFontSize(7);
  });

  // Ticket ID
  doc.setTextColor(26, 110, 247);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.ticketId, 45, 108, { align: 'center' });

  // QR image
  try {
    const qrImgUrl = getQrUrl(ticket.ticketId, 150);
    const imgData = await fetchImageAsBase64(qrImgUrl);
    if (imgData) doc.addImage(imgData, 'PNG', 25, 112, 40, 40);
  } catch (_) {
    doc.setTextColor(143, 163, 201);
    doc.setFontSize(7);
    doc.text('Escanea el QR en la web', 45, 130, { align: 'center' });
  }

  // Bottom
  doc.setTextColor(74, 96, 128);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('ticketone.vercel.app', 45, 148, { align: 'center' });

  doc.save(`entrada-${ticket.ticketId}.pdf`);
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Admin Auth Check ───────────────────────────────────────────────────
async function requireAdmin(redirectTo = '/admin/login') {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = redirectTo;
        return reject('No auth');
      }
      try {
        const snap = await db.collection('admins').doc(user.uid).get();
        if (!snap.exists) {
          await auth.signOut();
          window.location.href = redirectTo;
          return reject('Not admin');
        }
        resolve(user);
      } catch (e) {
        window.location.href = redirectTo;
        reject(e);
      }
    });
  });
}

// ── Log Admin Activity ─────────────────────────────────────────────────
async function logActivity(action, details) {
  try {
    const user = auth.currentUser;
    await db.collection('activity_log').add({
      action,
      details,
      adminEmail: user?.email || 'unknown',
      adminUid: user?.uid || 'unknown',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (_) { /* non-critical */ }
}

// Init theme on load
document.addEventListener('DOMContentLoaded', initTheme);
