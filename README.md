# JobBond — Full-Stack Worker & Job Connecting Platform

> **Tagline:** "Connecting Skills. Creating Opportunities."  
> **Brand Mission:** Connecting Indian households and businesses directly with skilled craftspeople and daily wage workers without middleman exploitation or commission deductions.

---

## 1. Executive Summary & Problem Solved

Across Indian towns and metro cities (Delhi NCR, Mumbai, Bengaluru, Lucknow, Jaipur, Pune, Patna, Hyderabad), informal skilled workers (electricians, plumbers, carpenters, painters, appliance technicians) and unorganized labourers face two major challenges:
1. **Aggregator Exploitation:** Large gig apps charge 20% to 35% commission cuts and impose arbitrary penalties.
2. **Customer Trust & Friction:** Customers struggle to find verified, punctual workers with transparent rates in their immediate colony or sector.

**JobBond** provides a transparent, dual-sided platform that respects worker dignity and customer security:
- **0% Platform Commission:** 100% of the agreed wage is settled directly between customer and worker.
- **Privacy by Design:** Phone numbers and private addresses remain masked until an enquiry or application is legitimately accepted.
- **Bilingual Interface:** Instant seamless switching between English and Hindi (**हिन्दी**).
- **Three-Tier Role Access Control:** Segregated workflows for Customers, Workers, and Platform Administrators.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js with Express & TypeScript (`server.ts` running full REST APIs with Vite middleware integration)
- **Database Architecture:** Normalized PostgreSQL Schema (`migrations/001_initial_schema.sql` and `migrations/002_seed_data.sql`), with an in-process persistent relational store (`server/db.ts`)
- **Validation:** Zod schema validation on all inputs
- **Security & Cryptography:** Node.js native `crypto.scryptSync` with unique cryptographic salts for password hashing, token-based session management, and HTTP-only cookie support
- **Testing:** Automated test suite with Node's native test runner (`tests/api.test.ts`)

---

## 3. Database Schema Design

The relational schema complies with 3NF (Third Normal Form) and includes proper foreign keys, constraints, and indexes:

| Table | Description | Primary Key / Constraints |
|---|---|---|
| `profiles` | User accounts, credentials, contact, role | `id` (UUID), `email` (UNIQUE), `role` CHECK ('customer', 'worker', 'admin') |
| `service_categories` | Dynamically managed service categories | `id` (UUID), `slug` (UNIQUE) |
| `worker_profiles` | Public worker portfolio, bio, rates, city, availability | `id` (UUID), `profile_id` (FK -> profiles, UNIQUE) |
| `worker_skills` | Association of worker to service categories | `id` (UUID), `(worker_profile_id, category_id, skill_name)` UNIQUE |
| `jobs` | Job postings created by customers | `id` (UUID), `customer_id` (FK -> profiles) |
| `job_applications` | Worker proposals on posted jobs | `id` (UUID), `(job_id, worker_id)` UNIQUE (Prevents duplicate proposals) |
| `service_enquiries` | Direct customer-to-worker inquiry requests | `id` (UUID), `customer_id` (FK), `worker_id` (FK) |
| `saved_workers` | Customer bookmarking shortlist | `id` (UUID), `(customer_id, worker_id)` UNIQUE |
| `audit_logs` | Administrative and moderation audit trail | `id` (UUID), `admin_id` (FK -> profiles) |
| `auth_sessions` | Active user sessions with expiration | `id` (UUID), `token` (UNIQUE) |

---

## 4. Pre-Configured Demo Accounts (1-Click Login)

The login and registration modal includes 1-click demo login buttons for testing every perspective:

| Role | Account Name | Email | Password | Access & Features |
|---|---|---|---|---|
| **Customer** | Rohan Mehra | `customer@jobbond.in` | `Password123!` | Post jobs, review applicants, save workers, send direct service enquiries |
| **Worker (Electrician)** | Rajesh Kumar | `rajesh.worker@jobbond.in` | `Password123!` | ITI Electrician profile, toggle availability, respond to enquiries, apply for jobs |
| **Worker (Plumber)** | Amit Patel | `amit.worker@jobbond.in` | `Password123!` | Mumbai plumber profile, manage daily/hourly rates, review received enquiries |
| **Administrator** | Pooja Sharma | `admin@jobbond.in` | `AdminPass123!` | System statistics, user suspension, category curation, job deletion with audit logs |

---

## 5. REST API Endpoints

### Authentication & Profiles
- `POST /api/auth/register` — Registers customer or worker with role enforcement (Users cannot self-assign `admin`).
- `POST /api/auth/login` — Authenticates email/password using scrypt hash verification.
- `GET /api/auth/me` — Fetches current authenticated session, profile, and worker skills.
- `POST /api/auth/logout` — Destroys session token.

### Workers Directory
- `GET /api/workers` — Search workers with keyword, city, category, experience, and availability filters.
- `GET /api/workers/:id` — Public profile details, ratings, and skills.
- `PATCH /api/workers/profile` — Worker-only update for bio, availability status (Available/Busy), rates, and visibility.

### Jobs & Applications
- `GET /api/jobs` — Browse open jobs with category, city, work type, and budget filters.
- `GET /api/jobs/:id` — Detailed job specification.
- `POST /api/jobs` — Customer or Admin creates a new job posting.
- `PATCH /api/jobs/:id` — Update job parameters.
- `DELETE /api/jobs/:id` — Delete/close job (authorized customer or admin).
- `POST /api/jobs/:id/applications` — Worker submits proposal with proposed rate and cover letter (Duplicate application prevented).
- `GET /api/my/applications` — Returns applications relevant to the authenticated user.
- `PATCH /api/applications/:id/status` — Customer updates applicant status (`shortlisted`, `accepted`, `rejected`).

### Service Enquiries
- `POST /api/enquiries` — Customer sends private service enquiry to worker.
- `GET /api/my/enquiries` — Returns user's received or sent enquiries.
- `PATCH /api/enquiries/:id/respond` — Worker accepts or declines enquiry with response note.

### Shortlist / Saved Workers
- `POST /api/saved-workers` — Customer bookmarks worker.
- `DELETE /api/saved-workers/:workerId` — Removes worker from customer's shortlist.
- `GET /api/saved-workers` — Lists shortlisted workers with 1-click contact.

### Admin Central
- `GET /api/admin/stats` — Platform metrics (users, active workers, open jobs, applications).
- `GET /api/admin/users` — List platform profiles with status.
- `PATCH /api/admin/users/:id/status` — Activate or suspend accounts.
- `POST /api/admin/categories` — Add new service category.
- `GET /api/admin/audit-logs` — Review audit trail.

---

## 6. How to Run Locally

### Start Dev Server (Vite + Express Backend)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated Tests
```bash
npm test
```

### Type Checking & Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

---

## 7. College Faculty & Hackathon Presentation Guide

1. **Homepage:** Demonstrate the hero search bar with Indian cities (New Delhi, Mumbai, Bengaluru, etc.) and category cards with worker counts.
2. **Language Switcher:** Toggle the **EN / हिंदी** button in the header; point out that all labels, instructions, categories, and notifications adapt dynamically.
3. **Customer Flow:**
   - Log in as **Demo Customer (Rohan)**.
   - Click "Find Workers", filter by Electrician in New Delhi, and click "Send Enquiry" to Rajesh Kumar.
   - Go to "Customer Dashboard" to post a new job or inspect applicants for existing jobs.
4. **Worker Flow:**
   - Log in as **Demo Worker (Rajesh Kumar)**.
   - Show the worker dashboard: toggle availability from "Available" to "Busy", review the newly received customer enquiry, and respond with "Accept".
   - View "Job Opportunities" and apply with a customized proposed rate.
5. **Duplicate Prevention & Privacy:** Demonstrate that submitting a duplicate application returns an HTTP 409 error, and phone numbers are only unlocked once an enquiry is accepted.
6. **Admin Flow:** Log in as **Demo Admin (Pooja)**, view platform statistics, inspect user accounts, toggle user suspension, and check the immutable security audit log.
