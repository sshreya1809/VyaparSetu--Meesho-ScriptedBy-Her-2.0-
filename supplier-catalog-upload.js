/**
 * Meesho Supplier Hub - Catalog Database & Upload Engine
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

const DEFAULT_CATALOGS = [
  {
    id: 'MSH-KRTI-101',
    title: 'Designer Floral Silk Anarkali Kurti',
    category: 'Women Ethnic',
    price: 599,
    mrp: 1499,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    influencerEnrolled: true,
    roi: '8% ROI'
  },
  {
    id: 'MSH-SRE-204',
    title: 'Georgette Embroidered Saree with Blouse',
    category: 'Women Ethnic',
    price: 1299,
    mrp: 2999,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    influencerEnrolled: true,
    roi: '6% ROI'
  },
  {
    id: 'MSH-WTCH-88',
    title: 'Men Luxury Chronograph Wrist Watch',
    category: 'Men Fashion',
    price: 849,
    mrp: 1999,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80',
    influencerEnrolled: false,
    roi: '10% ROI'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initCatalogDatabase();
  setupTabSwitcher();
  setupPresetThumbnails();
  setupAddCatalogForm();
  renderMyCatalogsTable();
});

function initCatalogDatabase() {
  const existing = localStorage.getItem('meesho_supplier_catalogs');
  if (!existing) {
    localStorage.setItem('meesho_supplier_catalogs', JSON.stringify(DEFAULT_CATALOGS));
  }
  updateCatalogCountBadge();
}

function getStoredCatalogs() {
  try {
    const raw = localStorage.getItem('meesho_supplier_catalogs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return DEFAULT_CATALOGS;
  }
}

function saveCatalogs(catalogs) {
  localStorage.setItem('meesho_supplier_catalogs', JSON.stringify(catalogs));
  updateCatalogCountBadge();
}

function updateCatalogCountBadge() {
  const catalogs = getStoredCatalogs();
  const badge = document.getElementById('my-catalogs-badge');
  if (badge) badge.textContent = catalogs.length;
}

function setupTabSwitcher() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const views = document.querySelectorAll('.tab-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      views.forEach(v => {
        v.classList.remove('active');
        if (v.id === target) {
          v.classList.add('active');
        }
      });

      if (target === 'view-my-catalogs') {
        renderMyCatalogsTable();
      }
    });
  });
}

function setupPresetThumbnails() {
  const thumbs = document.querySelectorAll('.preset-thumb');
  const imgDisplay = document.getElementById('preview-img-display');
  const placeholder = document.getElementById('preview-placeholder');
  const imgUrlInput = document.getElementById('cat-img-url');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const url = thumb.dataset.img;

      if (imgUrlInput) imgUrlInput.value = url;
      if (imgDisplay && placeholder) {
        imgDisplay.src = url;
        imgDisplay.style.display = 'block';
        placeholder.style.display = 'none';
      }
    });
  });

  if (imgUrlInput) {
    imgUrlInput.addEventListener('input', () => {
      const url = imgUrlInput.value.trim();
      if (url && imgDisplay && placeholder) {
        imgDisplay.src = url;
        imgDisplay.style.display = 'block';
        placeholder.style.display = 'none';
      }
    });
  }

  // Device File Upload Handler
  const btnDevice = document.getElementById('btn-device-upload');
  const fileInput = document.getElementById('cat-file-input');
  if (btnDevice && fileInput) {
    btnDevice.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          if (imgUrlInput) imgUrlInput.value = dataUrl;
          if (imgDisplay && placeholder) {
            imgDisplay.src = dataUrl;
            imgDisplay.style.display = 'block';
            placeholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Google Drive / Cloud Link Import Handler
  const btnGDrive = document.getElementById('btn-gdrive-import');
  if (btnGDrive) {
    btnGDrive.addEventListener('click', () => {
      const inputLink = prompt('Paste Google Drive public share link or any Image URL:');
      if (inputLink && inputLink.trim()) {
        let finalUrl = inputLink.trim();
        // Extract Google Drive File ID if present
        const gdriveMatch = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || finalUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (gdriveMatch && gdriveMatch[1]) {
          finalUrl = `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
        }
        if (imgUrlInput) imgUrlInput.value = finalUrl;
        if (imgDisplay && placeholder) {
          imgDisplay.src = finalUrl;
          imgDisplay.style.display = 'block';
          placeholder.style.display = 'none';
        }
      }
    });
  }

  // Drag-and-Drop Zone Handler
  const dropzone = document.getElementById('dropzone-card');
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#4A1FB8';
      dropzone.style.background = '#EEECFA';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '#C3B4ED';
      dropzone.style.background = '#F9F8FE';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#C3B4ED';
      dropzone.style.background = '#F9F8FE';
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          if (imgUrlInput) imgUrlInput.value = dataUrl;
          if (imgDisplay && placeholder) {
            imgDisplay.src = dataUrl;
            imgDisplay.style.display = 'block';
            placeholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function setupAddCatalogForm() {
  const form = document.getElementById('new-catalog-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('cat-title')?.value.trim() || 'New Designer Product';
    const sku = document.getElementById('cat-sku')?.value.trim() || `MSH-${Math.floor(1000 + Math.random() * 9000)}`;
    const category = document.getElementById('cat-category')?.value || 'Women Ethnic';
    const price = parseInt(document.getElementById('cat-price')?.value || '499', 10);
    const mrp = parseInt(document.getElementById('cat-mrp')?.value || '999', 10);
    const stock = parseInt(document.getElementById('cat-stock')?.value || '50', 10);
    const image = document.getElementById('cat-img-url')?.value.trim() || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80';
    const influencerEnrolled = document.getElementById('inf-enroll-toggle')?.checked || false;

    const newCat = {
      id: sku,
      title,
      category,
      price,
      mrp,
      stock,
      image,
      influencerEnrolled,
      roi: influencerEnrolled ? '8% ROI' : 'Not Enrolled'
    };

    const catalogs = getStoredCatalogs();
    catalogs.unshift(newCat);
    saveCatalogs(catalogs);

    alert(`✅ Product "${title}" (${sku}) successfully stored in your Meesho Catalog Database!\n\nSent to Influencer Program: ${influencerEnrolled ? 'YES (50K+ Creators)' : 'NO'}`);

    form.reset();

    // Switch to My Catalogs tab automatically
    const myCatBtn = document.querySelector('.tab-btn[data-target="view-my-catalogs"]');
    if (myCatBtn) myCatBtn.click();
  });
}

function renderMyCatalogsTable() {
  const tbody = document.getElementById('my-catalogs-tbody');
  if (!tbody) return;

  const catalogs = getStoredCatalogs();

  if (catalogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #8B8BA3;">
          No catalogs found in database. Click "Add New Catalog" above to upload your first product!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = catalogs.map((cat, index) => `
    <tr>
      <td>
        <div class="prod-cell">
          <img src="${cat.image}" alt="${cat.title}" class="prod-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80'" />
          <div>
            <div class="prod-title">${cat.title}</div>
            <div class="prod-sku">SKU: ${cat.id}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="cat-badge">${cat.category}</span>
      </td>
      <td>
        <div class="price-text">₹${cat.price}</div>
        <div style="font-size: 11.5px; text-decoration: line-through; color: #8B8BA3;">MRP ₹${cat.mrp || cat.price * 2}</div>
      </td>
      <td>
        <span class="stock-pill">
          <span class="stock-dot"></span>
          ${cat.stock || 50} in stock
        </span>
      </td>
      <td>
        <button class="btn-influencer-status ${cat.influencerEnrolled ? 'enrolled' : 'not-enrolled'}" onclick="toggleInfluencerEnrollment('${cat.id}')">
          ${cat.influencerEnrolled ? '🌟 Enrolled in Influencers (Live)' : '+ Send to Influencer Program'}
        </button>
      </td>
      <td>
        <button class="btn-delete-cat" onclick="deleteCatalogItem('${cat.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

window.toggleInfluencerEnrollment = function(sku) {
  const catalogs = getStoredCatalogs();
  const idx = catalogs.findIndex(c => c.id === sku);
  if (idx !== -1) {
    catalogs[idx].influencerEnrolled = !catalogs[idx].influencerEnrolled;
    catalogs[idx].roi = catalogs[idx].influencerEnrolled ? '8% ROI' : 'Not Enrolled';
    saveCatalogs(catalogs);
    renderMyCatalogsTable();
    const status = catalogs[idx].influencerEnrolled ? 'ENROLLED in 50K+ Influencer Promotion' : 'REMOVED from Influencer Promotion';
    alert(`Catalog [${sku}] is now ${status}!`);
  }
};

window.deleteCatalogItem = function(sku) {
  if (confirm(`Are you sure you want to delete SKU ${sku} from your Meesho Catalog Database?`)) {
    let catalogs = getStoredCatalogs();
    catalogs = catalogs.filter(c => c.id !== sku);
    saveCatalogs(catalogs);
    renderMyCatalogsTable();
  }
};

/* ============================ GLOBAL LOGOUT FUNCTIONALITY ============================ */
function handleSupplierLogout() {
  if (!confirm('Are you sure you want to log out and erase your Meesho Supplier session data?')) {
    return;
  }
  const dbJson = localStorage.getItem('meesho_supplier_users_db');
  if (dbJson) {
    try {
      const db = JSON.parse(dbJson);
      const userJson = localStorage.getItem('meesho_supplier_user');
      if (userJson) {
        const userObj = JSON.parse(userJson);
        if (db[userObj.identifier]) {
          db[userObj.identifier].authenticated = false;
          localStorage.setItem('meesho_supplier_users_db', JSON.stringify(db));
        }
      }
    } catch (err) {
      console.warn('Error updating database logout state:', err);
    }
  }

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
