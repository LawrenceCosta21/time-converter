'use strict';

/* ── Timezone population ── */
const ALL_TZ = (() => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [
      'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
      'America/Anchorage','America/Sao_Paulo','America/Toronto','America/Vancouver',
      'Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome',
      'Europe/Moscow','Europe/Istanbul','Africa/Cairo','Africa/Lagos','Africa/Nairobi',
      'Asia/Dubai','Asia/Karachi','Asia/Kolkata','Asia/Dhaka','Asia/Bangkok',
      'Asia/Singapore','Asia/Tokyo','Asia/Shanghai','Asia/Seoul','Asia/Hong_Kong',
      'Australia/Sydney','Australia/Melbourne','Pacific/Auckland','Pacific/Honolulu',
    ];
  }
})();

const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function populateSelect(id) {
  const sel = document.getElementById(id);
  ALL_TZ.forEach(z => {
    const o = document.createElement('option');
    o.value = o.textContent = z;
    sel.appendChild(o);
  });
  sel.value = ALL_TZ.includes(USER_TZ) ? USER_TZ : 'UTC';
}

populateSelect('p1-tz');
populateSelect('p2-tz');

/* ── Tab switching ── */
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => {
    const active = t.id === 'tab-' + id;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });
  document.querySelectorAll('.panel').forEach(p => {
    const active = p.id === 'panel-' + id;
    p.classList.toggle('active', active);
    active ? p.removeAttribute('hidden') : p.setAttribute('hidden', '');
  });
}

/* ── Defaults ── */
const now = new Date();
document.getElementById('p1-date').value = now.toLocaleDateString('en-CA');
document.getElementById('p1-time').value = now.toTimeString().slice(0, 8);
document.getElementById('p2-epoch').value = Math.floor(Date.now() / 1000);

/* ── Live clock in header ── */
function tickClock() {
  const d = new Date();
  const s = d.toUTCString().replace('GMT', 'UTC');
  document.getElementById('now-strip').textContent = s;
}
tickClock();
setInterval(tickClock, 1000);

/* ── Panel 1: DateTime → Epoch ── */
function p1Convert() {
  const date = document.getElementById('p1-date').value;
  const time = document.getElementById('p1-time').value || '00:00:00';
  const tz   = document.getElementById('p1-tz').value;
  const err  = document.getElementById('p1-err');
  const box  = document.getElementById('p1-result');

  if (!date) { err.textContent = 'Please enter a date.'; box.setAttribute('hidden', ''); return; }
  err.textContent = '';

  try {
    const isoStr = date + 'T' + time;
    const ref    = new Date(isoStr + 'Z');
    const utcMs  = ref.getTime();

    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const lp = {};
    fmt.formatToParts(ref).forEach(p => (lp[p.type] = p.value));
    const localTs = Date.UTC(+lp.year, +lp.month - 1, +lp.day, +lp.hour, +lp.minute, +lp.second);
    const offset  = utcMs - localTs;

    const [yr, mo, dy] = date.split('-').map(Number);
    const [hh, mm, ss = 0] = time.split(':').map(Number);
    const epochMs = Date.UTC(yr, mo - 1, dy, hh, mm, ss) + offset;
    const epochS  = Math.floor(epochMs / 1000);

    document.getElementById('p1-s').textContent  = epochS;
    document.getElementById('p1-ms').textContent = epochMs;
    document.getElementById('p1-utc').textContent =
      'UTC: ' + new Date(epochMs).toISOString().replace('T', ' ').replace('Z', ' Z');

    box.removeAttribute('hidden');
  } catch {
    err.textContent = 'Could not convert. Check your inputs.';
    box.setAttribute('hidden', '');
  }
}

/* ── Panel 2: Epoch → DateTime ── */
let epUnit = 's';

function setUnit(u) {
  epUnit = u;
  document.getElementById('tog-s').classList.toggle('active',  u === 's');
  document.getElementById('tog-ms').classList.toggle('active', u === 'ms');
  const val = +document.getElementById('p2-epoch').value;
  if (!isNaN(val) && val) {
    document.getElementById('p2-epoch').value = u === 'ms' ? val * 1000 : Math.floor(val / 1000);
  }
  p2Convert();
}

function fmtTz(ms, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date(ms)).replace(',', '');
}

function getDOY(d) {
  return Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 0))) / 86400000);
}

function getWeek(d) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil((((x - yearStart) / 86400000) + 1) / 7);
}

function p2Convert() {
  const raw = document.getElementById('p2-epoch').value.trim();
  const err = document.getElementById('p2-err');
  const box = document.getElementById('p2-result');

  if (!raw) { err.textContent = ''; box.setAttribute('hidden', ''); return; }
  const num = Number(raw);
  if (isNaN(num)) { err.textContent = 'Please enter a valid number.'; box.setAttribute('hidden', ''); return; }
  err.textContent = '';

  const ms   = epUnit === 's' ? num * 1000 : num;
  const date = new Date(ms);

  if (isNaN(date.getTime())) { err.textContent = 'Timestamp out of range.'; box.setAttribute('hidden', ''); return; }

  document.getElementById('p2-utc').textContent  = fmtTz(ms, 'UTC');
  document.getElementById('p2-iso').textContent  = date.toISOString();

  document.getElementById('p2-local-name').textContent = USER_TZ;
  document.getElementById('p2-local').textContent      = fmtTz(ms, USER_TZ);

  const ctz = document.getElementById('p2-tz').value;
  document.getElementById('p2-custom-name').textContent = ctz;
  document.getElementById('p2-custom').textContent      = fmtTz(ms, ctz);

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  document.getElementById('p2-dow').textContent = DAYS[date.getUTCDay()];
  document.getElementById('p2-doy').textContent = getDOY(date);
  document.getElementById('p2-wk').textContent  = 'W' + String(getWeek(date)).padStart(2, '0');

  box.removeAttribute('hidden');
}

/* ── Copy ── */
function cp(valId, btnId) {
  const text = document.getElementById(valId).textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
  });
}

/* ── Event listeners ── */
['p1-date', 'p1-time', 'p1-tz'].forEach(id =>
  document.getElementById(id).addEventListener('input', p1Convert)
);
['p2-epoch', 'p2-tz'].forEach(id =>
  document.getElementById(id).addEventListener('input', p2Convert)
);

/* ── Init ── */
p1Convert();
p2Convert();

/* ── Expose globals for inline onclick ── */
window.switchTab = switchTab;
window.setUnit   = setUnit;
window.cp        = cp;
