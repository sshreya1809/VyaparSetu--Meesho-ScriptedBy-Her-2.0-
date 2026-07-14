/**
 * VyaparSETU 2.0 - Standalone AI Broker Logic
 */

const SCENARIOS = {
  'up-bedsheets': {
    title: 'UP East Bedsheet Liquidation (₹349)',
    rawPrompt: 'Clear 500 unbranded cotton bedsheets in UP this week at ₹349 unit price.',
    product: 'Jaipuri Double Cotton Bedsheets (Unbranded)',
    region: 'Uttar Pradesh (Lucknow, Kanpur, Varanasi)',
    volume: '500 Units',
    price: '₹349 • HIGH URGENCY',
    creators: [
      {
        id: 'cr-1',
        name: 'Arka Sharma (Bharat Top Influencer)',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        followers: '340K Followers',
        similarity: '99.9% ANN MATCH',
        headline: '🔥 अर्का शर्मा रेकमेंडेशन: 100% कॉटन डबल बेडशीट मात्र ₹349 में!',
        regional: 'Arka Sharma verified! Best Jaipuri double bedsheet on Meesho at factory wholesale rate ₹349. Cash on Delivery available!',
        hindi: 'अर्का शर्मा द्वारा सत्यापित: 100% पक्का रंग जयपुरी डबल कॉटन बेडशीट मात्र ₹349 में! फ्री होम डिलीवरी और COD उपलब्ध।',
        approved: true
      },
      {
        id: 'cr-2',
        name: 'Pooja Tiwari (Lucknow Lifestyle)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        followers: '84.2K Followers',
        similarity: '98.4% ANN MATCH',
        headline: '🛏️ लखनऊ वालो! शुद्ध 100% कॉटन बेडशीट केवल ₹349 में!',
        regional: 'Arre Bhauji, garmi me thandak dene wali 100% pucca rang Jaipuri cotton bedsheet ab Meesho par sidhe factory rate me!',
        hindi: 'अरे भौजी! गर्मी में ठंडक देने वाली 100% पक्का रंग जयपुरी कॉटन बेडशीट अब मीशो पर सीधे फैक्ट्री रेट ₹349 में!',
        approved: true
      }
    ]
  },
  'biar-sarees': {
    title: 'Bihar Banarasi Saree Surplus (₹699)',
    rawPrompt: 'Liquidate 300 Banarasi Silk Sarees in Bihar & Purvanchal before festival season at ₹699.',
    product: 'Festive Banarasi Silk Saree Collection',
    region: 'Bihar & Purvanchal (Patna, Gaya, Muzaffarpur)',
    volume: '300 Units',
    price: '₹699 • CRITICAL LIQUIDATION',
    creators: [
      {
        id: 'cr-3',
        name: 'Neha Bhojpuri Queen (Patna Fashion)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        followers: '210K Followers',
        similarity: '99.5% ANN MATCH',
        headline: '✨ बिहार की शान: बनारसी सिल्क साड़ी मात्र ₹699 में!',
        regional: 'Chhath aur shadi season ke liye sabse best Banarasi Saree Meesho par factory daam me!',
        hindi: 'त्योहारों के लिए खास: असली जरी बॉर्डर बनारसी सिल्क साड़ी अब मीशो पर केवल ₹699 में उपलब्ध।',
        approved: true
      }
    ]
  },
  'raj-kurtis': {
    title: 'Rajasthan Printed Kurti Set (₹499)',
    rawPrompt: 'Fast movement for 450 Jaipuri Block Printed Kurti Sets across Jaipur & Udaipur at ₹499.',
    product: 'Jaipuri Block Printed Cotton Kurti Set',
    region: 'Rajasthan (Jaipur, Jodhpur, Udaipur)',
    volume: '450 Units',
    price: '₹499 • NORMAL URGENCY',
    creators: [
      {
        id: 'cr-4',
        name: 'Kavita Rathore (Jaipur Ethnic Reels)',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        followers: '145K Followers',
        similarity: '99.1% ANN MATCH',
        headline: '🌸 जयपुर स्पेशल ब्लॉक प्रिंट कुर्ती सेट ₹499 में!',
        regional: 'Original Sanganeri hand block print kurti set directly from Jaipur artisans on Meesho.',
        hindi: 'सांगानेरी हैंड ब्लॉक प्रिंट 100% कॉटन कुर्ती सेट सीधे जयपुर के कारीगरों से केवल ₹499 में।',
        approved: true
      }
    ]
  }
};

let currentScenarioKey = 'up-bedsheets';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupScenarios();
  renderScenario(currentScenarioKey);
  setupLatencyTimer();
  setupLaunchDispatch();
});

function setupTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn[data-tab]');
  const tabViews = document.querySelectorAll('.tab-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
    });
  });
}

function setupScenarios() {
  const pills = document.querySelectorAll('.scenario-pill[data-scenario]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentScenarioKey = pill.dataset.scenario;
      renderScenario(currentScenarioKey);
    });
  });

  const runBtn = document.getElementById('btn-run-intent');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      renderScenario(currentScenarioKey);
    });
  }

  const voiceBtn = document.getElementById('btn-voice-record');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      voiceBtn.textContent = '🎙️ Listening... (Speak now)';
      voiceBtn.style.color = '#00f59b';
      setTimeout(() => {
        voiceBtn.textContent = '🎙️ Speak Goal (Hindi / Hinglish)';
        voiceBtn.style.color = '#fff';
        alert('🎙️ Voice input captured & parsed via Gemini Pro Speech NLP!');
      }, 2000);
    });
  }
}

function renderScenario(key) {
  const data = SCENARIOS[key];
  if (!data) return;

  const promptArea = document.getElementById('raw-intent-prompt');
  if (promptArea) promptArea.value = data.rawPrompt;

  const prodEl = document.getElementById('nlp-product');
  const regEl = document.getElementById('nlp-region');
  const volEl = document.getElementById('nlp-volume');
  const priceEl = document.getElementById('nlp-price');

  if (prodEl) prodEl.textContent = data.product;
  if (regEl) regEl.textContent = data.region;
  if (volEl) volEl.textContent = data.volume;
  if (priceEl) priceEl.textContent = data.price;

  const container = document.getElementById('creators-container');
  if (!container) return;

  container.innerHTML = data.creators.map((c, index) => `
    <div class="creator-card" id="card-${c.id}">
      <div class="creator-left">
        <img src="${c.avatar}" class="creator-avatar" alt="${c.name}" />
        <div class="creator-info">
          <h3>${c.name}</h3>
          <div class="creator-meta">${c.followers} • Regional Match</div>
          <span class="similarity-badge">⚡ ${c.similarity}</span>
        </div>
      </div>

      <div class="vernacular-box">
        <div class="vernacular-head">
          <span>AI VERNACULAR AD COPY</span>
          <span>HUMAN-IN-THE-LOOP REVIEW</span>
        </div>
        <div class="vernacular-text"><strong>${c.headline}</strong><br />${c.regional}</div>
        <div class="vernacular-hindi">${c.hindi}</div>
      </div>

      <div class="creator-actions">
        <button class="btn-approve" onclick="toggleCreatorStatus('${c.id}', true)">✓ Approved</button>
        <button class="btn-veto" onclick="toggleCreatorStatus('${c.id}', false)">✕ Veto / Exclude</button>
      </div>
    </div>
  `).join('');
}

function toggleCreatorStatus(id, isApproved) {
  const card = document.getElementById(`card-${id}`);
  if (card) {
    if (isApproved) {
      card.style.opacity = '1';
      card.style.borderColor = '#00f59b';
    } else {
      card.style.opacity = '0.45';
      card.style.borderColor = '#ff4458';
    }
  }
}

function setupLatencyTimer() {
  const badge = document.getElementById('qdrant-latency');
  if (!badge) return;

  setInterval(() => {
    const lat = Math.floor(Math.random() * (46 - 24 + 1)) + 24;
    badge.textContent = `Qdrant ANN: ${lat}ms`;
  }, 4000);
}

function setupLaunchDispatch() {
  const launchBtn = document.getElementById('btn-launch-campaign');
  const modal = document.getElementById('dispatch-modal');
  const closeBtn = document.getElementById('btn-close-dispatch');
  const doneBtn = document.getElementById('btn-done-dispatch');
  const logBody = document.getElementById('dispatch-log-body');

  const openModal = () => modal?.classList.add('active');
  const closeModal = () => modal?.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      openModal();
      if (!logBody) return;

      logBody.innerHTML = '';
      const logs = [
        '[00:00.12] 🟢 [CELERY WORKER POOL] Initiating multi-channel automated dispatch queue...',
        '[00:00.38] 🟢 [META CLOUD API WHATSAPP] Direct payload dispatched to verified creator -> ACK HTTP 200 OK',
        '[00:00.64] 🟢 [TRAI DLT SMS GATEWAY] Direct SMS alert delivered -> DLT Template Verified (#MSH-88219)',
        '[00:00.91] 🟢 [GMAIL SMTP RELAY] Direct email campaign brief sent -> 250 2.0.0 OK Handshake',
        '[00:01.20] 🎉 [SUCCESS] All creators notified! Campaign tracking live.'
      ];

      logs.forEach((line, i) => {
        setTimeout(() => {
          logBody.innerHTML += `<div class="log-entry">${line}</div>`;
          logBody.scrollTop = logBody.scrollHeight;
          if (i === logs.length - 1 && typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          }
        }, (i + 1) * 450);
      });
    });
  }
}
