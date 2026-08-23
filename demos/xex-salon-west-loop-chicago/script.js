/**
 * Luxe Glow / Beauty Salon Template Script
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
    details: "Dimensional blonding + toner gloss"
  },
  cut: {
    name: "Precision Cut & Blowout",
    price: 65,
    duration: "60 Mins",
    details: "Scalp wash, custom cut & volume style"
  },
  facial: {
    name: "Hydra-Glow Radiance Facial",
    price: 95,
    duration: "75 Mins",
    details: "Hydro-vacuum pore detox & peptide infusion"
  },
  biab: {
    name: "BIAB Russian Gel Manicure",
    price: 55,
    duration: "60 Mins",
    details: "Dry e-file prep & apex nail overlay"
  },
  massage: {
    name: "Aromatherapy Spa Massage",
    price: 85,
    duration: "60 Mins",
    details: "Warm botanical oils & tension relief"
  },
  bridal: {
    name: "Couture Bridal Hair & Makeup",
    price: 220,
    duration: "150 Mins",
    details: "Trial-tested styling & 24hr HD airbrush glam"
  }
};

const BASE_ADDONS = {
  olaplex: { name: "Olaplex & K18 Bond Therapy", price: 25 },
  collagen_mask: { name: "Collagen Eye & Lip Plump", price: 20 },
  nail_art: { name: "Hand-Painted Chrome Nail Art", price: 18 },
  scalp_scrub: { name: "Detox Botanical Scalp Scrub", price: 22 }
};

let selectedTreatment = "balayage";
let selectedAddons = new Set(["olaplex"]);

document.addEventListener("DOMContentLoaded", async () => {
  await loadSalonData();
  setupCalculator();
  setupTabNavigation();
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

function cleanBusinessName(raw, city) {
  if (!raw) return "Luxe Glow Salon";
  let cleaned = String(raw).trim();

  // Known location keywords
  const locRegex = /(?:downtown abu dhabi|down town abu dhabi|north abu dhabi|south abu dhabi|abu dhabi|dubai|sharjah|ajman|uae|united arab emirates|central london|west london|east london|north london|south london|london|manchester|birmingham|downtown los angeles|west hollywood|hollywood|los angeles|la|downtown chicago|chicago|new york|manhattan|brooklyn|toronto|vancouver|sydney|melbourne|auckland|north auckland|south auckland|downtown auckland|mumbai|delhi|bangalore|houston|dallas|miami|uk|usa|australia|new zealand)/i;

  // 1. Remove separator + location or generic category suffixes
  cleaned = cleaned.replace(/\s*[-|–—,:]\s*(?:(?:beauty salon|hair salon|salon|spa|cleaning|services)\s+)?(?:downtown\s+|down town\s+|central\s+|north\s+|south\s+|east\s+|west\s+)?(?:abu dhabi|dubai|sharjah|ajman|uae|london|manchester|birmingham|los angeles|new york|chicago|houston|dallas|miami|toronto|sydney|melbourne|auckland|mumbai|delhi|bangalore|uk|usa|australia|new zealand)\s*$/i, '');
  cleaned = cleaned.replace(/\s*[-|–—,:]\s*(?:abu dhabi|dubai|sharjah|ajman|uae|london|manchester|birmingham|los angeles|new york|chicago|houston|dallas|miami|toronto|sydney|melbourne|auckland|mumbai|delhi|bangalore)\s*$/i, '');

  // 2. Remove trailing location name without separator
  cleaned = cleaned.replace(/\s+(?:abu dhabi|dubai|sharjah|ajman|uae|london|manchester|birmingham|los angeles|new york|chicago|houston|dallas|miami|toronto|sydney|melbourne|auckland|mumbai|delhi|bangalore)\s*$/i, '');

  // 3. Remove custom city if provided
  if (city) {
    const escapedCity = String(city).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`\\s*[-|–—,:]?\\s*${escapedCity}\\s*$`, 'i'), '');
  }

  // 4. Remove duplicate repetitive category after separator
  cleaned = cleaned.replace(/\s*[-|–—,:]\s*(?:beauty salon|hair salon|nail salon|spa|cleaning services)\s*$/i, '');

  // 5. Clean trailing punctuation
  cleaned = cleaned.replace(/[\s\-|–—,:]+$/, '').trim();

  // 6. Convert ALL-CAPS to Title Case
  if (cleaned.length > 3 && cleaned === cleaned.toUpperCase()) {
    cleaned = cleaned.toLowerCase().split(' ').map(w => {
      if (['and', '&', 'of', 'in', 'by', 'the', 'for'].includes(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned || raw;
}

function applyDataToDOM(data) {
  if (!data) return;

  // Text contents
  const bName = cleanBusinessName(data.business_name || "Luxe Glow Salon", data.city);
  document.title = `${bName} | Luxury Hair, Color & Beauty Lounge`;
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
  if (heroFacial) heroFacial.textContent = `Hydra Facial ${currentCurrency}95+`;
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
    const rawName = salonData ? (salonData.business_name || "Luxe Glow Salon") : "Luxe Glow Salon";
    const bName = cleanBusinessName(rawName, salonData?.city);
    const waNumber = (salonData ? (salonData.whatsapp || salonData.phone || "") : "").replace(/\D/g, "");
    const msg = `Hi ${bName}! 👋 I'd like to reserve an appointment:\n✦ Treatment: ${t.name}\n${activeAddonNames.length ? '✦ Add-ons: ' + activeAddonNames.join(', ') + '\n' : ''}✦ Estimated Total: ${currentCurrency}${total}\n\nCould you let me know your available slots this week?`;
    
    if (waNumber) {
      waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    } else {
      waBtn.href = `mailto:${salonData?.email || 'hello@luxeglowsalon.com'}?subject=Appointment%20Booking&body=${encodeURIComponent(msg)}`;
    }
  }

  // Update hero whatsapp link
  const heroWa = document.querySelector("[data-whatsapp-link]");
  if (heroWa && salonData) {
    const waNumber = (salonData.whatsapp || salonData.phone || "").replace(/\D/g, "");
    const rawName = salonData.business_name || "Luxe Glow Salon";
    const bName = cleanBusinessName(rawName, salonData?.city);
    if (waNumber) {
      heroWa.href = `https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(bName)},%20I'd%20like%20to%20inquire%20about%20booking%20an%20appointment!`;
    }
  }
}

function setupTabNavigation() {
  const topTabs = document.querySelectorAll(".section-tab");
  const bottomTabs = document.querySelectorAll(".mobile-bottom-tab");
  const allNavLinks = document.querySelectorAll('a[href^="#"], [data-tab]');
  const sections = ["overview", "services", "calculator", "transformations", "reviews", "faqs"];

  function setActiveTab(targetId) {
    topTabs.forEach((tab) => {
      const tabTarget = tab.getAttribute("data-tab") || (tab.getAttribute("href") || "").replace("#", "");
      if (tabTarget === targetId) {
        tab.className =
          "section-tab active inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all bg-primary text-white shadow-sm";
        try {
          tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        } catch (_) {}
      } else {
        tab.className =
          "section-tab inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition-all bg-white border border-[#E8DCCF] text-foreground/80 hover:border-primary hover:text-primary";
      }
    });

    bottomTabs.forEach((tab) => {
      const tabTarget = tab.getAttribute("data-tab") || (tab.getAttribute("href") || "").replace("#", "");
      if (tabTarget === targetId) {
        tab.classList.remove("text-foreground/60");
        tab.classList.add("text-primary", "font-semibold");
      } else if (tabTarget && tabTarget !== "whatsapp") {
        tab.classList.remove("text-primary", "font-semibold");
        tab.classList.add("text-foreground/60");
      }
    });
  }

  // Click listeners for smooth instant navigation using native scrollIntoView
  allNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      const dataTab = link.getAttribute("data-tab") || "";
      const targetId = dataTab || (href.startsWith("#") ? href.replace("#", "") : "");

      if (targetId && targetId !== "#" && targetId !== "whatsapp") {
        const el = document.getElementById(targetId);
        if (el) {
          e.preventDefault();
          e.stopPropagation();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveTab(targetId);
          try {
            history.replaceState(null, "", `#${targetId}`);
          } catch (_) {}
        }
      }
    });
  });

  // IntersectionObserver for ScrollSpy tab tracking
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id && sections.includes(id)) {
              setActiveTab(id);
            }
          }
        });
      },
      { rootMargin: "-10% 0px -65% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
}
