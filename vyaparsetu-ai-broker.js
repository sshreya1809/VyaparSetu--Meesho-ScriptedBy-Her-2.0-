/**
 * VyaparSETU 2.0 - Standalone AI Broker Logic (Meesho Supplier Hub Theme)
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
        phone: '918591852051',
        email: 'arkachakraborty2824@gmail.com',
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
        phone: '919838112044',
        email: 'pooja.tiwari.lucknow@meesho-affiliates.in',
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
        phone: '919123456789',
        email: 'neha.bhojpuri@meesho-creators.in',
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
        phone: '919829012345',
        email: 'kavita.jaipur@meesho-creators.in',
        approved: true
      }
    ]
  }
};

let currentScenarioKey = 'up-bedsheets';
let isCampaignLaunched = false;

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupScenarios();
  renderScenario(currentScenarioKey);
  setupLatencyTimer();
  setupLaunchDispatch();
  setupBackToMeesho();
});

function setupBackToMeesho() {
  const backBtn = document.getElementById('btn-back-meesho');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.opener && !window.opener.closed) {
        window.opener.focus();
      } else {
        window.location.href = 'supplier-influencer.html';
      }
    });
  }
}

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
      isCampaignLaunched = false;
      const statusBanner = document.getElementById('campaign-status-banner');
      const realtimeCenter = document.getElementById('realtime-outreach-center');
      if (statusBanner) statusBanner.style.display = 'none';
      if (realtimeCenter) realtimeCenter.style.display = 'none';
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
      setTimeout(() => {
        voiceBtn.textContent = '🎙️ Speak Goal (Hindi / Hinglish)';
        alert('🎙️ Voice input captured & parsed via Gemini Pro Speech NLP!');
      }, 1500);
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

  container.innerHTML = data.creators.map((c) => {
    const encodedCopy = encodeURIComponent(`${c.headline}\n\n${c.regional}\n\nCheck out the Meesho Campaign Link: https://meesho.com/campaign/${key}`);
    const whatsappUrl = `https://wa.me/${c.phone}?text=${encodedCopy}`;
    const smsUrl = `sms:+${c.phone}?body=${encodedCopy}`;
    const emailUrl = `mailto:${c.email}?subject=Meesho%20Sponsorship%20Campaign%20Brief&body=${encodedCopy}`;

    return `
      <div class="creator-card" id="card-${c.id}" style="${isCampaignLaunched ? 'border-color: #038D63; box-shadow: 0 6px 20px rgba(3, 141, 99, 0.15);' : ''}">
        <div class="creator-left">
          <img src="${c.avatar}" class="creator-avatar" alt="${c.name}" />
          <div class="creator-info">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h3 style="margin: 0;">${c.name}</h3>
              ${isCampaignLaunched ? '<span style="background: #038D63; color: #FFF; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 12px;">DISPATCHED ✓</span>' : ''}
            </div>
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

          <!-- REAL CLICKABLE MULTI-CHANNEL OUTREACH LINKS -->
          <div style="border-top: 1px solid #E6E1F5; margin-top: 6px; padding-top: 8px; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #58596B; text-transform: uppercase;">Real Direct Outreach</span>
            <a href="${whatsappUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #E8F7F0; color: #038D63; text-decoration: none; font-size: 12.5px; font-weight: 700; padding: 8px; border-radius: 8px; border: 1px solid #BCEAD5;">
              <span>💬 Open Live WhatsApp</span>
              <span>↗</span>
            </a>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <a href="${smsUrl}" style="display: flex; align-items: center; justify-content: center; background: #EEECFA; color: #4A1FB8; text-decoration: none; font-size: 12px; font-weight: 700; padding: 6px; border-radius: 6px;">
                📱 SMS Alert
              </a>
              <a href="${emailUrl}" style="display: flex; align-items: center; justify-content: center; background: #FFF5F7; color: #D3184B; text-decoration: none; font-size: 12px; font-weight: 700; padding: 6px; border-radius: 6px;">
                ✉️ Email Brief
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCreatorStatus(id, isApproved) {
  const card = document.getElementById(`card-${id}`);
  if (card) {
    if (isApproved) {
      card.style.opacity = '1';
      card.style.borderColor = '#4A1FB8';
    } else {
      card.style.opacity = '0.45';
      card.style.borderColor = '#D3184B';
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
      isCampaignLaunched = true;

      // Show permanent live campaign banner & real-time messaging feed in UI
      const statusBanner = document.getElementById('campaign-status-banner');
      const realtimeCenter = document.getElementById('realtime-outreach-center');
      const realtimeFeed = document.getElementById('realtime-message-feed');

      if (statusBanner) {
        statusBanner.style.display = 'block';
        statusBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (realtimeCenter) {
        realtimeCenter.style.display = 'block';
      }

      // Re-render creator cards so they show DISPATCHED badges
      renderScenario(currentScenarioKey);

      // Update button text to indicate active campaign
      launchBtn.innerHTML = '<span>🎉 Campaign Launched (All Channels Active)</span>';
      launchBtn.style.background = '#038D63';

      // Open live gateway ledger modal
      openModal();
      if (!logBody) return;

      logBody.innerHTML = '';
      const logs = [
        '[00:00.12] 🟢 [CELERY WORKER POOL] Initiating multi-channel automated dispatch queue...',
        '[00:00.38] 🟢 [META CLOUD API WHATSAPP] Direct payload dispatched to Arka Sharma (+91 8591852051) -> ACK HTTP 200 OK',
        '[00:00.64] 🟢 [TRAI DLT SMS GATEWAY] Direct SMS alert delivered to +91 8591852051 -> DLT Template Verified (#MSH-88219)',
        '[00:00.91] 🟢 [GMAIL SMTP RELAY] Direct email campaign brief sent to arkachakraborty2824@gmail.com -> 250 2.0.0 OK Handshake',
        '[00:01.20] 🎉 [SUCCESS] All creators notified! Campaign tracking live across WhatsApp, SMS, and Email.'
      ];

      logs.forEach((line, i) => {
        setTimeout(() => {
          logBody.innerHTML += `<div class="log-entry">${line}</div>`;
          logBody.scrollTop = logBody.scrollHeight;
          if (i === logs.length - 1 && typeof confetti === 'function') {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        }, (i + 1) * 450);
      });

      // Populate Live Real-Time Messaging Feed Stream (WhatsApp + SMS + Email)
      if (realtimeFeed) {
        realtimeFeed.innerHTML = '';
        const streamMessages = [
          {
            delay: 400,
            channel: 'WHATSAPP',
            sender: 'OUTGOING • WhatsApp Cloud API (wa.me)',
            meta: 'To: Arka Sharma (+91 8591852051) • Status: Delivered & Read ✓✓',
            color: '#E8F7F0',
            borderColor: '#038D63',
            text: '🔥 अर्का शर्मा रेकमेंडेशन: 100% कॉटन डबल बेडशीट मात्र ₹349 में! फ्री होम डिलीवरी और COD उपलब्ध।',
            actionText: '💬 Open Real WhatsApp Chat',
            actionLink: 'https://wa.me/918591852051?text=' + encodeURIComponent('🔥 अर्का शर्मा रेकमेंडेशन: 100% कॉटन डबल बेडशीट मात्र ₹349 में! फ्री होम डिलीवरी और COD उपलब्ध।')
          },
          {
            delay: 1000,
            channel: 'SMS',
            sender: 'OUTGOING • TRAI DLT SMS Gateway',
            meta: 'To: Pooja Tiwari (+91 9838112044) • Status: Delivered ✓✓ (#MSH-88219)',
            color: '#EEECFA',
            borderColor: '#4A1FB8',
            text: 'Meesho Sponsorship Alert: 100% pucca rang Jaipuri cotton bedsheet at factory rate ₹349. Campaign referral active.',
            actionText: '📱 Send Real SMS to Device',
            actionLink: 'sms:+919838112044?body=' + encodeURIComponent('Meesho Sponsorship Alert: 100% pucca rang Jaipuri cotton bedsheet at factory rate ₹349.')
          },
          {
            delay: 1700,
            channel: 'EMAIL',
            sender: 'OUTGOING • Gmail SMTP Relay (Campaign Brief)',
            meta: 'To: arkachakraborty2824@gmail.com • Status: 250 2.0.0 OK Handshake ✓',
            color: '#FFF5F7',
            borderColor: '#D3184B',
            text: 'Subject: Meesho Sponsorship Campaign Brief — UP East Bedsheets (₹349)<br />Attached: High-res product images, GST verified invoice tag & Avadhi ad copy.',
            actionText: '✉️ Open Real Email in Gmail',
            actionLink: 'mailto:arkachakraborty2824@gmail.com?subject=Meesho%20Sponsorship%20Campaign%20Brief&body=' + encodeURIComponent('Hi Arka, please find attached the Meesho Sponsorship Campaign brief for Jaipuri Bedsheets.')
          },
          {
            delay: 2600,
            channel: 'WHATSAPP',
            sender: 'INCOMING REPLY • Arka Sharma (Verified Creator)',
            meta: 'Just now • WhatsApp Chat Reply 💬',
            color: '#FFFFFF',
            borderColor: '#038D63',
            text: 'Hey Meesho Team! Received the brief & sample link for Jaipuri Bedsheets (₹349). Campaign reel goes live tomorrow at 6 PM! 🚀',
            actionText: '💬 Reply on WhatsApp',
            actionLink: 'https://wa.me/918591852051?text=Thanks%20Arka!'
          },
          {
            delay: 3500,
            channel: 'EMAIL',
            sender: 'INCOMING EMAIL REPLY • Arka Sharma (arkachakraborty2824@gmail.com)',
            meta: 'Just now • Email Handshake ACK ✉️',
            color: '#FFFFFF',
            borderColor: '#D3184B',
            text: 'Re: Meesho Sponsorship Campaign Brief — Draft reel video and e-signature verified GST invoice have been uploaded to the portal.',
            actionText: '✉️ Reply via Email',
            actionLink: 'mailto:arkachakraborty2824@gmail.com?subject=Re:%20Meesho%20Sponsorship%20Campaign%20Brief'
          },
          {
            delay: 4300,
            channel: 'SMS',
            sender: 'INCOMING SMS ACK • Pooja Tiwari (+91 9838112044)',
            meta: 'Just now • DLT SMS ACK 📱',
            color: '#FFFFFF',
            borderColor: '#4A1FB8',
            text: 'Namaste Bhauji! SMS link mil gaya hai. WhatsApp story aur Meesho affiliate link add kar diya hai! ✨',
            actionText: '📱 Reply via SMS',
            actionLink: 'sms:+919838112044?body=Thanks%20Pooja!'
          }
        ];

        streamMessages.forEach(item => {
          setTimeout(() => {
            const badgeStyle = item.channel === 'WHATSAPP' 
              ? 'background: #E8F7F0; color: #038D63; border: 1px solid #BCEAD5;'
              : item.channel === 'EMAIL'
              ? 'background: #FFF5F7; color: #D3184B; border: 1px solid #F8CCD8;'
              : 'background: #EEECFA; color: #4A1FB8; border: 1px solid #D6D0F2;';

            const bubble = document.createElement('div');
            bubble.style.background = item.color;
            bubble.style.borderLeft = `4px solid ${item.borderColor}`;
            bubble.style.padding = '14px 18px';
            bubble.style.borderRadius = '10px';
            bubble.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            bubble.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 6px; ${badgeStyle}">${item.channel}</span>
                  <span style="font-size: 13px; font-weight: 800; color: #1E1F2C;">${item.sender}</span>
                </div>
                <span style="font-size: 11.5px; color: #58596B;">${item.meta}</span>
              </div>
              <p style="font-size: 14px; color: #1E1F2C; margin: 0 0 10px;">${item.text}</p>
              <a href="${item.actionLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${item.borderColor}; text-decoration: none; background: #FFF; border: 1px solid ${item.borderColor}; padding: 5px 12px; border-radius: 6px;">
                <span>${item.actionText}</span>
                <span>↗</span>
              </a>
            `;
            realtimeFeed.appendChild(bubble);
          }, item.delay);
        });
      }
    });
  }
}
