// tests/trip.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db } = require('../database/setup');

beforeAll(async () => {
  await db.sync({ force: true });

  // create a user to attach trips to
  await request(app).post('/api/users').send({
    name: 'Trip User',
    email: 'tripuser@example.com'
  });
});

afterAll(async () => {
  await db.close();
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
});

describe('Trips API', () => {
  let userId;
  let tripId;

  test('find created user to use as owner', async () => {
    const users = await request(app).get('/api/users');
    const u = users.body.find(x => x.email === 'tripuser@example.com');
    expect(u).toBeDefined();
    userId = u.id;
  });

  test('POST /api/trips - create trip (valid)', async () => {
    const res = await request(app).post('/api/trips').send({
      date: '2025-01-01',
      location: 'Test Lake',
      type: 'fishing',
      weather: 'Calm',
      notes: 'Good day',
      gear: 'Rod A, Reel 1',
      userId
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    tripId = res.body.id;
  });

  test('GET /api/trips - list trips', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/trips/:id - get trip (with species empty array)', async () => {
    const res = await request(app).get(`/api/trips/${tripId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', tripId);
  });

  test('PUT /api/trips/:id - update trip', async () => {
    const res = await request(app).put(`/api/trips/${tripId}`).send({ notes: 'Updated notes' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notes', 'Updated notes');
  });

  test('DELETE /api/trips/:id - delete trip', async () => {
    const res = await request(app).delete(`/api/trips/${tripId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/trips - validation error when required fields missing', async () => {
    const res = await request(app).post('/api/trips').send({ location: 'X' });
    expect(res.status).toBe(400);
  });
});
