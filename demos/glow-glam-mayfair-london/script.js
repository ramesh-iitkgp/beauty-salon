/**
 * Luxe Glow Salon & Spa — Frontend Automation & Dynamic Script
 * Connects to data/business.json and powers interactive treatment booking.
 */

// Global state
let salonData = null;
let currentCurrency = "£";

// Treatment base prices (in GBP baseline, scaled by currency)
const TREATMENT_PRICES = {
  cut: { name: "Signature Haircut & Blowout", basePrice: 65, duration: "60 mins" },
  balayage: { name: "Artisan Balayage & Color Gloss", basePrice: 160, duration: "180 mins" },
  facial: { name: "Hydra-Infusion Radiance Facial", basePrice: 95, duration: "75 mins" },
  biab: { name: "BIAB Russian Structured Gel Manicure", basePrice: 55, duration: "60 mins" },
  massage: { name: "Aromatherapy Deep Relax Massage", basePrice: 85, duration: "60 mins" },
  bridal: { name: "Couture Bridal Hair & HD Makeup", basePrice: 220, duration: "150 mins" }
};

const ADDON_PRICES = {
  olaplex: { name: "Olaplex Bond Rebuilder", price: 25 },
  collagen_mask: { name: "Collagen Eye & Lip Plump Mask", price: 20 },
  nail_art: { name: "Hand-Painted Chrome / French Art", price: 18 },
  scalp_scrub: { name: "Detox Botanical Scalp Scrub", price: 22 }
};

let selectedTreatment = "balayage";
let selectedAddons = new Set(["olaplex"]);

document.addEventListener("DOMContentLoaded", async () => {
  await loadSalonData();
  setupCalculator();
  setupSmoothScroll();
});

async function loadSalonData() {
  try {
    const res = await fetch("./data/business.json");
    if (!res.ok) throw new Error("Could not load business.json");
    salonData = await res.json();
    currentCurrency = salonData.currency_symbol || "£";
    applyDataToDOM(salonData);
  } catch (err) {
    console.warn("Using fallback local salon data:", err);
    updateCalculatedTotal();
  }
}

function applyDataToDOM(data) {
  if (!data) return;

  // Text contents
  document.querySelectorAll("[data-business-name]").forEach(el => el.textContent = data.business_name || "Luxe Glow Salon");
  document.querySelectorAll("[data-tagline]").forEach(el => el.textContent = data.tagline || "");
  document.querySelectorAll("[data-address]").forEach(el => el.textContent = data.address || "");
  document.querySelectorAll("[data-city]").forEach(el => el.textContent = data.city || "");
  document.querySelectorAll("[data-phone]").forEach(el => {
    el.textContent = data.phone || "";
    if (el.tagName === "A") el.href = `tel:${data.phone}`;
  });
  document.querySelectorAll("[data-rating]").forEach(el => el.textContent = data.rating || "4.9");
  document.querySelectorAll("[data-reviews-count]").forEach(el => el.textContent = data.review_count || "180+");
  document.querySelectorAll("[data-hours]").forEach(el => el.textContent = data.opening_hours || "");

  // WhatsApp links
  const waNumber = (data.whatsapp || data.phone || "").replace(/\D/g, "");
  document.querySelectorAll("[data-whatsapp-link]").forEach(el => {
    if (waNumber) {
      el.href = `https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(data.business_name || "Luxe Glow")},%20I'd%20like%20to%20book%20an%20appointment!`;
    }
  });

  // Services rendering if placeholder exists
  renderServicesList(data.services);
  renderBeforeAfter(data.before_after_pairs);
  renderReviews(data.reviews);

  updateCalculatedTotal();
}

function renderServicesList(services) {
  const container = document.getElementById("services-grid");
  if (!container || !services || !services.length) return;

  container.innerHTML = services.map(svc => `
    <div class="service-card">
      <img class="service-card-img" src="${svc.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}" alt="${svc.name}">
      <div class="service-card-body">
        <div class="service-card-title-row">
          <h3>${svc.name}</h3>
          <span class="price">${svc.price_from}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--color-text-muted);">${svc.description}</p>
        <ul class="service-features-list">
          ${(svc.features || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
        <button onclick="selectServiceAndScroll('${getServiceKeyByName(svc.name)}')" class="btn btn-outline btn-sm" style="margin-top:auto; width:100%;">
          Book This Treatment
        </button>
      </div>
    </div>
  `).join('');
}

function getServiceKeyByName(name) {
  const lower = name.toLowerCase();
  if (lower.includes("cut") || lower.includes("blowout")) return "cut";
  if (lower.includes("balayage") || lower.includes("color")) return "balayage";
  if (lower.includes("facial") || lower.includes("skin")) return "facial";
  if (lower.includes("gel") || lower.includes("nail") || lower.includes("biab")) return "biab";
  if (lower.includes("massage") || lower.includes("spa")) return "massage";
  if (lower.includes("bridal") || lower.includes("makeup")) return "bridal";
  return "balayage";
}

function renderBeforeAfter(pairs) {
  const container = document.getElementById("transformations-grid");
  if (!container || !pairs || !pairs.length) return;

  container.innerHTML = pairs.map(p => `
    <div class="gallery-card">
      <div class="before-after-img-wrap">
        <span class="img-tag before">Before</span>
        <img src="${p.before}" alt="Before ${p.title}">
        <span class="img-tag after">After</span>
        <img src="${p.after}" alt="After ${p.title}">
      </div>
      <div class="gallery-content">
        <span class="badge-luxury" style="margin-bottom:8px; font-size:0.72rem;">${p.badge || 'Transformation'}</span>
        <h4>${p.title}</h4>
        <p>${p.description}</p>
      </div>
    </div>
  `).join('');
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-grid");
  if (!container || !reviews || !reviews.length) return;

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="reviewer-name">${r.name}</span>
        <span class="rating-stars">${"★".repeat(r.rating || 5)}</span>
      </div>
      <span class="review-service-tag">Treatment: ${r.service || 'Salon Service'}</span>
      <p class="review-text">"${r.comment}"</p>
    </div>
  `).join('');
}

/* Calculator Logic */
function setupCalculator() {
  const serviceOptions = document.querySelectorAll(".service-option-card");
  serviceOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      serviceOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      selectedTreatment = opt.dataset.treatment;
      updateCalculatedTotal();
    });
  });

  const addonCheckboxes = document.querySelectorAll(".addon-checkbox");
  addonCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const addonKey = e.target.value;
      if (e.target.checked) {
        selectedAddons.add(addonKey);
      } else {
        selectedAddons.delete(addonKey);
      }
      updateCalculatedTotal();
    });
  });
}

function selectServiceAndScroll(treatmentKey) {
  const card = document.querySelector(`[data-treatment="${treatmentKey}"]`);
  if (card) {
    document.querySelectorAll(".service-option-card").forEach(o => o.classList.remove("active"));
    card.classList.add("active");
    selectedTreatment = treatmentKey;
    updateCalculatedTotal();
  }
  const bookingSec = document.getElementById("booking-calculator");
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: "smooth" });
  }
}

function updateCalculatedTotal() {
  const treatment = TREATMENT_PRICES[selectedTreatment] || TREATMENT_PRICES.balayage;
  let total = treatment.basePrice;

  selectedAddons.forEach(k => {
    if (ADDON_PRICES[k]) {
      total += ADDON_PRICES[k].price;
    }
  });

  const totalEl = document.getElementById("calc-total-price");
  const treatmentNameEl = document.getElementById("calc-treatment-name");
  const durationEl = document.getElementById("calc-duration");

  if (totalEl) totalEl.textContent = `${currentCurrency}${total}`;
  if (treatmentNameEl) treatmentNameEl.textContent = treatment.name;
  if (durationEl) durationEl.textContent = `Approx. Duration: ${treatment.duration}`;

  // Update booking CTA link
  const bookBtn = document.getElementById("confirm-booking-btn");
  if (bookBtn && salonData) {
    const businessName = salonData.business_name || "Luxe Glow Salon";
    const waNumber = (salonData.whatsapp || salonData.phone || "").replace(/\D/g, "");
    const addonNames = Array.from(selectedAddons).map(k => ADDON_PRICES[k]?.name).filter(Boolean);
    const msg = `Hi ${businessName}! 👋 I'd like to book an appointment for:\n✦ ${treatment.name}\n${addonNames.length ? '✦ Add-ons: ' + addonNames.join(', ') + '\n' : ''}✦ Estimated Total: ${currentCurrency}${total}\n\nCould you let me know your available slots this week?`;
    
    if (waNumber) {
      bookBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    } else {
      bookBtn.href = `mailto:${salonData.email || 'hello@luxeglowsalon.com'}?subject=Appointment%20Booking%20Request&body=${encodeURIComponent(msg)}`;
    }
  }
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
