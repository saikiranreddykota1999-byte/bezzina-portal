# Joseph Bezzina & Co. Ltd — Website Improvement Roadmap

**Live site:** https://jbezzina.store  
**Audit date:** 12 July 2026  
**Overall score:** 58 / 100  
**Target (Phase 1):** 70 / 100 within 4–6 weeks

This document is the prioritized implementation backlog from the enterprise audit. Work top-to-bottom within each phase unless dependencies say otherwise.

---

## Score Targets

| Score | What must be true |
|-------|-------------------|
| **70** | Real logo, unified brand, About redesign, contact form, legal pages, custom 404, global search, mock features removed/labelled, basic trust section |
| **80** | Above + DB search, mega menu, full SEO metadata, related products, quote email confirmation, security headers, admin page auth, testimonials |
| **90** | Above + case studies/certs, real tracking, quote status portal, 5k+ SKU performance, WCAG AA, Stripe webhook reconciliation |
| **95** | Above + B2B company accounts, tier pricing, PO checkout, ERP-ready APIs, test coverage, observability |
| **100** | Grainger/RS-tier — 12–18 months sustained investment |

---

## Phase 0 — Critical (Week 1)

> Unblock trust, compliance, and production credibility. **Do these first.**

| ID | Task | Why it matters | Business impact | Solution | Effort |
|----|------|----------------|-----------------|----------|--------|
| C-01 | Replace “JB” placeholder with real logo | Weak brand recall on every page | Buyers question legitimacy | Use `company.logoUrl` in `components/layout/header.tsx` + footer | Easy |
| C-02 | Unify brand colors (blue `#0B3D91` + gold `#D8A106` primary) | Two design systems (orange vs blue/gold) | Site feels inconsistent / unfinished | Audit `globals.css`, header, hero, CTAs; align to Services page standard | Moderate |
| C-03 | Redesign About page | 2 paragraphs is unacceptable for a 1969 supplier | Enterprise buyers leave during research | New `components/about/` with timeline, warehouse, team, industries, certs | Moderate |
| C-04 | Add contact enquiry form | No form = high friction | Lost inbound leads | Server action + Zod + Resend notification on `/contact` | Moderate |
| C-05 | Privacy Policy + Terms + Cookie consent | EU/Malta GDPR requirement | Legal/compliance risk | New routes + footer links + cookie banner component | Moderate |
| C-06 | Custom `not-found.tsx` + `error.tsx` | Generic Next.js errors | Broken trust on 404/500 | Branded pages with Browse Products + Request Quote CTAs | Easy |
| C-07 | Fix canonical URL mismatch | `jbezzina.store` vs `bezzina.com.mt` in sitemap/robots/schema | SEO dilution, duplicate indexing | Set `NEXT_PUBLIC_SITE_URL=https://jbezzina.store` everywhere; align `app/sitemap.ts`, `app/robots.ts` | Easy |
| C-08 | Global header search | Search only on homepage hero | Users can’t find products after landing | Move `SearchBar` into `components/layout/header.tsx` (compact variant) | Moderate |
| C-09 | Remove or label mock `/track` page | Demo tracking numbers destroy trust | Credibility damage if discovered | Either integrate real carrier API or add clear “Coming soon” + remove demo data | Easy |
| C-10 | Remove or implement fake account pages | Tickets, suggestions, saved cards are shells | Users feel deceived | Delete routes OR build real backend for each | Moderate |
| C-11 | Admin page-level `requirePermission()` | URL knowledge bypasses UI-only guards | Data breach risk | Add guard to every `app/(admin)/admin/**/page.tsx` | Moderate |
| C-12 | Stripe webhook order reconciliation | Client-side-only order creation after payment | Paid orders with no record | Implement handler in `app/api/stripe/webhook/route.ts` | Complex |
| C-13 | DB-level product search | Full catalogue loaded into memory (927+ SKUs) | Site slows/crashes at scale | Supabase RPC / Postgres FTS; paginate at DB layer | Complex |

### Phase 0 file references

```
components/layout/header.tsx          # C-01, C-08
components/home/hero.tsx              # C-02, C-08
app/(marketing)/about/page.tsx        # C-03
app/(marketing)/contact/page.tsx      # C-04
app/not-found.tsx                     # C-06 (create)
app/error.tsx                         # C-06 (create)
lib/site-url.ts                       # C-07
app/sitemap.ts, app/robots.ts         # C-07
app/(marketing)/track/page.tsx        # C-09
app/(marketing)/account/tickets/      # C-10
app/(marketing)/account/suggestions/# C-10
app/(admin)/admin/**/page.tsx         # C-11
app/api/stripe/webhook/route.ts       # C-12
services/product.service.ts           # C-13
lib/catalogue-filters.ts              # C-13
```

---

## Phase 1 — High Priority (Weeks 2–3)

| ID | Task | Priority | Effort |
|----|------|----------|--------|
| H-01 | Trust bar on homepage (Since 1969, Reg C1486, Marsa warehouse) | High | Easy |
| H-02 | Testimonials + client logos section | High | Moderate |
| H-03 | Complete Product JSON-LD (`image`, `description`, `offers`, `availability`) | High | Easy |
| H-04 | `buildPageMetadata()` on all marketing pages (OG, Twitter, canonical) | High | Moderate |
| H-05 | Fix homepage category slugs to match DB (`config/categories.ts` vs Supabase) | High | Moderate |
| H-06 | Product card quote/wishlist always visible on touch (not hover-only) | High | Easy |
| H-07 | Sticky mobile CTA bar (Quote / Call / WhatsApp) | High | Moderate |
| H-08 | Align homepage Services section with `/services` card design | High | Moderate |
| H-09 | Mega menu (Marine / Industrial / top categories) | High | Complex |
| H-10 | Phone number in header | High | Easy |
| H-11 | Related products on product detail page | High | Moderate |
| H-12 | Customer email confirmation on quote submit | High | Moderate |
| H-13 | Quote status tracking in customer account | High | Complex |
| H-14 | Security headers (CSP, HSTS, X-Frame-Options) in `next.config.ts` | High | Moderate |
| H-15 | Rate limiting on OTP, login, public inserts | High | Complex |
| H-16 | Customer password login lockout (mirror admin pattern) | High | Moderate |
| H-17 | Skip-to-content link in root layout | High | Easy |
| H-18 | Focus trap on quote drawer + image zoom modal | High | Moderate |
| H-19 | Fix subcategory filter showing raw UUIDs in dropdown | High | Easy |
| H-20 | Add `/search` to navigation | High | Easy |

---

## Phase 2 — Medium Priority (Weeks 4–6)

| ID | Task | Effort |
|----|------|--------|
| M-01 | Central SDS / datasheet library page | Moderate |
| M-02 | Brands directory (replace `/brands` redirect) | Moderate |
| M-03 | FAQ page | Moderate |
| M-04 | Industries served page | Moderate |
| M-05 | Company timeline component (reusable) | Moderate |
| M-06 | Newsletter signup in footer | Easy |
| M-07 | VAT number + registration in footer | Easy |
| M-08 | WhatsApp + LinkedIn in footer | Easy |
| M-09 | Sitemap: add `/about`, `/services`, `/search`, `/careers` | Easy |
| M-10 | Sitemap: real `lastModified` from product `updated_at` | Moderate |
| M-11 | Homepage `generateMetadata` + default OG image | Easy |
| M-12 | Confirm business hours with client → update LocalBusiness schema | Easy |
| M-13 | Breadcrumb JSON-LD on marine/industrial division pages | Easy |
| M-14 | Product compare (2–4 items) | Complex |
| M-15 | “Quote all filtered results” on catalogue | Moderate |
| M-16 | Account sidebar navigation (replace flat dashboard) | Moderate |
| M-17 | Register page with B2B value proposition | Moderate |
| M-18 | Stock decrement on order placement | Complex |
| M-19 | Order idempotency keys | Moderate |
| M-20 | Pickup slot booking DB unique constraint | Complex |
| M-21 | Replace OTP `listUsers(1000)` with indexed email/phone lookup | Complex |
| M-22 | Admin server-action integration tests | Complex |
| M-23 | Sentry / error monitoring | Moderate |
| M-24 | `.env.example` with all required vars documented | Easy |
| M-25 | React Hook Form on top 5 forms (contact, quote, careers, login, checkout) | Complex |

---

## Phase 3 — Future Enterprise (Months 2–6)

| ID | Feature |
|----|---------|
| E-01 | B2B company accounts with multi-user roles |
| E-02 | Contract / tier / volume pricing per customer |
| E-03 | PO number at checkout |
| E-04 | Net terms / credit limits |
| E-05 | Quote → order conversion with PDF export |
| E-06 | ERP / WMS integration (API layer) |
| E-07 | Dealer / distributor portal |
| E-08 | Punchout / cXML |
| E-09 | Live chat + CRM (Intercom / HubSpot) |
| E-10 | Blog / news / knowledge base |
| E-11 | Case studies + project gallery |
| E-12 | Multi-language (EN / MT) |
| E-13 | Real carrier tracking integration |
| E-14 | ISO / certification showcase |
| E-15 | Bulk CSV product import (admin) |
| E-16 | Inventory alerts + reservation |
| E-17 | Advanced analytics + CRO A/B testing |
| E-18 | PWA + offline catalogue |
| E-19 | AI-powered semantic search |
| E-20 | SSO / SAML for enterprise customers |

---

## Quick Wins Checklist (< 1 day each)

- [x] **C-01** Real logo in header and footer
- [x] **C-06** Custom 404 with quote CTA
- [x] **C-07** Align `NEXT_PUBLIC_SITE_URL` across sitemap, robots, schema
- [x] **C-09** Label or remove mock tracking
- [x] **H-01** Trust bar on homepage
- [x] **H-06** Touch-visible quote buttons on product cards
- [x] **H-10** Phone number in header
- [x] **H-17** Skip-to-content link
- [x] **H-19** Fix UUID labels in subcategory filter (now uses slugs)
- [x] **H-20** Add Search to navigation
- [ ] **M-06** Newsletter placeholder in footer
- [x] **M-07** VAT + registration in footer
- [x] **M-08** WhatsApp link in footer
- [x] **M-24** `.env.example`

---

## Sprint 2 — Completed items

- [x] **C-03** About page redesign (timeline, values, industries, stats, CTA)
- [x] **C-04** Contact enquiry form (Zod + Resend + staff notification)
- [x] **C-05** Privacy Policy, Terms of Service, Cookie Policy + consent banner
- [x] **C-02** Brand color unification on key marketing components (blue/gold)
- [x] **M-08** WhatsApp link in footer

**Goal:** Reach ~65/100 in one sprint (1–2 weeks).

1. C-01 Real logo
2. C-06 Custom 404/error pages
3. C-07 Canonical URL fix
4. C-09 Mock tracking fix
5. H-01 Trust bar
6. H-06 Touch-visible quote buttons
7. H-10 Phone in header
8. H-17 Skip-to-content
9. H-19 UUID filter fix
10. M-07 Footer trust details

Then immediately start **C-03 About redesign** and **C-04 Contact form** in Sprint 2.

---

## Sprint 3 — Completed items

- [x] **C-08** Global header search (compact `SearchBar` in header + mobile menu)
- [x] **C-11** Admin page-level `guardAdminPage()` on all admin routes
- [x] **H-02** Testimonials + industries served section on homepage
- [x] **H-03** Complete Product JSON-LD (image, description, offers, availability)
- [x] **H-04** `buildPageMetadata()` on remaining marketing pages
- [x] **H-05** Homepage categories loaded from Supabase (fallback to config)
- [x] **H-07** Sticky mobile CTA bar (Quote / Call / WhatsApp)
- [x] **H-08** Homepage Services aligned with `/services` card design
- [x] **H-11** Related products on product detail page
- [x] **H-12** Customer email confirmation on quote submit
- [x] **H-14** Security headers in `next.config.ts`
- [x] **M-06** Newsletter signup in footer
- [x] **M-24** `.env.example` documented

**Goal:** Reach ~70/100 — trust, SEO, security, and conversion fundamentals in place.

---

## Category Score Tracker

Use this table to re-score after each phase.

| Category | Audit Score | Target (Phase 1) | Current |
|----------|-------------|------------------|---------|
| Overall Design | 6.2 | 7.5 | — |
| Branding | 5.0 | 7.5 | — |
| About Page | 3.2 | 7.0 | — |
| Services | 8.1 | 8.5 | — |
| Products | 7.0 | 7.5 | — |
| Contact | 7.2 | 8.5 | — |
| SEO | 5.8 | 7.5 | — |
| Accessibility | 5.8 | 7.0 | — |
| Trust | 4.5 | 7.0 | — |
| Security | 4.8 | 6.5 | — |
| Performance | 5.5 | 6.5 | — |
| **Overall** | **58** | **70** | — |

---

## Converting to GitHub Issues

```bash
# Example: create Sprint 1 issues (run from repo root)
gh issue create --title "C-01: Replace JB placeholder with real logo" --label "critical,quick-win" --body "See ROADMAP.md C-01"
gh issue create --title "C-06: Custom branded 404 and error pages" --label "critical,quick-win" --body "See ROADMAP.md C-06"
gh issue create --title "C-07: Fix canonical URL mismatch" --label "critical,seo" --body "See ROADMAP.md C-07"
```

Suggested labels: `critical`, `high`, `medium`, `enterprise`, `quick-win`, `seo`, `security`, `cro`, `accessibility`, `performance`.

---

## Notes

- Product images and pricing were excluded from the audit scope.
- Admin portal was reviewed via codebase only (not publicly accessible).
- Services page (`/services`) is the design quality benchmark — other pages should converge to that standard.
- Confirm opening hours with client before updating `lib/structuredData.ts` LocalBusiness schema.

---

*Last updated: 12 July 2026 (Sprint 3)*
