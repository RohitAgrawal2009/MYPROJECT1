export type UserRole = 'customer' | 'worker' | 'admin';
export type Language = 'en' | 'hi' | 'pa' | 'bn' | 'mr' | 'ta' | 'te' | 'gu';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  preferred_lang: Language;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  icon: string;
  description: string;
  description_hi: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface WorkerSkillItem {
  skill_name: string;
  category_id: string;
  category_name?: string;
  category_name_hi?: string;
  icon?: string;
}

export interface WorkerDetail {
  id: string;
  profile_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  preferred_lang: Language;
  bio: string;
  bio_hi?: string;
  experience_years: number;
  city: string;
  service_area: string;
  hourly_rate?: number;
  daily_rate?: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  rating: number;
  reviews_count: number;
  completed_jobs: number;
  is_public: boolean;
  skills: WorkerSkillItem[];
  // Agricultural specific fields & availability
  agri_available?: boolean;
  agri_activities?: string[];
  agri_service_radius?: string;
  agri_available_from?: string;
  agri_available_until?: string;
  agri_schedule?: string;
  agri_expected_wage?: number;
  agri_work_types?: string[];
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  category_id: string;
  title: string;
  description: string;
  location_city: string;
  service_area: string;
  budget_min?: number;
  budget_max?: number;
  pay_type: 'fixed' | 'hourly' | 'daily';
  work_type: 'one_time' | 'daily' | 'part_time' | 'full_time';
  preferred_date?: string;
  contact_preference: 'in_app' | 'phone' | 'either';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  // Agricultural specific fields
  agri_activity?: string;
  workers_needed?: number;
  start_date?: string;
  duration?: string;
  payment_basis?: 'daily' | 'hourly' | 'per_task' | 'fixed_project';
  meals_accommodation?: boolean;
  accommodation_details?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_name_hi?: string;
  category_icon?: string;
  posted_by?: string;
  applications_count?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  cover_message?: string;
  proposed_rate?: number;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  job_title?: string;
  job_city?: string;
  job_area?: string;
  job_budget?: string;
  pay_type?: string;
  category_name?: string;
  category_name_hi?: string;
  worker_name?: string;
  worker_phone?: string;
  worker_rating?: number;
  worker_experience?: number;
  worker_city?: string;
}

export interface ServiceEnquiry {
  id: string;
  customer_id: string;
  worker_id: string;
  category_id?: string;
  description: string;
  preferred_schedule?: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  response_message?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_phone?: string;
  worker_name?: string;
  worker_phone?: string;
  category_name?: string;
  category_name_hi?: string;
}

export interface SavedWorker {
  saved_id: string;
  saved_at: string;
  id: string;
  profile_id: string;
  full_name: string;
  avatar_url?: string;
  bio: string;
  experience_years: number;
  city: string;
  service_area: string;
  hourly_rate?: number;
  daily_rate?: number;
  availability_status: string;
  rating: number;
  skills: WorkerSkillItem[];
}

export interface AdminStats {
  total_users: number;
  total_customers: number;
  total_workers: number;
  active_workers: number;
  total_jobs: number;
  open_jobs: number;
  total_applications: number;
  total_enquiries: number;
}

export interface AuditLogItem {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}
