# RentSpace — Premium Living. Smarter Renting.

> **Production Real-Estate Platform**  
> **Enterprise Architecture**: Node.js, Express, MongoDB Atlas, React, TypeScript, Tailwind CSS, Vite, and Cloudinary / Local Multi-Photo Storage.

---

## 🏢 Overview

**RentSpace** is a full-stack rental property discovery and management platform designed specifically for students, young working professionals, and property owners in Indian metropolitan hubs (Bengaluru, Gurugram, Pune, Hyderabad, Mumbai).

The platform bridges the gap between tenants looking for verified PG accommodations, shared suites, private rooms, and studio apartments, and property owners seeking direct, zero-brokerage tenants.

---

## ✨ Key Features

1. **Role-Based Authentication & Authorization**
   - Tenant, Property Owner, and Administrator roles with protected routes and signed Bearer token sessions.
   - Secure password hashing using `bcryptjs` with salt rounds.
   - Public registration strictly restricted to Tenant and Owner roles; Admin accounts are safeguarded through controlled server-side provisioning.

2. **Secure Guest Browsing System & Field Sanitization**
   - Unauthenticated visitors can freely browse the homepage, explore properties, view photos, rent in INR, category, and approximate locality.
   - **Server-Side Field Masking**: Protected via `serializePropertyForPublic()`; private street addresses, landlord phone numbers, emails, tenant inquiries, and moderation notes are strictly withheld on the server from unauthenticated requests.
   - Restricted sections on detail pages are marked with a lock badge (*"Sign in to view full details and contact the owner"*).
   - Instant sign-in via `AuthModal` preserves the visitor's return path.

3. **Smart Property Exploration & Search**
   - Multi-category filtering: PG Accommodation, Studio Apartments, Luxury Flats, Shared Rooms, and Private Rooms (all 5 categories).
   - Real-time search by locality, city, rent range (min/max), furnishing status, and amenities.
   - Dynamic sorting (Newest, Lowest Rent, Highest Rent, Highest Rated).

3. **Digital Move-in Enquiry Workflow**
   - Direct tenant-to-owner enquiry dispatch with move-in dates, stay duration, and phone contacts.
   - Owner pipeline with real-time status updates: `New` ➔ `Contacted` ➔ `In Progress` ➔ `Closed`.
   - Bidirectional status tracking and owner notes visible in the Tenant Dashboard.

4. **Owner Management Console**
   - Add new listings with comprehensive specifications, room occupancy, deposit, and photo attachments.
   - In-place property editing, availability toggling (Available, Rented, Maintenance), and listing deletion.
   - Moderation status indicators (Approved, Under Review, Changes Requested).

5. **Administrative Moderation & Trust Desk**
   - Comprehensive system metrics: Total Users, Tenants, Owners, Listings, Pending Reviews, Flagged Reports.
   - Property moderation queue with Approve, Reject, Grant "Verified" Badge, and "Feature on Homepage" toggles.
   - User account management with suspend/reactivate toggles.
   - Flagged listing report review and resolution.

6. **Dual-Engine Storage Architecture**
   - **Production Mode**: Full Mongoose models (`User`, `Property`, `Enquiry`, `Review`, `SavedProperty`, `Report`) connected via `MONGODB_URI`.
   - **Preview / Development Mode**: Resilient, high-fidelity in-memory dual-engine store initialized with verified Indian metropolitan property data, enabling immediate interactive testing even before an external database cluster is linked.

---

## 📁 Repository Structure

```
├── server.ts                   # Main Express server entry point mounting Vite middlewares
├── server/
│   ├── db/
│   │   └── connection.ts       # Mongoose MongoDB connection initializer & fallback binder
│   ├── models/
│   │   ├── User.ts             # Mongoose User schema & model
│   │   ├── Property.ts         # Mongoose Property schema, indexes & model
│   │   ├── Enquiry.ts          # Mongoose Enquiry schema & model
│   │   └── Extras.ts           # Review, SavedProperty, and Report models
│   ├── middleware/
│   │   └── auth.ts             # Token verification and role authorization middleware
│   ├── routes/
│   │   └── api.ts              # RESTful API endpoints (/api/auth, /api/properties, etc.)
│   ├── store.ts                # Dual-engine state store with bcrypt hashing and validation
│   ├── seed.ts                 # Database seed script for MongoDB
│   └── createAdmin.ts          # Server-side controlled admin account provisioning CLI
├── src/                        # React Frontend (Vite)
│   ├── assets/images/          # High-resolution architectural photography assets
│   ├── components/
│   │   ├── Navbar.tsx          # Top Bar Contract with 3 zones, role switcher & mobile drawer
│   │   ├── PropertyCard.tsx    # Property card with zero-pill typography & favorite toggle
│   │   └── Footer.tsx          # Comprehensive footer with project specifications
│   ├── context/
│   │   └── AuthContext.tsx     # Context API for auth state, tokens & quick demo switchers
│   ├── pages/
│   │   ├── HomePage.tsx        # Hero with search panel, categories, featured properties, CTA
│   │   ├── ExplorePage.tsx     # Filter sidebar, search, responsive drawer, results grid
│   │   ├── PropertyDetailPage.tsx # Image gallery, specs, sticky enquiry form, reviews, reports
│   │   ├── AuthPage.tsx        # Login/Register with Tenant/Owner selection & demo logins
│   │   ├── TenantDashboard.tsx # Tenant inquiries, shortlist, and profile settings
│   │   ├── OwnerDashboard.tsx  # Owner listings, enquiry status management, edit modals
│   │   ├── AddPropertyPage.tsx # Property listing form with amenity & photo selection
│   │   ├── SavedPropertiesPage.tsx # Shortlisted properties grid
│   │   └── AdminDashboard.tsx  # Moderation queue, reports, user suspension, diagnostics
│   ├── services/
│   │   └── api.ts              # Typed API client with Bearer auth headers
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces and domain models
│   ├── App.tsx                 # Route declarations & global toasts
│   └── main.tsx                # React DOM root
├── .env.example                # Template for environment configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional for local standalone database; in preview mode, in-memory store runs automatically)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd rentspace

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```ini
PORT=3000
APP_URL="http://localhost:3000"
MONGODB_URI="mongodb://localhost:27017/rentspace"
JWT_SECRET="rentspace_super_secret_jwt_key_college_project_2026"
NODE_ENV="development"
```

### 4. Running the Application
To start the full-stack server (Express backend + Vite frontend):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seeding the Database (When MongoDB is running)
```bash
npm run seed
```

### 6. Creating an Administrator Account
```bash
npm run create-admin admin@rentspace.com Password@123 "MCA Administrator"
```

---

## 🔑 Pre-Configured Demo Accounts for Testing

Use the **Quick Role Test** buttons in the top navigation strip, or log in with these credentials:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@rentspace.com` | `Password@123` | Search, save properties, submit move-in enquiries, write reviews, manage tenant profile |
| **Owner** | `owner@rentspace.com` | `Password@123` | List new properties, edit listings, manage enquiry statuses (`New` ➔ `Contacted` ➔ `In Progress`) |
| **Admin** | `admin@rentspace.com` | `Password@123` | Moderate listings (approve/reject/feature), inspect reported listings, suspend users, reset demo data |

---

## 🛠️ REST API Specification

### Authentication
- `POST /api/auth/register` — Register a new Tenant or Owner.
- `POST /api/auth/login` — Authenticate and receive a signed Bearer token.
- `GET /api/auth/me` — Retrieve currently logged-in user profile.
- `PUT /api/auth/profile` — Update account profile details.

### Properties
- `GET /api/properties` — Discover properties with multi-parameter filtering & sorting.
- `GET /api/properties/:id` — Retrieve detailed property information, owner info, and reviews.
- `POST /api/properties` — Create a new property listing (Owner role required; enters moderation queue).
- `PUT /api/properties/:id` — Update property listing (Ownership verified).
- `DELETE /api/properties/:id` — Delete property listing (Ownership verified).
- `GET /api/owner/properties` — Retrieve listings owned by authenticated owner.

### Enquiries
- `POST /api/enquiries` — Submit a move-in enquiry for a listing.
- `GET /api/tenant/enquiries` — Fetch enquiries submitted by current tenant.
- `GET /api/owner/enquiries` — Fetch enquiries received for owner's properties.
- `PATCH /api/enquiries/:id/status` — Update enquiry status & landlord feedback note.

### Saved Properties & Reviews
- `GET /api/saved` — Retrieve bookmarked properties.
- `POST /api/saved/:id` — Toggle bookmark on a property.
- `GET /api/properties/:id/reviews` — Fetch verified reviews.
- `POST /api/properties/:id/reviews` — Submit a tenant review & star rating.
- `POST /api/properties/:id/report` — Report a listing for admin review.

### Administration
- `GET /api/admin/stats` — High-level platform KPIs.
- `GET /api/admin/properties` — Retrieve all listings including pending moderation items.
- `PATCH /api/admin/properties/:id/moderate` — Approve or reject listing with feedback.
- `GET /api/admin/users` — List registered users.
- `PATCH /api/admin/users/:id/status` — Suspend or reactivate user account.
- `GET /api/admin/reports` — Inspect reported violations.
- `POST /api/admin/reset-demo-data` — Reset database to initial seed data.

---

## 🎓 Academic Project Notes

Developed by **Cloud RentSpace Team** as an MCA College Project.  
Adheres to software engineering best practices including separation of concerns, MVC structure, RESTful API design, defensive input validation, WCAG AA accessibility, and responsive typography.
