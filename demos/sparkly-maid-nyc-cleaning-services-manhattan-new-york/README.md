# Agency-Grade Home Cleaning Website Template

A modern, high-converting, personalized website template engineered specifically for automated lead generation and white-label client deployment in the residential and commercial cleaning industry across **US, UK, New Zealand, Australia, India, and Canada**.

Built with **HTML5, CSS3, and Vanilla JavaScript**, this template is **100% data-driven**, lightning fast, and strictly adheres to subdirectory deployment rules (e.g., `https://yourdomain.com/demos/super-cleaners-london/`).

---

## Core Template Structure

```text
├── index.html                  # Accessible, semantic HTML markup with dynamic placeholders
├── style.css                   # Modern CSS design system (Deep Slate Navy, Ocean Blue & Fresh Mint)
├── script.js                   # Universal data engine, interactive calculator, before/after slider
├── data/
│   └── business.json           # SOLE authoritative source of customer-specific business information
└── README.md                   # Automation documentation and integration guide
```

---

## Key Features & Conversion Architecture

1. **Hyper-Personalized Business Identity**:
   - Company name, tagline, category, full address, direct phone, WhatsApp chat, email, website link, and Google Maps integration.
   - Supports custom `logo_url` or automatically renders a modern vector brand mark.

2. **Multi-Region & Multi-Currency Engine**:
   - Built-in dynamic support for **United States ($), United Kingdom (£), Australia (A$), New Zealand (NZ$), Canada (C$), and India (₹)**.
   - Built-in demo switcher with 6 regional business presets to preview live adaptability.

3. **Interactive "Before & After" Split Slider**:
   - Touch/mouse drag-enabled split-image comparison slider to showcase cleaning transformations (Kitchen, Bathroom, Living Space, Oven Grime).

4. **Live Instant Quote & Cost Estimator**:
   - Interactive bedrooms & bathrooms selector, property type chip toggle, cleaning tiers (Regular, Deep, Move-Out), recurring frequency discounts (-15%, -20%), and add-ons (Oven, Fridge, Windows, Carpet).
   - Generates instant localized pricing and 1-click WhatsApp / Email booking inquiries.

5. **Room-by-Room Cleaning Checklist Matrix**:
   - Tabbed scope breakdown for Kitchens, Bathrooms, Living Areas, and Move-Out Turnover.

6. **Interactive Service Area Finder**:
   - Suburb tag cloud and real-time search input for visitors to confirm local coverage.

7. **Verified Social Proof & Reviews**:
   - Google & Trustpilot review cards with star ratings, reviewer details, and date badges.

8. **Zero-Defect Graceful Degradation**:
   - If any optional field (e.g. logo, TikTok, years in business, custom photos) is omitted, its UI element hides automatically without visual defects or layout gaps.

---

## Universal Data Schema (`/data/business.json`)

The template accepts both `snake_case` and `camelCase` keys:

```json
{
  "_comment": "Authoritative source of truth for the website.",
  "business_name": "Super Cleaners London",
  "tagline": "Award-Winning Residential, Deep & Move-Out Cleaning Specialists",
  "category": "Residential & Commercial Cleaning",
  "phone": "+44 20 7946 0912",
  "whatsapp": "+44 20 7946 0912",
  "email": "contact@supercleanerslondon.co.uk",
  "website_url": "https://supercleanerslondon.co.uk",
  "address": "45 Baker Street, Marylebone, London W1U 8ED",
  "city": "London",
  "state": "Greater London",
  "country": "United Kingdom",
  "currency_symbol": "£",
  "currency_code": "GBP",
  "opening_hours": "Mon - Sat: 8:00 AM - 7:00 PM | Sun: 9:00 AM - 4:00 PM",
  "rating": "4.9",
  "review_count": "184",
  "years_in_business": "12+ Years in Business",
  "established_year": "2014",
  "google_maps_url": "https://maps.google.com/?q=London+UK",
  "logo_url": "",
  "hero_image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
  "service_areas": [
    "Marylebone",
    "Westminster",
    "Kensington & Chelsea",
    "Camden",
    "Mayfair",
    "Battersea"
  ],
  "social": {
    "instagram": "https://instagram.com/supercleanerslondon",
    "facebook": "https://facebook.com/supercleanerslondon",
    "tiktok": "https://tiktok.com/@supercleanerslondon",
    "linkedin": "https://linkedin.com/company/supercleanerslondon",
    "youtube": "https://youtube.com/@supercleanerslondon",
    "twitter": "https://x.com/supercleanersuk",
    "yelp": "https://yelp.co.uk/biz/supercleaners-london",
    "pinterest": "https://pinterest.com/supercleanerslondon"
  },
  "before_after_pairs": [
    {
      "id": "kitchen",
      "badge": "Kitchen Restoration",
      "title": "Kitchen Degreasing & Stovetop Restoration",
      "description": "Removal of heavy grease splatter, burnt stovetop carbon, and messy clutter.",
      "before": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80",
      "after": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "before_stats": "Heavy grease, clutter & burnt spills",
      "after_stats": "100% Degreased & showroom shine"
    }
  ],
  "services": [
    {
      "name": "Regular Home Cleaning",
      "badge": "Popular Housekeeping",
      "price_from": "£22/hr",
      "description": "Consistent weekly or bi-weekly housekeeping tailored to keep your living spaces fresh.",
      "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      "features": [
        "Dusting & vacuuming all rooms",
        "Kitchen counters & stovetop scrub",
        "Complete bathroom sanitization"
      ]
    }
  ],
  "reviews": [
    {
      "author": "Victoria Sterling",
      "rating": 5,
      "text": "Super Cleaners London did an exceptional job on our flat in Marylebone.",
      "source": "Google Review",
      "date": "1 week ago",
      "service": "End of Tenancy Deep Clean"
    }
  ]
}
```
