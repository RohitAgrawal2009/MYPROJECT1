# JobBond: Mobile-First Onboarding & User Experience Redesign

## 1. Executive Summary & Vision

**JobBond** is an Indian marketplace platform connecting everyday customers and employers with local skilled and unskilled workers (electricians, plumbers, carpenters, masons, painters, mechanics, and agricultural farm laborers).

This plan redesigns the user journey around an ultra-simple, mobile-first onboarding flow crafted for Indian users across diverse technical literacy levels—including rural workers, farmers, and urban households.

---

## 2. Core User Experience & Screen Flow

```
                      ┌─────────────────────────────────┐
                      │    Screen 1: Language Select     │
                      │   8 Indian Languages in Script   │
                      └────────────────┬────────────────┘
                                       │ (Persist language)
                                       ▼
                      ┌─────────────────────────────────┐
                      │    Screen 2: Mobile Number      │
                      │       +91 Indian Mobile + OTP   │
                      └────────────────┬────────────────┘
                                       │ (Verify OTP & Session)
                                       ▼
                      ┌─────────────────────────────────┐
                      │   Screen 3: User Type Select    │
                      │  "Need Worker" vs "Need Work"   │
                      └────────┬───────────────┬────────┘
                               │               │
            ┌──────────────────┘               └──────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│  Screen 4A: Customer Profile  │               │  Screen 4B: Worker Profile    │
│  Name, City/Village, Contact  │               │  Name, Village, Trade, Rate   │
└───────────────┬───────────────┘               └───────────────┬───────────────┘
                │                                               │
                ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│    Screen 5: Customer Home    │               │    Screen 6: Worker Home      │
│  8 Category Cards, Search,    │               │  Availability Toggle, Nearby  │
│  Post Job, Enquiries, Agri    │               │  Jobs, Daily Wages, Agri Jobs │
└───────────────────────────────┘               └───────────────────────────────┘
                ▲                                               ▲
                └───────────────────────┬───────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │   Mobile Bottom Navigation  │
                         │   Role-Tailored Quick Tabs  │
                         └─────────────────────────────┘
```

---

## 3. Screen-by-Screen Specifications

### Screen 1: Language Selection (First-Open Gate)
- **Gate Behavior**: Shown immediately on first visit before any homepage or dashboard.
- **Languages (Native Scripts & Romanized)**:
  1. English
  2. हिन्दी (Hindi)
  3. ਪੰਜਾਬੀ (Punjabi)
  4. বাংলা (Bengali)
  5. मराठी (Marathi)
  6. தமிழ் (Tamil)
  7. తెలుగు (Telugu)
  8. ગુજરાતી (Gujarati)
- **Visual Design**: Large, tap-friendly cards (minimum 56px touch height), high-contrast border, prominent green checkmark on active choice.
- **Controls**: Large "Continue / आगे बढ़ें" button anchored at bottom.
- **Persistence**: Saved to `localStorage('jobbond_lang')` and profile; returning users skip this screen directly to login/dashboard. Settings dropdown in the header allows changing language at any time.

### Screen 2: Mobile Number & OTP Verification
- **Header**: "Welcome to JobBond / जॉबबॉन्ड में आपका स्वागत है"
- **Subheader**: "Continue with your mobile number / अपने मोबाइल नंबर से आगे बढ़ें"
- **Inputs**:
  - Country code dropdown (+91 India default with flag indicator).
  - 10-digit Indian phone number input with instant format validation (`^[6-9]\d{9}$`).
- **OTP Verification**:
  - 6-digit OTP input boxes with auto-focus advance.
  - 60-second cooldown timer for "Resend OTP / पुनः OTP भेजें".
  - "Change Number / नंबर बदलें" link to correct typos without reloading.
- **SMS Integration & Provider Transparency**:
  - Production architecture hooks into SMS gateways (Fast2SMS, MSG91, Twilio, or Supabase Phone Auth).
  - The API clearly surfaces SMS delivery status and provider requirements (`FAST2SMS_API_KEY` / `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`).
  - In development/sandbox mode, the system provides an on-screen preview test banner displaying the generated OTP code so evaluation and testing proceed without incurring carrier SMS charges or requiring unconfigured credentials.

### Screen 3: User Type Selection
- **Header**: "What would you like to do on JobBond? / आप जॉबबॉन्ड पर क्या करना चाहते हैं?"
- **Options**:
  1. **I Need a Worker / मुझे काम करवाना है**:
     - Visual: Illustration/icon of home repairs, farm tools, construction.
     - Role: `customer`.
     - Directs to Customer Profile Setup or Customer Home.
  2. **I Need Work / मुझे काम चाहिए**:
     - Visual: Illustration/icon of skilled craftsman, toolkit, agricultural worker.
     - Role: `worker`.
     - Directs to Worker Profile Setup or Worker Home.
- **Smart Routing**: Existing users who already completed onboarding bypass this screen directly to their designated dashboard.

### Screen 4: Simple Stepped Profile Setup
- **For Customers**:
  - Full Name (required).
  - City / Village / District (dropdown + auto-suggest for Indian cities/states).
  - Preferred contact language.
- **For Workers**:
  - Full Name (required).
  - City / Village / Tehsil.
  - Primary Trade/Skill: Multi-select pills (Electrician, Plumber, Carpenter, Agricultural Worker / Farm Labor, Mason, Painter, Cleaner, Driver, Mechanic).
  - Experience level: Quick select (<1 yr, 1-3 yrs, 3-5 yrs, 5+ yrs).
  - Daily wage expectation (₹/day, e.g. ₹500, ₹800, ₹1200).
  - Current Availability: "Available for Work Today" toggle (Green / Gray).

### Screen 5: Customer Home Redesign
- **Top Bar**: JobBond logo, Location pill (e.g., "Ludhiana, Punjab"), Language selector, Notification bell.
- **Hero Prompt**: "What service do you need today? / आज आपको कौन सी सेवा चाहिए?"
- **Search Bar**: Search by skill, worker name, or service area.
- **8 Core Category Grid**:
  - Electrician (बिजली मिस्त्री)
  - Plumber (नलसाज़ / प्लंबर)
  - Carpenter (बढ़ई / कारपेंटर)
  - Agricultural & Farm Worker (कृषि व खेत मजदूर)
  - Mason / Rajmistri (राजमिस्त्री)
  - Painter (पेंटर)
  - Cleaning & Sanitation (सफाई कर्मचारी)
  - Mechanic & Repair (मैकेनिक)
- **Quick Action**: "Post a Work Request" card with daily rate vs fixed price options.
- **Active Enquiries & Worker Direct Call**: Instant dial/WhatsApp button for verified local workers.

### Screen 6: Worker Home Redesign
- **Worker Status Banner**:
  - Large toggle switch: **"I Am Available for Work Today"** (🟢 काम के लिए उपलब्ध हूँ / ⚪ अनुपलब्ध).
  - Updates worker's public status in the directory in real-time.
- **Daily Earnings & Applications Summary**:
  - Active applications, new customer enquiries, today's confirmed jobs.
- **Nearby Job Feed**:
  - Filter tabs: "All", "Agricultural / Farm Work", "Daily Wage (दिहाड़ी)", "Part-Time", "Full-Time".
  - Job card with clear daily wage badge (e.g., "₹800/day"), location distance (e.g., "3 km away"), and one-tap "Apply for Work / काम के लिए आवेदन करें".

### Mobile Bottom Navigation
- **Customer Navigation**:
  - 🏠 Home
  - 🔍 Find Workers
  - 📋 My Requests / Enquiries
  - 👤 Profile & Settings
- **Worker Navigation**:
  - 💼 Available Jobs
  - 📨 My Applications
  - ⚡ My Availability & Rates
  - 👤 Profile & Settings

---

## 4. Technical Architecture & Data Flow

### Backend Architecture (`server.ts` & `server/db.ts`)
- **Database Schema Extensions**:
  - `otp_sessions` table/store:
    ```typescript
    interface OtpSession {
      id: string;
      phone: string;
      code: string;
      expires_at: number;
      attempts: number;
      verified: boolean;
      created_at: number;
    }
    ```
- **New API Endpoints**:
  1. `POST /api/auth/otp/send`:
     - Validates 10-digit Indian phone number.
     - Rate-limits requests (max 1 per 60 seconds per phone).
     - Generates 6-digit cryptographic OTP.
     - If SMS credentials (`FAST2SMS_API_KEY` / `TWILIO_*`) exist, transmits real SMS; otherwise logs to audit and provides development response with test code for immediate testing.
  2. `POST /api/auth/otp/verify`:
     - Validates code within 10-minute expiry window.
     - Finds existing profile with matching phone or initializes a new profile stub.
     - Issues authenticated session cookie and bearer token.
     - Returns `{ user, token, isNewUser, role }`.
  3. `POST /api/auth/onboarding/role`:
     - Updates user role (`customer` or `worker`).
  4. `POST /api/auth/onboarding/profile`:
     - Saves stepped profile details (name, city, village, trade skills, daily rate).
     - Marks `onboarding_completed: true`.

### Frontend Architecture
- **State Management**:
  - `LanguageContext`: 8 languages with full dictionary coverage for onboarding, error states, and dashboard labels.
  - `AuthContext`: Extended to support `sendOtp`, `verifyOtp`, `updateRole`, `completeOnboarding`, along with existing password/quick-login options for backwards compatibility.
- **Component Breakdown**:
  - `src/components/onboarding/LanguageSelectScreen.tsx`
  - `src/components/onboarding/MobileLoginScreen.tsx`
  - `src/components/onboarding/UserTypeScreen.tsx`
  - `src/components/onboarding/ProfileSetupScreen.tsx`
  - `src/components/dashboard/CustomerHomeView.tsx`
  - `src/components/dashboard/WorkerHomeView.tsx`
  - `src/components/common/BottomNav.tsx`

---

## 5. Preservation & Backwards Compatibility
- **Existing Tests**: All 8 tests in `tests/api.test.ts` will continue to pass.
- **Existing Routes**: Admin dashboard (`/admin`), Find Workers (`/find-workers`), Find Jobs (`/find-jobs`), Agriculture (`/agriculture`), and contact pages remain accessible.
- **Seeded Profiles**: Quick-login and existing test accounts (`admin@jobbond.in`, `customer@jobbond.in`, `worker.elec@jobbond.in`) remain functional.

---

## 6. Implementation Phases

1. **Phase 1: Backend OTP & Profile Onboarding API**
   - Add OTP session store, verification logic, rate limiter, and endpoints in `server.ts` and `server/db.ts`.
   - Add automated test assertions in `tests/api.test.ts` for OTP issuance, verification, and expiry.

2. **Phase 2: Multilingual Dictionary Enhancements**
   - Complete dictionary keys for all 8 languages across onboarding screens, categories, and labels.

3. **Phase 3: Screens 1 to 4 (Onboarding Flow)**
   - Build `LanguageSelectScreen`, `MobileLoginScreen`, `UserTypeScreen`, and `ProfileSetupScreen`.
   - Wire onboarding state into `src/App.tsx`.

4. **Phase 4: Screens 5 & 6 (Customer & Worker Home) + Bottom Nav**
   - Build dedicated mobile-first `CustomerHomeView` and `WorkerHomeView`.
   - Implement role-specific sticky `BottomNav` for mobile viewports.

5. **Phase 5: Verification & Testing**
   - Run `npm test` and `compile_applet`.
   - Verify flow in all 8 languages and both Light/Dark/System themes.
