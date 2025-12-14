// tests/species.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db } = require('../database/setup');

let token;
let otherToken;
let tripId;
let speciesId;

beforeAll(async () => {
  await db.sync({ force: true });

  // Owner
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Owner', email: 'owner@test.com', password: 'pw' });

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'owner@test.com', password: 'pw' });

  token = login.body.token;

  // Other user
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Other', email: 'other@test.com', password: 'pw' });

  const loginOther = await request(app)
    .post('/api/auth/login')
    .send({ email: 'other@test.com', password: 'pw' });

  otherToken = loginOther.body.token;

  const trip = await request(app)
    .post('/api/trips')
    .set('Authorization', `Bearer ${token}`)
    .send({
      date: '2025-07-01',
      location: 'Spec Lake',
      type: 'fishing'
    });

  tripId = trip.body.id;
});

afterAll(async () => {
  await db.close();
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  } catch (e) {}
});

describe('Species API', () => {
  test('Create species (authorized)', async () => {
    const res = await request(app)
      .post('/api/species')
      .set('Authorization', `Bearer ${token}`)
      .send({
        speciesName: 'Bass',
        tripId
      });

    expect(res.status).toBe(201);
    speciesId = res.body.id;
  });

  test('Other user cannot access species → 403', async () => {
    const res = await request(app)
      .get(`/api/species/${speciesId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  test('Get species list (authorized)', async () => {
    const res = await request(app)
      .get('/api/species')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ✅ NEW: search species by name
  test('Search species by name', async () => {
    const res = await request(app)
      .get('/api/species/search?name=Bass')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Delete species (owner)', async () => {
    const res = await request(app)
      .delete(`/api/species/${speciesId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('Access species without token → 401', async () => {
    const res = await request(app).get('/api/species');
    expect(res.status).toBe(401);
  });
});
