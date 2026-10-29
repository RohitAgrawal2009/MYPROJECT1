import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { db, hashPassword, verifyPassword, Profile, WorkerProfile, Job } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// --- Authentication Middleware ---
export interface AuthenticatedRequest extends Request {
  user?: Profile;
  token?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.jobbond_token) {
    token = req.cookies.jobbond_token;
  }

  if (token) {
    const session = db.getSession(token);
    if (session) {
      const user = db.getProfileById(session.user_id);
      if (user && user.is_active) {
        req.user = user;
        req.token = token;
      }
    }
  }
  next();
};

app.use(authMiddleware);

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
};

const requireRole = (...roles: Array<'customer' | 'worker' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
    }
    next();
  };
};

// --- Validation Schemas ---
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  role: z.enum(['customer', 'worker']), // Users CANNOT register as admin
  preferred_lang: z.enum(['en', 'hi']).default('en'),
  // Worker-specific optional fields on registration
  city: z.string().optional(),
  service_area: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  bio: z.string().optional(),
  category_id: z.string().optional(),
  daily_rate: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const JobCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Please provide more details about the work'),
  location_city: z.string().min(2, 'City is required'),
  service_area: z.string().min(2, 'Service area is required'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  pay_type: z.enum(['fixed', 'hourly', 'daily']).default('fixed'),
  work_type: z.enum(['one_time', 'daily', 'part_time', 'full_time']).default('one_time'),
  preferred_date: z.string().optional(),
  contact_preference: z.enum(['in_app', 'phone', 'either']).default('in_app'),
  agri_activity: z.string().optional(),
  workers_needed: z.number().min(1).optional(),
  start_date: z.string().optional(),
  duration: z.string().optional(),
  payment_basis: z.enum(['daily', 'hourly', 'per_task', 'fixed_project']).optional(),
  meals_accommodation: z.boolean().optional(),
  accommodation_details: z.string().optional(),
});

const ApplicationCreateSchema = z.object({
  cover_message: z.string().optional(),
  proposed_rate: z.number().positive().optional(),
});

const EnquiryCreateSchema = z.object({
  worker_id: z.string().min(1, 'Worker ID is required'),
  category_id: z.string().optional(),
  description: z.string().min(10, 'Please describe the required work in detail'),
  preferred_schedule: z.string().optional(),
});

// ==========================================
// API ROUTES
// ==========================================

// --- Health ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JobBond Platform API',
    timestamp: new Date().toISOString(),
  });
});

function getZodErrorMessage(error: any): string {
  if (!error) return 'Invalid input data';
  if (Array.isArray(error.issues) && error.issues[0]?.message) return error.issues[0].message;
  if (Array.isArray(error.errors) && error.errors[0]?.message) return error.errors[0].message;
  return 'Validation failed';
}

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const parseResult = RegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getZodErrorMessage(parseResult.error) });
  }

  const { email, password, full_name, phone, role, preferred_lang, city, service_area, experience_years, bio, category_id, daily_rate, hourly_rate } = parseResult.data;

  const existing = db.getProfileByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const password_hash = hashPassword(password);
  const profile = db.createProfile({
    email,
    password_hash,
    full_name,
    phone,
    role,
    preferred_lang,
    is_active: true,
  });

  if (role === 'worker') {
    const workerProfile = db.upsertWorkerProfile(profile.id, {
      bio: bio || `Experienced ${full_name} ready for local job bookings.`,
      experience_years: experience_years || 1,
      city: city || 'New Delhi',
      service_area: service_area || 'Central Area',
      daily_rate: daily_rate || 800,
      hourly_rate: hourly_rate || 200,
      availability_status: 'available',
      is_public: true,
    });

    if (category_id) {
      db.setWorkerSkills(workerProfile.id, [
        { category_id, skill_name: 'Core Service Work' },
      ]);
    }
  }

  const session = db.createSession(profile.id);
  res.cookie('jobbond_token', session.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password_hash: _, ...safeUser } = profile;
  res.status(201).json({
    message: 'Registration successful',
    token: session.token,
    user: safeUser,
  });
});

app.post('/api/auth/login', (req, res) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Valid email and password required.' });
  }

  const { email, password } = parseResult.data;
  const user = db.getProfileByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Your account has been deactivated. Contact support.' });
  }

  const session = db.createSession(user.id);
  res.cookie('jobbond_token', session.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password_hash: _, ...safeUser } = user;
  res.json({
    message: 'Login successful',
    token: session.token,
    user: safeUser,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const { password_hash, ...safeUser } = req.user!;
  let workerProfile = null;
  let skills: any[] = [];

  if (req.user!.role === 'worker') {
    workerProfile = db.getWorkerProfileByProfileId(req.user!.id);
    if (workerProfile) {
      skills = db.getWorkerSkills(workerProfile.id);
    }
  }

  res.json({
    user: safeUser,
    worker_profile: workerProfile,
    skills,
  });
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res) => {
  if (req.token) {
    db.deleteSession(req.token);
  }
  res.clearCookie('jobbond_token');
  res.json({ message: 'Logged out successfully' });
});

// --- Categories ---
app.get('/api/categories', (req, res) => {
  const categories = db.getCategories();
  res.json(categories);
});

// --- Workers Directory & Profile ---
app.get('/api/workers', (req, res) => {
  const { search, category, city, minExp, availability, sort } = req.query;

  const allWorkers = db.getWorkerProfiles().filter((w) => w.is_public);
  const profiles = db.getProfiles();
  const categories = db.getCategories();
  const allSkills = db.getWorkerSkills();

  let enriched = allWorkers
    .map((wp) => {
      const user = profiles.find((p) => p.id === wp.profile_id && p.is_active);
      if (!user) return null;
      const skills = allSkills.filter((s) => s.worker_profile_id === wp.id);
      return {
        id: wp.id,
        profile_id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        preferred_lang: user.preferred_lang,
        bio: wp.bio,
        bio_hi: wp.bio_hi,
        experience_years: wp.experience_years,
        city: wp.city,
        service_area: wp.service_area,
        hourly_rate: wp.hourly_rate,
        daily_rate: wp.daily_rate,
        availability_status: wp.availability_status,
        rating: wp.rating,
        reviews_count: wp.reviews_count,
        completed_jobs: wp.completed_jobs,
        is_public: wp.is_public,
        agri_available: wp.agri_available,
        agri_activities: wp.agri_activities,
        agri_service_radius: wp.agri_service_radius,
        agri_available_from: wp.agri_available_from,
        agri_available_until: wp.agri_available_until,
        agri_schedule: wp.agri_schedule,
        agri_expected_wage: wp.agri_expected_wage,
        agri_work_types: wp.agri_work_types,
        skills: skills.map((s) => {
          const cat = categories.find((c) => c.id === s.category_id);
          return {
            skill_name: s.skill_name,
            category_id: s.category_id,
            category_name: cat ? cat.name : '',
            category_name_hi: cat ? cat.name_hi : '',
            icon: cat ? cat.icon : 'Wrench',
          };
        }),
      };
    })
    .filter(Boolean) as any[];

  // Filters
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    enriched = enriched.filter((w) => {
      return (
        w.full_name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.service_area.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q) ||
        w.skills.some((s: any) => s.skill_name.toLowerCase().includes(q) || s.category_name.toLowerCase().includes(q))
      );
    });
  }

  if (category && typeof category === 'string' && category !== 'all') {
    enriched = enriched.filter((w) => w.skills.some((s: any) => s.category_id === category || s.category_name.toLowerCase() === category.toLowerCase()));
  }

  if (city && typeof city === 'string' && city !== 'all') {
    enriched = enriched.filter((w) => w.city.toLowerCase() === city.toLowerCase());
  }

  if (minExp) {
    const exp = Number(minExp);
    if (!isNaN(exp)) {
      enriched = enriched.filter((w) => w.experience_years >= exp);
    }
  }

  if (availability && typeof availability === 'string' && availability !== 'all') {
    enriched = enriched.filter((w) => w.availability_status === availability);
  }

  // Sorting
  if (sort === 'exp_desc') {
    enriched.sort((a, b) => b.experience_years - a.experience_years);
  } else if (sort === 'rate_asc') {
    enriched.sort((a, b) => (a.hourly_rate || 9999) - (b.hourly_rate || 9999));
  } else if (sort === 'rating_desc') {
    enriched.sort((a, b) => b.rating - a.rating);
  } else {
    // Recommended default: rating * completed_jobs weight
    enriched.sort((a, b) => (b.rating * (b.reviews_count + 1)) - (a.rating * (a.reviews_count + 1)));
  }

  res.json(enriched);
});

app.get('/api/workers/:id', (req, res) => {
  const workerProfile = db.getWorkerProfileById(req.params.id) || db.getWorkerProfileByProfileId(req.params.id);
  if (!workerProfile) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  const user = db.getProfileById(workerProfile.profile_id);
  if (!user || !user.is_active) {
    return res.status(404).json({ error: 'Worker is unavailable or inactive.' });
  }

  const categories = db.getCategories();
  const rawSkills = db.getWorkerSkills(workerProfile.id);
  const skills = rawSkills.map((s) => {
    const cat = categories.find((c) => c.id === s.category_id);
    return {
      skill_name: s.skill_name,
      category_id: s.category_id,
      category_name: cat ? cat.name : '',
      category_name_hi: cat ? cat.name_hi : '',
      icon: cat ? cat.icon : 'Wrench',
    };
  });

  // Privacy protection: do NOT return plain phone unless authorized or enquiry accepted
  res.json({
    id: workerProfile.id,
    profile_id: user.id,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    preferred_lang: user.preferred_lang,
    bio: workerProfile.bio,
    bio_hi: workerProfile.bio_hi,
    experience_years: workerProfile.experience_years,
    city: workerProfile.city,
    service_area: workerProfile.service_area,
    hourly_rate: workerProfile.hourly_rate,
    daily_rate: workerProfile.daily_rate,
    availability_status: workerProfile.availability_status,
    rating: workerProfile.rating,
    reviews_count: workerProfile.reviews_count,
    completed_jobs: workerProfile.completed_jobs,
    is_public: workerProfile.is_public,
    agri_available: workerProfile.agri_available,
    agri_activities: workerProfile.agri_activities,
    agri_service_radius: workerProfile.agri_service_radius,
    agri_available_from: workerProfile.agri_available_from,
    agri_available_until: workerProfile.agri_available_until,
    agri_schedule: workerProfile.agri_schedule,
    agri_expected_wage: workerProfile.agri_expected_wage,
    agri_work_types: workerProfile.agri_work_types,
    skills,
    created_at: workerProfile.created_at,
  });
});

app.post('/api/workers/profile', requireAuth, requireRole('worker'), (req: AuthenticatedRequest, res) => {
  const { bio, bio_hi, experience_years, city, service_area, hourly_rate, daily_rate, availability_status, is_public, skills } = req.body;

  const updatedProfile = db.upsertWorkerProfile(req.user!.id, {
    bio,
    bio_hi,
    experience_years: Number(experience_years) || 1,
    city,
    service_area,
    hourly_rate: hourly_rate ? Number(hourly_rate) : undefined,
    daily_rate: daily_rate ? Number(daily_rate) : undefined,
    availability_status,
    is_public: is_public !== undefined ? Boolean(is_public) : true,
  });

  if (Array.isArray(skills)) {
    db.setWorkerSkills(updatedProfile.id, skills);
  }

  res.json({ message: 'Profile updated successfully', profile: updatedProfile });
});

app.patch('/api/workers/profile', requireAuth, requireRole('worker'), (req: AuthenticatedRequest, res) => {
  const current = db.getWorkerProfileByProfileId(req.user!.id);
  if (!current) {
    return res.status(404).json({ error: 'Worker profile does not exist yet.' });
  }

  const {
    bio,
    bio_hi,
    experience_years,
    city,
    service_area,
    hourly_rate,
    daily_rate,
    availability_status,
    is_public,
    skills,
    agri_available,
    agri_activities,
    agri_service_radius,
    agri_available_from,
    agri_available_until,
    agri_schedule,
    agri_expected_wage,
    agri_work_types,
  } = req.body;

  const updatedProfile = db.upsertWorkerProfile(req.user!.id, {
    ...(bio !== undefined ? { bio } : {}),
    ...(bio_hi !== undefined ? { bio_hi } : {}),
    ...(experience_years !== undefined ? { experience_years: Number(experience_years) } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(service_area !== undefined ? { service_area } : {}),
    ...(hourly_rate !== undefined ? { hourly_rate: Number(hourly_rate) } : {}),
    ...(daily_rate !== undefined ? { daily_rate: Number(daily_rate) } : {}),
    ...(availability_status !== undefined ? { availability_status } : {}),
    ...(is_public !== undefined ? { is_public: Boolean(is_public) } : {}),
    ...(agri_available !== undefined ? { agri_available: Boolean(agri_available) } : {}),
    ...(agri_activities !== undefined ? { agri_activities } : {}),
    ...(agri_service_radius !== undefined ? { agri_service_radius } : {}),
    ...(agri_available_from !== undefined ? { agri_available_from } : {}),
    ...(agri_available_until !== undefined ? { agri_available_until } : {}),
    ...(agri_schedule !== undefined ? { agri_schedule } : {}),
    ...(agri_expected_wage !== undefined ? { agri_expected_wage: Number(agri_expected_wage) } : {}),
    ...(agri_work_types !== undefined ? { agri_work_types } : {}),
  });

  if (Array.isArray(skills)) {
    db.setWorkerSkills(updatedProfile.id, skills);
  }

  res.json({ message: 'Profile updated', profile: updatedProfile });
});

// --- Jobs & Applications ---
app.get('/api/jobs', (req, res) => {
  const { search, category, city, work_type, pay_type, status } = req.query;
  const categories = db.getCategories();
  const profiles = db.getProfiles();
  const applications = db.getApplications();

  let jobs = db.getJobs();

  if (status && typeof status === 'string' && status !== 'all') {
    jobs = jobs.filter((j) => j.status === status);
  } else {
    // By default show open jobs
    jobs = jobs.filter((j) => j.status === 'open');
  }

  if (category && typeof category === 'string' && category !== 'all') {
    jobs = jobs.filter((j) => {
      const cat = categories.find((c) => c.id === j.category_id);
      return j.category_id === category || (cat && (cat.slug === category || cat.id === category));
    });
  }

  if (req.query.agri_activity && typeof req.query.agri_activity === 'string' && req.query.agri_activity !== 'all') {
    jobs = jobs.filter((j) => j.agri_activity === req.query.agri_activity);
  }

  if (city && typeof city === 'string' && city !== 'all') {
    jobs = jobs.filter((j) => j.location_city.toLowerCase() === city.toLowerCase());
  }

  if (work_type && typeof work_type === 'string' && work_type !== 'all') {
    jobs = jobs.filter((j) => j.work_type === work_type);
  }

  if (pay_type && typeof pay_type === 'string' && pay_type !== 'all') {
    jobs = jobs.filter((j) => j.pay_type === pay_type);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    jobs = jobs.filter((j) => {
      const cat = categories.find((c) => c.id === j.category_id);
      return (
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.location_city.toLowerCase().includes(q) ||
        j.service_area.toLowerCase().includes(q) ||
        (cat && cat.name.toLowerCase().includes(q))
      );
    });
  }

  const enriched = jobs.map((j) => {
    const cat = categories.find((c) => c.id === j.category_id);
    const poster = profiles.find((p) => p.id === j.customer_id);
    const appsCount = applications.filter((a) => a.job_id === j.id).length;
    return {
      ...j,
      category_name: cat ? cat.name : 'General',
      category_name_hi: cat ? cat.name_hi : 'सामान्य',
      category_icon: cat ? cat.icon : 'Wrench',
      posted_by: poster ? poster.full_name : 'Customer',
      applications_count: appsCount,
    };
  });

  res.json(enriched);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }

  const cat = db.getCategories().find((c) => c.id === job.category_id);
  const poster = db.getProfileById(job.customer_id);
  const applications = db.getApplications().filter((a) => a.job_id === job.id);

  res.json({
    ...job,
    category_name: cat ? cat.name : 'General',
    category_name_hi: cat ? cat.name_hi : 'सामान्य',
    category_icon: cat ? cat.icon : 'Wrench',
    posted_by: poster ? poster.full_name : 'Customer',
    applications_count: applications.length,
  });
});

app.post('/api/jobs', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const parseResult = JobCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getZodErrorMessage(parseResult.error) });
  }

  const job = db.createJob({
    ...parseResult.data,
    customer_id: req.user!.id,
    status: 'open',
  });

  res.status(201).json({ message: 'Job posted successfully', job });
});

app.patch('/api/jobs/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.customer_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to modify this job listing.' });
  }

  const updated = db.updateJob(job.id, req.body);
  res.json({ message: 'Job updated', job: updated });
});

app.delete('/api/jobs/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.customer_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this job listing.' });
  }

  if (req.user!.role === 'admin') {
    db.logAdminAction(req.user!.id, 'DELETE_JOB', 'JOB', job.id, `Job '${job.title}' deleted by admin moderation.`);
  }

  db.deleteJob(job.id);
  res.json({ message: 'Job removed successfully' });
});

// --- Job Applications ---
app.post('/api/jobs/:id/applications', requireAuth, requireRole('worker'), (req: AuthenticatedRequest, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }

  if (job.status !== 'open') {
    return res.status(400).json({ error: 'This job is no longer accepting applications.' });
  }

  // Prevent duplicate application
  const existingApp = db.getApplication(job.id, req.user!.id);
  if (existingApp) {
    return res.status(409).json({ error: 'You have already applied for this job opportunity.' });
  }

  const parseResult = ApplicationCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getZodErrorMessage(parseResult.error) });
  }

  const application = db.createApplication({
    job_id: job.id,
    worker_id: req.user!.id,
    cover_message: parseResult.data.cover_message,
    proposed_rate: parseResult.data.proposed_rate,
    status: 'pending',
  });

  res.status(201).json({ message: 'Application submitted successfully', application });
});

app.get('/api/my/applications', requireAuth, (req: AuthenticatedRequest, res) => {
  const allApps = db.getApplications();
  const allJobs = db.getJobs();
  const allProfiles = db.getProfiles();
  const categories = db.getCategories();

  if (req.user!.role === 'worker') {
    const workerApps = allApps.filter((a) => a.worker_id === req.user!.id);
    const enriched = workerApps.map((a) => {
      const job = allJobs.find((j) => j.id === a.job_id);
      const cat = job ? categories.find((c) => c.id === job.category_id) : null;
      return {
        ...a,
        job_title: job ? job.title : 'Deleted Job',
        job_city: job ? job.location_city : '',
        job_area: job ? job.service_area : '',
        job_budget: job ? `${job.budget_min || 0} - ${job.budget_max || 0}` : '',
        pay_type: job ? job.pay_type : 'fixed',
        category_name: cat ? cat.name : '',
        category_name_hi: cat ? cat.name_hi : '',
      };
    });
    return res.json(enriched);
  } else if (req.user!.role === 'customer') {
    // For customers, return applications for jobs they created
    const myJobIds = allJobs.filter((j) => j.customer_id === req.user!.id).map((j) => j.id);
    const jobApps = allApps.filter((a) => myJobIds.includes(a.job_id));

    const enriched = jobApps.map((a) => {
      const job = allJobs.find((j) => j.id === a.job_id);
      const worker = allProfiles.find((p) => p.id === a.worker_id);
      const workerProfile = db.getWorkerProfileByProfileId(a.worker_id);
      return {
        ...a,
        job_title: job ? job.title : '',
        worker_name: worker ? worker.full_name : 'Worker',
        worker_phone: worker ? worker.phone : '',
        worker_rating: workerProfile ? workerProfile.rating : 5.0,
        worker_experience: workerProfile ? workerProfile.experience_years : 1,
        worker_city: workerProfile ? workerProfile.city : '',
      };
    });
    return res.json(enriched);
  }

  res.json([]);
});

app.patch('/api/applications/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  if (!['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid application status.' });
  }

  const apps = db.getApplications();
  const appItem = apps.find((a) => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const job = db.getJobById(appItem.job_id);
  if (!job) {
    return res.status(404).json({ error: 'Associated job not found.' });
  }

  // Only the customer who posted the job or an admin can update status
  if (job.customer_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to review this application.' });
  }

  const updated = db.updateApplication(appItem.id, { status });
  res.json({ message: 'Application status updated', application: updated });
});

// --- Service Enquiries ---
app.post('/api/enquiries', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const parseResult = EnquiryCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getZodErrorMessage(parseResult.error) });
  }

  const { worker_id, category_id, description, preferred_schedule } = parseResult.data;

  // Verify worker exists
  const workerProfile = db.getWorkerProfileById(worker_id) || db.getWorkerProfileByProfileId(worker_id);
  if (!workerProfile) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  const enquiry = db.createEnquiry({
    customer_id: req.user!.id,
    worker_id: workerProfile.profile_id,
    category_id: category_id || undefined,
    description,
    preferred_schedule,
    status: 'pending',
  });

  res.status(201).json({ message: 'Enquiry sent successfully to worker', enquiry });
});

app.get('/api/my/enquiries', requireAuth, (req: AuthenticatedRequest, res) => {
  const allEnquiries = db.getEnquiries();
  const profiles = db.getProfiles();
  const categories = db.getCategories();

  let relevant: any[] = [];

  if (req.user!.role === 'worker') {
    relevant = allEnquiries.filter((e) => e.worker_id === req.user!.id);
  } else if (req.user!.role === 'customer') {
    relevant = allEnquiries.filter((e) => e.customer_id === req.user!.id);
  } else if (req.user!.role === 'admin') {
    relevant = allEnquiries;
  }

  const enriched = relevant.map((e) => {
    const cust = profiles.find((p) => p.id === e.customer_id);
    const worker = profiles.find((p) => p.id === e.worker_id);
    const cat = categories.find((c) => c.id === e.category_id);
    return {
      ...e,
      customer_name: cust ? cust.full_name : 'Customer',
      customer_phone: cust ? cust.phone : '',
      worker_name: worker ? worker.full_name : 'Worker',
      worker_phone: worker ? worker.phone : '',
      category_name: cat ? cat.name : 'General',
      category_name_hi: cat ? cat.name_hi : 'सामान्य',
    };
  });

  res.json(enriched);
});

app.patch('/api/enquiries/:id/respond', requireAuth, requireRole('worker', 'admin'), (req: AuthenticatedRequest, res) => {
  const { status, response_message } = req.body;
  if (!['responded', 'accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status response.' });
  }

  const all = db.getEnquiries();
  const enquiry = all.find((e) => e.id === req.params.id);
  if (!enquiry) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  if (enquiry.worker_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to respond to this enquiry.' });
  }

  const updated = db.updateEnquiry(enquiry.id, {
    status,
    response_message: response_message || '',
  });

  res.json({ message: 'Enquiry updated', enquiry: updated });
});

// --- Saved Workers ---
app.post('/api/saved-workers', requireAuth, requireRole('customer'), (req: AuthenticatedRequest, res) => {
  const { worker_id } = req.body;
  if (!worker_id) {
    return res.status(400).json({ error: 'Worker ID is required.' });
  }

  const workerProfile = db.getWorkerProfileById(worker_id) || db.getWorkerProfileByProfileId(worker_id);
  if (!workerProfile) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  const saved = db.saveWorker(req.user!.id, workerProfile.profile_id);
  res.status(201).json({ message: 'Worker saved to shortlist', saved });
});

app.delete('/api/saved-workers/:workerId', requireAuth, requireRole('customer'), (req: AuthenticatedRequest, res) => {
  const targetId = req.params.workerId;
  const workerProfile = db.getWorkerProfileById(targetId) || db.getWorkerProfileByProfileId(targetId);
  const profileId = workerProfile ? workerProfile.profile_id : targetId;

  db.unsaveWorker(req.user!.id, profileId);
  res.json({ message: 'Worker removed from saved list' });
});

app.get('/api/saved-workers', requireAuth, requireRole('customer'), (req: AuthenticatedRequest, res) => {
  const saved = db.getSavedWorkers(req.user!.id);
  const workerProfiles = db.getWorkerProfiles();
  const profiles = db.getProfiles();
  const categories = db.getCategories();
  const allSkills = db.getWorkerSkills();

  const list = saved
    .map((s) => {
      const wp = workerProfiles.find((w) => w.profile_id === s.worker_id);
      if (!wp) return null;
      const user = profiles.find((p) => p.id === wp.profile_id);
      if (!user) return null;
      const skills = allSkills.filter((sk) => sk.worker_profile_id === wp.id);
      return {
        saved_id: s.id,
        saved_at: s.created_at,
        id: wp.id,
        profile_id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        bio: wp.bio,
        experience_years: wp.experience_years,
        city: wp.city,
        service_area: wp.service_area,
        hourly_rate: wp.hourly_rate,
        daily_rate: wp.daily_rate,
        availability_status: wp.availability_status,
        rating: wp.rating,
        skills: skills.map((sk) => {
          const cat = categories.find((c) => c.id === sk.category_id);
          return {
            skill_name: sk.skill_name,
            category_name: cat ? cat.name : '',
            icon: cat ? cat.icon : 'Wrench',
          };
        }),
      };
    })
    .filter(Boolean);

  res.json(list);
});

// --- Admin Endpoints ---
app.get('/api/admin/stats', requireAuth, requireRole('admin'), (req, res) => {
  const profiles = db.getProfiles();
  const workers = db.getWorkerProfiles();
  const jobs = db.getJobs();
  const applications = db.getApplications();
  const enquiries = db.getEnquiries();

  res.json({
    total_users: profiles.length,
    total_customers: profiles.filter((p) => p.role === 'customer').length,
    total_workers: workers.length,
    active_workers: workers.filter((w) => w.availability_status === 'available').length,
    total_jobs: jobs.length,
    open_jobs: jobs.filter((j) => j.status === 'open').length,
    total_applications: applications.length,
    total_enquiries: enquiries.length,
  });
});

app.get('/api/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  const profiles = db.getProfiles().map((p) => {
    const { password_hash, ...safe } = p;
    const wp = p.role === 'worker' ? db.getWorkerProfileByProfileId(p.id) : null;
    return {
      ...safe,
      worker_details: wp
        ? {
            city: wp.city,
            experience_years: wp.experience_years,
            rating: wp.rating,
            availability: wp.availability_status,
          }
        : null,
    };
  });
  res.json(profiles);
});

app.patch('/api/admin/users/:id/status', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active boolean required.' });
  }

  const updated = db.updateProfile(req.params.id, { is_active });
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.logAdminAction(
    req.user!.id,
    is_active ? 'ACTIVATE_USER' : 'SUSPEND_USER',
    'USER',
    req.params.id,
    `Admin changed user ${updated.email} active status to ${is_active}`
  );

  res.json({ message: 'User status updated', user: updated });
});

app.post('/api/admin/categories', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { name, name_hi, slug, icon, description, description_hi } = req.body;
  if (!name || !name_hi || !slug) {
    return res.status(400).json({ error: 'Name, Hindi Name, and Slug are required.' });
  }

  const cat = db.createCategory({
    name,
    name_hi,
    slug: slug.toLowerCase().replace(/\s+/g, '-'),
    icon: icon || 'Wrench',
    description: description || '',
    description_hi: description_hi || '',
    is_active: true,
    display_order: db.getCategories().length + 1,
  });

  db.logAdminAction(req.user!.id, 'CREATE_CATEGORY', 'CATEGORY', cat.id, `Created service category '${name}'`);
  res.status(201).json({ message: 'Category created', category: cat });
});

app.patch('/api/admin/categories/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Category not found.' });
  }
  db.logAdminAction(req.user!.id, 'UPDATE_CATEGORY', 'CATEGORY', req.params.id, `Updated category ${updated.name}`);
  res.json({ message: 'Category updated', category: updated });
});

app.get('/api/admin/audit-logs', requireAuth, requireRole('admin'), (req, res) => {
  const logs = db.getAuditLogs();
  const profiles = db.getProfiles();
  const enriched = logs.map((l) => {
    const admin = profiles.find((p) => p.id === l.admin_id);
    return {
      ...l,
      admin_name: admin ? admin.full_name : 'Admin',
    };
  });
  res.json(enriched);
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JobBond Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
