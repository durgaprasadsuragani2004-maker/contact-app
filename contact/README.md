# QRLync - QR-Based Digital Contact & Company Profile Management System

> A full-stack, enterprise-grade digital identity and company profile platform built with **React.js (Frontend), Node.js + Express.js (Backend), and MongoDB Atlas**. Allows individuals and organizations to manage complete digital profiles, generate unique dynamic QR codes, showcase multiple company representatives with individual vCard downloads, display business operating hours, services/products catalogs, and provide interactive location navigation with **1-tap Get Directions**.

---

## 🌟 Key Capabilities & Advanced Features

- 👤 **Dual Identity Modes**: Full support for **Individual / Person** and **Company / Organization** accounts with dedicated schemas and workflows.
- 👥 **Multiple Company Contact Persons**:
  - Add multiple representatives (Executives, Tech Leads, Sales, HR) with designations, departments, direct phone/email, and notes.
  - **Individual Representative vCards**: Visitors can download an individual standard `.vcf` contact file for any specific company representative in 1 tap (`/api/contact/:token/person/:contactId`).
- 📍 **Interactive Location & 1-Tap "Get Directions"**:
  - Structured address lines, city, state, country, pincode, landmark, and GPS coordinates (`latitude` / `longitude`).
  - Prominent **[ 📍 Get Directions ]** button navigating with exact coordinates or formatted address.
- 🔗 **Dynamic Social & Professional Links (`social_links`)**:
  - Add, edit, delete, and reorder links for **LinkedIn, GitHub, X / Twitter, WhatsApp, Telegram, YouTube, Instagram, Facebook, Website, Portfolio, and Custom URLs**.
- 🛠️ **Services & Products Catalog (`services`)**:
  - Display company offerings with titles, descriptions, and "Learn More" external links.
- 🏢 **"Know More About Us" Company Overview**:
  - Corporate overview, mission statement, vision, founded year, employee headcount, and regions served.
- ⏰ **Weekly Business Operating Hours (`business_hours`)**:
  - Operating schedule editor with Open/Closed toggles, time pickers, and quick presets.
- 📥 **RFC 6350 Compliant vCard 3.0 / 4.0 Export**:
  - Maps names, organizations, roles, cell/work phones, emails, URLs, structured addresses, GPS coordinates (`GEO:lat;lng`), notes, and embedded photos. Works natively on **iOS, Android, Outlook, macOS, and Windows**.
- 🔄 **Stable Dynamic QR Token Routing**:
  - QR codes encode stable public URLs (`/profile/:token`). Any changes to company representatives, services, hours, or contact numbers update the public view in real time without invalidating existing printed QR codes.
- 📱 **Interactive Smartphone Chassis Simulation**:
  - Realtime preview on the dashboard and profile editor reflecting live edits instantaneously.
- 🖨️ **Printable Badges & Business Cards**: High-definition print-ready templates for physical 3.5" x 2" business cards and conference table standees.

---

## 🏗️ Architecture & Technology Stack

| Layer | Directory | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `/frontend` | React 18, Vite, React Router 6 | Component-driven SPA with real-time state synchronization |
| **Styling** | `/frontend/src/index.css` | Modern Vanilla CSS & Design Tokens | Glassmorphism, Google Fonts (`Outfit`, `Plus Jakarta Sans`), responsive grid |
| **Icons** | `/frontend` | Lucide React | Clean, scalable interface icons |
| **Backend** | `/backend` | Node.js, Express.js | RESTful API architecture with CORS, static upload server, and error handling |
| **Database** | `/backend/database`, MongoDB Atlas | MongoDB + Mongoose | Cloud-native document database with schemas and relationships |
| **QR Engine** | `/backend/services`, `/frontend` | `qrcode` & `qrcode.react` | High error correction (Level H) QR generation in PNG and SVG |
| **Contact Engine** | `/backend/services` | Custom RFC vCard 3.0/4.0 Builder | Generates `.vcf` binary payloads with MIME headers & embedded photos |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+ / v24+)
- npm (v9+)

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd contact
   ```

2. Install dependencies for root, backend, and frontend:
   ```bash
   # Install all workspace dependencies
   npm run install:all
   ```

### Running Locally

Start both the backend server (port 5000) and frontend client (port 5173) simultaneously:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

Individual commands:
- **Backend only**: `npm run backend:dev`
- **Frontend only**: `npm run frontend:dev`
- **Seed database**: `npm run seed`
- **Build frontend**: `npm run frontend:build`

---

## ⚡ Pre-seeded Demo Accounts

The application automatically seeds realistic demo data on startup:

| Account Type | Email | Password | Unique QR Token | Live Public Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Individual Profile** | `rahul@example.com` | `Password123!` | `rahul-demo-2026` | `http://localhost:5173/profile/rahul-demo-2026` |
| **Company Profile** | `contact@apexcloud.com` | `Password123!` | `apex-corp-2026` | `http://localhost:5173/profile/apex-corp-2026` |

*You can also click the **1-Click Demo Login** buttons on the Sign In page for instant testing.*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create new individual or company account & generate unique QR code
- `POST /api/auth/login` - Authenticate with email/password and obtain JWT
- `GET  /api/auth/me` - Retrieve current session and profile data
- `POST /api/auth/update-password` - Securely change account password

### Profile Management (Protected)
- `GET  /api/profile` - Fetch authenticated user's profile bundled with `social_links`, `company_contacts`, `services`, and `business_hours`
- `PUT  /api/profile` - Atomically update profile fields and sync relational tables
- `POST /api/profile/upload` - Upload profile picture / company logo (Multer 5MB limit)
- `POST /api/profile/regenerate-qr` - Regenerate unique profile QR token

### Public Profile & Contact Export (Public)
- `GET  /api/public/profile/:token` - Retrieve complete public profile data bundle (increments scan count)
- `GET  /api/contact/:token` - Download main profile vCard (`.vcf`)
- `GET  /api/contact/:token/person/:contactId` - Download individual representative vCard (`.vcf`)

---

## 📇 vCard Field Mapping Matrix

| Profile Field | vCard 3.0 Specification | Description |
| :--- | :--- | :--- |
| Full Name / Company Name | `FN:` | Formatted Display Name |
| First / Last Name | `N:LastName;FirstName;;;` | Structured Name Parts |
| Organization | `ORG:Company Name;Department` | Corporate entity & division |
| Job Title | `TITLE:` | Official Designation |
| Department | `ROLE:` | Functional Role |
| Phone Number | `TEL;TYPE=CELL,VOICE:` | Primary Mobile Contact |
| Alternate Phone | `TEL;TYPE=WORK,VOICE:` | Office / Secondary Line |
| Email | `EMAIL;TYPE=INTERNET,WORK:` | Official Email |
| Website / LinkedIn / GitHub | `URL;TYPE=WORK:` / `URL;TYPE=LinkedIn:` | External Web Presence |
| GPS Coordinates | `GEO:latitude;longitude` | Exact Geographical Coordinates |
| Physical Address | `ADR;TYPE=WORK:;;Street;City;State;Postal;Country` | Structured Geographical Address |
| Bio / Notes / GST / Mission | `NOTE:` | Bio, mission statement, GST/Tax IDs |
| Avatar / Logo | `PHOTO;ENCODING=b;TYPE=JPEG:` | Base64-embedded image |

---

## 📂 Project Structure

```text
contact/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Toast, Modal, LoadingSpinner
│   │   │   ├── dashboard/      # ProfileCompletion, QRCodeCard, PhoneMockupPreview
│   │   │   ├── profile/        # IndividualForm, CompanyForm, ImageUploader, SocialLinksManager,
│   │   │   │                   # CompanyContactsManager, ServicesManager, BusinessHoursManager
│   │   │   └── public/         # PublicCard, AddContactButton, SocialLinksGrid
│   │   ├── context/            # AuthContext (state, JWT, toasts)
│   │   ├── pages/              # Home, Login, Register, Dashboard, Edit, Public, Print, Settings
│   │   ├── services/           # API fetch wrapper
│   │   ├── utils/              # vCard client helpers & formatters
│   │   ├── App.jsx             # React Router setup
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Modern design system stylesheet
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── controllers/            # authController, profileController, publicController
│   ├── database/               # mongo.js (MongoDB connection), seed.js (demo accounts)
│   ├── middleware/             # auth.js (JWT), upload.js (Multer)
│   ├── routes/                 # authRoutes, profileRoutes, publicRoutes
│   ├── services/               # qrService, vcardService
│   ├── uploads/                # User uploaded images & logos
│   ├── server.js               # Express application entry point
│   └── package.json
│
├── data/                       # Local data folder retained for uploads and local assets
├── test_integration.js         # Automated end-to-end integration test suite
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 🧪 Testing & Verification

Run the automated integration test suite:
```bash
node test_integration.js
```
Expected output:
```text
🧪 Running Complete End-to-End Advanced API & Integration Verification...

  ✅ PASS: GET /api/health returns 200 OK
  ✅ PASS: GET /api/public/profile/rahul-demo-2026 returns profile with social links and GPS coordinates
  ✅ PASS: GET /api/contact/rahul-demo-2026 returns RFC vCard with GEO coordinates
  ✅ PASS: GET /api/public/profile/apex-corp-2026 bundles multi-contacts, services, and business hours
  ✅ PASS: GET /api/contact/apex-corp-2026 returns company vCard with headquarters location
  ✅ PASS: Found CTO contact person in company
  ✅ PASS: GET /api/contact/:token/person/:id generates tailored vCard for individual company representative
  ✅ PASS: POST /api/auth/login authenticates company account
  ✅ PASS: GET /api/profile returns full authenticated profile with relations
  ✅ PASS: PUT /api/profile atomically updates core fields and relational services table
  ✅ PASS: Live QR stability: Public card immediately reflects newly added service and name under existing QR token
  ✅ PASS: POST /api/auth/register creates new Company profile & QR token
  ✅ PASS: Public profile retrieval for dynamically registered company

📊 Verification Summary: 13 Passed, 0 Failed
```

---

## 🛡️ License & Credits

Engineered with ❤️ for professional networking and digital contact management.
Released under the MIT License.
