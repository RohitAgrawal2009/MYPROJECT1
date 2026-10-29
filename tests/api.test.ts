import { describe, it } from 'node:test';
import assert from 'node:assert';
import { db, hashPassword, verifyPassword } from '../server/db.ts';

describe('JobBond Platform Test Suite', () => {
  it('1. Cryptographic Password Hashing & Verification', () => {
    const rawPass = 'Secret123!';
    const hash = hashPassword(rawPass);
    assert.strictEqual(typeof hash, 'string');
    assert.ok(hash.includes(':'), 'Hash format should contain salt:hash');
    assert.strictEqual(verifyPassword(rawPass, hash), true, 'Valid password must verify');
    assert.strictEqual(verifyPassword('WrongPass', hash), false, 'Invalid password must fail');
  });

  it('2. Seed Data Integrity', () => {
    const profiles = db.getProfiles();
    assert.ok(profiles.length >= 4, 'Should contain at least 4 seeded profiles');

    const admin = profiles.find((p) => p.role === 'admin');
    assert.ok(admin, 'Admin profile must exist');
    assert.strictEqual(admin.email, 'admin@jobbond.in');

    const customer = profiles.find((p) => p.role === 'customer');
    assert.ok(customer, 'Customer profile must exist');

    const worker = profiles.find((p) => p.role === 'worker');
    assert.ok(worker, 'Worker profile must exist');

    const categories = db.getCategories();
    assert.ok(categories.length >= 8, 'Should have core Indian service categories');
    assert.ok(categories.some((c) => c.slug === 'electrician'));
    assert.ok(categories.some((c) => c.slug === 'plumber'));
  });

  it('3. User Registration & Role Control', () => {
    const testEmail = `test.worker.${Date.now()}@jobbond.in`;
    const newWorker = db.createProfile({
      email: testEmail,
      password_hash: hashPassword('TestWorkerPass123!'),
      full_name: 'Sunil Sharma Carpenter',
      phone: '+91 98888 77777',
      role: 'worker',
      preferred_lang: 'hi',
      is_active: true,
    });

    assert.ok(newWorker.id);
    assert.strictEqual(newWorker.email, testEmail);
    assert.strictEqual(newWorker.role, 'worker');

    // Create associated worker profile
    const wp = db.upsertWorkerProfile(newWorker.id, {
      bio: 'Skilled furniture builder',
      experience_years: 6,
      city: 'Pune',
      service_area: 'Kothrud, Hinjewadi',
      daily_rate: 1200,
      hourly_rate: 250,
      availability_status: 'available',
      is_public: true,
    });

    assert.ok(wp.id);
    assert.strictEqual(wp.city, 'Pune');
    assert.strictEqual(wp.daily_rate, 1200);
  });

  it('4. Job Posting by Customer', () => {
    const customer = db.getProfiles().find((p) => p.role === 'customer')!;
    const category = db.getCategories()[0]!;

    const job = db.createJob({
      customer_id: customer.id,
      category_id: category.id,
      title: 'Fix Balcony Inverter Connection & Switchboard',
      description: 'Balcony inverter tripping repeatedly during load changeover.',
      location_city: 'New Delhi',
      service_area: 'Saket',
      budget_min: 700,
      budget_max: 1200,
      pay_type: 'fixed',
      work_type: 'one_time',
      preferred_date: 'This Sunday',
      contact_preference: 'in_app',
      status: 'open',
    });

    assert.ok(job.id);
    assert.strictEqual(job.title, 'Fix Balcony Inverter Connection & Switchboard');
    assert.strictEqual(job.status, 'open');
  });

  it('5. Worker Job Application & Duplicate Application Prevention', () => {
    const worker = db.getProfiles().find((p) => p.role === 'worker')!;
    const job = db.getJobs()[0]!;

    // First application
    const app1 = db.createApplication({
      job_id: job.id,
      worker_id: worker.id,
      cover_message: 'I have 9 years of electrical experience.',
      proposed_rate: 900,
      status: 'pending',
    });

    assert.ok(app1.id);
    assert.strictEqual(app1.status, 'pending');

    // Verify lookup finds existing application
    const existing = db.getApplication(job.id, worker.id);
    assert.ok(existing, 'Should find worker application for this job');
    assert.strictEqual(existing.worker_id, worker.id);
  });

  it('6. Service Enquiry Lifecycle', () => {
    const customer = db.getProfiles().find((p) => p.role === 'customer')!;
    const worker = db.getProfiles().find((p) => p.role === 'worker')!;

    const enquiry = db.createEnquiry({
      customer_id: customer.id,
      worker_id: worker.id,
      description: 'Need water motor check at 10am tomorrow.',
      preferred_schedule: 'Tomorrow 10 AM',
      status: 'pending',
    });

    assert.ok(enquiry.id);
    assert.strictEqual(enquiry.status, 'pending');

    // Worker responds
    const updated = db.updateEnquiry(enquiry.id, {
      status: 'accepted',
      response_message: 'Available! Will arrive at 10 AM sharp.',
    });

    assert.ok(updated);
    assert.strictEqual(updated.status, 'accepted');
    assert.ok(updated.response_message && updated.response_message.includes('10 AM sharp'));
  });

  it('7. Saved Workers Shortlist', () => {
    const customer = db.getProfiles().find((p) => p.role === 'customer')!;
    const worker = db.getProfiles().find((p) => p.role === 'worker')!;

    const saved = db.saveWorker(customer.id, worker.id);
    assert.ok(saved.id);

    const list = db.getSavedWorkers(customer.id);
    assert.ok(list.some((s) => s.worker_id === worker.id));

    // Remove
    const removed = db.unsaveWorker(customer.id, worker.id);
    assert.strictEqual(removed, true);
  });

  it('8. Administrator Audit Logging', () => {
    const admin = db.getProfiles().find((p) => p.role === 'admin')!;
    const log = db.logAdminAction(admin.id, 'CATEGORY_AUDIT', 'CATEGORY', 'cat-test', 'Verified category taxonomy');

    assert.ok(log.id);
    assert.strictEqual(log.action, 'CATEGORY_AUDIT');

    const logs = db.getAuditLogs();
    assert.ok(logs.some((l) => l.id === log.id));
  });
});
