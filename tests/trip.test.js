// tests/trip.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db } = require('../database/setup');

let token;
let otherToken;
let tripId;

beforeAll(async () => {
  await db.sync({ force: true });

  // User A
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'User A', email: 'a@test.com', password: 'pw' });

  const loginA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'a@test.com', password: 'pw' });

  token = loginA.body.token;

  // User B
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'User B', email: 'b@test.com', password: 'pw' });

  const loginB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'b@test.com', password: 'pw' });

  otherToken = loginB.body.token;
});

afterAll(async () => {
  await db.close();
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  } catch (e) {}
});

describe('Trips API', () => {
  test('Create trip (authorized)', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2025-01-01',
        location: 'Test Lake',
        type: 'fishing'
      });

    expect(res.status).toBe(201);
    tripId = res.body.id;
  });

  test('Get trips (authorized)', async () => {
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ✅ NEW: search trips by type
  test('Search trips by type', async () => {
    const res = await request(app)
      .get('/api/trips/search?type=fishing')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ✅ NEW: search trips by date range
  test('Search trips by date range', async () => {
    const res = await request(app)
      .get('/api/trips/search?startDate=2024-01-01&endDate=2026-01-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('Access trip owned by another user → 403', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  test('Access trips without token → 401', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(401);
  });

  test('Delete trip (owner)', async () => {
    const res = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
