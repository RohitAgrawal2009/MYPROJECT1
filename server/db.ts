import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'worker' | 'admin';
  preferred_lang: 'en' | 'hi' | 'pa' | 'bn' | 'mr' | 'ta' | 'te' | 'gu';
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

export interface WorkerProfile {
  id: string;
  profile_id: string;
  bio: string;
  bio_hi: string;
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
  // Agricultural specific availability
  agri_available?: boolean;
  agri_activities?: string[];
  agri_service_radius?: string;
  agri_available_from?: string;
  agri_available_until?: string;
  agri_schedule?: string;
  agri_expected_wage?: number;
  agri_work_types?: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkerSkill {
  id: string;
  worker_profile_id: string;
  category_id: string;
  skill_name: string;
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
}

export interface SavedWorker {
  id: string;
  customer_id: string;
  worker_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface AuthSession {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
}

export interface DatabaseSchema {
  profiles: Profile[];
  service_categories: ServiceCategory[];
  worker_profiles: WorkerProfile[];
  worker_skills: WorkerSkill[];
  jobs: Job[];
  job_applications: JobApplication[];
  service_enquiries: ServiceEnquiry[];
  saved_workers: SavedWorker[];
  audit_logs: AuditLog[];
  auth_sessions: AuthSession[];
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jobbond_store.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.loadOrSeed();
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  private loadOrSeed(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('Could not read existing DB file, re-seeding default data:', err);
      }
    }
    const initial = this.getInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  private getInitialSeed(): DatabaseSchema {
    const adminPass = hashPassword('AdminPass123!');
    const demoPass = hashPassword('Password123!');

    const categories: ServiceCategory[] = [
      {
        id: 'cat-elec',
        name: 'Electrician',
        name_hi: 'इलेक्ट्रीशियन',
        slug: 'electrician',
        icon: 'Zap',
        description: 'Wiring, MCB repairs, fans, invertor, switchboards, lighting installations',
        description_hi: 'वायरिंग, एमसीबी रिपेयर, पंखा लगाना, इन्वर्टर, स्विचबोर्ड मरम्मत',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-plumb',
        name: 'Plumber',
        name_hi: 'प्लंबर (नलसाज)',
        slug: 'plumber',
        icon: 'Droplets',
        description: 'Pipe leakage, tap repairs, motor installation, sanitary fittings, tank cleaning',
        description_hi: 'पाइप लीकेज, नल फिटिंग, मोटर इंस्टॉलेशन, बाथरूम सेनेटरी कार्य',
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-carp',
        name: 'Carpenter',
        name_hi: 'बढ़ई',
        slug: 'carpenter',
        icon: 'Hammer',
        description: 'Furniture assembly, door hinges, modular kitchen repair, custom wood shelves',
        description_hi: 'फर्नीचर मरम्मत, दरवाजे के ताले, मॉड्यूलर किचन, अलमारी कार्य',
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-paint',
        name: 'Painter',
        name_hi: 'पेंटर',
        slug: 'painter',
        icon: 'Paintbrush',
        description: 'Interior & exterior wall painting, waterproof putty, texture, enamel polish',
        description_hi: 'दीवार पेंटिंग, वाटरप्रूफिंग, पुट्टी और प्राइमर, बाहरी इमल्शन',
        is_active: true,
        display_order: 4,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-clean',
        name: 'Cleaner',
        name_hi: 'सफाई कर्मचारी',
        slug: 'cleaner',
        icon: 'Sparkles',
        description: 'Home deep cleaning, kitchen degreasing, bathroom scrubbing, sofa dry-clean',
        description_hi: 'घर की गहरी सफाई, किचन धुलाई, सोफा शैम्पू, ऑफिस सैनिटाइजेशन',
        is_active: true,
        display_order: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-tutor',
        name: 'Tutor',
        name_hi: 'ट्यूटर / शिक्षक',
        slug: 'tutor',
        icon: 'GraduationCap',
        description: 'Maths, Science, English, primary & secondary coaching, competitive foundational study',
        description_hi: 'होम ट्यूशन, गणित, विज्ञान, भाषा कोचिंग, प्रतियोगी परीक्षा तैयारी',
        is_active: true,
        display_order: 6,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-agri',
        name: 'Agricultural Worker',
        name_hi: 'कृषि श्रमिक',
        slug: 'agricultural-worker',
        icon: 'Wheat',
        description: 'Crop harvesting, field leveling, weed removal, drip irrigation, seasonal farm support',
        description_hi: 'फसल कटाई, निराई-गुड़ाई, बुवाई, सिंचाई सहायता, ट्रैक्टर संचालन',
        is_active: true,
        display_order: 7,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-labour',
        name: 'General Labour',
        name_hi: 'सामान्य मजदूर',
        slug: 'general-labour',
        icon: 'Users',
        description: 'Heavy material shifting, loading/unloading trucks, civil helper, warehouse logistics',
        description_hi: 'सामान चढ़ाना-उतारना, शिफ्टिंग, निर्माण सहायक, इवेंट लॉजिस्टिक्स',
        is_active: true,
        display_order: 8,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cat-appl',
        name: 'Appliance Repair',
        name_hi: 'उपकरण मरम्मत',
        slug: 'appliance-repair',
        icon: 'Wrench',
        description: 'AC gas refill, washing machine spin issue, refrigerator thermostat, RO servicing',
        description_hi: 'एसी सर्विसिंग, फ्रिज गैस चार्ज, वाशिंग मशीन व माइक्रोवेव मरम्मत',
        is_active: true,
        display_order: 9,
        created_at: new Date().toISOString(),
      },
    ];

    const profiles: Profile[] = [
      {
        id: 'usr-admin-1',
        email: 'admin@jobbond.in',
        password_hash: adminPass,
        full_name: 'Pooja Sharma (Platform Admin)',
        phone: '+91 98765 00001',
        role: 'admin',
        preferred_lang: 'en',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
      },
      {
        id: 'usr-cust-1',
        email: 'customer@jobbond.in',
        password_hash: demoPass,
        full_name: 'Rohan Mehra',
        phone: '+91 98111 22334',
        role: 'customer',
        preferred_lang: 'en',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-15T10:30:00Z',
        updated_at: '2026-01-15T10:30:00Z',
      },
      {
        id: 'usr-cust-2',
        email: 'priya.customer@jobbond.in',
        password_hash: demoPass,
        full_name: 'Priya Verma',
        phone: '+91 99222 33445',
        role: 'customer',
        preferred_lang: 'hi',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-18T14:15:00Z',
        updated_at: '2026-01-18T14:15:00Z',
      },
      {
        id: 'usr-work-1',
        email: 'rajesh.worker@jobbond.in',
        password_hash: demoPass,
        full_name: 'Rajesh Kumar Electrician',
        phone: '+91 98711 55667',
        role: 'worker',
        preferred_lang: 'hi',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-12T08:00:00Z',
        updated_at: '2026-01-12T08:00:00Z',
      },
      {
        id: 'usr-work-2',
        email: 'amit.worker@jobbond.in',
        password_hash: demoPass,
        full_name: 'Amit Patel Plumber',
        phone: '+91 98222 66778',
        role: 'worker',
        preferred_lang: 'en',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-14T11:20:00Z',
        updated_at: '2026-01-14T11:20:00Z',
      },
      {
        id: 'usr-work-3',
        email: 'gurpreet.carpenter@jobbond.in',
        password_hash: demoPass,
        full_name: 'Gurpreet Singh Carpenter',
        phone: '+91 97333 77889',
        role: 'worker',
        preferred_lang: 'en',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-16T12:00:00Z',
        updated_at: '2026-01-16T12:00:00Z',
      },
      {
        id: 'usr-work-4',
        email: 'sunita.cleaner@jobbond.in',
        password_hash: demoPass,
        full_name: 'Sunita Devi Home Care',
        phone: '+91 96444 88990',
        role: 'worker',
        preferred_lang: 'hi',
        avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-20T09:40:00Z',
        updated_at: '2026-01-20T09:40:00Z',
      },
      {
        id: 'usr-work-5',
        email: 'ramesh.farmer@jobbond.in',
        password_hash: demoPass,
        full_name: 'Ramesh Yadav Agri & Labour',
        phone: '+91 95555 99001',
        role: 'worker',
        preferred_lang: 'hi',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-22T07:15:00Z',
        updated_at: '2026-01-22T07:15:00Z',
      },
      {
        id: 'usr-work-6',
        email: 'balwant.agri@jobbond.in',
        password_hash: demoPass,
        full_name: 'Balwant Singh Tractor & Harvest',
        phone: '+91 94111 22334',
        role: 'worker',
        preferred_lang: 'pa',
        avatar_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: '2026-01-23T08:00:00Z',
        updated_at: '2026-01-23T08:00:00Z',
      },
    ];

    const worker_profiles: WorkerProfile[] = [
      {
        id: 'wp-1',
        profile_id: 'usr-work-1',
        bio: 'Govt ITI certified electrician with 9+ years experience handling home wiring, sub-meters, inverter setups, tripping faults, and 3-phase line work in Delhi NCR.',
        bio_hi: 'सरकारी आईटीआई प्रमाणित इलेक्ट्रीशियन। दिल्ली एनसीआर में 9+ वर्षों का अनुभव - घरेलू वायरिंग, सब-मीटर, इन्वर्टर और 3-फेज लाइन कार्य।',
        experience_years: 9,
        city: 'New Delhi',
        service_area: 'South Delhi, Dwarka, Noida Sector 18-62',
        hourly_rate: 250,
        daily_rate: 1400,
        availability_status: 'available',
        rating: 4.9,
        reviews_count: 42,
        completed_jobs: 118,
        is_public: true,
        created_at: '2026-01-12T08:00:00Z',
        updated_at: '2026-01-12T08:00:00Z',
      },
      {
        id: 'wp-2',
        profile_id: 'usr-work-2',
        bio: 'Professional plumber specializing in concealed pipe leak detection, CPVC fittings, water pumps, overhead tank automatic level valves, and bathroom renovations in Mumbai.',
        bio_hi: 'पेशेवर प्लंबर - पाइप लीकेज, सीपीवीसी फिटिंग, पानी की मोटर, स्वचालित टैंक वाल्व और बाथरूम नवीनीकरण में विशेषज्ञ।',
        experience_years: 7,
        city: 'Mumbai',
        service_area: 'Andheri, Bandra, Borivali, Powai',
        hourly_rate: 300,
        daily_rate: 1600,
        availability_status: 'available',
        rating: 4.8,
        reviews_count: 36,
        completed_jobs: 89,
        is_public: true,
        created_at: '2026-01-14T11:20:00Z',
        updated_at: '2026-01-14T11:20:00Z',
      },
      {
        id: 'wp-3',
        profile_id: 'usr-work-3',
        bio: 'Master carpenter proficient in modular kitchen hardware, hydraulic beds, lock replacements, laminate edging, and custom wooden cabinets with clean finishes.',
        bio_hi: 'मास्टर कारपेंटर - मॉड्यूलर किचन हार्डवेयर, हाइड्रोलिक बेड, लॉक बदलना और कस्टम लकड़ी की अलमारियों के विशेषज्ञ।',
        experience_years: 12,
        city: 'Bengaluru',
        service_area: 'Indiranagar, Koramangala, Whitefield, HSR Layout',
        hourly_rate: 350,
        daily_rate: 1800,
        availability_status: 'busy',
        rating: 4.95,
        reviews_count: 58,
        completed_jobs: 145,
        is_public: true,
        created_at: '2026-01-16T12:00:00Z',
        updated_at: '2026-01-16T12:00:00Z',
      },
      {
        id: 'wp-4',
        profile_id: 'usr-work-4',
        bio: 'Reliable housekeeping and residential deep cleaning specialist. Punctual, hygienic, trusted by 100+ families for post-construction and festival season deep cleans.',
        bio_hi: 'भरोसेमंद हाउसकीपिंग और डीप क्लीनिंग विशेषज्ञ। समयनिष्ठ, स्वच्छ और सुरक्षित घरेलू सफाई सेवा।',
        experience_years: 5,
        city: 'Lucknow',
        service_area: 'Gomti Nagar, Aliganj, Hazratganj, Indira Nagar',
        hourly_rate: 180,
        daily_rate: 900,
        availability_status: 'available',
        rating: 4.85,
        reviews_count: 29,
        completed_jobs: 73,
        is_public: true,
        created_at: '2026-01-20T09:40:00Z',
        updated_at: '2026-01-20T09:40:00Z',
      },
      {
        id: 'wp-5',
        profile_id: 'usr-work-5',
        bio: 'Experienced in agricultural harvesting, organic farm maintenance, nursery care, and general heavy material loading/unloading.',
        bio_hi: 'फसल कटाई, बागवानी, जैविक फार्म रखरखाव और भारी सामान लोडिंग/अनलोडिंग में दक्ष।',
        experience_years: 8,
        city: 'Jaipur',
        service_area: 'Mansarovar, Vaishali Nagar, Sanganer, Chomu outskirts',
        hourly_rate: 150,
        daily_rate: 750,
        availability_status: 'available',
        rating: 4.75,
        reviews_count: 19,
        completed_jobs: 54,
        is_public: true,
        agri_available: true,
        agri_activities: ['Harvesting and Crop Cutting', 'Sowing and Planting', 'Irrigation and Water Management', 'Weeding and Field Maintenance'],
        agri_service_radius: '20 km around Chomu & Jaipur Rural',
        agri_available_from: '2026-11-01',
        agri_available_until: '2027-03-31',
        agri_schedule: 'Full day (7 AM - 5 PM)',
        agri_expected_wage: 750,
        agri_work_types: ['Daily Wage', 'Crop Harvesting', 'Field Work'],
        created_at: '2026-01-22T07:15:00Z',
        updated_at: '2026-01-22T07:15:00Z',
      },
      {
        id: 'wp-6',
        profile_id: 'usr-work-6',
        bio: 'Heavy tractor driver with 10+ years experience in rotary tiller, disc harrow, laser land leveling, and combine harvester operation across wheat and paddy seasons.',
        bio_hi: 'रोटरी टिलर, लेजर लैंड लेवलर और कंबाइन हार्वेस्टर चलाने में 10+ वर्षों का अनुभव।',
        experience_years: 10,
        city: 'New Delhi',
        service_area: 'Najafgarh, Alipur, Narela, Kundli border',
        hourly_rate: 250,
        daily_rate: 1100,
        availability_status: 'available',
        rating: 4.9,
        reviews_count: 24,
        completed_jobs: 62,
        is_public: true,
        agri_available: true,
        agri_activities: ['Tractor Driving & Farm Machinery', 'Harvesting and Crop Cutting', 'Spraying and Crop Care'],
        agri_service_radius: '30 km covering Outer Delhi & Sonipat belt',
        agri_available_from: '2026-11-01',
        agri_available_until: '2027-05-15',
        agri_schedule: 'Flexible / Day & Night Harvest shifts',
        agri_expected_wage: 1100,
        agri_work_types: ['Daily Wage', 'Contract Machine Operation'],
        created_at: '2026-01-23T08:00:00Z',
        updated_at: '2026-01-23T08:00:00Z',
      },
    ];

    const worker_skills: WorkerSkill[] = [
      { id: 'ws-1', worker_profile_id: 'wp-1', category_id: 'cat-elec', skill_name: 'House Wiring & MCB', created_at: '2026-01-12T08:00:00Z' },
      { id: 'ws-2', worker_profile_id: 'wp-1', category_id: 'cat-elec', skill_name: 'Inverter & Battery Wiring', created_at: '2026-01-12T08:00:00Z' },
      { id: 'ws-3', worker_profile_id: 'wp-1', category_id: 'cat-appl', skill_name: 'Ceiling Fan & Geyser Install', created_at: '2026-01-12T08:00:00Z' },
      { id: 'ws-4', worker_profile_id: 'wp-2', category_id: 'cat-plumb', skill_name: 'Concealed Pipe Repair', created_at: '2026-01-14T11:20:00Z' },
      { id: 'ws-5', worker_profile_id: 'wp-2', category_id: 'cat-plumb', skill_name: 'Water Motor Fitting', created_at: '2026-01-14T11:20:00Z' },
      { id: 'ws-6', worker_profile_id: 'wp-3', category_id: 'cat-carp', skill_name: 'Modular Kitchen Fitting', created_at: '2026-01-16T12:00:00Z' },
      { id: 'ws-7', worker_profile_id: 'wp-3', category_id: 'cat-carp', skill_name: 'Door Lock & Hinge Fix', created_at: '2026-01-16T12:00:00Z' },
      { id: 'ws-8', worker_profile_id: 'wp-4', category_id: 'cat-clean', skill_name: 'Kitchen & Bathroom Scrubbing', created_at: '2026-01-20T09:40:00Z' },
      { id: 'ws-9', worker_profile_id: 'wp-5', category_id: 'cat-agri', skill_name: 'Seasonal Crop Harvesting', created_at: '2026-01-22T07:15:00Z' },
      { id: 'ws-10', worker_profile_id: 'wp-5', category_id: 'cat-labour', skill_name: 'Material Shifting & Loading', created_at: '2026-01-22T07:15:00Z' },
      { id: 'ws-11', worker_profile_id: 'wp-6', category_id: 'cat-agri', skill_name: 'Tractor Driving & Rotary Tiller', created_at: '2026-01-23T08:00:00Z' },
      { id: 'ws-12', worker_profile_id: 'wp-6', category_id: 'cat-agri', skill_name: 'Harvester Machine Operation', created_at: '2026-01-23T08:00:00Z' },
    ];

    const jobs: Job[] = [
      {
        id: 'job-101',
        customer_id: 'usr-cust-1',
        category_id: 'cat-elec',
        title: 'Full 3BHK Apartment Rewiring & Main MCB Board Upgrade',
        description: 'Need an experienced certified electrician to inspect old wiring, rewire two bedrooms, and replace a tripping 32A main MCB distribution box. Materials provided or can be reimbursed on actual bills.',
        location_city: 'New Delhi',
        service_area: 'Dwarka Sector 11',
        budget_min: 3500,
        budget_max: 5500,
        pay_type: 'fixed',
        work_type: 'one_time',
        preferred_date: 'This Saturday / Sunday',
        contact_preference: 'in_app',
        status: 'open',
        created_at: '2026-01-25T11:00:00Z',
        updated_at: '2026-01-25T11:00:00Z',
      },
      {
        id: 'job-102',
        customer_id: 'usr-cust-1',
        category_id: 'cat-plumb',
        title: 'Overhead Water Tank Float Valve Replacement & Low Pressure Fix',
        description: 'Water overflowing from rooftop 1000L Sintex tank due to stuck ballcock valve. Also need pressure checking for top floor shower pipe.',
        location_city: 'New Delhi',
        service_area: 'South Delhi, Greater Kailash 1',
        budget_min: 600,
        budget_max: 950,
        pay_type: 'fixed',
        work_type: 'one_time',
        preferred_date: 'Immediate / Tomorrow morning',
        contact_preference: 'either',
        status: 'open',
        created_at: '2026-01-26T15:30:00Z',
        updated_at: '2026-01-26T15:30:00Z',
      },
      {
        id: 'job-103',
        customer_id: 'usr-cust-2',
        category_id: 'cat-carp',
        title: 'Wooden Wardrobe Sliding Track Repair & Lock Installation',
        description: 'Master bedroom 3-door sliding cupboard roller wheel is jammed. Need track leveling, smooth alignment, and two Godrej rim locks installed.',
        location_city: 'Bengaluru',
        service_area: 'HSR Layout Sector 2',
        budget_min: 1200,
        budget_max: 1800,
        pay_type: 'fixed',
        work_type: 'one_time',
        preferred_date: 'Within 3 days',
        contact_preference: 'in_app',
        status: 'open',
        created_at: '2026-01-27T09:15:00Z',
        updated_at: '2026-01-27T09:15:00Z',
      },
      {
        id: 'job-104',
        customer_id: 'usr-cust-2',
        category_id: 'cat-clean',
        title: 'Move-in Deep House Cleaning for 2BHK Flat',
        description: 'Comprehensive cleaning before tenant move-in: kitchen cabinets degreasing, bathroom tiles scaling removal, balcony wash, and floor buffing.',
        location_city: 'Lucknow',
        service_area: 'Gomti Nagar Extension',
        budget_min: 2000,
        budget_max: 2800,
        pay_type: 'fixed',
        work_type: 'one_time',
        preferred_date: 'Coming Weekend',
        contact_preference: 'in_app',
        status: 'open',
        created_at: '2026-01-28T16:00:00Z',
        updated_at: '2026-01-28T16:00:00Z',
      },
      {
        id: 'job-105',
        customer_id: 'usr-cust-1',
        category_id: 'cat-labour',
        title: 'Warehouse Inventory Shifting & Carton Loading Helper',
        description: 'Need 2 energetic helpers for 2 full days to unpack, label, and rearrange boxed retail goods in ground-floor storage depot.',
        location_city: 'Mumbai',
        service_area: 'Bhiwandi / Kalyan Link Road',
        budget_min: 800,
        budget_max: 950,
        pay_type: 'daily',
        work_type: 'daily',
        preferred_date: 'Starting Next Monday',
        contact_preference: 'either',
        status: 'open',
        created_at: '2026-01-28T18:20:00Z',
        updated_at: '2026-01-28T18:20:00Z',
      },
      {
        id: 'job-201',
        customer_id: 'usr-cust-1',
        category_id: 'cat-agri',
        title: 'Wheat Harvesting & Grain Bagging Helpers Needed',
        description: 'Need a team of 4 energetic farm workers for seasonal wheat cutting, bundling, and manual thresher feeding on our 5-acre agricultural plot.',
        location_city: 'Jaipur',
        service_area: 'Chomu Rural Village',
        budget_min: 750,
        budget_max: 900,
        pay_type: 'daily',
        work_type: 'daily',
        preferred_date: 'Starting Next Monday',
        contact_preference: 'either',
        status: 'open',
        agri_activity: 'Harvesting and Crop Cutting',
        workers_needed: 4,
        start_date: '2026-11-03',
        duration: '4 Days',
        payment_basis: 'daily',
        meals_accommodation: true,
        accommodation_details: 'Farmhouse guest room and daily fresh lunch provided.',
        created_at: '2026-01-28T10:00:00Z',
        updated_at: '2026-01-28T10:00:00Z',
      },
      {
        id: 'job-202',
        customer_id: 'usr-cust-2',
        category_id: 'cat-agri',
        title: 'Tractor Driver for Soil Bed Preparation & Laser Leveling',
        description: 'Requires experienced tractor operator with 45+ HP tractor familiarity to prepare 8 acres seedbed for winter vegetable sowing.',
        location_city: 'New Delhi',
        service_area: 'Najafgarh Farm Sector',
        budget_min: 1100,
        budget_max: 1400,
        pay_type: 'daily',
        work_type: 'one_time',
        preferred_date: 'Within 5 Days',
        contact_preference: 'in_app',
        status: 'open',
        agri_activity: 'Tractor Driving & Farm Machinery',
        workers_needed: 1,
        start_date: '2026-11-06',
        duration: '2 Days',
        payment_basis: 'daily',
        meals_accommodation: false,
        created_at: '2026-01-28T12:00:00Z',
        updated_at: '2026-01-28T12:00:00Z',
      },
      {
        id: 'job-203',
        customer_id: 'usr-cust-1',
        category_id: 'cat-agri',
        title: 'Fruit Orchard Picking, Sorting & Crate Packing Crew',
        description: 'Looking for 3 careful farm hands to pick seasonal guavas and citrus, inspect quality, and pack into wooden transport crates.',
        location_city: 'Lucknow',
        service_area: 'Malihabad Fruit Belt',
        budget_min: 650,
        budget_max: 800,
        pay_type: 'daily',
        work_type: 'daily',
        preferred_date: 'Next Weekend',
        contact_preference: 'either',
        status: 'open',
        agri_activity: 'Fruit and Vegetable Picking',
        workers_needed: 3,
        start_date: '2026-11-12',
        duration: '1 Week',
        payment_basis: 'daily',
        meals_accommodation: true,
        created_at: '2026-01-28T15:00:00Z',
        updated_at: '2026-01-28T15:00:00Z',
      },
    ];

    const job_applications: JobApplication[] = [
      {
        id: 'app-1',
        job_id: 'job-101',
        worker_id: 'usr-work-1',
        cover_message: 'Namaste Rohan ji, I am ITI licensed and have completed over 100+ apartment rewiring jobs in Dwarka. I bring my own insulation tester and tools.',
        proposed_rate: 4200,
        status: 'shortlisted',
        created_at: '2026-01-25T14:30:00Z',
        updated_at: '2026-01-26T10:00:00Z',
      },
      {
        id: 'app-2',
        job_id: 'job-103',
        worker_id: 'usr-work-3',
        cover_message: 'Hi Priya, I specialize in sliding cabinet tracks and soft-close hardware. Can finish the repair and lock setup in 3 hours smoothly.',
        proposed_rate: 1500,
        status: 'pending',
        created_at: '2026-01-27T11:45:00Z',
        updated_at: '2026-01-27T11:45:00Z',
      },
    ];

    const service_enquiries: ServiceEnquiry[] = [
      {
        id: 'enq-1',
        customer_id: 'usr-cust-1',
        worker_id: 'usr-work-1',
        category_id: 'cat-elec',
        description: 'Hi Rajesh, looking to get 4 ceiling fans and modular lights installed in our new flat in Dwarka Sector 12. Are you available this Friday afternoon?',
        preferred_schedule: 'Friday 2 PM - 6 PM',
        status: 'responded',
        response_message: 'Yes sir, I am available on Friday afternoon. Standard charge is ₹250/hour or ₹800 lump sum for 4 fans. Please confirm.',
        created_at: '2026-01-24T10:00:00Z',
        updated_at: '2026-01-24T12:30:00Z',
      },
      {
        id: 'enq-2',
        customer_id: 'usr-cust-2',
        worker_id: 'usr-work-4',
        category_id: 'cat-clean',
        description: 'Hello Sunita ji, we need kitchen chimney and tile scrubbing this Sunday morning. Please let us know if you can visit Gomti Nagar.',
        preferred_schedule: 'Sunday 9:00 AM',
        status: 'pending',
        created_at: '2026-01-28T09:00:00Z',
        updated_at: '2026-01-28T09:00:00Z',
      },
    ];

    const saved_workers: SavedWorker[] = [
      {
        id: 'save-1',
        customer_id: 'usr-cust-1',
        worker_id: 'usr-work-1',
        created_at: '2026-01-23T11:00:00Z',
      },
      {
        id: 'save-2',
        customer_id: 'usr-cust-1',
        worker_id: 'usr-work-2',
        created_at: '2026-01-24T15:00:00Z',
      },
    ];

    const audit_logs: AuditLog[] = [
      {
        id: 'audit-1',
        admin_id: 'usr-admin-1',
        action: 'PLATFORM_INITIALIZATION',
        target_type: 'SYSTEM',
        target_id: 'system',
        details: 'Initial system boot and security verification verified.',
        created_at: '2026-01-10T09:05:00Z',
      },
    ];

    return {
      profiles,
      service_categories: categories,
      worker_profiles,
      worker_skills,
      jobs,
      job_applications,
      service_enquiries,
      saved_workers,
      audit_logs,
      auth_sessions: [],
    };
  }

  // --- Profiles & Auth ---
  public getProfiles(): Profile[] {
    return this.data.profiles;
  }

  public getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    const id = 'usr-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const newProfile: Profile = {
      ...profile,
      id,
      created_at: now,
      updated_at: now,
    };
    this.data.profiles.push(newProfile);
    this.save();
    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.profiles[idx];
  }

  // --- Sessions ---
  public createSession(userId: string): AuthSession {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: AuthSession = {
      id: crypto.randomUUID(),
      token,
      user_id: userId,
      expires_at: expires,
    };
    this.data.auth_sessions.push(session);
    this.save();
    return session;
  }

  public getSession(token: string): AuthSession | undefined {
    const session = this.data.auth_sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expires_at) < new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string): void {
    this.data.auth_sessions = this.data.auth_sessions.filter((s) => s.token !== token);
    this.save();
  }

  // --- Worker Profiles ---
  public getWorkerProfiles(): WorkerProfile[] {
    return this.data.worker_profiles;
  }

  public getWorkerProfileByProfileId(profileId: string): WorkerProfile | undefined {
    return this.data.worker_profiles.find((w) => w.profile_id === profileId);
  }

  public getWorkerProfileById(id: string): WorkerProfile | undefined {
    return this.data.worker_profiles.find((w) => w.id === id);
  }

  public upsertWorkerProfile(profileId: string, payload: Partial<WorkerProfile>): WorkerProfile {
    const existingIndex = this.data.worker_profiles.findIndex((w) => w.profile_id === profileId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.worker_profiles[existingIndex] = {
        ...this.data.worker_profiles[existingIndex],
        ...payload,
        updated_at: now,
      };
      this.save();
      return this.data.worker_profiles[existingIndex];
    } else {
      const newWorker: WorkerProfile = {
        id: 'wp-' + crypto.randomUUID(),
        profile_id: profileId,
        bio: payload.bio || '',
        bio_hi: payload.bio_hi || '',
        experience_years: payload.experience_years || 1,
        city: payload.city || '',
        service_area: payload.service_area || '',
        hourly_rate: payload.hourly_rate,
        daily_rate: payload.daily_rate,
        availability_status: payload.availability_status || 'available',
        rating: 5.0,
        reviews_count: 0,
        completed_jobs: 0,
        is_public: payload.is_public ?? true,
        created_at: now,
        updated_at: now,
      };
      this.data.worker_profiles.push(newWorker);
      this.save();
      return newWorker;
    }
  }

  // --- Categories ---
  public getCategories(): ServiceCategory[] {
    return this.data.service_categories.sort((a, b) => a.display_order - b.display_order);
  }

  public createCategory(category: Omit<ServiceCategory, 'id' | 'created_at'>): ServiceCategory {
    const newCat: ServiceCategory = {
      ...category,
      id: 'cat-' + crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.service_categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<ServiceCategory>): ServiceCategory | null {
    const idx = this.data.service_categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.service_categories[idx] = {
      ...this.data.service_categories[idx],
      ...updates,
    };
    this.save();
    return this.data.service_categories[idx];
  }

  // --- Worker Skills ---
  public getWorkerSkills(workerProfileId?: string): WorkerSkill[] {
    if (workerProfileId) {
      return this.data.worker_skills.filter((ws) => ws.worker_profile_id === workerProfileId);
    }
    return this.data.worker_skills;
  }

  public setWorkerSkills(workerProfileId: string, skills: { category_id: string; skill_name: string }[]): WorkerSkill[] {
    this.data.worker_skills = this.data.worker_skills.filter((ws) => ws.worker_profile_id !== workerProfileId);
    const now = new Date().toISOString();
    const newSkills: WorkerSkill[] = skills.map((s) => ({
      id: 'ws-' + crypto.randomUUID(),
      worker_profile_id: workerProfileId,
      category_id: s.category_id,
      skill_name: s.skill_name,
      created_at: now,
    }));
    this.data.worker_skills.push(...newSkills);
    this.save();
    return newSkills;
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return this.data.jobs;
  }

  public getJobById(id: string): Job | undefined {
    return this.data.jobs.find((j) => j.id === id);
  }

  public createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Job {
    const id = 'job-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const job: Job = {
      ...jobData,
      id,
      created_at: now,
      updated_at: now,
    };
    this.data.jobs.unshift(job);
    this.save();
    return job;
  }

  public updateJob(id: string, updates: Partial<Job>): Job | null {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.data.jobs[idx] = {
      ...this.data.jobs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.jobs[idx];
  }

  public deleteJob(id: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => j.id !== id);
    this.data.job_applications = this.data.job_applications.filter((a) => a.job_id !== id);
    this.save();
    return this.data.jobs.length < initialLen;
  }

  // --- Job Applications ---
  public getApplications(): JobApplication[] {
    return this.data.job_applications;
  }

  public getApplication(jobId: string, workerId: string): JobApplication | undefined {
    return this.data.job_applications.find((a) => a.job_id === jobId && a.worker_id === workerId);
  }

  public createApplication(appData: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): JobApplication {
    const id = 'app-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const app: JobApplication = {
      ...appData,
      id,
      created_at: now,
      updated_at: now,
    };
    this.data.job_applications.unshift(app);
    this.save();
    return app;
  }

  public updateApplication(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.data.job_applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.job_applications[idx] = {
      ...this.data.job_applications[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.job_applications[idx];
  }

  // --- Enquiries ---
  public getEnquiries(): ServiceEnquiry[] {
    return this.data.service_enquiries;
  }

  public createEnquiry(enquiryData: Omit<ServiceEnquiry, 'id' | 'created_at' | 'updated_at'>): ServiceEnquiry {
    const id = 'enq-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const enquiry: ServiceEnquiry = {
      ...enquiryData,
      id,
      created_at: now,
      updated_at: now,
    };
    this.data.service_enquiries.unshift(enquiry);
    this.save();
    return enquiry;
  }

  public updateEnquiry(id: string, updates: Partial<ServiceEnquiry>): ServiceEnquiry | null {
    const idx = this.data.service_enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.service_enquiries[idx] = {
      ...this.data.service_enquiries[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.service_enquiries[idx];
  }

  // --- Saved Workers ---
  public getSavedWorkers(customerId: string): SavedWorker[] {
    return this.data.saved_workers.filter((s) => s.customer_id === customerId);
  }

  public saveWorker(customerId: string, workerId: string): SavedWorker {
    const existing = this.data.saved_workers.find(
      (s) => s.customer_id === customerId && s.worker_id === workerId
    );
    if (existing) return existing;
    const item: SavedWorker = {
      id: 'save-' + crypto.randomUUID(),
      customer_id: customerId,
      worker_id: workerId,
      created_at: new Date().toISOString(),
    };
    this.data.saved_workers.push(item);
    this.save();
    return item;
  }

  public unsaveWorker(customerId: string, workerId: string): boolean {
    const initial = this.data.saved_workers.length;
    this.data.saved_workers = this.data.saved_workers.filter(
      (s) => !(s.customer_id === customerId && s.worker_id === workerId)
    );
    this.save();
    return this.data.saved_workers.length < initial;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public logAdminAction(adminId: string, action: string, targetType: string, targetId: string, details: string): AuditLog {
    const log: AuditLog = {
      id: 'audit-' + crypto.randomUUID(),
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }
}

export const db = new Database();
