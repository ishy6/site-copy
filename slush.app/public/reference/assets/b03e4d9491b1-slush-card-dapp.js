// ── DAPP KIT IMPORTS ─────────────────────────────
// Migrated from direct @mysten/slush-wallet + wallet-standard usage to the
// recommended @mysten/dapp-kit-core actions API. See:
// https://sdk.mystenlabs.com/dapp-kit/dapp-kit-instance
//
// Why this matters: dApp Kit interacts with the wallet standard differently
// (per Slush team) and is their recommended integration path. The previous
// direct standard:connect approach was hitting an intermittent
// `window.opener is not available` failure on mobile Safari that we couldn't
// resolve via sync-popup-trust patterns alone.
import { createDAppKit } from 'https://esm.sh/@mysten/dapp-kit-core@1.3.0?deps=@wallet-standard/errors@0.1.1';
import { SuiGrpcClient } from 'https://esm.sh/@mysten/sui@2.15.0/grpc';

// ── CONFIGURATION ─────────────────────────────
const API_BASE_URL = 'https://slush-card-waitlist-prod.mystenlabs.com';
const USE_MOCK_API = false;
const DAPP_NAME = 'Slush Card Waitlist';
const SLUSH_CHROME_URL = 'https://chromewebstore.google.com/detail/slush-sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil';
const OTP_LENGTH = 6;
const OTP_COOLDOWN_SEC = 60;

// dApp Kit instance — created once at module load. autoConnect: true handles
// silent reconnect on page reload for previously-connected users, replacing
// the manual { silent: true } pattern we used to have.
const dAppKit = createDAppKit({
  networks: ['mainnet'],
  defaultNetwork: 'mainnet',
  createClient: (network) =>
    new SuiGrpcClient({ network, baseUrl: 'https://fullnode.mainnet.sui.io:443' }),
  autoConnect: true,
  slushWalletConfig: { appName: DAPP_NAME },
});

const COUNTRY_NAMES = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  AU: 'Australia',
  BR: 'Brazil',
  IN: 'India',
  CN: 'China',
  RU: 'Russia',
  XX: 'Unknown',
};

// ── STATE ──────────────────────────────────────
let currentEmail = '';
let verificationToken = null;
let waitlistPosition = null;
let detectedCountry = { countryCode: 'XX', region: 'XX' };
let resendTimer = null;
let resendCountdown = 0;
// Tracks whether a Slush-compatible wallet was found at init time. Comes from
// dAppKit.stores.$wallets — set in initWallet().
let slushWallet = null;
let connectedAddress = null;
let returnToken = null;
let deviceToken = null;
let slushInAppContext = false;
let injectedWalletAddress = null;
let softHoldExpiresAt = null;
let walletConnectInFlight = false;

const SUI_ADDRESS_RE = /^0x[a-fA-F0-9]{64}$/;


function getActiveWalletBtn() {
  const ids = [
    'wallet-connect-btn',
    'wallet-connect-btn-success-email-only',
    'wallet-connect-btn-expired'
  ];
  return ids.map(id => document.getElementById(id))
            .find(btn => btn && btn.offsetParent !== null) || null;
}

function isValidSuiAddress(addr) {
  return typeof addr === 'string' && SUI_ADDRESS_RE.test(addr);
}

// ── EMAIL VALIDATION ──────────────────────────────────
// Returns { ok: true } or { ok: false, reason: '...' }.
//
// Rules (mirror of the backend Zod schema — keep them in sync):
//   - RFC 5321 length limits: total ≤ 254, local-part ≤ 64, domain ≤ 253
//   - local-part: latin letters, digits, and _ ' + - .
//     (no leading dot, no consecutive dots, no trailing dot)
//   - domain: latin letters/digits/hyphens with dot-separated labels,
//     TLD ≥ 2 latin letters
//   - extra XSS-shape blocklist (<, >, ", `, \, ;, =, &) for safer error
//     messages — these would also be rejected by the regex, but checking
//     them first lets us bail with a clean "Invalid email" message.
//
// Intentionally NOT validated here:
//   - whether the TLD actually exists (gmail.fq passes this check; backend
//     should do MX lookup or IANA list check to prevent hard-bounces).
//   - very short addresses like "a@b.co" — these are technically RFC-valid;
//     blocking them needs an explicit product rule.
//   - non-latin (IDN/unicode) addresses — backend rejects them, so we do too.
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { ok: false, reason: 'Invalid email' };
  }
  if (email.length > 254) {
    return { ok: false, reason: 'Email is too long' };
  }
  // Block characters commonly used in injection attacks. Doing this before
  // the regex so the error message can be specific.
  if (/[<>"`\\;=&]/.test(email)) {
    return { ok: false, reason: 'Invalid email' };
  }
  // Mirror of the backend Zod email schema. Keeping these in sync prevents
  // the user from hitting backend ZodError responses for inputs we can
  // catch client-side (most importantly: non-latin / cyrillic characters,
  // leading dots, consecutive dots, and bad domain shape).
  //
  // Local-part:  [A-Za-z0-9_'+\-\.]*[A-Za-z0-9_+-]   (cannot start with dot,
  //              no consecutive dots, must not end with dot)
  // Domain:      ([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}
  const shape = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
  if (!shape.test(email)) {
    return { ok: false, reason: 'Invalid email' };
  }
  const [local, domain] = email.split('@');
  if (local.length > 64) {
    return { ok: false, reason: 'Invalid email' };
  }
  if (domain.length > 253) {
    return { ok: false, reason: 'Invalid email' };
  }
  return { ok: true };
}

// ── DEVICE-TRUST TOKEN & EMAIL STORAGE ────────────────
const EMAIL_STORAGE_KEY = 'slush.waitlist.email.v1';
const DEVICE_TOKEN_KEY = 'slush.waitlist.deviceToken.v1';

function loadUserEmail() {
  try {
    const e = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    // console.log('[DEBUG] loadUserEmail:', e ? `Found saved email: ${e}` : 'No email found in storage');
    return e;
  } catch (e) {
    return null;
  }
}

function saveUserEmail(email) {
  try {
    if (email) {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      // console.log('[DEBUG] saveUserEmail: Email saved to storage ->', email);
    }
  } catch (e) {}
}

function clearUserEmail() {
  try {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    // console.log('[DEBUG] clearUserEmail: Email removed from storage');
  } catch (e) {}
}

function loadDeviceToken() {
  try {
    const dt = window.localStorage.getItem(DEVICE_TOKEN_KEY);
    // console.log('[DEBUG] loadDeviceToken:', dt ? 'Found saved deviceToken' : 'No deviceToken found in storage');
    return dt;
  } catch (e) {
    return null;
  }
}

function saveDeviceToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(DEVICE_TOKEN_KEY, token);
      // console.log('[DEBUG] saveDeviceToken: New deviceToken saved to storage');
    }
  } catch (e) {}
}

function clearDeviceToken() {
  try {
    window.localStorage.removeItem(DEVICE_TOKEN_KEY);
    // console.log('[DEBUG] clearDeviceToken: deviceToken removed from storage');
  } catch (e) {}
}

// ── WALLET ERROR HELPER ───────────────────────
function setWalletError(msg, isHtml = false) {
  const els = [document.getElementById('wallet-error'), document.getElementById('wallet-error-step-success')];
  els.forEach((el) => {
    if (!el) return;
    if (isHtml) el.innerHTML = msg;
    else el.textContent = msg;
  });
}

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) <= new Date();
}

// ── API LAYER ──────────────────────────────────────────────────────────────
async function apiGetLocation() {
  const r = await fetch(`${API_BASE_URL}/v1/location`);
  return { ok: r.ok, data: await r.json() };
}

async function apiSendOTP(email) {
  // console.log(`[DEBUG] API POST /send-otp for email: ${email}`);
  const r = await fetch(`${API_BASE_URL}/v1/waitlist/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

async function apiVerifyOTP(email, code) {
  // console.log(`[DEBUG] API POST /verify-otp for email: ${email}, code: ${code}`);
  const r = await fetch(`${API_BASE_URL}/v1/waitlist/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, rememberDevice: true }),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

async function apiCheckEmail(email, returnToken = null, deviceToken = null) {
  // console.log(`[DEBUG] API POST /check-email | Email: ${email} | Has returnToken: ${!!returnToken} | Has deviceToken: ${!!deviceToken}`);
  const body = { email };
  if (returnToken) body.returnToken = returnToken;
  if (deviceToken) body.deviceToken = deviceToken;
  const r = await fetch(`${API_BASE_URL}/v1/waitlist/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

async function apiJoinWaitlist(token, opts = {}) {
  const r = await fetch(`${API_BASE_URL}/v1/waitlist/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...opts }),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

async function apiConnectWallet(token, walletAddress) {
  // console.log(`[DEBUG] API POST /connect-wallet | Wallet: ${walletAddress}`);
  const r = await fetch(`${API_BASE_URL}/v1/waitlist/connect-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, walletAddress }),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

// ── PAGE INIT ──────────────────────────────────
async function initPage() {
  // console.log('[DEBUG] --- initPage() START ---');
  goToStep('loading');

  try {
    apiGetLocation().then(r => { if (r.ok) detectedCountry = r.data; }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const prefill = params.get('email');
    returnToken = params.get('returnToken');

    // Read address from URL
    const urlAddress = params.get('address');
    if (urlAddress && isValidSuiAddress(urlAddress)) {
      injectedWalletAddress = urlAddress;
      // console.log('[DEBUG] initPage: Address received from URL:', injectedWalletAddress);
      // Update email step heading for in-wallet flow
      const heading = document.getElementById('step-email-h3');
      if (heading) heading.textContent = 'Your wallet is connected, enter your email to join the waitlist';
    }

    deviceToken = loadDeviceToken();
    const savedEmail = loadUserEmail();

    // Smart preloader wait
    if (prefill || savedEmail) {
      // console.log('[DEBUG] initPage: Waiting for preloader signal...');
      await new Promise(resolve => {
        if (window.preloaderFinished) resolve();
        else window.addEventListener('preloaderDone', resolve, { once: true });
      });
    }

    if (prefill) {
      await handleReturningUser(prefill);
    } else if (savedEmail) {
      await handleReturningUser(savedEmail);
    } else {
      goToStep('email');
    }
  } catch (e) {
    // console.error('[DEBUG] Init failed:', e);
    goToStep('email');
  }
}

// ── RETURNING USER ─────────────────────────────
async function handleReturningUser(email) {
  currentEmail = email.trim().toLowerCase();
  // console.log(`[DEBUG] handleReturningUser started for email: ${currentEmail}`);
  try {
    goToStep('loading');
    const r = await apiCheckEmail(currentEmail, returnToken, deviceToken);

    if (!r.ok) {
      // console.log(`[DEBUG] handleReturningUser: Server returned error (${r.status}). Clearing tokens if expired.`);
      if (r.data?.error === 'INVALID_TOKEN' || r.data?.error === 'TOKEN_EXPIRED') {
        clearDeviceToken();
        deviceToken = null;
      }
      prefillAndShowEmail();
      return;
    }

    const { status, token, walletConnected, deviceToken: rotatedDt, expiresAt } = r.data;
    // console.log(`[DEBUG] handleReturningUser: Successful API response. Status: ${status}. Token received: ${!!token}`);

    if (expiresAt) softHoldExpiresAt = expiresAt;
    // console.log(`[DEBUG] handleReturningUser: expiresAt from API: ${expiresAt || "NOT PROVIDED"}, softHoldExpiresAt: ${softHoldExpiresAt}`);

    if (rotatedDt) {
      // console.log('[DEBUG] handleReturningUser: API returned rotated deviceToken. Saving.');
      deviceToken = rotatedDt;
      saveDeviceToken(rotatedDt);
    }

    if (['verified', 'on_waitlist', 'expired'].includes(status)) {
      saveUserEmail(currentEmail);
    }

    let effectiveStatus = status;

if (status === 'on_waitlist' && isExpired(expiresAt)) {
  // console.log('[DEBUG] handleReturningUser: Soft hold expired, overriding status to expired');
  effectiveStatus = 'expired';
}

    switch (effectiveStatus) {
      case 'not_verified':
        // console.log('[DEBUG] handleReturningUser: Status not_verified. Showing email input.');
        prefillAndShowEmail();
        break;
      case 'expired':
        // console.log(`[DEBUG] handleReturningUser: Status expired. Token available for auto-recovery? -> ${!!token}`);
        if (token) {
          verificationToken = token;
          // console.log('[DEBUG] handleReturningUser: expired + token present, calling /join then wallet step.');
          await submitJoin();
          return;
        }
        // Fallback: if returnToken exists but API didn't return token yet, retry check-email
        if (returnToken) {
          // console.log('[DEBUG] handleReturningUser: expired without token, retrying check-email with returnToken...');
          try {
            const retry = await apiCheckEmail(currentEmail, returnToken, deviceToken);
            if (retry.ok && retry.data?.token) {
              verificationToken = retry.data.token;
              // console.log('[DEBUG] handleReturningUser: Got token on retry, going to wallet step.');
              await goToWalletStep();
              return;
            }
          } catch (e) {
            // console.warn('[DEBUG] handleReturningUser: retry check-email failed:', e);
          }
        }
        // console.log('[DEBUG] handleReturningUser: No token for expired user, redirecting to email step.');
        prefillAndShowEmail();
        return;
      case 'verified':
        // console.log('[DEBUG] handleReturningUser: Status verified.');
        if (token) {
          verificationToken = token;
          // console.log('[DEBUG] handleReturningUser: Token present, auto-joining.');
          await submitJoin();
        } else {
          // console.log('[DEBUG] handleReturningUser: No token (unexpected for verified), showing email input.');
          prefillAndShowEmail();
        }
        break;
case 'on_waitlist': {
  // console.log(`[DEBUG] handleReturningUser: Status on_waitlist. Wallet connected? -> ${walletConnected}`);

  const daysLeft = getDaysLeft(expiresAt || softHoldExpiresAt);
  if (daysLeft === 0) {
    // console.log('[DEBUG] handleReturningUser: 0 days left, forcing expired step');
    goToStep('expired');
    return;
  }

  if (walletConnected) {
    showAlreadyRegistered(true);
    break;
  }

  if (token) {
    verificationToken = token;
    waitlistPosition = r.data.position || null;

    if (expiresAt) {
      softHoldExpiresAt = expiresAt;
    }

    if (injectedWalletAddress) {
      // console.log('[DEBUG] handleReturningUser: Injected wallet found. Auto-connecting...');
      await goToWalletStep();
    } else {
      // console.log('[DEBUG] handleReturningUser: No injected wallet. Showing success-email-only.');
      goToStep('success-email-only');
      initWallet();
    }

    break;
  }

  // console.log('[DEBUG] handleReturningUser: on_waitlist but no token (re-auth required).');
  prefillAndShowEmail();
  break;
}
      
      default:
        // console.log(`[DEBUG] handleReturningUser: Unknown status ${status}, falling back to email input.`);
        prefillAndShowEmail();
    }
  } catch (e) {
    // console.error('[DEBUG] handleReturningUser Error:', e);
    prefillAndShowEmail();
  }
}

function prefillAndShowEmail() {
  const inp = document.getElementById('email-input');
  if (!inp) return;
  inp.value = currentEmail;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
    document.getElementById('send-otp-btn')?.classList.add('is-active');
  }
  goToStep('email');
}

// ── WALLET STEP ───────────────────────
async function goToWalletStep() {
  if (injectedWalletAddress) {
    // console.log('[DEBUG] goToWalletStep: Injected wallet found. Attempting auto-connect...');
    goToStep('wallet');
    const btn = document.getElementById('wallet-connect-btn');
    const label = btn ? btn.querySelector('div') || btn : null;
    if (label) label.textContent = 'Locking your spot…';
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    }

    try {
      const r = await apiConnectWallet(verificationToken, injectedWalletAddress);
      if (r.ok) {
        // console.log('[DEBUG] goToWalletStep: Injected wallet successfully connected to API.');
        connectedAddress = injectedWalletAddress;
        const posDisplay = document.getElementById('success-wallet-position');
        const pos = r.data.position || waitlistPosition;
        if (posDisplay) posDisplay.textContent = pos ? `Position: #${pos}` : '';
        goToStep('success-wallet');
        showToast('Wallet connected — spot locked ✓');
        return;
      }
    } catch (e) {
      // console.warn('[DEBUG] [slush-in-app] auto-connect failed, falling back', e);
    }
    injectedWalletAddress = null;
  }
  // console.log('[DEBUG] goToWalletStep: Showing standard wallet screen.');
  goToStep('wallet');
  initWallet();
}

window.restartFromExpired = function () {
  // console.log('[DEBUG] restartFromExpired called.');
  verificationToken = null;
  // returnToken intentionally kept — needed if user retries from expired state
  const inp = document.getElementById('email-input');
  if (inp) inp.value = currentEmail;
  goToStep('email');
};

function showAlreadyRegistered(hasWallet = false) {
  // console.log(`[DEBUG] showAlreadyRegistered. Has wallet: ${hasWallet}`);
  if (hasWallet) {
    goToStep('success-wallet');
  } else if (injectedWalletAddress && verificationToken) {
    // console.log('[DEBUG] showAlreadyRegistered: injected address present, auto-connecting wallet...');
    goToWalletStep();
    showToast('Welcome back!');
    return;
  } else {
    goToStep('success-email-only');
    initWallet();
  }
  showToast('Welcome back!');
}

// ── EMAIL + OTP HANDLERS ───────────────────────
document.getElementById('email-input')?.addEventListener('input', function () {
  this.style.color = '';
});

window.handleSendOTP = async function () {
  const inp = document.getElementById('email-input');
  const err = document.getElementById('email-error');
  const btn = document.getElementById('send-otp-btn');
  const email = inp.value.trim().toLowerCase();

  // console.log(`[DEBUG] handleSendOTP: Button clicked for ${email}`);

  if (err) err.textContent = '';
  const v = validateEmail(email);
  if (!v.ok) {
    if (err) err.textContent = v.reason;
    inp?.focus();
    if (inp) inp.style.border = '1px solid #ca1a38';
    return;
  }

  if (btn) btn.disabled = true;
  if (btn) btn.textContent = 'Checking…';
  currentEmail = email;

  try {
    // console.log('[DEBUG] handleSendOTP: Checking email status before sending OTP...');
    goToStep('loading');
    const check = await apiCheckEmail(email, null, deviceToken);

    if (!check.ok && (check.data?.error === 'INVALID_TOKEN' || check.data?.error === 'TOKEN_EXPIRED')) {
      // console.log('[DEBUG] handleSendOTP: deviceToken invalid, clearing.');
      clearDeviceToken();
      deviceToken = null;
    }

    if (check.ok) {
      const { status, token, walletConnected, deviceToken: rotatedDt } = check.data;
      // console.log(`[DEBUG] handleSendOTP: checkEmail response -> Status: ${status}. Token present: ${!!token}`);

      if (rotatedDt) {
        deviceToken = rotatedDt;
        saveDeviceToken(rotatedDt);
      }

      if (['verified', 'on_waitlist', 'expired'].includes(status)) {
        saveUserEmail(currentEmail);
      }

      let effectiveStatus = status;

if (status === 'on_waitlist' && isExpired(check.data.expiresAt)) {
  // console.log('[DEBUG] handleSendOTP: Soft hold expired, overriding status to expired');
  effectiveStatus = 'expired';
}

      switch (effectiveStatus) {
        case 'expired':
          if (token) {
            // console.log('[DEBUG] handleSendOTP: Status expired + token present. Calling /join then wallet step.');
            verificationToken = token;
            await submitJoin();
            return;
          }
          // console.log('[DEBUG] handleSendOTP: Status expired, no token. Sending OTP to re-authenticate.');
          // Fall through to send OTP below
          break;
        case 'verified':
          if (token) {
            // console.log('[DEBUG] handleSendOTP: Status verified. Auto-joining.');
            verificationToken = token;
            await submitJoin();
            return;
          }
          break;
        case 'on_waitlist':
          if (walletConnected) {
            // console.log('[DEBUG] handleSendOTP: User already on waitlist with wallet.');
            showAlreadyRegistered(true);
            return;
          }
          if (token) {
            verificationToken = token;
            waitlistPosition = check.data.position || null;
            if (injectedWalletAddress) {
              // console.log('[DEBUG] handleSendOTP: on_waitlist + injected address. Auto-connecting wallet...');
              await goToWalletStep();
            } else {
              // console.log('[DEBUG] handleSendOTP: User on waitlist without wallet. Showing success-email-only.');
              goToStep('success-email-only');
              initWallet();
            }
            return;
          }
          break;
        case 'not_verified':
        default:
          // console.log('[DEBUG] handleSendOTP: Verification needed. Sending OTP.');
          break;
      }
    }

    if (btn) btn.textContent = 'Sending…';
    const r = await apiSendOTP(email);
    if (r.ok) {
      // console.log('[DEBUG] handleSendOTP: OTP sent successfully.');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'email_form_submit', email: email });
      goToStep('otp');
      startResendCooldown();
    } else {
      // console.log(`[DEBUG] handleSendOTP: OTP send error: ${r.data.error}`);
      const retryAfter = r.data?.retryAfter;
      const msgs = {
        RATE_LIMIT: retryAfter
          ? `Too many attempts. Please wait ${retryAfter}s before trying again.`
          : `Too many attempts. Please wait a minute before trying again.`,
        INVALID_EMAIL: 'Invalid email.',
        // Backend returns EmailInvalidAddressError when the address is on the
        // mail provider's suppression list (prior hard bounce, spam complaint,
        // or manual suppression). The address is syntactically valid, so we
        // can't say "Invalid email" — that would imply a typo and the user
        // would just retype the same address. Tell them to use a different one.
        EmailInvalidAddressError: `We can't send emails to this address. Please use a different one.`,
      };

      // ZodError fallback: backend Zod schema rejected the payload. The
      // frontend validateEmail() should normally catch every input the Zod
      // schema does — but if anything slips through (e.g. a normalisation
      // edge case), peek inside the Zod error to figure out which field failed
      // and show a useful message instead of "Something went wrong".
      let resolvedMsg = msgs[r.data.error];
      if (!resolvedMsg && r.data?.error?.name === 'ZodError') {
        try {
          const issues = JSON.parse(r.data.error.message);
          const emailIssue = Array.isArray(issues) && issues.find(i => i?.path?.[0] === 'email');
          if (emailIssue) resolvedMsg = 'Invalid email.';
        } catch {
          // message wasn't JSON — fall through to the generic fallback
        }
      }

      // Return to the email step so the user can see the error and retry —
      // otherwise we stay stuck on the loading step with the form hidden.
      goToStep('email');
      if (err) err.textContent = resolvedMsg || 'Something went wrong. Please try again.';
      if (inp) inp.style.border = '1px solid #ca1a38';
    }
  } catch (e) {
    // console.error('[DEBUG] handleSendOTP Network error:', e);
    // Same recovery: bring the user back to the email form on network error.
    goToStep('email');
    if (err) err.textContent = 'Network error.';
    if (inp) inp.style.border = '1px solid #ca1a38';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Continue';
    }
  }
};

window.handleVerifyOTP = async function () {
  const err = document.getElementById('otp-error');
  const verifyBtn = document.getElementById('verify-otp-btn');
  const resendBtn = document.getElementById('resend-btn');
  const resendDisp = document.getElementById('resend-countdown');

  const code = getOTPValue();
  // console.log(`[DEBUG] handleVerifyOTP: Attempting code verification...`);
  if (!err) return;
  err.textContent = '';

  if (code.length !== OTP_LENGTH) {
    err.textContent = 'Enter all 6 digits.';
    return;
  }

  if (verifyBtn) verifyBtn.disabled = true;
  if (resendBtn) {
    resendBtn.style.pointerEvents = 'none';
    resendBtn.textContent = 'Verifying…';
  }
  if (resendDisp) resendDisp.textContent = '';

  try {
    const r = await apiVerifyOTP(currentEmail, code);

    if (!r.ok) {
      // console.log(`[DEBUG] handleVerifyOTP: Verification error - ${r.data.error}`);
      const msgs = {
        INVALID_CODE: `Incorrect code. ${r.data.attemptsRemaining} left.`,
        CODE_EXPIRED: 'Expired. Request a new one.',
        TOO_MANY_ATTEMPTS: 'Too many tries. Request a new code.',
      };
      err.textContent = msgs[r.data.error] || 'Failed.';

      document.querySelectorAll('#otp-container input').forEach((inp) => {
        inp.style.border = '1px solid #ca1a38';
      });

      if (verifyBtn) verifyBtn.disabled = false;
      if (resendBtn) {
        resendBtn.style.pointerEvents = 'auto';
        resendBtn.textContent = resendCountdown > 0 ? 'Resend in ' : 'Resend code';
      }
      if (resendDisp) resendDisp.textContent = resendCountdown > 0 ? resendCountdown : '';
      return;
    }

    // console.log('[DEBUG] handleVerifyOTP: Verification successful! Saving tokens and email.');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'otp_verified', email: currentEmail });
    verificationToken = r.data.token;

    if (r.data.deviceToken) {
      deviceToken = r.data.deviceToken;
      saveDeviceToken(r.data.deviceToken);
    }

    saveUserEmail(currentEmail);

    await submitJoin();
  } catch (e) {
    // console.error('[DEBUG] [OTP Error]', e);
    err.textContent = 'Network error.';
    if (verifyBtn) verifyBtn.disabled = false;
    if (resendBtn) {
      resendBtn.style.pointerEvents = 'auto';
      resendBtn.textContent = resendCountdown > 0 ? 'Resend in ' : 'Resend code';
    }
  }
};

window.handleResendOTP = async function () {
  if (resendCountdown > 0) return;
  // console.log('[DEBUG] handleResendOTP called');
  const btn = document.getElementById('resend-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  const otpErr = document.getElementById('otp-error');
  if (otpErr) otpErr.textContent = '';
  try {
    const r = await apiSendOTP(currentEmail);
    if (r.ok) {
      clearOTPInputs();
      startResendCooldown();
    } else {
      startResendCooldown(r.data.retryAfter || OTP_COOLDOWN_SEC);
    }
  } catch (e) {
    // console.error('[DEBUG] handleResendOTP error:', e);
  } finally {
    // If cooldown never started (error before startResendCooldown), re-enable the button
    if (resendCountdown <= 0) {
      btn.disabled = false;
      btn.textContent = 'Resend code';
    }
  }
};

// ── JOIN WAITLIST ──────────────────────────────
async function submitJoin() {
  // console.log('[DEBUG] submitJoin: Sending /join request...');
  const utm = getUTMParams();

  // FIX: token is passed via first arg only, not duplicated in opts
  const opts = { ...utm };
  if (injectedWalletAddress) {
    opts.pendingWalletConnect = true;
    // console.log('[DEBUG] submitJoin: Setting pendingWalletConnect = true');
  }

  const r = await apiJoinWaitlist(verificationToken, opts);

  if (r.ok) {
    // console.log('[DEBUG] submitJoin: Successfully registered! Moving to wallet step.');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'waitlist_joined', position: r.data.position, email: currentEmail });
    waitlistPosition = r.data.position;

    saveUserEmail(currentEmail);

    const subtitle = document.getElementById('wallet-step-subtitle');
    if (subtitle) subtitle.textContent = `To stay on the waitlist, you need to connect your wallet.`;

    await goToWalletStep();

  } else if (r.status === 403 && r.data.error === 'GEO_RESTRICTED') {
    // console.log('[DEBUG] submitJoin: GEO blocked.');
    const cc = r.data.countryCode;
    const geoDetail = document.getElementById('geo-blocked-detail');
    if (geoDetail) {
      geoDetail.textContent = cc === 'XX'
        ? 'We could not determine your location.'
        : `Not yet available in ${COUNTRY_NAMES[cc] || cc}. We've saved your email.`;
    }
    goToStep('geo-blocked');

  } else if (r.status === 409) {
    // console.log('[DEBUG] submitJoin: Conflict (already on waitlist). Showing success screen.');
    waitlistPosition = r.data.position;
    showAlreadyRegistered(!!(r.data.walletAddress || r.data.address));

  } else if (r.status === 401) {
    // console.log('[DEBUG] submitJoin: 401 Unauthorized. Resetting to email input.');
    goToStep('email');
  } else {
    showToast('Join failed. Please try again.');
  }
}

// ── WALLET CONNECT ─────────────────────────────
async function initWallet() {
  // Guard: if a connect is already in flight, don't re-run init —
  // it would clobber slushWallet, btn.onclick, and the connecting label
  // mid-flow. This protects against goToStep() calling initWallet()
  // while a connect is open.
  if (walletConnectInFlight) {
    return;
  }

  const btn = getActiveWalletBtn();
  if (!btn) return;

  // Extra guard: if THIS specific button is already in connecting state,
  // skip re-init too (covers cases where the in-flight flag was somehow missed).
  if (btn.dataset.connecting === 'true') {
    return;
  }

  const label = btn.querySelector('div') || btn;

  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';
  label.textContent = 'Initializing…';

  try {
    // dApp Kit auto-registers Slush (via slushWalletConfig in createDAppKit)
    // and discovers any standard-compatible wallets the user has installed.
    // We just need to find the Slush one in the wallets list.
    const wallets = dAppKit.stores.$wallets.get();
    slushWallet = wallets.find((w) => /slush/i.test(w.name)) ?? null;

    // If $wallets is empty on first read (extension still registering),
    // subscribe once and retry — covers the race where dApp Kit fires the
    // wallet registration just after the initial getter.
    if (!slushWallet) {
      slushWallet = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          unsub();
          resolve(null);
        }, 1000);
        const unsub = dAppKit.stores.$wallets.subscribe((ws) => {
          const found = ws.find((w) => /slush/i.test(w.name));
          if (found) {
            clearTimeout(timeout);
            unsub();
            resolve(found);
          }
        });
      });
    }
  } catch (e) {
    console.error('[DEBUG] initWallet error:', e);
  }

  btn.style.pointerEvents = 'auto';
  btn.style.opacity = '1';

  if (!slushWallet) {
    label.textContent = '↗ Install Slush Wallet';
    btn.onclick = () => {
      window.open(SLUSH_CHROME_URL, '_blank');
    };
  } else {
    label.textContent = 'Connect wallet';
    btn.onclick = handleWalletConnect;
  }

  const successBtn = document.getElementById('wallet-connect-btn-success-email-only');
  if (successBtn) successBtn.onclick = handleWalletConnect;

  const expiredBtn = document.getElementById('wallet-connect-btn-expired');
  if (expiredBtn) expiredBtn.onclick = handleExpiredWalletConnect;
}

async function handleExpiredWalletConnect() {
  verificationToken = null; // Обязательно сбрасываем, чтобы не зациклиться на ошибке 410
  const inp = document.getElementById('email-input');
  if (inp && currentEmail) inp.value = currentEmail;
  if (currentEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
    document.getElementById('send-otp-btn')?.classList.add('is-active');
  }
  goToStep('email');
}

async function handleWalletConnect() {
  // No more sync-popup-trust gymnastics here — dApp Kit handles popup
  // trust internally via its own connect flow. We can just await.
  if (!slushWallet) return;

  const btn = getActiveWalletBtn();
  if (!btn) return;

  // hard lock against double taps
  if (btn.dataset.connecting === 'true') {
    return;
  }

  // Lock initWallet from re-running and clobbering slushWallet/onclick
  // mid-flow if a parent goToStep() fires in parallel.
  walletConnectInFlight = true;
  btn.dataset.connecting = 'true';

  const label = btn.querySelector('div') || btn;

  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';
  label.textContent = 'Connecting…';
  setWalletError('');

  try {
    const result = await dAppKit.connectWallet({ wallet: slushWallet });
    const acct = result?.accounts?.[0];

    if (!acct?.address) {
      throw new Error('No account returned');
    }

    await handleWalletConnected(acct.address);
  } catch (e) {
    console.error('[Wallet connect error]', e);

    const msg = e?.message?.toLowerCase?.() || '';

    btn.dataset.connecting = 'false';
    label.textContent = 'Connect wallet';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';

    if (
      msg.includes('set up your wallet') ||
      msg.includes('not set up')
    ) {
      showWalletSetupHint();
      return;
    }

    if (
      msg.includes('not logged') ||
      msg.includes('locked') ||
      msg.includes('no account')
    ) {
      showWalletLoginHint();
      return;
    }

    if (
      msg.includes('closed') ||
      msg.includes('reject') ||
      msg.includes('cancel')
    ) {
      setWalletError('Please try again.');
      showToast('Please try again.');
      return;
    }

    // Kept as safety net — should be much rarer now that dApp Kit handles
    // the popup flow, but worth surfacing a clear message if it still happens.
    if (
      msg.includes('window.opener') ||
      msg.includes('popup') ||
      msg.includes('blocked')
    ) {
      setWalletError('Popup was blocked by your browser. Please try again.');
      showToast('Popup blocked');
      return;
    }

    setWalletError('Connection failed. Please try again.');
    showToast('Connection failed. Please try again.');
  } finally {
    // Always release the in-flight guard, success or failure.
    // handleWalletConnected() releases it on the success path on its own
    // (after the API round-trip completes), but for any error path we
    // need to clear it here so the user can retry.
    walletConnectInFlight = false;
  }
}

async function handleWalletConnected(address) {
  // console.log(`[DEBUG] handleWalletConnected: Saving wallet to server. Address: ${address}`);
  connectedAddress = address;
  const btn = getActiveWalletBtn();
  if (!btn) return;
  const label = btn.querySelector('div') || btn;
  const addrDisplay = document.getElementById('address-display');
  const addrText = document.getElementById('address-text');
  if (addrText) addrText.textContent = fmtAddr(address);
  if (addrDisplay) addrDisplay.classList.add('visible');
  label.textContent = 'Locking your spot…';
  btn.style.pointerEvents = 'none';
  try {
    const r = await apiConnectWallet(verificationToken, address);
    if (r.ok) {
      // console.log('[DEBUG] handleWalletConnected: Successfully saved to server!');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'wallet_connected', wallet: address, email: currentEmail });
      const posDisplay = document.getElementById('success-wallet-position');
      const pos = r.data.position || waitlistPosition;
      if (posDisplay) posDisplay.textContent = pos ? `Position: #${pos}` : '';
      goToStep('success-wallet');
      showToast('Wallet connected — spot locked ✓');
      label.textContent = '✓ Connected';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '1';
    } else if (r.status === 401) {
      setWalletError('Session expired. Please verify your email again.');
      label.textContent = 'Session expired';
      btn.style.pointerEvents = 'none';
    } else if (r.status === 404) {
      setWalletError('Waitlist entry not found. Please join first.');
      label.textContent = 'Connect wallet';
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    } else if (r.status === 410) {
      // Position expired — re-join first then retry connect-wallet
      // console.log('[DEBUG] handleWalletConnected: 410 expired, attempting re-join...');
      const rejoin = await apiJoinWaitlist(verificationToken, getUTMParams());
      if (rejoin.ok) {
        // console.log('[DEBUG] handleWalletConnected: Re-join successful, retrying connect-wallet...');
        const retry = await apiConnectWallet(verificationToken, address);
        if (retry.ok) {
          const posDisplay = document.getElementById('success-wallet-position');
          const pos = retry.data.position || waitlistPosition;
          if (posDisplay) posDisplay.textContent = pos ? `Position: #${pos}` : '';
          goToStep('success-wallet');
          showToast('Wallet connected — spot locked ✓');
          return;
        }
      }
      goToStep('expired');
    } else if (r.status === 409) {
      setWalletError('A different wallet is already connected.');
      label.textContent = 'Connect wallet';
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    } else if (r.status === 503) {
      setWalletError('Wallet service is temporarily unavailable. Please try again in a moment.');
      label.textContent = 'Try again';
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.onclick = handleWalletConnect;
    } else {
      setWalletError('Could not save wallet. Please try again.');
      label.textContent = 'Connect wallet';
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.onclick = handleWalletConnect;
    }
  } catch (e) {
    setWalletError('Network error — please try again.');
    label.textContent = 'Connect wallet';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
    btn.onclick = handleWalletConnect;
    // console.error(e);
  } finally {
    // Connect flow fully complete (success or failure) — release the
    // initWallet guard so future clicks / re-inits work normally.
    walletConnectInFlight = false;
    if (btn) btn.dataset.connecting = 'false';
  }
}

// ── WALLET HELPERS ─────────────────────────────
function showWalletSetupHint() {
  setWalletError(`Your <b>Slush Wallet</b> is not set up yet.<br>Open the extension and complete setup first.`, true);
  showToast('Set up your wallet first');
}

function showWalletLoginHint() {
  setWalletError(`Please open your <b>Slush Wallet</b> extension and sign in.<br>Then return here — we'll connect automatically.`, true);
  showToast('Open Slush Wallet extension');
}


function fmtAddr(a) {
  return a.slice(0, 8) + '…' + a.slice(-6);
}



// ── OTP INPUT LOGIC ────────────────────────────
let isPasting = false;

function setupOTPInputs() {
  const inputs = document.querySelectorAll('#otp-container input');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', (e) => {
      if (isPasting) return;
      resetOTPErrorState();
      const v = e.target.value.replace(/\D/g, '');
      e.target.value = v.slice(0, 1);
      if (v && i < inputs.length - 1) inputs[i + 1].focus();
      updateVerifyBtn();
      if (getOTPValue().length === OTP_LENGTH) window.handleVerifyOTP();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        resetOTPErrorState();
        if (!e.target.value && i > 0) {
          inputs[i - 1].focus();
          inputs[i - 1].value = '';
          updateVerifyBtn();
        }
      }
    });
    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const p = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (!p) return;

      // Reset error BEFORE paste to avoid red flash
      resetOTPErrorState();

      // Flag to prevent input events during paste from triggering auto-submit early
      isPasting = true;
      p.split('').forEach((c, j) => {
        if (inputs[i + j]) inputs[i + j].value = c;
      });
      isPasting = false;

      inputs[Math.min(i + p.length, inputs.length - 1)].focus();
      updateVerifyBtn();

      // Small delay to let DOM update before submitting, avoids visual flash
      if (p.length === OTP_LENGTH) setTimeout(() => window.handleVerifyOTP(), 50);
    });
  });
}

function getOTPValue() {
  return Array.from(document.querySelectorAll('#otp-container input'))
    .map((i) => i.value)
    .join('');
}

function clearOTPInputs() {
  document.querySelectorAll('#otp-container input').forEach((i) => (i.value = ''));
  document.querySelectorAll('#otp-container input')[0]?.focus();
  updateVerifyBtn();
}

function updateVerifyBtn() {
  const btn = document.getElementById('verify-otp-btn');
  if (btn) btn.disabled = getOTPValue().length !== OTP_LENGTH;
}

// ── RESEND COOLDOWN ────────────────────────────
function startResendCooldown(s = OTP_COOLDOWN_SEC) {
  resendCountdown = s;
  const btn = document.getElementById('resend-btn');
  const disp = document.getElementById('resend-countdown');
  if (!btn) return;
  btn.disabled = true;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCountdown--;
    if (resendCountdown <= 0) {
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.textContent = 'Resend code';
      if (disp) disp.textContent = '';
    } else {
      if (btn.textContent !== 'Verifying…') {
        btn.textContent = 'Resend in ';
        if (disp) disp.textContent = `${resendCountdown}`;
      }
    }
  }, 1000);
}

// ── OTP VISUAL STATES ──────────────────────────
function setOTPInputsColor(color) {
  document.querySelectorAll('#otp-container input').forEach((inp) => {
    inp.style.color = color;
  });
}

function resetOTPErrorState() {
  const err = document.getElementById('otp-error');
  if (err && err.textContent !== '') {
    err.textContent = '';
    setOTPInputsColor('');
  }
}

// ── NAVIGATION ─────────────────────────────────
let cardAlreadyReset = false;

window.goToStep = function (step) {
  // console.log(`[DEBUG] goToStep: Navigating to step '${step}'`);
  const target = document.getElementById(`step-${step}`);
  if (!target) return;

  document.querySelectorAll('.step').forEach((el) => el.classList.remove('active'));

  target.classList.add('active');

  if (step === 'expired') {
  const btn = document.getElementById('wallet-connect-btn-expired');
  if (btn) {
btn.onclick = (e) => {
      e.preventDefault();
      window.restartFromExpired();
    };
  }
  if (!slushWallet) {
    initWallet();
  }
}

  if (step === 'success-wallet') {
    document.querySelectorAll('.card-background-vid').forEach(el => el.style.setProperty('opacity', '0', 'important'));
  }

  if (step === 'success-wallet') {
    const subtitle = document.getElementById('step-success-wallet-subtitle');
    if (subtitle && currentEmail) {
      subtitle.textContent = `Be on the lookout for updates sent to ${currentEmail}.`;
    }

    const resetCardRotation = () => {
      if (cardAlreadyReset) return;
      cardAlreadyReset = true;
      // console.log('[DEBUG] resetCardRotation: Resetting card rotation');
      const cardInners = document.querySelectorAll('.wallet-card-inner');
      cardInners.forEach((el) => {
        el.style.setProperty('transform', 'rotateX(0deg)', 'important');
      });
      const cardImgs = document.querySelectorAll('.card-img');
      cardImgs.forEach((el) => {
        el.style.setProperty('transform', 'scale(1)', 'important');
      });
    };

    setTimeout(resetCardRotation, 100);
    setTimeout(resetCardRotation, 500); // Fallback

    const posDisplay = document.getElementById('success-wallet-position');
    if (posDisplay) {
      posDisplay.textContent = waitlistPosition ? `Position: #${waitlistPosition}` : '';
    }
  }

  if (step === 'success-email-only') {
    const posDisplay = document.getElementById('success-email-position');
    if (posDisplay) {
      posDisplay.textContent = waitlistPosition ? `Position: #${waitlistPosition}` : '';
    }

    const emailDisplay = document.getElementById('display-email');
    if (emailDisplay && currentEmail) {
      emailDisplay.textContent = currentEmail;
    }

    const btn = document.getElementById('wallet-connect-btn-success-email-only');
    if (btn) {
      btn.onclick = handleWalletConnect;
      if (!slushWallet) {
        initWallet();
      }
    }

const holdHeading = document.getElementById('soft-hold-heading');
const days = getDaysLeft(softHoldExpiresAt);
if (holdHeading && days !== null) {
  if (days > 0) {
    holdHeading.textContent = `We'll hold your spot for ${days} day${days === 1 ? '' : 's'}!`;
  } else {
    // Если по расчетам осталось меньше дня, но мы еще на этом экране
    holdHeading.textContent = `Your spot is held until the end of the day!`;
  }
}
  }
  if (step === 'otp') {
    const disp = document.getElementById('otp-email-display');
    if (disp) disp.textContent = currentEmail;
    clearOTPInputs();
    setTimeout(() => document.querySelector('#otp-container input')?.focus(), 100);
  }
    

  if (step === 'email') {
    setTimeout(() => document.getElementById('email-input')?.focus(), 100);
  }
};

// ── UTILITIES ──────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getUTMParams() {
  const p = new URLSearchParams(window.location.search),
    u = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = p.get(k);
    if (v) u[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return u;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2200);
}

function getDaysLeft(isoDate) {
  if (!isoDate) return null;
  const diff = new Date(isoDate) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  // Если осталось меньше 1 дня (например, 0 или минус), 
  // возвращаем 0, чтобы логика в goToStep могла это обработать
  return days > 0 ? days : 0;
}

function showGeoBanner() {
  const banner = document.getElementById('geo-banner');
  if (!banner) return; // FIX: null-check
  const cc = detectedCountry.countryCode;
  if (cc === 'XX') {
    banner.style.display = 'none';
    return;
  }
  banner.className = 'geo-banner info';
  banner.innerHTML = `Detected location: <strong>${COUNTRY_NAMES[cc] || cc}</strong>`;
  banner.style.display = 'block';
}

// ── INIT & GLOBAL EVENTS ───────────────────────
setupOTPInputs();
initPage();

document.getElementById('send-otp-btn')?.addEventListener('click', window.handleSendOTP);
document.getElementById('email-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.handleSendOTP();
});

const emailInp = document.getElementById('email-input');
const sendBtn = document.getElementById('send-otp-btn');
const emailErr = document.getElementById('email-error');

emailInp?.addEventListener('input', (e) => {
  const value = e.target.value.trim().toLowerCase();
  if (emailInp) emailInp.style.border = '';
  if (emailErr) emailErr.textContent = '';

  // Use the same validator as handleSendOTP so the Continue button only
  // activates on inputs that will actually pass submit-time validation.
  if (validateEmail(value).ok) {
    sendBtn?.classList.add('is-active');
  } else {
    sendBtn?.classList.remove('is-active');
  }
});
// ── BFCACHE FIX ────────────────────────────────
// When browser restores page from back-forward cache, JS state is frozen
// but DOM is reset — reinitialize everything cleanly.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // console.log('[DEBUG] pageshow: Page restored from bfcache. Reinitializing...');
    slushWallet = null;
    connectedAddress = null;
    verificationToken = null;
    window.preloaderFinished = false;
    initPage();
  }
});
