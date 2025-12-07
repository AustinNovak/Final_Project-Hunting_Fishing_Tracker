// tests/species.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db } = require('../database/setup');

beforeAll(async () => {
  await db.sync({ force: true });

  // create user and trip to attach species to
  const u = await request(app).post('/api/users').send({ name: 'Spec User', email: 'specuser@example.com' });
  const users = await request(app).get('/api/users');
  const user = users.body.find(x => x.email === 'specuser@example.com');
  await request(app).post('/api/trips').send({
    date: '2025-07-01',
    location: 'Spec Lake',
    type: 'fishing',
    userId: user.id
  });
});

afterAll(async () => {
  await db.close();
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
});

describe('Species API', () => {
  let tripId, speciesId;

  test('find created trip', async () => {
    const trips = await request(app).get('/api/trips');
    const t = trips.body.find(tr => tr.location === 'Spec Lake');
    expect(t).toBeDefined();
    tripId = t.id;
  });

  test('POST /api/species - create species linked to trip', async () => {
    const res = await request(app).post('/api/species').send({
      speciesName: 'Largemouth Bass',
      quantity: 2,
      measurement: '1.5 lbs, 2.0 lbs',
      notes: 'near weedlines',
      tripId
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    speciesId = res.body.id;
  });

  test('GET /api/species - list species', async () => {
    const res = await request(app).get('/api/species');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/species/:id - fetch single', async () => {
    const res = await request(app).get(`/api/species/${speciesId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('speciesName', 'Largemouth Bass');
  });

  test('PUT /api/species/:id - update', async () => {
    const res = await request(app).put(`/api/species/${speciesId}`).send({ notes: 'updated note' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notes', 'updated note');
  });

  test('DELETE /api/species/:id - delete', async () => {
    const res = await request(app).delete(`/api/species/${speciesId}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/species - bad tripId returns 400', async () => {
    const res = await request(app).post('/api/species').send({ speciesName: 'X', tripId: 9999 });
    expect(res.status).toBe(400);
  });
});
