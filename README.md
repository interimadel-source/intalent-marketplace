# Intalent — Full-Stack Algerian Freelance & Enterprise Marketplace

**Intalent** is a full-stack freelance and enterprise services marketplace designed for the Algerian market (58 Wilayas, `DZD` pricing, trilingual `EN / FR / AR (RTL)` support, and official Intalent deep purple `#25083F` / vibrant violet `#8B43F5` brand identity).

---

## 1. Architecture & Runtime Requirements

- **Runtime:** Python `3.11+` (tested on `Python 3.15.1` with built-in `sqlite3 3.53.4` and `ThreadingHTTPServer`). Zero external package installations required to boot and run locally.
- **Database:** Normalized persistent SQLite relational database (`intalent.db`) with 24+ tables, foreign key integrity, and audit logging.
- **Frontend:** Responsive Desktop-First Single-Page Application (`public/index.html`, `public/styles.css`, `public/i18n.js`, `public/app.js`, `public/pages-public.js`, `public/pages-marketplace.js`, `public/pages-dashboards.js`).
- **Official Brand Assets:** Stored in `public/assets/logos/` (`logo-dark.png`, `logo-white-purple.png`, `logo-white-black.png`).

---

## 2. Quick Start & Local Development Commands

### Initialize & Seed the Database
```powershell
cd C:\Users\adel\.gemini\antigravity\scratch\intalent
python seed.py
```

### Start the Full-Stack Application Server
```powershell
cd C:\Users\adel\.gemini\antigravity\scratch\intalent
python server.py
```
Then open **http://127.0.0.1:8000** in your browser.

### Run Automated End-to-End Tests (Journeys A–F)
```powershell
cd C:\Users\adel\.gemini\antigravity\scratch\intalent
python tests_e2e.py
```

---

## 3. Pre-Seeded Accounts for Testing

| Role | Email | Password | Highlights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@intalent.dz` | `AdminPassword123!` | Full RBAC admin dashboard, category/skill management, Pro review, audit logs |
| **Pro Freelancer** | `amine@intalent.dz` | `Password123!` | Verified Pro Full-Stack Architect, active services, wallet balance, orders |
| **Pro Designer** | `yasmine@intalent.dz` | `Password123!` | Verified Pro Brand & UI/UX Designer in Oran |
| **Client** | `client@intalent.dz` | `Password123!` | Active & completed orders, saved favorites, project requests |
| **Business** | `business@intalent.dz` | `Password123!` | Atlas Tech SPA corporate profile, team members, enterprise briefs |

*(You can also use the one-click QA autofill buttons on the `#login` page or register any new account.)*

---

## 4. External Credentials & Integrations Required for Production

1. **SATIM CIB / Edahabia Live E-Payment Gateway:**
   - Currently runs in a clearly labeled **SATIM CIB / Edahabia Sandbox** (`payment_sandbox_mode=true`) with integer DZD calculations, server-side commission deduction, and simulated failure testing.
   - To process live Algerian Dinar cards, obtain merchant certification from **SATIM** and set `SATIM_MERCHANT_USERNAME`, `SATIM_MERCHANT_PASSWORD`, and `SATIM_TERMINAL_ID` in `.env`.
2. **Google & Facebook OAuth 2.0:**
   - Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, and `FACEBOOK_APP_SECRET` in `.env`. When unconfigured, clicking the social login buttons displays an honest configuration modal rather than faking OAuth login.
3. **Transactional Email (SMTP):**
   - Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` in `.env` for live email delivery on password resets and order alerts.
