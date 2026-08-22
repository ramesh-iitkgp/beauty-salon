/**
 * Empire Owl / Beauty Salon Template Script
 * Connects to data/business.json, calculates live estimates, and formats 1-click WhatsApp booking.
 */

// Global State
let salonData = null;
let currentCurrency = "£";

// Base prices (scaled by currency config)
const BASE_TREATMENTS = {
  balayage: {
    name: "Artisan Balayage & Color Gloss",
    price: 160,
    duration: "180 Mins",
    details: "Dimensional blonding + toner"
  },
  cut: {
    name: "Precision Cut & Blowout",
    price: 65,
    duration: "60 Mins",
    details: "Wash, custom cut & volume style"
  },
  facial: {
    name: "Hydra-Glow Radiance Facial",
    price: 95,
    duration: "75 Mins",
    details: "Hydro-vacuum pore detox"
  },
  biab: {
    name: "BIAB Russian Gel Manicure",
    price: 55,
    duration: "60 Mins",
    details: "Dry e-file prep + apex overlay"
  },
  massage: {
    name: "Aromatherapy Spa Massage",
    price: 85,
    duration: "60 Mins",
    details: "Warm oil tension release"
  },
  bridal: {
    name: "Couture Bridal Updo & Makeup",
    price: 220,
    duration: "150 Mins",
    details: "24hr HD airbrush glam"
  }
};

const BASE_ADDONS = {
  olaplex: { name: "Olaplex Bond Rebuilder", price: 25 },
  collagen_mask: { name: "Collagen Eye & Lip Plump", price: 20 },
  nail_art: { name: "Hand-Painted Chrome Art", price: 18 },
  scalp_scrub: { name: "Detox Botanical Scalp Scrub", price: 22 }
};

let selectedTreatment = "balayage";
let selectedAddons = new Set(["olaplex"]);

document.addEventListener("DOMContentLoaded", async () => {
  await loadSalonData();
  setupCalculator();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

async function loadSalonData() {
  try {
    const res = await fetch("./data/business.json");
    if (!res.ok) throw new Error("Could not load data/business.json");
    salonData = await res.json();
    currentCurrency = salonData.currency_symbol || "£";
    applyDataToDOM(salonData);
  } catch (err) {
    console.warn("Using fallback salon state:", err);
    updateCalculatorDisplay();
  }
}

function applyDataToDOM(data) {
  if (!data) return;

  // Text contents
  const bName = data.business_name || "Empire Owl Salon";
  document.querySelectorAll("[data-business-name]").forEach(el => el.textContent = bName);
  document.querySelectorAll("[data-tagline]").forEach(el => el.textContent = data.tagline || "");
  document.querySelectorAll("[data-address]").forEach(el => el.textContent = data.address || "");
  document.querySelectorAll("[data-city]").forEach(el => el.textContent = data.city || "London");
  document.querySelectorAll("[data-hours]").forEach(el => el.textContent = data.opening_hours || "");
  
  if (data.phone) {
    document.querySelectorAll("[data-phone]").forEach(el => el.href = `tel:${data.phone}`);
    document.querySelectorAll("[data-phone-display]").forEach(el => el.textContent = data.phone);
  }

  if (data.email) {
    document.querySelectorAll("[data-email]").forEach(el => el.href = `mailto:${data.email}`);
    document.querySelectorAll("[data-email-display]").forEach(el => el.textContent = data.email);
  }

  if (data.hero_image) {
    const heroImg = document.getElementById("hero-bg-img");
    if (heroImg) heroImg.src = data.hero_image;
  }

  // Social links
  if (data.social) {
    const ig = document.querySelector("[data-instagram]");
    if (ig && data.social.instagram) ig.href = data.social.instagram;
    const fb = document.querySelector("[data-facebook]");
    if (fb && data.social.facebook) fb.href = data.social.facebook;
  }

  // Hero badges
  const heroCuts = document.getElementById("hero-cuts-price");
  if (heroCuts) heroCuts.textContent = `${currentCurrency}45–${currentCurrency}65`;
  const heroBalayage = document.getElementById("hero-balayage-badge");
  if (heroBalayage) heroBalayage.textContent = `Balayage ${currentCurrency}160`;
  const heroFacial = document.getElementById("hero-facial-badge");
  if (heroFacial) heroFacial.textContent = `Facial ${currentCurrency}95+`;
  const heroNails = document.getElementById("hero-nails-badge");
  if (heroNails) heroNails.textContent = `BIAB Nails ${currentCurrency}55`;
  const bentoCut = document.getElementById("bento-cut-price");
  if (bentoCut) bentoCut.textContent = `${currentCurrency}45`;

  // Render Transformations & Reviews
  renderTransformations(data.before_after_pairs);
  renderReviews(data.reviews);

  updateCalculatorDisplay();
}

function renderTransformations(pairs) {
  const container = document.getElementById("transformations-container");
  if (!container || !pairs || !pairs.length) return;

  container.innerHTML = pairs.map(p => `
    <div class="bg-white rounded-[2.5rem] p-4 border border-border shadow-md flex flex-col justify-between hover:shadow-xl transition-all group">
      <div class="rounded-[2rem] overflow-hidden relative shadow-inner bg-[#1B120D] mb-4">
        <!-- Dual Split Container -->
        <div class="grid grid-cols-2 aspect-[4/3] relative">
          <div class="relative overflow-hidden border-r border-white/20">
            <img src="${p.before}" alt="Before ${p.title}" class="w-full h-full object-cover">
            <span class="absolute top-3 left-3 bg-black/75 text-white backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-semibold font-sans uppercase tracking-wider">
              Before
            </span>
          </div>
          <div class="relative overflow-hidden">
            <img src="${p.after}" alt="After ${p.title}" class="w-full h-full object-cover">
            <span class="absolute top-3 right-3 bg-primary text-white backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-semibold font-sans uppercase tracking-wider">
              After
            </span>
          </div>
        </div>
      </div>

      <div class="px-2 pb-2 text-left">
        <span class="inline-block text-[10px] uppercase tracking-widest text-primary font-semibold font-sans mb-1.5 bg-secondary px-2.5 py-0.5 rounded-full">
          ${p.badge || 'Transformation'}
        </span>
        <h4 class="text-2xl font-newsreader font-light leading-snug mb-2 text-foreground">
          ${p.title}
        </h4>
        <p class="text-xs text-foreground/70 font-sans leading-relaxed mb-4">
          ${p.description}
        </p>

        <!-- Before & After Comparison Pills -->
        <div class="space-y-1.5 pt-3 border-t border-border/80 text-[11px] font-sans">
          <div class="flex items-center gap-1.5 text-foreground/60">
            <span class="size-1.5 rounded-full bg-red-400"></span>
            <strong>Before:</strong> <span>${p.before_stats || 'Faded tone & dry ends'}</span>
          </div>
          <div class="flex items-center gap-1.5 text-foreground/80 font-medium">
            <span class="size-1.5 rounded-full bg-emerald-500"></span>
            <strong class="text-primary">After:</strong> <span>${p.after_stats || 'Luminous salon glow'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");
  if (!container || !reviews || !reviews.length) return;

  container.innerHTML = reviews.map(r => `
    <article class="bg-white rounded-[2rem] p-8 shadow-sm border border-border flex flex-col justify-between min-h-[280px]">
      <div>
        <div class="flex text-amber-500 mb-4 text-sm">
          ${"★".repeat(r.rating || 5)}
        </div>
        <p class="text-xl tracking-tight leading-snug font-newsreader font-light text-foreground mb-6">
          "${r.comment}"
        </p>
      </div>
      <div class="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p class="text-sm font-semibold font-sans text-foreground">${r.name}</p>
          <p class="text-xs text-foreground/50 font-medium font-sans">${r.service || 'Salon Client'}</p>
        </div>
        <i data-lucide="quote" class="size-6 text-primary/30"></i>
      </div>
    </article>
  `).join('');
}

/* Calculator Setup & Updates */
function setupCalculator() {
  const buttons = document.querySelectorAll(".treatment-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("active", "border-2", "border-primary", "bg-secondary/30");
        b.classList.add("border", "border-border", "bg-white");
        const icon = b.querySelector(".check-icon");
        if (icon) icon.classList.add("hidden");
      });

      btn.classList.add("active", "border-2", "border-primary", "bg-secondary/30");
      btn.classList.remove("border-border", "bg-white");
      const icon = btn.querySelector(".check-icon");
      if (icon) icon.classList.remove("hidden");

      selectedTreatment = btn.dataset.key;
      updateCalculatorDisplay();
    });
  });

  const addonCheckboxes = document.querySelectorAll(".addon-checkbox");
  addonCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const val = e.target.value;
      if (e.target.checked) {
        selectedAddons.add(val);
      } else {
        selectedAddons.delete(val);
      }
      updateCalculatorDisplay();
    });
  });
}

function updateCalculatorDisplay() {
  const t = BASE_TREATMENTS[selectedTreatment] || BASE_TREATMENTS.balayage;
  let total = t.price;

  const activeAddonNames = [];
  selectedAddons.forEach(k => {
    if (BASE_ADDONS[k]) {
      total += BASE_ADDONS[k].price;
      activeAddonNames.push(BASE_ADDONS[k].name);
    }
  });

  const totalDisplay = document.getElementById("calc-total-display");
  const durationDisplay = document.getElementById("calc-duration-display");
  const summaryDetails = document.getElementById("calc-summary-details");
  const waBtn = document.getElementById("calc-whatsapp-btn");

  if (totalDisplay) totalDisplay.textContent = `${currentCurrency}${total}`;
  if (durationDisplay) durationDisplay.textContent = `(${t.duration})`;
  if (summaryDetails) {
    const addonsText = activeAddonNames.length ? ` + ${activeAddonNames.join(", ")}` : "";
    summaryDetails.textContent = `${t.name}${addonsText}`;
  }

  // Format WhatsApp Booking link
  if (waBtn) {
    const bName = salonData ? salonData.business_name : "Empire Owl Salon";
    const waNumber = (salonData ? (salonData.whatsapp || salonData.phone || "") : "").replace(/\D/g, "");
    const msg = `Hi ${bName}! 👋 I'd like to reserve an appointment:\n✦ Treatment: ${t.name}\n${activeAddonNames.length ? '✦ Add-ons: ' + activeAddonNames.join(', ') + '\n' : ''}✦ Estimated Total: ${currentCurrency}${total}\n\nCould you let me know your available slots this week?`;
    
    if (waNumber) {
      waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    } else {
      waBtn.href = `mailto:${salonData?.email || 'hello@salon.com'}?subject=Appointment%20Booking&body=${encodeURIComponent(msg)}`;
    }
  }

  // Update hero whatsapp link
  const heroWa = document.querySelector("[data-whatsapp-link]");
  if (heroWa && salonData) {
    const waNumber = (salonData.whatsapp || salonData.phone || "").replace(/\D/g, "");
    const bName = salonData.business_name || "Empire Owl Salon";
    if (waNumber) {
      heroWa.href = `https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(bName)},%20I'd%20like%20to%20inquire%20about%20booking%20an%20appointment!`;
    }
  }
}
