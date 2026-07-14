/**
 * Meesho Supplier Hub - Influencer Marketing Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadStoreProfile();
  setupCatalogSelectionModal();
  setupESignatureAlert();
  setupAIRobotAutomation();
});

function loadStoreProfile() {
  const userJson = localStorage.getItem('meesho_supplier_user');
  let supplierName = 'Frostilicious';

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.identifier) {
        const cleanId = user.identifier.split('@')[0];
        supplierName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
      }
    } catch (err) {}
  }

  const storeSelectorEl = document.getElementById('store-name-display');
  const storeAvatarEl = document.getElementById('store-avatar-char');

  if (storeSelectorEl) storeSelectorEl.textContent = supplierName;
  if (storeAvatarEl) storeAvatarEl.textContent = supplierName.charAt(0).toUpperCase();
}

function setupCatalogSelectionModal() {
  const modal = document.getElementById('catalog-selection-modal');
  const topBtn = document.getElementById('btn-select-catalogs-top');
  const mainBtn = document.getElementById('btn-select-catalogs-main');
  const closeBtn = document.getElementById('btn-close-cat-modal');
  const cancelBtn = document.getElementById('btn-cancel-cat-modal');
  const enrollBtn = document.getElementById('btn-confirm-enroll');

  const openModal = () => {
    populateInfluencerModalList();
    modal?.classList.add('active');
  };
  const closeModal = () => modal?.classList.remove('active');

  if (topBtn) topBtn.addEventListener('click', openModal);
  if (mainBtn) mainBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (enrollBtn) {
    enrollBtn.addEventListener('click', () => {
      alert('🎉 Success! Your selected catalogs have been enrolled and sent to 50,000+ Meesho Influencers for reel creation.');
      closeModal();
      if (topBtn) {
        topBtn.textContent = '✓ Catalogs Enrolled';
        topBtn.style.background = '#038D63';
      }
      if (mainBtn) {
        mainBtn.textContent = '✓ Catalogs Enrolled in Influencer Program';
        mainBtn.style.background = '#038D63';
      }
    });
  }
}

function populateInfluencerModalList() {
  const container = document.querySelector('.modal-content-pad');
  if (!container) return;

  let catalogs = [];
  try {
    const raw = localStorage.getItem('meesho_supplier_catalogs');
    if (raw) catalogs = JSON.parse(raw);
  } catch (e) {}

  if (catalogs.length === 0) {
    return; // Keep existing static defaults if no database items
  }

  container.innerHTML = `
    <p style="font-size: 13.5px; color: #58596B; margin-bottom: 16px;">Select catalogs from your Meesho Database to enroll them in Influencer Reels:</p>
    ${catalogs.map(cat => `
      <div class="catalog-check-row">
        <div class="catalog-info-left">
          <input type="checkbox" ${cat.influencerEnrolled ? 'checked' : ''} style="width: 18px; height: 18px;" />
          <img src="${cat.image}" alt="${cat.title}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
          <div>
            <div class="cat-title">${cat.title}</div>
            <div class="cat-meta">SKU: ${cat.id} • Selling Price: ₹${cat.price}</div>
          </div>
        </div>
        <span class="comm-badge">${cat.roi || '8% ROI'}</span>
      </div>
    `).join('')}
  `;
}

function setupESignatureAlert() {
  const addSigBtn = document.getElementById('btn-add-esignature');
  const alertStrip = document.getElementById('esignature-alert-strip');

  if (addSigBtn && alertStrip) {
    addSigBtn.addEventListener('click', () => {
      const name = prompt('Enter your full legal name or E-Signature to authorize GST invoices & credit notes:');
      if (name && name.trim()) {
        alertStrip.style.transition = 'all 0.3s ease';
        alertStrip.style.background = '#E6F8F1';
        alertStrip.style.borderColor = '#A7EAD1';
        alertStrip.innerHTML = `
          <div class="esig-left">
            <span style="color: #038D63; font-size: 18px;">✓</span>
            <div>
              <div class="esig-title" style="color: #038D63;">E-Signature Verified (${name.trim()})</div>
              <div class="esig-subtitle" style="color: #2F6B52;">Your e-signature is active for all automated customer invoicing.</div>
            </div>
          </div>
        `;
      }
    });
  }
}

function setupAIRobotAutomation() {
  const openBtn = document.getElementById('btn-open-ai-robot');
  const modal = document.getElementById('ai-console-modal');
  const closeBtn = document.getElementById('btn-close-ai-modal');
  const cancelBtn = document.getElementById('btn-cancel-ai-modal');
  const activateBtn = document.getElementById('btn-confirm-ai-activate');
  const terminalLog = document.getElementById('ai-terminal-log');

  const openModal = () => modal?.classList.add('active');
  const closeModal = () => modal?.classList.remove('active');

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (activateBtn) {
    activateBtn.addEventListener('click', () => {
      activateBtn.disabled = true;
      activateBtn.textContent = '🤖 Autonomous AI Running...';
      
      const lines = [
        '[00:01s] Scanning Meesho Catalog Database (meesho_supplier_catalogs)...',
        '[00:02s] Found 3 Active SKUs -> Matching with Top Reel Creators...',
        '[00:03s] SKU MSH-KRTI-101 matched with @lishapatel._ (Reach: 450k views)',
        '[00:04s] Dynamic Commission auto-balanced to 8.2% ROI to outbid competitors.',
        '[00:05s] ✅ AUTONOMOUS INFLUENCER AUTO-PILOT ENGAGED! 🚀'
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < lines.length) {
          if (terminalLog) {
            terminalLog.innerHTML += `\n${lines[i]}`;
            terminalLog.scrollTop = terminalLog.scrollHeight;
          }
          i++;
        } else {
          clearInterval(interval);
          alert('🎉 Autonomous Influencer Auto-Pilot Activated!\n\nVyaparSetu Bot 2.0 is now automatically managing influencer reels & commissions for your catalogs 24/7.');
          closeModal();
          activateBtn.disabled = false;
          activateBtn.textContent = '🚀 Activate Autonomous AI Mode';

          if (openBtn) {
            openBtn.innerHTML = `
              <span class="robot-btn-icon">🤖</span>
              <span>AI Auto-Pilot ACTIVE (3 Campaigns Live) ✨</span>
            `;
            openBtn.style.background = 'linear-gradient(135deg, #038D63 0%, #05B37E 100%)';
            openBtn.style.boxShadow = '0 8px 24px rgba(3, 141, 99, 0.4)';
          }

          const statusPill = document.querySelector('.ai-status-pill');
          if (statusPill) {
            statusPill.textContent = 'AUTO-PILOT ACTIVE 🟢';
            statusPill.style.background = '#E8F7F0';
            statusPill.style.color = '#038D63';
          }
        }
      }, 500);
    });
  }
}
