/**
 * Meesho Supplier Hub Panel - Interactive Dashboard Logic
 */

// ==================== STRICT AUTHENTICATION GUARD ====================
(function enforceSupplierAuthentication() {
  const jwt = localStorage.getItem('meesho_supplier_jwt') || sessionStorage.getItem('session_jwt');
  const user = localStorage.getItem('meesho_supplier_user');
  if (!jwt && !user) {
    // Unauthenticated access blocked: immediately redirect to login
    window.location.href = 'supplier-auth.html?mode=login';
  }
})();
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
  window.name = 'meesho_supplier_hub_main';
  loadJwtSessionProfile();
  setupStepperTabs();
  setupCatalogModal();
  setupSidebarNavigation();
});

function loadJwtSessionProfile() {
  const userJson = localStorage.getItem('meesho_supplier_user');
  const jwtToken = localStorage.getItem('meesho_supplier_jwt');
  let supplierName = 'Frostilicious'; // Default demo store name

  const nameEl = document.getElementById('hub-welcome-name');
  const storeSelectorEl = document.getElementById('store-name-display');
  const storeAvatarEl = document.getElementById('store-avatar-char');
  const logoutBtn = document.getElementById('sidebar-logout-btn') || document.querySelector('.sidebar-logout-btn');

  if (!userJson && !jwtToken) {
    // No active session detected (User has logged out or hasn't signed in)
    if (nameEl) nameEl.textContent = 'Welcome Guest (Not Logged In)';
    if (storeSelectorEl) storeSelectorEl.textContent = 'Guest Store';
    if (storeAvatarEl) storeAvatarEl.textContent = '🔒';
    if (logoutBtn) {
      logoutBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
        <span>Sign In</span>
      `;
      logoutBtn.onclick = () => window.location.href = 'supplier-auth.html?mode=login';
      logoutBtn.style.background = '#EEECFA';
      logoutBtn.style.color = '#9F2089';
      logoutBtn.style.borderColor = '#C4BAF0';
    }
    return;
  }

  if (logoutBtn) {
    logoutBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      <span>Logout</span>
    `;
    logoutBtn.onclick = () => handleSupplierLogout();
    logoutBtn.style.background = 'rgba(239, 68, 68, 0.15)';
    logoutBtn.style.color = '#F87171';
    logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  }

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.identifier) {
        const cleanId = user.identifier.split('@')[0];
        supplierName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
      }
    } catch (err) {
      console.warn('Error reading session user:', err);
    }
  }

  if (nameEl) nameEl.textContent = `Welcome ${supplierName}`;
  if (storeSelectorEl) storeSelectorEl.textContent = supplierName;
  if (storeAvatarEl) storeAvatarEl.textContent = supplierName.charAt(0).toUpperCase();
}

function setupStepperTabs() {
  const tabs = document.querySelectorAll('.stepper-tab');
  const stepContentBox = document.getElementById('stepper-dynamic-header');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (stepContentBox) {
        if (index === 0) {
          stepContentBox.textContent = 'Choose how you would like to upload your catalog';
        } else if (index === 1) {
          stepContentBox.textContent = 'Catalog Quality Check & Live Verification Status';
        } else {
          stepContentBox.textContent = 'Manage Inventory & Track Your First Orders';
        }
      }
    });
  });
}

function setupCatalogModal() {
  const modal = document.getElementById('single-catalog-modal');
  const btnSingle = document.getElementById('btn-add-single');
  const btnBulk = document.getElementById('btn-add-bulk');
  const btnClose = document.getElementById('btn-close-catalog-modal');
  const btnCancel = document.getElementById('btn-cancel-catalog-modal');
  const form = document.getElementById('single-catalog-form');

  if (btnSingle) {
    btnSingle.addEventListener('click', () => {
      window.location.href = 'supplier-catalog-upload.html';
    });
  }

  if (btnBulk) {
    btnBulk.addEventListener('click', () => {
      window.location.href = 'supplier-catalog-upload.html';
    });
  }

  const closeModal = () => modal?.classList.remove('active');

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const prodName = document.getElementById('cat-prod-name')?.value || 'New Product';
      const prodPrice = document.getElementById('cat-prod-price')?.value || '499';

      alert(`Catalog successfully uploaded for "${prodName}" at ₹${prodPrice}! It will go live after standard 0% Commission QC.`);
      closeModal();
      form.reset();
    });
  }
}

function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && href.endsWith('.html')) {
        // Allow standard navigation to supplier-influencer.html or other HTML pages
        return;
      }
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ============================ REAL LOGOUT FUNCTIONALITY ============================ */
function handleSupplierLogout() {
  if (!confirm('Are you sure you want to log out from Meesho Supplier Hub? This will erase all authenticated session tokens and redirect you to the login screen.')) {
    return;
  }

  // Revoke Google OAuth Access Token if active
  const oauthAccess = localStorage.getItem('meesho_oauth_access_token');
  if (oauthAccess && window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      google.accounts.oauth2.revoke(oauthAccess, () => {
        console.log('Google OAuth token revoked from server.');
      });
    } catch (e) {
      console.warn('Could not revoke Google OAuth token:', e);
    }
  }

  // Update persistent user database state to unauthenticated
  try {
    const userJson = localStorage.getItem('meesho_supplier_user');
    if (userJson) {
      const userObj = JSON.parse(userJson);
      const dbJson = localStorage.getItem('meesho_supplier_users_db');
      if (dbJson && userObj.identifier) {
        const db = JSON.parse(dbJson);
        if (db[userObj.identifier]) {
          db[userObj.identifier].authenticated = false;
          localStorage.setItem('meesho_supplier_users_db', JSON.stringify(db));
        }
      }
    }
  } catch (err) {
    console.warn('Error updating database logout state:', err);
  }

  // Erase ALL supplier authenticated details and JWT tokens across local and session storage
  const keysToRemove = [
    'meesho_supplier_jwt',
    'meesho_supplier_user',
    'meesho_auth_header',
    'meesho_oauth_access_token',
    'meesho_oauth_id_token',
    'meesho_oauth_provider'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));

  sessionStorage.removeItem('session_jwt');
  sessionStorage.removeItem('session_oauth_access');

  alert('✓ Successfully logged out! Authenticated session tokens and user details have been erased.');
  window.location.href = 'supplier-auth.html?mode=login';
}
window.handleSupplierLogout = handleSupplierLogout;
