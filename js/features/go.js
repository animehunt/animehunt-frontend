// ============================================================
// js/features/go.js
// go.html — Download session verify karo aur redirect karo
// Ye file go.html ke inline script ki jagah use hogi
// ============================================================

const BASE = 'https://animehunt-backend.animehunt715.workers.dev';

const params    = new URLSearchParams(location.search);
const sessionId = params.get('session');
const directUrl = params.get('url');

let sessionData = null;

// ---- DOM helper ----
const D = id => document.getElementById(id);
const delay = ms => new Promise(r => setTimeout(r, ms));

// ============================================================
// ANALYTICS PING
// ============================================================
async function track(event_type, extra = {}) {
  try {
    await fetch(`${BASE}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        event_data: JSON.stringify({
          session_id: sessionId,
          host_entry_id: sessionData?.host_entry_id || null,
          ...extra
        })
      })
    });
  } catch {}
}

// ============================================================
// PROGRESS UI
// ============================================================
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = D(`step${i}`);
    if (!el) continue;
    el.className = 'step-item' + (i < n ? ' done' : i === n ? ' active' : '');
  }
  const bar = D('progressBar');
  if (bar) bar.style.width = ((n - 1) / 3 * 100) + '%';
}

function setVStep(n) {
  for (let i = 1; i <= 5; i++) {
    const el = D(`vs${i}`);
    if (!el) continue;
    el.className = 'vs-item' + (i < n ? ' done' : i === n ? ' active' : '');
  }
}

function showError(msg) {
  const err = D('errorBox');
  if (err) { err.textContent = '⚠️ ' + msg; err.style.display = 'block'; }
  const icon = D('stateIcon'); if (icon) icon.textContent = '❌';
  const title = D('stateTitle'); if (title) title.textContent = 'Something went wrong';
  const sub = D('stateSub'); if (sub) sub.textContent = 'Please go back and try again.';
  const bar = D('progressBar'); if (bar) bar.style.width = '100%';
}

// ============================================================
// AD / POPUP RUNNERS (backend se aate hain)
// ============================================================
function runPopupScript(script) {
  if (!script) return;
  try {
    const s = document.createElement('script');
    s.textContent = script.replace(/<\/?script[^>]*>/gi, '');
    document.head.appendChild(s);
  } catch (e) { console.warn('Popup:', e); }
}

function runAd(adCode, adType) {
  if (!adCode) return;
  try {
    if (adType === 'redirect' || adType === 'popup') {
      window.open(adCode, '_blank', 'noopener,noreferrer');
    } else {
      const s = document.createElement('script');
      s.textContent = adCode.replace(/<\/?script[^>]*>/gi, '');
      document.head.appendChild(s);
    }
  } catch (e) { console.warn('Ad:', e); }
}

// ============================================================
// PRE-FLOW (verify button se pehle)
// ============================================================
async function runPreFlow(s) {
  if (s.popup_script) {
    runPopupScript(s.popup_script);
    track('popup_open');
    track('popup_view');
    await delay(300);
  }
  if (s.pre_ad_code) {
    runAd(s.pre_ad_code, s.pre_ad_type);
    await delay(400);
  }
}

// ============================================================
// VERIFY FLOW (button click ke baad)
// ============================================================
async function runVerifyFlow(s) {
  const verifyBtn = D('verifyBtn');
  if (verifyBtn) {
    verifyBtn.classList.add('loading');
    verifyBtn.disabled = true;
  }

  setVStep(1);
  await delay(600);
  setVStep(2);

  if (s.verify_popup_script) {
    runPopupScript(s.verify_popup_script);
    track('popup_open');
    track('popup_view');
    await delay(500);
  }

  setVStep(3);
  await delay(400);

  if (s.verify_ad_code) {
    runAd(s.verify_ad_code, s.verify_ad_type);
    await delay(300);
  }

  setVStep(4);
  await delay(300);
  setVStep(5);
  await delay(200);

  // Final redirect
  track('download_start');
  window.location.href = s.download_url || s.link || s.url || '/';
}

// ============================================================
// MAIN — Session load karo
// ============================================================
async function init() {
  // Direct URL redirect (no session)
  if (directUrl && !sessionId) {
    await delay(1500);
    window.location.href = decodeURIComponent(directUrl);
    return;
  }

  if (!sessionId) {
    showError('No session ID provided.');
    return;
  }

  setStep(1);

  try {
    setStep(2);
    const res = await fetch(`${BASE}/api/session/${encodeURIComponent(sessionId)}`);
    const j   = await res.json();

    if (!j.success || !j.data) {
      showError(j.error || 'Session expired or invalid.');
      return;
    }

    sessionData = j.data;
    setStep(3);

    // Pre-flow (ads before verify)
    await runPreFlow(sessionData);

    setStep(4);

    // Show verify button
    const verifySection = D('verifySection');
    if (verifySection) verifySection.style.display = 'block';

    // Update UI with file info
    const sub = D('stateSub');
    if (sub && sessionData.filename) {
      sub.textContent = sessionData.filename;
    }

    // Verify button click
    const verifyBtn = D('verifyBtn');
    verifyBtn?.addEventListener('click', async () => {
      await runVerifyFlow(sessionData);
    });

    track('session_loaded');

  } catch (err) {
    console.error('Go page error:', err);
    showError('Failed to load session. Please try again.');
  }
}

init();
