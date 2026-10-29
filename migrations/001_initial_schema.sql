-- ==========================================================
-- JOBBOND POSTGRESQL DATABASE SCHEMA
-- Connecting Skills. Creating Opportunities.
-- ==========================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
    preferred_lang VARCHAR(5) DEFAULT 'en' CHECK (preferred_lang IN ('en', 'hi')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for authentication & role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Service Categories Table (Managed dynamically via Admin)
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'Wrench',
    description TEXT,
    description_hi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON service_categories(slug);

-- 3. Worker Profiles Table
CREATE TABLE IF NOT EXISTS worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    bio_hi TEXT,
    experience_years INT DEFAULT 1,
    city VARCHAR(100) NOT NULL,
    service_area VARCHAR(150) NOT NULL,
    hourly_rate NUMERIC(10, 2),
    daily_rate NUMERIC(10, 2),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    completed_jobs INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_worker_profile_id UNIQUE(profile_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_city ON worker_profiles(city);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_availability ON worker_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_public ON worker_profiles(is_public);

-- 4. Worker Skills & Category Association
CREATE TABLE IF NOT EXISTS worker_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_worker_skill UNIQUE(worker_profile_id, category_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_worker_skills_category ON worker_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_name ON worker_skills(skill_name);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    service_area VARCHAR(150) NOT NULL,
    budget_min NUMERIC(10, 2),
    budget_max NUMERIC(10, 2),
    pay_type VARCHAR(20) DEFAULT 'fixed' CHECK (pay_type IN ('fixed', 'hourly', 'daily')),
    work_type VARCHAR(20) DEFAULT 'one_time' CHECK (work_type IN ('one_time', 'daily', 'part_time', 'full_time')),
    preferred_date VARCHAR(50),
    contact_preference VARCHAR(30) DEFAULT 'in_app' CHECK (contact_preference IN ('in_app', 'phone', 'either')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);

-- 6. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cover_message TEXT,
    proposed_rate NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_worker_application UNIQUE (job_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_job_app_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_app_worker ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_app_status ON job_applications(status);

-- 7. Service Enquiries Table
CREATE TABLE IF NOT EXISTS service_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    preferred_schedule VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'declined')),
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_customer ON service_enquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_worker ON service_enquiries(worker_id);

-- 8. Saved Workers (Shortlist) Table
CREATE TABLE IF NOT EXISTS saved_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_saved_worker UNIQUE (customer_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_workers_customer ON saved_workers(customer_id);

-- 9. Audit Logs Table (Admin Moderation & Security)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
