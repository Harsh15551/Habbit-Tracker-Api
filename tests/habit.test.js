require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Habit = require('../src/models/Habit');
const CompletionLog = require('../src/models/CompletionLog');

let token;
let habitId;

beforeAll(async () => {
  // Use MONGODB_URI or fallback to local test database
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit_tracker_test';
  
  // Connect to DB if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  // Clear test users, habits, and logs
  // We use distinct names/emails to prevent clashing with actual users
  await User.deleteMany({ email: 'tester_integration@example.com' });
});

afterAll(async () => {
  // Clean up created records
  if (habitId) {
    await CompletionLog.deleteMany({ habit: habitId });
    await Habit.deleteOne({ _id: habitId });
  }
  await User.deleteOne({ email: 'tester_integration@example.com' });

  // Close connection
  await mongoose.connection.close();
});

describe('Habits Integration API Tests', () => {
  it('1. should register a new test user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Integration Tester',
        email: 'tester_integration@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('2. should login successfully with registered credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'tester_integration@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('3. should create a habit for the logged-in user', async () => {
    const res = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Morning Meditation',
        description: '10 minutes mindfulness meditation',
        frequency: 'daily',
        tags: ['health', 'mind'],
        reminderTime: '07:30'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.habit).toHaveProperty('_id');
    habitId = res.body.data.habit._id;
  });

  it('4. should get all habits for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/v1/habits')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.habits.length).toBeGreaterThan(0);
  });

  it('5. should track the habit for today', async () => {
    const res = await request(app)
      .post(`/api/v1/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.streaks.currentStreak).toBe(1);
  });

  it('6. should reject duplicate tracking on the same day', async () => {
    const res = await request(app)
      .post(`/api/v1/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('already marked as completed');
  });

  it('7. should fetch completion history', async () => {
    const res = await request(app)
      .get(`/api/v1/habits/${habitId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.streaks.currentStreak).toBe(1);
    expect(res.body.data.recentLogs.length).toBe(1);
  });
});
