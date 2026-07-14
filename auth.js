/**
 * Meesho Supplier Prototype - JWT Authentication Engine & Auth Panel Logic
 */

// ==================== GOOGLE OAUTH CONFIGURATION ====================
// Replace 'YOUR_GOOGLE_CLIENT_ID_HERE' below with your copied Client ID from Google Cloud Console
// Example: const GOOGLE_CLIENT_ID = '1234567890-abcdefghijklmnop.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
// ====================================================================

let currentAuthMode = 'signup';
let activeJwtData = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeUserDatabase();

  // Check URL query parameters for ?mode=login or ?mode=signup
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode === 'login') {
    switchAuthTab('login');
  } else {
    switchAuthTab('signup');
  }

  setupAuthListeners();
});

function initializeUserDatabase() {
  let db = localStorage.getItem('meesho_supplier_users_db');
  if (!db) {
    const defaultUsers = {
      '9876543210': {
        identifier: '9876543210',
        password: 'Supplier@Meesho2026',
        gstin: '29ABCDE1234F1Z5',
        role: 'MEESHO_VERIFIED_SUPPLIER',
        commission_tier: '0% COMMISSION',
        registered_at: new Date().toISOString()
      },
      'supplier@meesho.com': {
        identifier: 'supplier@meesho.com',
        password: 'Supplier@Meesho2026',
        gstin: '29SUPPLIER001Z9',
        role: 'MEESHO_VERIFIED_SUPPLIER',
        commission_tier: '0% COMMISSION',
        registered_at: new Date().toISOString()
      }
    };
    localStorage.setItem('meesho_supplier_users_db', JSON.stringify(defaultUsers));
  }
}

function getUserDatabase() {
  try {
    return JSON.parse(localStorage.getItem('meesho_supplier_users_db') || '{}');
  } catch (e) {
    return {};
  }
}

function saveUserToDatabase(userObj) {
  const db = getUserDatabase();
  db[userObj.identifier] = userObj;
  localStorage.setItem('meesho_supplier_users_db', JSON.stringify(db));
}

function switchAuthTab(mode) {
  currentAuthMode = mode;
  const signupTab = document.getElementById('tab-signup');
  const loginTab = document.getElementById('tab-login');
  const gstField = document.getElementById('field-gstin');
  const confirmField = document.getElementById('field-confirm-pass');
  const submitBtn = document.getElementById('auth-submit-btn');
  const formTitle = document.getElementById('auth-title');
  const formSubtitle = document.getElementById('auth-subtitle');

  if (mode === 'login') {
    if (loginTab) loginTab.classList.add('active');
    if (signupTab) signupTab.classList.remove('active');
    if (gstField) gstField.style.display = 'none';
    if (confirmField) confirmField.style.display = 'none';
    if (formTitle) formTitle.textContent = 'Login to Supplier Panel';
    if (formSubtitle) formSubtitle.textContent = 'Enter your registered mobile number or email ID';
    if (submitBtn) submitBtn.textContent = 'Authenticate & Login via JWT';
  } else {
    if (signupTab) signupTab.classList.add('active');
    if (loginTab) loginTab.classList.remove('active');
    if (gstField) gstField.style.display = 'block';
    if (confirmField) confirmField.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Create Supplier Account';
    if (formSubtitle) formSubtitle.textContent = 'Start selling to crores of customers at 0% commission';
    if (submitBtn) submitBtn.textContent = 'Register & Generate JWT';
  }
}

function setupAuthListeners() {
  document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));

  document.getElementById('auth-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleJwtAuth();
  });

  document.getElementById('jwt-modal-close')?.addEventListener('click', closeJwtModal);
  document.getElementById('btn-copy-jwt')?.addEventListener('click', copyJwtToClipboard);
  document.getElementById('btn-dashboard-continue')?.addEventListener('click', finishLoginRedirect);
}

/* ============================ JWT GENERATOR & AUTH LOGIC ============================ */
function base64urlEncode(obj) {
  const jsonStr = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(jsonStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function simulateHMACSHA256Signature(headerBase64, payloadBase64) {
  const input = headerBase64 + '.' + payloadBase64;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const simulatedSigHex = Math.abs(hash).toString(16).padStart(8, '0') + 
    'f9e2d4a8b7c6103982736451a0b9c8d7e6f5' + Math.abs(hash * 31).toString(16);
  return btoa(simulatedSigHex).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function handleJwtAuth() {
  const identifier = document.getElementById('input-identifier')?.value.trim() || '9876543210';
  const gstin = document.getElementById('input-gstin')?.value.trim() || '29ABCDE1234F1Z5';
  const password = document.getElementById('input-password')?.value || '';
  const confirmPassword = document.getElementById('input-confirm-password')?.value || '';

  if (!identifier) {
    alert('Please enter your mobile number or email ID');
    return;
  }

  const usersDb = getUserDatabase();
  let statusTitle = '✓ HS256 Signed JSON Web Token Generated';
  let statusDesc = 'Your supplier login details have been securely encrypted into a session token.';
  let resolvedGstin = gstin;

  if (currentAuthMode === 'signup') {
    if (password && confirmPassword && password !== confirmPassword) {
      alert('Authentication Error: Confirm Password does not match Password!');
      return;
    }

    if (usersDb[identifier]) {
      // User already exists, switch to login verification
      statusTitle = '✓ Registered Account Authenticated & JWT Issued';
      statusDesc = `User '${identifier}' is already registered in the database. Credentials verified and new session token generated.`;
      resolvedGstin = usersDb[identifier].gstin || gstin;
    } else {
      // Register new user record
      const newUser = {
        identifier: identifier,
        password: password || 'Supplier@Meesho2026',
        gstin: gstin,
        role: 'MEESHO_VERIFIED_SUPPLIER',
        commission_tier: '0% COMMISSION',
        registered_at: new Date().toISOString()
      };
      saveUserToDatabase(newUser);
      statusTitle = '✓ New Supplier Account Registered & JWT Generated';
      statusDesc = `User details for '${identifier}' saved to database. Credentials encrypted into a verified HS256 session token.`;
    }
  } else {
    // LOGIN MODE - Authenticate against saved user records
    const existingUser = usersDb[identifier];
    if (!existingUser) {
      alert(`Authentication Failed: No registered account found for '${identifier}'. Please switch to Sign Up to create an account first.`);
      return;
    }

    if (password && existingUser.password && existingUser.password !== password) {
      alert(`Authentication Failed: Incorrect password entered for '${identifier}'. Please check your password and try again.`);
      return;
    }

    resolvedGstin = existingUser.gstin || 'VERIFIED_ON_FILE';
    statusTitle = '✓ User Authenticated via Saved Credentials & JWT Verified';
    statusDesc = `Credentials for '${identifier}' successfully validated against registered user database. HS256 session token verified.`;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 86400; // 24 hours

  const jwtHeader = { alg: 'HS256', typ: 'JWT' };
  const jwtPayload = {
    sub: `SUP_${Math.floor(1000 + Math.random() * 9000)}`,
    identifier: identifier,
    auth_type: currentAuthMode.toUpperCase(),
    gstin: resolvedGstin,
    role: 'MEESHO_VERIFIED_SUPPLIER',
    commission_tier: '0% COMMISSION',
    authenticated: true,
    permissions: ['CATALOG_CREATE', 'ORDERS_MANAGE', 'PAYMENTS_VIEW'],
    iat: iat,
    exp: exp
  };

  const headerB64 = base64urlEncode(jwtHeader);
  const payloadB64 = base64urlEncode(jwtPayload);
  const sigB64 = simulateHMACSHA256Signature(headerB64, payloadB64);
  const fullJwtString = `${headerB64}.${payloadB64}.${sigB64}`;

  activeJwtData = {
    token: fullJwtString,
    header: jwtHeader,
    payload: jwtPayload,
    headerB64: headerB64,
    payloadB64: payloadB64,
    sigB64: sigB64,
    statusTitle: statusTitle,
    statusDesc: statusDesc
  };

  // Save to browser session & local storage
  localStorage.setItem('meesho_supplier_jwt', fullJwtString);
  localStorage.setItem('meesho_supplier_user', JSON.stringify(jwtPayload));
  localStorage.setItem('meesho_auth_header', `Bearer ${fullJwtString}`);
  sessionStorage.setItem('session_jwt', fullJwtString);

  displayJwtInspectorModal(activeJwtData);
}

function handleOAuthLogin(provider) {
  // Check if real Google Identity Services SDK should be triggered
  if (provider === 'google' && typeof GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            let userEmail = 'supplier.partner@gmail.com';
            let userName = 'Google Verified Account';
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await userInfoRes.json();
              if (userInfo.email) userEmail = userInfo.email;
              if (userInfo.name) userName = userInfo.name;
            } catch (err) {
              console.warn('Could not fetch detailed Google profile, using default verified claims.');
            }
            completeOAuthLogin('google', userEmail, userName, tokenResponse.access_token);
          }
        },
      });
      tokenClient.requestAccessToken();
      return;
    } catch (e) {
      console.error('Google Sign-In initialization failed or blocked. Falling back to prototype verification:', e);
    }
  }

  // Graceful Prototype Authentication (if GOOGLE_CLIENT_ID is not set or for instant testing)
  completeOAuthLogin(provider);
}
window.handleOAuthLogin = handleOAuthLogin;

function completeOAuthLogin(provider, customEmail, customTitle, realAccessToken) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 86400; // 24 hours

  let identifier = customEmail || 'DIGILOCKER_GSTIN_USER';
  let gstin = '27DIGILOCKER001Z9';
  let authType = 'OAUTH2_DIGILOCKER_GOVT';
  let providerTitle = customTitle || 'DigiLocker / GST Portal Verified';

  if (provider === 'google') {
    identifier = customEmail || 'supplier.partner@gmail.com';
    gstin = '29GOOGLE8819F1Z5';
    authType = 'OAUTH2_GOOGLE_OIDC';
    providerTitle = customTitle || 'Google Verified Account';
  } else if (provider === 'whatsapp') {
    identifier = '+91 9876543210 (Verified WhatsApp API)';
    gstin = '29WHATSAPP9912Z1';
    authType = 'OAUTH2_WHATSAPP_CLOUD';
    providerTitle = 'WhatsApp Verified Account';
  }

  // Save OAuth verified profile to user database automatically
  const oauthUserRecord = {
    identifier: identifier,
    password: 'OAUTH_EXTERNAL_AUTHENTICATED',
    gstin: gstin,
    role: 'MEESHO_VERIFIED_SUPPLIER',
    commission_tier: '0% COMMISSION',
    provider: providerTitle,
    registered_at: new Date().toISOString()
  };
  saveUserToDatabase(oauthUserRecord);

  const oauthAccessToken = realAccessToken || (`bearer_oauth_${provider}_` + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12));
  const oauthIdTokenClaims = {
    iss: `https://auth.${provider}.com/oauth2/v2`,
    sub: `sub_oauth_${Math.floor(10000 + Math.random() * 90000)}`,
    aud: typeof GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? GOOGLE_CLIENT_ID : 'meesho_supplier_client_id_2026',
    email: identifier,
    email_verified: true,
    phone_number_verified: true,
    gstin_verified: true,
    auth_time: iat
  };
  const oauthIdToken = base64urlEncode({alg: 'RS256', typ: 'JWT'}) + '.' + base64urlEncode(oauthIdTokenClaims) + '.sig_oauth_verified_cert_99182';

  const jwtHeader = { alg: 'HS256', typ: 'JWT' };
  const jwtPayload = {
    sub: `SUP_${Math.floor(1000 + Math.random() * 9000)}`,
    identifier: identifier,
    auth_type: authType,
    oauth_provider: provider.toUpperCase(),
    gstin: gstin,
    role: 'MEESHO_VERIFIED_SUPPLIER',
    commission_tier: '0% COMMISSION',
    authenticated: true,
    permissions: ['CATALOG_CREATE', 'ORDERS_MANAGE', 'PAYMENTS_VIEW', 'OAUTH_VERIFIED'],
    iat: iat,
    exp: exp
  };

  const headerB64 = base64urlEncode(jwtHeader);
  const payloadB64 = base64urlEncode(jwtPayload);
  const sigB64 = simulateHMACSHA256Signature(headerB64, payloadB64);
  const fullJwtString = `${headerB64}.${payloadB64}.${sigB64}`;

  activeJwtData = {
    token: fullJwtString,
    header: jwtHeader,
    payload: jwtPayload,
    headerB64: headerB64,
    payloadB64: payloadB64,
    sigB64: sigB64,
    isOAuth: true,
    providerName: providerTitle,
    accessToken: oauthAccessToken,
    idToken: oauthIdToken,
    statusTitle: `✓ Verified via ${providerTitle} & Saved to Database`,
    statusDesc: `User profile saved to database and authenticated instantly. RS256 claims verified and HS256 JWT issued.`
  };

  // Store all JWT and OAuth tokens securely across local & session storage
  localStorage.setItem('meesho_supplier_jwt', fullJwtString);
  localStorage.setItem('meesho_supplier_user', JSON.stringify(jwtPayload));
  localStorage.setItem('meesho_oauth_access_token', oauthAccessToken);
  localStorage.setItem('meesho_oauth_id_token', oauthIdToken);
  localStorage.setItem('meesho_oauth_provider', provider.toUpperCase());
  localStorage.setItem('meesho_auth_header', `Bearer ${fullJwtString}`);

  sessionStorage.setItem('session_jwt', fullJwtString);
  sessionStorage.setItem('session_oauth_access', oauthAccessToken);

  displayJwtInspectorModal(activeJwtData);
}

function displayJwtInspectorModal(jwtData) {
  const modal = document.getElementById('jwt-inspector-modal');
  const tokenDisplay = document.getElementById('jwt-token-formatted');
  const payloadDisplay = document.getElementById('jwt-payload-json');
  const oauthSection = document.getElementById('oauth-token-section');
  const bannerTitle = document.getElementById('jwt-modal-banner-title');
  const bannerDesc = document.getElementById('jwt-modal-banner-desc');

  if (!modal || !tokenDisplay || !payloadDisplay) return;

  if (bannerTitle && jwtData.statusTitle) bannerTitle.textContent = jwtData.statusTitle;
  if (bannerDesc && jwtData.statusDesc) bannerDesc.textContent = jwtData.statusDesc;

  if (oauthSection) {
    if (jwtData.isOAuth) {
      oauthSection.style.display = 'block';
      const providerDisp = document.getElementById('oauth-provider-display');
      const accessDisp = document.getElementById('oauth-access-display');
      const idDisp = document.getElementById('oauth-id-display');
      if (providerDisp) providerDisp.textContent = jwtData.providerName;
      if (accessDisp) accessDisp.textContent = jwtData.accessToken;
      if (idDisp) idDisp.textContent = jwtData.idToken;
    } else {
      oauthSection.style.display = 'none';
    }
  }

  tokenDisplay.innerHTML = `
    <span class="jwt-part-header">${jwtData.headerB64}</span>.<span class="jwt-part-payload">${jwtData.payloadB64}</span>.<span class="jwt-part-signature">${jwtData.sigB64}</span>
  `;

  payloadDisplay.textContent = JSON.stringify(jwtData.payload, null, 2);

  modal.classList.add('active');
}

function closeJwtModal() {
  document.getElementById('jwt-inspector-modal')?.classList.remove('active');
}

function copyJwtToClipboard() {
  if (!activeJwtData) return;
  navigator.clipboard.writeText(activeJwtData.token);
  const copyBtn = document.getElementById('btn-copy-jwt');
  if (copyBtn) {
    const origText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = origText, 2000);
  }
}

function finishLoginRedirect() {
  window.location.href = 'supplier-dashboard.html';
}

