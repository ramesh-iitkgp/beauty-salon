/**
 * ============================================================================
 * AGENCY-GRADE HOME CLEANING WEBSITE TEMPLATE ENGINE
 * Multi-Country Dynamic Rendering (US, UK, NZ, AUS, India, Canada)
 * Interactive Before/After Split Slider, Instant Price Calculator,
 * Photo Gallery Lightbox, Suburb Finder & Dynamic SEO Engine.
 * ============================================================================
 */

(function () {
  'use strict';

  // Global State
  let currentBusinessData = null;
  let currentBeforeAfterIndex = 0;
  let currentGalleryIndex = 0;
  let galleryImageUrls = [];

  // Calculator State
  let calcState = {
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    tier: 'regular',
    frequency: 'bi-weekly',
    addons: []
  };

  /**
   * ==========================================================================
   * HIGH-RESOLUTION GENERIC DEFAULT ASSETS
   * ==========================================================================
   */
  const GENERIC_ASSETS = {
    hero: './assets/hero_cleaner.jpg',
    serviceDefaults: {
      regular: './assets/service_regular.jpg',
      deep: './assets/service_deep.jpg',
      tenancy: './assets/service_move_out.jpg',
      carpet: './assets/service_carpet.jpg',
      postrenovation: './assets/living_after.jpg',
      commercial: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
      general: './assets/service_regular.jpg'
    },
    gallery: [
      './assets/hero_cleaner.jpg',
      './assets/kitchen_after.jpg',
      './assets/bathroom_after.jpg',
      './assets/living_after.jpg',
      './assets/service_deep.jpg',
      './assets/service_carpet.jpg'
    ]
  };

  /**
   * Safe Data Normalizer
   * Harmonizes snake_case & camelCase for all 20+ fields
   */
  function normalizeData(raw) {
    if (!raw) return {};

    const country = raw.country || 'United Kingdom';
    let defaultCurrency = '£';
    let defaultCode = 'GBP';

    if (country.includes('USA') || country.includes('United States')) {
      defaultCurrency = '$';
      defaultCode = 'USD';
    } else if (country.includes('Australia')) {
      defaultCurrency = 'A$';
      defaultCode = 'AUD';
    } else if (country.includes('New Zealand')) {
      defaultCurrency = 'NZ$';
      defaultCode = 'NZD';
    } else if (country.includes('Canada')) {
      defaultCurrency = 'C$';
      defaultCode = 'CAD';
    } else if (country.includes('India')) {
      defaultCurrency = '₹';
      defaultCode = 'INR';
    }

    return {
      name: raw.business_name || raw.company_name || raw.name || 'Super Cleaners London',
      tagline: raw.tagline || 'Award-Winning Residential, Deep & Move-Out Cleaning Specialists',
      category: raw.category || 'Residential & Commercial Cleaning',
      city: raw.city || '',
      state: raw.state || '',
      country: country,
      address: raw.address || '',
      phone: raw.phone || '',
      whatsapp: (raw.whatsapp || raw.whats_app || raw.phone || '').trim(),
      email: raw.email || '',
      websiteUrl: (raw.website_url || raw.website || '').trim(),
      googleMapsUrl: (raw.google_maps_url || raw.maps_link || raw.googleMapsUrl || '').trim(),
      openingHours: raw.opening_hours || raw.openingHours || '',
      rating: raw.rating || raw.google_rating ? String(raw.rating || raw.google_rating) : '',
      reviewCount: raw.review_count || raw.reviewCount ? String(raw.review_count || raw.reviewCount) : '',
      yearsInBusiness: raw.years_in_business || raw.yearsInBusiness || (raw.established_year ? `Serving Since ${raw.established_year}` : ''),
      currencySymbol: raw.currency_symbol || defaultCurrency,
      currencyCode: raw.currency_code || defaultCode,
      logoUrl: (raw.logo_url || raw.logoUrl || '').trim(),
      heroImage: (raw.hero_image || raw.heroImage || '').trim(),
      serviceAreas: Array.isArray(raw.service_areas) ? raw.service_areas : (Array.isArray(raw.serviceAreas) ? raw.serviceAreas : []),
      social: raw.social || {
        instagram: raw.instagramUrl || '',
        facebook: raw.facebookUrl || '',
        tiktok: raw.tiktokUrl || '',
        linkedin: '',
        youtube: '',
        twitter: '',
        yelp: '',
        pinterest: ''
      },
      beforeAfterPairs: Array.isArray(raw.before_after_pairs)
        ? raw.before_after_pairs
        : (Array.isArray(raw.beforeAfterPairs) ? raw.beforeAfterPairs : []),
      services: Array.isArray(raw.services) ? raw.services : [],
      businessImages: Array.isArray(raw.business_images) && raw.business_images.length > 0
        ? raw.business_images 
        : (Array.isArray(raw.galleryImages) && raw.galleryImages.length > 0 ? raw.galleryImages : []),
      reviews: Array.isArray(raw.reviews) ? raw.reviews : []
    };
  }

  /**
   * Helper: Build WhatsApp click-to-chat URL
   */
  function getWhatsAppUrl(data, customMessage = '') {
    if (!data) return '';
    const phoneSource = (data.whatsapp || data.phone || '').trim();
    const cleanDigits = phoneSource.replace(/[^0-9]/g, '');
    if (!cleanDigits) return '';
    const text = customMessage || `Hello ${data.name || 'Cleaning Team'}, I would like to inquire about booking a cleaning service.`;
    return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(text)}`;
  }

  function getServiceFallbackImage(serviceName, index) {
    if (!serviceName) return GENERIC_ASSETS.serviceDefaults.general;
    const lower = serviceName.toLowerCase();
    if (lower.includes('regular') || lower.includes('maid') || lower.includes('domestic')) return GENERIC_ASSETS.serviceDefaults.regular;
    if (lower.includes('deep') || lower.includes('intensive') || lower.includes('spring')) return GENERIC_ASSETS.serviceDefaults.deep;
    if (lower.includes('tenancy') || lower.includes('move') || lower.includes('turnover')) return GENERIC_ASSETS.serviceDefaults.tenancy;
    if (lower.includes('carpet') || lower.includes('steam') || lower.includes('upholstery')) return GENERIC_ASSETS.serviceDefaults.carpet;
    if (lower.includes('renovation') || lower.includes('builder') || lower.includes('construction')) return GENERIC_ASSETS.serviceDefaults.postrenovation;
    if (lower.includes('commercial') || lower.includes('office') || lower.includes('janitorial')) return GENERIC_ASSETS.serviceDefaults.commercial;
    return GENERIC_ASSETS.gallery[index % GENERIC_ASSETS.gallery.length] || GENERIC_ASSETS.serviceDefaults.general;
  }

  /**
   * Master Render Engine
   */
  function renderWebsite(rawData) {
    const data = normalizeData(rawData);
    currentBusinessData = data;

    // 1. Dynamic SEO & Schema.org JSON-LD
    updateSEO(data);

    // 2. Top Info Bar
    renderTopBar(data);

    // 3. Navigation & Brand Wordmark
    renderHeader(data);

    // 4. Hero Section
    renderHero(data);

    // 5. Trust Metrics & Social Proof Strip
    renderTrustBar(data);

    // 6. Before & After Transformation Slider
    renderBeforeAfterSection(data);

    // 7. Dynamic Services Grid
    renderServices(data);

    // 8. Interactive Estimate Calculator
    renderCalculator(data);

    // 9. Why Choose Us
    renderWhyChoose(data);

    // 10. Photo Gallery & Lightbox
    renderGallery(data);

    // 11. Customer Reviews
    renderReviews(data);

    // 12. Service Areas & Suburb Search
    renderServiceAreas(data);

    // 13. Contact Card & Social Profiles
    renderContact(data);

    // 14. Modern Footer
    renderFooter(data);

    // 15. Mobile Sticky Bar
    renderMobileStickyBar(data);
  }

  /**
   * 1. Dynamic SEO & Schema.org JSON-LD
   */
  function updateSEO(data) {
    const pageTitle = data.city 
      ? `${data.name} | Top-Rated Cleaning Services in ${data.city}`
      : `${data.name} | Professional Cleaning Services`;
    
    document.title = pageTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    const description = `${data.tagline}. Trusted ${data.category.toLowerCase()} across ${data.city || 'your area'}. Request an instant quote today.`;
    if (metaDesc) metaDesc.setAttribute('content', description);

    document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', data.heroImage || GENERIC_ASSETS.hero);

    // Schema.org LocalBusiness / CleaningService
    let schemaScript = document.getElementById('schema-json-ld');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-json-ld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "CleaningService",
      "name": data.name,
      "description": data.tagline,
      "telephone": data.phone || undefined,
      "email": data.email || undefined,
      "url": data.websiteUrl || undefined,
      "address": data.address ? {
        "@type": "PostalAddress",
        "streetAddress": data.address,
        "addressLocality": data.city,
        "addressRegion": data.state,
        "addressCountry": data.country
      } : undefined,
      "aggregateRating": data.rating ? {
        "@type": "AggregateRating",
        "ratingValue": data.rating,
        "reviewCount": data.reviewCount || "100"
      } : undefined
    };
    schemaScript.textContent = JSON.stringify(schemaObj, null, 2);
  }

  /**
   * 2. Top Info Bar
   */
  function renderTopBar(data) {
    const hoursContainer = document.getElementById('top-bar-hours-container');
    const hoursVal = document.getElementById('top-bar-hours-val');
    if (hoursContainer && hoursVal) {
      if (data.openingHours) {
        hoursContainer.classList.remove('data-hidden');
        hoursVal.textContent = data.openingHours;
      } else {
        hoursContainer.classList.add('data-hidden');
      }
    }

    const emailContainer = document.getElementById('top-bar-email-container');
    const emailVal = document.getElementById('top-bar-email-val');
    const emailLink = document.getElementById('top-bar-email-link');
    if (emailContainer && emailVal) {
      if (data.email) {
        emailContainer.classList.remove('data-hidden');
        emailVal.textContent = data.email;
        if (emailLink) emailLink.href = `mailto:${data.email}`;
      } else {
        emailContainer.classList.add('data-hidden');
      }
    }

    const websiteContainer = document.getElementById('top-bar-website-container');
    const websiteLink = document.getElementById('top-bar-website-link');
    const websiteVal = document.getElementById('top-bar-website-val');
    if (websiteContainer && websiteLink) {
      if (data.websiteUrl) {
        websiteContainer.classList.remove('data-hidden');
        websiteLink.href = data.websiteUrl;
        if (websiteVal) websiteVal.textContent = 'Official Portal';
      } else {
        websiteContainer.classList.add('data-hidden');
      }
    }
  }

  /**
   * 3. Header & Navigation
   */
  function renderHeader(data) {
    const brandNameEls = document.querySelectorAll('[data-bind="name"]');
    brandNameEls.forEach(el => el.textContent = data.name);

    const brandCategoryEls = document.querySelectorAll('[data-bind="category"]');
    brandCategoryEls.forEach(el => el.textContent = data.category);

    const logoContainer = document.getElementById('nav-logo-container');
    const brandFallback = document.getElementById('nav-brand-fallback');

    if (logoContainer && brandFallback) {
      if (data.logoUrl) {
        logoContainer.style.display = 'block';
        logoContainer.innerHTML = `<img src="${data.logoUrl}" alt="${data.name} Logo" class="brand-logo-img" onerror="this.style.display='none'; document.getElementById('nav-brand-fallback').style.display='flex';" />`;
        brandFallback.style.display = 'none';
      } else {
        logoContainer.innerHTML = '';
        logoContainer.style.display = 'none';
        brandFallback.style.display = 'flex';
      }
    }

    // Phone CTA
    const navPhoneBtn = document.getElementById('nav-phone-btn');
    const navPhoneText = document.getElementById('nav-phone-text');
    if (navPhoneBtn) {
      if (data.phone) {
        navPhoneBtn.classList.remove('data-hidden');
        navPhoneBtn.href = `tel:${data.phone.replace(/\s+/g, '')}`;
        if (navPhoneText) navPhoneText.textContent = data.phone;
      } else {
        navPhoneBtn.classList.add('data-hidden');
      }
    }

    // WhatsApp CTA
    const navWhatsAppBtn = document.getElementById('nav-whatsapp-btn');
    const waUrl = getWhatsAppUrl(data);
    if (navWhatsAppBtn) {
      if (waUrl) {
        navWhatsAppBtn.classList.remove('data-hidden');
        navWhatsAppBtn.href = waUrl;
      } else {
        navWhatsAppBtn.classList.add('data-hidden');
      }
    }
  }

  /**
   * 4. Hero Section
   */
  function renderHero(data) {
    const heroTitleName = document.getElementById('hero-brand-name');
    if (heroTitleName) heroTitleName.textContent = data.name;

    const heroTagline = document.getElementById('hero-tagline');
    if (heroTagline) heroTagline.textContent = data.tagline;

    // Location Pill
    const locationPill = document.getElementById('hero-location-pill');
    const locationText = document.getElementById('hero-location-text');
    if (locationPill && locationText) {
      if (data.city) {
        locationPill.classList.remove('data-hidden');
        locationText.textContent = data.country ? `${data.city}, ${data.country}` : data.city;
      } else {
        locationPill.classList.add('data-hidden');
      }
    }

    // Rating Pill
    const ratingPill = document.getElementById('hero-rating-pill');
    const ratingScore = document.getElementById('hero-rating-score');
    if (ratingPill && ratingScore) {
      if (data.rating) {
        ratingPill.classList.remove('data-hidden');
        ratingScore.textContent = `${data.rating} ★ (${data.reviewCount || '100+'} Reviews)`;
      } else {
        ratingPill.classList.add('data-hidden');
      }
    }

    // Years in Business Pill
    const expPill = document.getElementById('hero-experience-pill');
    const expText = document.getElementById('hero-experience-text');
    if (expPill && expText) {
      if (data.yearsInBusiness) {
        expPill.classList.remove('data-hidden');
        expText.textContent = data.yearsInBusiness;
      } else {
        expPill.classList.add('data-hidden');
      }
    }

    // Hero Call Button
    const heroCallBtn = document.getElementById('hero-call-btn');
    const heroCallText = document.getElementById('hero-call-text');
    if (heroCallBtn) {
      if (data.phone) {
        heroCallBtn.classList.remove('data-hidden');
        heroCallBtn.href = `tel:${data.phone.replace(/\s+/g, '')}`;
        if (heroCallText) heroCallText.textContent = `Call ${data.phone}`;
      } else {
        heroCallBtn.classList.add('data-hidden');
      }
    }

    // Hero Photo
    const heroImg = document.getElementById('hero-main-img');
    if (heroImg) {
      heroImg.src = data.heroImage || GENERIC_ASSETS.hero;
      heroImg.alt = `${data.name} Professional Cleaning`;
    }

    // Floating Glass Card 1
    const floatingTitle = document.getElementById('floating-rating-title');
    const floatingDesc = document.getElementById('floating-rating-desc');
    if (floatingTitle) {
      floatingTitle.textContent = data.city ? `Top Rated in ${data.city}` : 'Top Rated Cleaners';
    }
    if (floatingDesc && data.rating) {
      floatingDesc.textContent = `${data.rating} ★ Customer Satisfaction`;
    }
  }

  /**
   * 5. Trust Metrics Bar
   */
  function renderTrustBar(data) {
    const trustRatingScore = document.getElementById('trust-rating-score');
    const trustReviewCount = document.getElementById('trust-review-count');
    const trustRatingBox = document.getElementById('trust-rating-box');

    if (trustRatingScore && trustReviewCount) {
      if (data.rating) {
        trustRatingScore.textContent = data.rating;
        trustReviewCount.textContent = data.reviewCount 
          ? `${data.reviewCount}+ Verified Reviews` 
          : 'Verified Client Rating';
        if (trustRatingBox) trustRatingBox.classList.remove('data-hidden');
      } else {
        if (trustRatingBox) trustRatingBox.classList.add('data-hidden');
      }
    }

    const cityPlaceholders = document.querySelectorAll('[data-bind="city"]');
    cityPlaceholders.forEach(el => el.textContent = data.city || 'Local Area');

    const yearsVal = document.getElementById('trust-years-val');
    if (yearsVal) {
      yearsVal.textContent = data.yearsInBusiness || '100% Quality Guaranteed';
    }

    const mapsBtn = document.getElementById('trust-maps-btn');
    if (mapsBtn) {
      if (data.googleMapsUrl) {
        mapsBtn.classList.remove('data-hidden');
        mapsBtn.href = data.googleMapsUrl;
      } else {
        mapsBtn.classList.add('data-hidden');
      }
    }
  }

  /**
   * 6. Before & After Transformation Split Slider
   */
  function renderBeforeAfterSection(data) {
    const pairs = data.beforeAfterPairs && data.beforeAfterPairs.length > 0 
      ? data.beforeAfterPairs 
      : [];

    const section = document.getElementById('before-after');
    const tabsContainer = document.getElementById('ba-tabs-container');
    if (!section || !tabsContainer) return;

    if (pairs.length === 0) {
      section.classList.add('data-hidden');
      return;
    }
    section.classList.remove('data-hidden');
    currentBeforeAfterIndex = 0;

    const icons = {
      kitchen: '🍳',
      bathroom: '🚿',
      living: '🛋️',
      appliance: '♨️'
    };

    tabsContainer.innerHTML = pairs.map((pair, idx) => `
      <button type="button" class="ba-tab-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <span>${icons[pair.id] || '✨'}</span>
        <span>${pair.badge || pair.title}</span>
      </button>
    `).join('');

    tabsContainer.querySelectorAll('.ba-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        switchBeforeAfter(idx, pairs);
      });
    });

    updateBeforeAfterDisplay(pairs[0]);
    setupSliderEvents();
  }

  function switchBeforeAfter(idx, pairs) {
    currentBeforeAfterIndex = idx;
    document.querySelectorAll('.ba-tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
    updateBeforeAfterDisplay(pairs[idx]);
  }

  function updateBeforeAfterDisplay(pair) {
    if (!pair) return;
    const beforeImg = document.getElementById('ba-before-img');
    const afterImg = document.getElementById('ba-after-img');
    const title = document.getElementById('ba-item-title');
    const desc = document.getElementById('ba-item-desc');
    const beforeStats = document.getElementById('ba-before-stats');
    const afterStats = document.getElementById('ba-after-stats');

    if (beforeImg) {
      beforeImg.src = pair.before;
      beforeImg.alt = `Dirty condition before cleaning: ${pair.title}`;
    }
    if (afterImg) {
      afterImg.src = pair.after;
      afterImg.alt = `Pristine condition after cleaning: ${pair.title}`;
    }
    if (title) title.textContent = pair.title;
    if (desc) desc.textContent = pair.description;
    if (beforeStats) beforeStats.textContent = pair.before_stats || pair.beforeStats || 'Heavy grime & dust';
    if (afterStats) afterStats.textContent = pair.after_stats || pair.afterStats || '100% Degreased & showroom shine';
  }

  function setupSliderEvents() {
    const viewport = document.getElementById('ba-viewport');
    const input = document.getElementById('ba-slider-input');
    const beforeWrapper = document.getElementById('ba-before-wrapper');
    const handle = document.getElementById('ba-handle');

    if (!viewport || !input || !beforeWrapper || !handle) return;

    function setPosition(val) {
      const clamped = Math.max(0, Math.min(100, val));
      beforeWrapper.style.width = `${clamped}%`;
      handle.style.left = `${clamped}%`;
    }

    input.addEventListener('input', (e) => setPosition(e.target.value));

    let isDown = false;
    const onMove = (e) => {
      if (!isDown) return;
      const rect = viewport.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const percent = ((clientX - rect.left) / rect.width) * 100;
      input.value = percent;
      setPosition(percent);
    };

    viewport.addEventListener('mousedown', () => isDown = true);
    window.addEventListener('mouseup', () => isDown = false);
    window.addEventListener('mousemove', onMove);

    viewport.addEventListener('touchstart', () => isDown = true, { passive: true });
    window.addEventListener('touchend', () => isDown = false);
    window.addEventListener('touchmove', onMove, { passive: true });
  }

  /**
   * 7. Dynamic Services Grid
   */
  function renderServices(data) {
    const container = document.getElementById('services-grid-container');
    const brandHeading = document.getElementById('services-brand-heading');
    if (brandHeading) brandHeading.textContent = data.name;

    if (!container) return;
    if (!data.services || data.services.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">Custom cleaning packages available upon request.</p>`;
      return;
    }

    const curr = data.currencySymbol || '£';

    container.innerHTML = data.services.map((service, index) => {
      const fallbackImg = getServiceFallbackImage(service.name, index);
      const imgSrc = service.image || fallbackImg;
      const priceText = service.price_from || service.priceFrom || '';
      const badgeText = service.badge || 'Tailored Package';
      const features = Array.isArray(service.features) ? service.features : [];

      return `
        <div class="service-card">
          <div class="service-img-wrapper">
            <img src="${imgSrc}" alt="${service.name}" loading="lazy" />
            <span class="service-badge-tag">${badgeText}</span>
            ${priceText ? `<span class="service-price-chip">From ${priceText}</span>` : ''}
          </div>
          <div class="service-card-body">
            <h3 class="service-title">${service.name}</h3>
            <p class="service-description">${service.description}</p>
            ${features.length > 0 ? `
              <div class="service-features-list">
                ${features.map(f => `
                  <div class="service-feature-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <a href="#calculator" class="service-cta-link" onclick="window.selectServiceInCalc('${service.name.replace(/'/g, "\\'")}')">
              <span>Calculate Estimate</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Populate Quote Form Service Select
    const quoteServiceSelect = document.getElementById('quote-service-select');
    if (quoteServiceSelect) {
      quoteServiceSelect.innerHTML = '<option value="">Select a service package...</option>' + 
        data.services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
  }

  /**
   * 8. Interactive Estimate & Cost Calculator
   */
  function renderCalculator(data) {
    const symbolEl = document.getElementById('calc-currency-symbol');
    if (symbolEl) symbolEl.textContent = data.currencySymbol || '£';

    // Update Addon Price Labels with Currency
    const curr = data.currencySymbol || '£';
    const rateMultiplier = getCurrencyMultiplier(curr);

    const ovenPrice = Math.round(35 * rateMultiplier);
    const fridgePrice = Math.round(25 * rateMultiplier);
    const windowsPrice = Math.round(30 * rateMultiplier);
    const carpetPrice = Math.round(50 * rateMultiplier);

    const ovenEl = document.getElementById('addon-price-oven');
    const fridgeEl = document.getElementById('addon-price-fridge');
    const windowsEl = document.getElementById('addon-price-windows');
    const carpetEl = document.getElementById('addon-price-carpet');

    if (ovenEl) ovenEl.textContent = `+${curr}${ovenPrice}`;
    if (fridgeEl) fridgeEl.textContent = `+${curr}${fridgePrice}`;
    if (windowsEl) windowsEl.textContent = `+${curr}${windowsPrice}`;
    if (carpetEl) carpetEl.textContent = `+${curr}${carpetPrice}`;

    setupCalculatorControls();
    recalculateQuote();
  }

  function getCurrencyMultiplier(curr) {
    if (curr === '₹') return 70; // 1 GBP ~ 100 INR, adjusted for Indian cleaning market pricing
    if (curr === 'A$' || curr === 'NZ$') return 1.8;
    if (curr === '$' || curr === 'C$') return 1.3;
    return 1; // GBP
  }

  function setupCalculatorControls() {
    // Property Type Chips
    document.querySelectorAll('#calc-property-chips .calc-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#calc-property-chips .calc-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        calcState.propertyType = chip.dataset.type;
        recalculateQuote();
      });
    });

    // Bedroom Steppers
    const bedVal = document.getElementById('bed-count');
    document.getElementById('bed-minus')?.addEventListener('click', () => {
      if (calcState.bedrooms > 1) {
        calcState.bedrooms--;
        if (bedVal) bedVal.textContent = calcState.bedrooms;
        recalculateQuote();
      }
    });
    document.getElementById('bed-plus')?.addEventListener('click', () => {
      if (calcState.bedrooms < 8) {
        calcState.bedrooms++;
        if (bedVal) bedVal.textContent = calcState.bedrooms;
        recalculateQuote();
      }
    });

    // Bathroom Steppers
    const bathVal = document.getElementById('bath-count');
    document.getElementById('bath-minus')?.addEventListener('click', () => {
      if (calcState.bathrooms > 1) {
        calcState.bathrooms--;
        if (bathVal) bathVal.textContent = calcState.bathrooms;
        recalculateQuote();
      }
    });
    document.getElementById('bath-plus')?.addEventListener('click', () => {
      if (calcState.bathrooms < 6) {
        calcState.bathrooms++;
        if (bathVal) bathVal.textContent = calcState.bathrooms;
        recalculateQuote();
      }
    });

    // Tier Cards
    document.querySelectorAll('#calc-tier-grid .calc-tier-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#calc-tier-grid .calc-tier-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        calcState.tier = card.dataset.tier;
        recalculateQuote();
      });
    });

    // Frequency Chips
    document.querySelectorAll('#calc-freq-chips .calc-freq-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#calc-freq-chips .calc-freq-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        calcState.frequency = chip.dataset.freq;
        recalculateQuote();
      });
    });

    // Add-on checkboxes
    document.querySelectorAll('#calc-addons-grid .calc-addon-input').forEach(box => {
      box.addEventListener('change', () => {
        calcState.addons = Array.from(document.querySelectorAll('#calc-addons-grid .calc-addon-input:checked')).map(b => b.dataset.addon);
        recalculateQuote();
      });
    });
  }

  function recalculateQuote() {
    const data = currentBusinessData || {};
    const curr = data.currencySymbol || '£';
    const mult = getCurrencyMultiplier(curr);

    // Base Calculation in GBP baseline
    let base = 40;
    base += (calcState.bedrooms - 1) * 20;
    base += (calcState.bathrooms - 1) * 15;

    if (calcState.propertyType === 'house') base += 20;
    if (calcState.propertyType === 'office') base += 35;

    // Tier Multipliers
    if (calcState.tier === 'deep') base *= 1.7;
    if (calcState.tier === 'move') base *= 2.1;

    // Addons
    let addonsTotalGBP = 0;
    if (calcState.addons.includes('oven')) addonsTotalGBP += 35;
    if (calcState.addons.includes('fridge')) addonsTotalGBP += 25;
    if (calcState.addons.includes('windows')) addonsTotalGBP += 30;
    if (calcState.addons.includes('carpet')) addonsTotalGBP += 50;

    // Discounts
    let discountRate = 0;
    if (calcState.frequency === 'weekly') discountRate = 0.20;
    else if (calcState.frequency === 'bi-weekly') discountRate = 0.15;
    else if (calcState.frequency === 'monthly') discountRate = 0.10;

    const baseInLocal = Math.round(base * mult);
    const discountInLocal = Math.round(baseInLocal * discountRate);
    const addonsInLocal = Math.round(addonsTotalGBP * mult);
    const finalTotal = (baseInLocal - discountInLocal) + addonsInLocal;

    // UI Updates
    const totalEl = document.getElementById('calc-total-price');
    const scopeNameEl = document.getElementById('breakdown-scope-name');
    const basePriceEl = document.getElementById('breakdown-base-price');
    const discountRow = document.getElementById('breakdown-discount-row');
    const discountPriceEl = document.getElementById('breakdown-discount-price');
    const addonsRow = document.getElementById('breakdown-addons-row');
    const addonsPriceEl = document.getElementById('breakdown-addons-price');
    const cycleText = document.getElementById('calc-cycle-text');

    if (totalEl) totalEl.textContent = finalTotal.toLocaleString();
    if (scopeNameEl) scopeNameEl.textContent = `${calcState.bedrooms} Bed, ${calcState.bathrooms} Bath • ${calcState.frequency.replace('-', ' ').toUpperCase()}`;
    if (basePriceEl) basePriceEl.textContent = `${curr}${baseInLocal}`;

    if (discountRow && discountPriceEl) {
      if (discountRate > 0) {
        discountRow.style.display = 'flex';
        discountPriceEl.textContent = `-${curr}${discountInLocal} (${Math.round(discountRate * 100)}%)`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (addonsRow && addonsPriceEl) {
      if (addonsInLocal > 0) {
        addonsRow.style.display = 'flex';
        addonsPriceEl.textContent = `+${curr}${addonsInLocal}`;
      } else {
        addonsRow.style.display = 'none';
      }
    }

    if (cycleText) {
      cycleText.textContent = calcState.frequency === 'one-time' ? 'one-time total (estimated)' : `per clean (${calcState.frequency})`;
    }

    // Dynamic WhatsApp booking link update
    const calcWhatsApp = document.getElementById('calc-whatsapp-btn');
    if (calcWhatsApp) {
      const msg = `Hello ${data.name || 'Team'}, I calculated an estimate of ${curr}${finalTotal} for my ${calcState.bedrooms} bed, ${calcState.bathrooms} bath property (${calcState.frequency}, ${calcState.tier} tier). I'd like to book!`;
      calcWhatsApp.href = getWhatsAppUrl(data, msg);
    }
  }

  window.selectServiceInCalc = function (serviceName) {
    const lower = serviceName.toLowerCase();
    if (lower.includes('deep')) calcState.tier = 'deep';
    else if (lower.includes('tenancy') || lower.includes('move')) calcState.tier = 'move';
    else calcState.tier = 'regular';

    document.querySelectorAll('#calc-tier-grid .calc-tier-card').forEach(card => {
      card.classList.toggle('active', card.dataset.tier === calcState.tier);
    });

    const quoteSelect = document.getElementById('quote-service-select');
    if (quoteSelect) quoteSelect.value = serviceName;

    recalculateQuote();
  };

  /**
   * 9. Interactive Room Checklist Matrix
   */
  function setupChecklistTabs() {
    document.querySelectorAll('#checklist-tabs .checklist-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#checklist-tabs .checklist-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.checklist-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const room = tab.dataset.room;
        const panel = document.getElementById(`panel-${room}`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /**
   * 10. Why Choose Us
   */
  function renderWhyChoose(data) {
    const whyBrandHeading = document.getElementById('why-brand-heading');
    if (whyBrandHeading) whyBrandHeading.textContent = data.name;
  }

  /**
   * 11. Photo Gallery & Fullscreen Lightbox
   */
  function renderGallery(data) {
    const container = document.getElementById('gallery-grid-container');
    const brandName = document.getElementById('gallery-brand-name');
    if (brandName) brandName.textContent = data.name;
    if (!container) return;

    const photos = data.businessImages && data.businessImages.length > 0 
      ? data.businessImages 
      : GENERIC_ASSETS.gallery;

    galleryImageUrls = photos;

    container.innerHTML = photos.slice(0, 6).map((imgUrl, idx) => `
      <div class="gallery-item" onclick="window.openLightbox(${idx})">
        <img src="${imgUrl}" alt="${data.name} Project Result" loading="lazy" />
        <div class="gallery-overlay">
          <div class="gallery-zoom-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </div>
          <span style="font-weight: 700; font-size: 0.85rem;">View Transformation</span>
        </div>
      </div>
    `).join('');
  }

  window.openLightbox = function (idx) {
    currentGalleryIndex = idx;
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img && galleryImageUrls[idx]) {
      img.src = galleryImageUrls[idx];
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function () {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  window.navigateLightbox = function (dir) {
    if (!galleryImageUrls.length) return;
    currentGalleryIndex = (currentGalleryIndex + dir + galleryImageUrls.length) % galleryImageUrls.length;
    const img = document.getElementById('lightbox-img');
    if (img) img.src = galleryImageUrls[currentGalleryIndex];
  };

  function setupLightboxKeyboard() {
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('lightbox-modal');
      if (modal && modal.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
  }

  /**
   * 12. Verified Customer Reviews
   */
  function renderReviews(data) {
    const container = document.getElementById('reviews-grid-container');
    const brandHeading = document.getElementById('reviews-brand-heading');
    if (brandHeading) brandHeading.textContent = data.name;
    if (!container) return;

    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    if (reviews.length === 0) {
      document.getElementById('reviews')?.classList.add('data-hidden');
      return;
    }
    document.getElementById('reviews')?.classList.remove('data-hidden');

    container.innerHTML = reviews.map(rev => {
      const starsCount = rev.rating || 5;
      const starsHTML = Array.from({ length: starsCount }).map(() => `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      `).join('');

      return `
        <div class="review-card">
          <div>
            <div class="review-stars">${starsHTML}</div>
            <p class="review-text">"${rev.text}"</p>
          </div>
          <div class="review-author-row">
            <div>
              <div class="review-author-name">${rev.author || 'Verified Client'}</div>
              ${rev.service ? `<div style="font-size: 0.775rem; color: var(--color-text-muted);">${rev.service}</div>` : ''}
            </div>
            <span class="review-badge">${rev.source || 'Google Review'}${rev.date ? ` • ${rev.date}` : ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 13. Service Areas Coverage & Suburb Lookup
   */
  function renderServiceAreas(data) {
    const pillsContainer = document.getElementById('service-areas-pills');
    const areas = data.serviceAreas || [];

    if (pillsContainer) {
      pillsContainer.innerHTML = areas.map(area => `
        <span class="service-area-pill">${area}</span>
      `).join('');
    }

    setupAreaLookup(areas, data.city);
  }

  function setupAreaLookup(areas, city) {
    const input = document.getElementById('area-search-input');
    const result = document.getElementById('area-lookup-result');
    if (!input || !result) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        result.textContent = '';
        result.className = 'area-lookup-result';
        return;
      }

      const match = areas.some(a => a.toLowerCase().includes(query));
      if (match) {
        result.textContent = `✓ Great news! We provide full mobile cleaning coverage in "${e.target.value.trim()}".`;
        result.className = 'area-lookup-result area-match-yes';
      } else {
        result.textContent = `📍 We cover all greater ${city || 'metro'} areas. Contact us to verify your specific street.`;
        result.className = 'area-lookup-result area-match-no';
      }
    });
  }

  /**
   * 14. Contact Card & Social Media Profiles
   */
  function renderContact(data) {
    // Phone
    const phoneContainer = document.getElementById('contact-phone-container');
    const phoneVal = document.getElementById('contact-phone-val');
    const phoneLink = document.getElementById('contact-phone-link');
    if (data.phone) {
      if (phoneContainer) phoneContainer.classList.remove('data-hidden');
      if (phoneVal) phoneVal.textContent = data.phone;
      if (phoneLink) phoneLink.href = `tel:${data.phone.replace(/\s+/g, '')}`;
    } else {
      if (phoneContainer) phoneContainer.classList.add('data-hidden');
    }

    // WhatsApp
    const waContainer = document.getElementById('contact-whatsapp-container');
    const waLink = document.getElementById('contact-whatsapp-link');
    const waUrl = getWhatsAppUrl(data);
    if (waContainer) {
      if (waUrl) {
        waContainer.classList.remove('data-hidden');
        if (waLink) waLink.href = waUrl;
      } else {
        waContainer.classList.add('data-hidden');
      }
    }

    // Email
    const emailContainer = document.getElementById('contact-email-container');
    const emailVal = document.getElementById('contact-email-val');
    const emailLink = document.getElementById('contact-email-link');
    if (data.email) {
      if (emailContainer) emailContainer.classList.remove('data-hidden');
      if (emailVal) emailVal.textContent = data.email;
      if (emailLink) emailLink.href = `mailto:${data.email}`;
    } else {
      if (emailContainer) emailContainer.classList.add('data-hidden');
    }

    // Address
    const addrContainer = document.getElementById('contact-address-container');
    const addrVal = document.getElementById('contact-address-val');
    if (data.address) {
      if (addrContainer) addrContainer.classList.remove('data-hidden');
      if (addrVal) addrVal.textContent = data.address;
    } else {
      if (addrContainer) addrContainer.classList.add('data-hidden');
    }

    // Hours
    const hoursContainer = document.getElementById('contact-hours-container');
    const hoursVal = document.getElementById('contact-hours-val');
    if (data.openingHours) {
      if (hoursContainer) hoursContainer.classList.remove('data-hidden');
      if (hoursVal) hoursVal.textContent = data.openingHours;
    } else {
      if (hoursContainer) hoursContainer.classList.add('data-hidden');
    }

    // Website Link
    const webContainer = document.getElementById('contact-website-container');
    const webLink = document.getElementById('contact-website-link');
    const webVal = document.getElementById('contact-website-val');
    if (data.websiteUrl) {
      if (webContainer) webContainer.classList.remove('data-hidden');
      if (webLink) webLink.href = data.websiteUrl;
      if (webVal) webVal.textContent = data.websiteUrl.replace(/^https?:\/\//, '');
    } else {
      if (webContainer) webContainer.classList.add('data-hidden');
    }

    // Socials Binding
    bindSocialLink('contact-social-instagram', data.social.instagram);
    bindSocialLink('contact-social-facebook', data.social.facebook);
    bindSocialLink('contact-social-tiktok', data.social.tiktok);
    bindSocialLink('contact-social-linkedin', data.social.linkedin);
    bindSocialLink('contact-social-youtube', data.social.youtube);
    bindSocialLink('contact-social-twitter', data.social.twitter || data.social.x);
    bindSocialLink('contact-social-yelp', data.social.yelp);
    bindSocialLink('contact-social-maps', data.googleMapsUrl);
  }

  function bindSocialLink(elementId, url) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (url && url.trim() !== '') {
      el.classList.remove('data-hidden');
      el.href = url;
    } else {
      el.classList.add('data-hidden');
    }
  }

  /**
   * 15. Modern Footer
   */
  function renderFooter(data) {
    const footerName = document.getElementById('footer-brand-name');
    if (footerName) footerName.textContent = data.name;

    const footerTagline = document.getElementById('footer-tagline');
    if (footerTagline) footerTagline.textContent = data.tagline;

    const footerCity = document.getElementById('footer-city-text');
    if (footerCity) footerCity.textContent = data.country ? `${data.city}, ${data.country}` : data.city;

    const footerPhone = document.getElementById('footer-phone-link');
    if (footerPhone && data.phone) {
      footerPhone.href = `tel:${data.phone.replace(/\s+/g, '')}`;
      footerPhone.textContent = data.phone;
      document.getElementById('footer-phone-container')?.classList.remove('data-hidden');
    }

    const footerWa = document.getElementById('footer-whatsapp-link');
    const waUrl = getWhatsAppUrl(data);
    if (footerWa && waUrl) {
      footerWa.href = waUrl;
      document.getElementById('footer-whatsapp-container')?.classList.remove('data-hidden');
    }

    const footerEmail = document.getElementById('footer-email-link');
    if (footerEmail && data.email) {
      footerEmail.href = `mailto:${data.email}`;
      footerEmail.textContent = data.email;
      document.getElementById('footer-email-container')?.classList.remove('data-hidden');
    }

    const footerAddr = document.getElementById('footer-address-val');
    if (footerAddr && data.address) {
      footerAddr.textContent = data.address;
      document.getElementById('footer-address-container')?.classList.remove('data-hidden');
    }

    const footerHours = document.getElementById('footer-hours-val');
    if (footerHours && data.openingHours) {
      footerHours.textContent = data.openingHours;
    }

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
  }

  /**
   * 16. Mobile Sticky Bar
   */
  function renderMobileStickyBar(data) {
    const callBtn = document.getElementById('mobile-sticky-call-btn');
    if (callBtn) {
      if (data.phone) {
        callBtn.classList.remove('data-hidden');
        callBtn.href = `tel:${data.phone.replace(/\s+/g, '')}`;
      } else {
        callBtn.classList.add('data-hidden');
      }
    }

    const waBtn = document.getElementById('mobile-sticky-whatsapp-btn');
    const waUrl = getWhatsAppUrl(data);
    if (waBtn) {
      if (waUrl) {
        waBtn.classList.remove('data-hidden');
        waBtn.href = waUrl;
      } else {
        waBtn.classList.add('data-hidden');
      }
    }
  }

  /**
   * Quote Form Handling
   */
  function setupQuoteForm() {
    const form = document.getElementById('quote-booking-form');
    const feedback = document.getElementById('quote-form-feedback');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quote-name')?.value || 'Customer';
      if (feedback) {
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <strong>Thank you, ${name}!</strong> Your cleaning quote request has been received. 
          The team at <strong>${currentBusinessData?.name || 'our office'}</strong> will contact you promptly to confirm your booking.
        `;
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    });
  }

  /**
   * Mobile Navigation Toggle
   */
  function setupMobileNav() {
    const btn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      drawer.classList.toggle('open', !isOpen);
      btn.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Universal Generic Services Generator
   * Generates standard generic services across all countries with localized pricing
   */
  function getGenericServices(curr) {
    let prices = {
      '£': { reg: '£22/hr', deep: '£180', move: '£220', carpet: '£65', reno: '£250', comm: '£25/hr' },
      '$': { reg: '$45/hr', deep: '$220', move: '$280', carpet: '$85', reno: '$320', comm: '$35/hr' },
      'A$': { reg: 'A$42/hr', deep: 'A$240', move: 'A$320', carpet: 'A$95', reno: 'A$360', comm: 'A$38/hr' },
      'NZ$': { reg: 'NZ$40/hr', deep: 'NZ$230', move: 'NZ$310', carpet: 'NZ$90', reno: 'NZ$350', comm: 'NZ$36/hr' },
      'C$': { reg: 'C$42/hr', deep: 'C$220', move: 'C$290', carpet: 'C$85', reno: 'C$330', comm: 'C$35/hr' },
      '₹': { reg: '₹499/hr', deep: '₹3,499', move: '₹4,999', carpet: '₹1,499', reno: '₹5,499', comm: '₹350/hr' }
    };
    const p = prices[curr] || prices['£'];

    return [
      {
        name: "Regular Home Cleaning",
        badge: "Popular Housekeeping",
        price_from: p.reg,
        description: "Consistent weekly or bi-weekly housekeeping tailored to keep your living spaces continuously immaculate and fresh.",
        image: "./assets/service_regular.jpg",
        features: [
          "Dusting & vacuuming all rooms",
          "Kitchen counters, sink & stovetop scrub",
          "Complete bathroom sanitization",
          "Bed making & linen changing"
        ]
      },
      {
        name: "Intensive Deep Cleaning",
        badge: "Top Detail Scrub",
        price_from: p.deep,
        description: "Top-to-bottom comprehensive deep scrub reaching behind appliances, skirting boards, grout lines, and heavy buildup.",
        image: "./assets/service_deep.jpg",
        features: [
          "Inside oven, microwave & range hood degreasing",
          "Deep tile & grout limescale descaling",
          "Baseboards, doors & window frame wiping",
          "Under & behind reachable furniture"
        ]
      },
      {
        name: "End of Tenancy / Move-Out Cleaning",
        badge: "100% Deposit Guarantee",
        price_from: p.move,
        description: "Inspection-ready handover deep clean strictly compliant with estate agent and landlord inventory checklists.",
        image: "./assets/service_move_out.jpg",
        features: [
          "48-hour free re-clean guarantee",
          "Deep cupboard & wardrobe interior wash",
          "Appliance internal degreasing included",
          "Official invoice for estate agent handover"
        ]
      },
      {
        name: "Carpet & Upholstery Steam Cleaning",
        badge: "Stain & Allergen Removal",
        price_from: p.carpet,
        description: "High-temperature hot water extraction extracting deep ground-in dirt, pet dander, stubborn stains, and bacteria.",
        image: "./assets/service_carpet.jpg",
        features: [
          "Deep hot-water steam injection",
          "Pet odor & stain neutralizing enzyme",
          "Quick drying time (2-4 hours)",
          "Safe for delicate fibers & wool rugs"
        ]
      },
      {
        name: "Post-Renovation & Builders Cleaning",
        badge: "Fine Dust Elimination",
        price_from: p.reno,
        description: "Specialized multi-stage fine dust extraction, paint splatter removal, and polishing following construction works.",
        image: "./assets/living_after.jpg",
        features: [
          "HEPA filtration fine dust extraction",
          "Paint, silicone & adhesive residue removal",
          "Window glass & track detailed polishing",
          "Ready for immediate furnishing"
        ]
      },
      {
        name: "Commercial & Office Cleaning",
        badge: "Discreet & Professional",
        price_from: p.comm,
        description: "Discreet, reliable janitorial maintenance creating clean, hygienic, and productive workplace environments.",
        image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80",
        features: [
          "Workstation & phone sanitization",
          "Kitchenette, breakroom & washroom restock",
          "After-hours or weekend keyholder service",
          "Eco-friendly commercial supplies"
        ]
      }
    ];
  }

  /**
   * ==========================================================================
   * 6 MULTI-REGION REALISTIC DEMO PRESETS (US, UK, AUS, NZ, Canada, India)
   * ==========================================================================
   */
  const DEMO_PRESETS = {
    'us_chicago': {
      "business_name": "Apex Deep Clean Pro",
      "tagline": "Chicagoland's Premier House, Deep & Move-Out Cleaning Specialists",
      "category": "Residential & Commercial Cleaning",
      "phone": "+1 (312) 555-0198",
      "whatsapp": "+1 (312) 555-0198",
      "email": "service@apexdeepclean.com",
      "website_url": "https://apexdeepclean.com",
      "address": "333 N Michigan Ave, Suite 1400, Chicago, IL 60601",
      "city": "Chicago",
      "state": "Illinois",
      "country": "United States",
      "currency_symbol": "$",
      "currency_code": "USD",
      "opening_hours": "Mon - Sun: 7:30 AM - 8:00 PM",
      "rating": "4.95",
      "review_count": "240",
      "years_in_business": "10+ Years in Business",
      "established_year": "2016",
      "google_maps_url": "https://maps.google.com/?q=Chicago+IL",
      "hero_image": "./assets/hero_cleaner.jpg",
      "service_areas": ["The Loop", "Lincoln Park", "Wicker Park", "Lakeview", "River North", "West Loop", "Gold Coast", "Evanston"],
      "social": {
        "instagram": "https://instagram.com/apexdeepclean",
        "facebook": "https://facebook.com/apexdeepclean",
        "tiktok": "https://tiktok.com/@apexdeepclean",
        "yelp": "https://yelp.com/biz/apex-deep-clean"
      },
      "services": getGenericServices('$'),
      "reviews": [
        { "author": "Marcus Brody", "rating": 5, "text": "Apex Deep Clean Pro did our Lincoln Park home. Spotless, polite, and completely pet-friendly. 10/10!", "source": "Google Review", "date": "4 days ago" }
      ]
    },
    'aus_sydney': {
      "business_name": "Bondi Pristine Cleaning Co",
      "tagline": "Sydney's Trusted Residential & End of Lease Cleaning Experts",
      "category": "Residential & Commercial Cleaning",
      "phone": "+61 480 012 345",
      "whatsapp": "+61 480 012 345",
      "email": "hello@bondipristine.com.au",
      "website_url": "https://bondipristine.com.au",
      "address": "82 Campbell Parade, Bondi Beach, Sydney NSW 2026",
      "city": "Sydney",
      "state": "NSW",
      "country": "Australia",
      "currency_symbol": "A$",
      "currency_code": "AUD",
      "opening_hours": "Mon - Sat: 7:00 AM - 6:30 PM",
      "rating": "4.9",
      "review_count": "172",
      "years_in_business": "8+ Years in Sydney",
      "established_year": "2018",
      "google_maps_url": "https://maps.google.com/?q=Bondi+Beach+Sydney",
      "hero_image": "./assets/hero_cleaner.jpg",
      "service_areas": ["Bondi", "Surry Hills", "Paddington", "Coogee", "Manly", "CBD", "Double Bay", "Rose Bay"],
      "social": {
        "instagram": "https://instagram.com/bondipristine",
        "facebook": "https://facebook.com/bondipristine"
      },
      "services": getGenericServices('A$'),
      "reviews": [
        { "author": "Liam Hemsworth", "rating": 5, "text": "Got 100% of our bond back on our terrace. The team was amazed at the oven and bathrooms.", "source": "Google Review", "date": "1 week ago" }
      ]
    },
    'nz_auckland': {
      "business_name": "Kiwi Sparkle Home Services",
      "tagline": "Auckland's Trusted Domestic, Deep & Move-Out Cleaning Specialists",
      "category": "Residential & Commercial Cleaning",
      "phone": "+64 9 555 8920",
      "whatsapp": "+64 9 555 8920",
      "email": "team@kiwisparkle.co.nz",
      "website_url": "https://kiwisparkle.co.nz",
      "address": "15 Queen Street, Auckland CBD, Auckland 1010",
      "city": "Auckland",
      "state": "Auckland Region",
      "country": "New Zealand",
      "currency_symbol": "NZ$",
      "currency_code": "NZD",
      "opening_hours": "Mon - Sat: 8:00 AM - 6:00 PM",
      "rating": "4.92",
      "review_count": "115",
      "years_in_business": "7+ Years in Auckland",
      "established_year": "2019",
      "google_maps_url": "https://maps.google.com/?q=Auckland+NZ",
      "hero_image": "./assets/hero_cleaner.jpg",
      "service_areas": ["Ponsonby", "Auckland CBD", "Takapuna", "Newmarket", "Remuera", "Grey Lynn", "Devonport"],
      "social": {
        "instagram": "https://instagram.com/kiwisparkle",
        "facebook": "https://facebook.com/kiwisparkle"
      },
      "services": getGenericServices('NZ$'),
      "reviews": [
        { "author": "Chloe Marshall", "rating": 5, "text": "Punctual, friendly and the house smelled amazing. Kiwi Sparkle is easily the best cleaning team in Auckland.", "source": "Google Review", "date": "2 weeks ago" }
      ]
    },
    'ca_toronto': {
      "business_name": "Maple Leaf Spotless Homes",
      "tagline": "Top-Tier Residential, Deep & Move-Out Cleaning in the GTA",
      "category": "Residential & Commercial Cleaning",
      "phone": "+1 (416) 555-7832",
      "whatsapp": "+1 (416) 555-7832",
      "email": "support@mapleleafspotless.ca",
      "website_url": "https://mapleleafspotless.ca",
      "address": "100 King St W, Suite 2100, Toronto, ON M5X 1A9",
      "city": "Toronto",
      "state": "Ontario",
      "country": "Canada",
      "currency_symbol": "C$",
      "currency_code": "CAD",
      "opening_hours": "Mon - Sun: 7:30 AM - 7:30 PM",
      "rating": "4.94",
      "review_count": "198",
      "years_in_business": "11+ Years in GTA",
      "established_year": "2015",
      "google_maps_url": "https://maps.google.com/?q=Toronto+ON",
      "hero_image": "./assets/hero_cleaner.jpg",
      "service_areas": ["Downtown Toronto", "Yorkville", "Etobicoke", "North York", "Scarborough", "Mississauga", "Vaughan"],
      "social": {
        "instagram": "https://instagram.com/mapleleafspotless",
        "facebook": "https://facebook.com/mapleleafspotless"
      },
      "services": getGenericServices('C$'),
      "reviews": [
        { "author": "Sophie Tremblay", "rating": 5, "text": "They transformed our Yorkville townhouse before family arrived. Efficient, immaculate, and professional.", "source": "Google Review", "date": "1 month ago" }
      ]
    },
    'in_mumbai': {
      "business_name": "UrbanShine Deep Cleaners",
      "tagline": "Mumbai's Premier Residential, Deep & Move-Out Cleaning Specialists",
      "category": "Residential & Commercial Cleaning",
      "phone": "+91 98200 54321",
      "whatsapp": "+91 98200 54321",
      "email": "book@urbanshineindia.com",
      "website_url": "https://urbanshineindia.com",
      "address": "Linking Road, Bandra West, Mumbai, Maharashtra 400050",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "currency_symbol": "₹",
      "currency_code": "INR",
      "opening_hours": "Mon - Sun: 8:00 AM - 8:30 PM",
      "rating": "4.88",
      "review_count": "310",
      "years_in_business": "9+ Years Experience",
      "established_year": "2017",
      "google_maps_url": "https://maps.google.com/?q=Bandra+West+Mumbai",
      "hero_image": "./assets/hero_cleaner.jpg",
      "service_areas": ["Bandra West", "Andheri", "BKC", "Powai", "Juhu", "South Mumbai", "Worli", "Thane"],
      "social": {
        "instagram": "https://instagram.com/urbanshinemumbai",
        "facebook": "https://facebook.com/urbanshinemumbai",
        "youtube": "https://youtube.com/@urbanshineindia"
      },
      "services": getGenericServices('₹'),
      "reviews": [
        { "author": "Rahul Sharma", "rating": 5, "text": "UrbanShine cleaned our 3BHK flat in Bandra before Diwali. The kitchen grease and bathroom tiles look brand new. Excellent crew!", "source": "Google Review", "date": "1 week ago" }
      ]
    }
  };

  /**
   * Demo Region Switcher Modal
   */
  function setupDemoSwitcher() {
    const btn = document.getElementById('demo-switcher-btn');
    const modal = document.getElementById('demo-switcher-modal');
    const closeBtn = document.getElementById('demo-modal-close');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => modal.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    document.querySelectorAll('.demo-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-preset');
        document.querySelectorAll('.demo-preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        modal.classList.remove('open');

        if (key === 'live') {
          fetch('./data/business.json', { cache: 'no-cache' })
            .then(res => res.json())
            .then(data => renderWebsite(data))
            .catch(() => renderWebsite(DEMO_PRESETS['us_chicago']));
        } else if (DEMO_PRESETS[key]) {
          renderWebsite(DEMO_PRESETS[key]);
        }
      });
    });
  }

  /**
   * Initialization
   */
  async function init() {
    setupMobileNav();
    setupQuoteForm();
    setupChecklistTabs();
    setupLightboxKeyboard();
    setupDemoSwitcher();

    try {
      const res = await fetch('./data/business.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      renderWebsite(data);
    } catch (err) {
      console.warn('Could not fetch data/business.json, using baseline demo:', err);
      renderWebsite(DEMO_PRESETS['us_chicago']);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
