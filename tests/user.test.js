// tests/user.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH, TEST_DB_FILENAME } = require('./setupTestDB');

// require server AFTER setting env in setupTestDB
const app = require('../server');
const { db } = require('../database/setup');

beforeAll(async () => {
  // ensure fresh DB
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
  // remove test DB file if present
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  } catch (e) {}
});

describe('Users API', () => {
  let createdId;

  test('POST /api/users - create user (valid)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'pw' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
    createdId = res.body.id;
  });

  test('GET /api/users - list users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/users/:id - get user with trips (not crash)', async () => {
    const res = await request(app).get(`/api/users/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toHaveProperty('name');
  });

  test('PUT /api/users/:id - update user', async () => {
    const res = await request(app).put(`/api/users/${createdId}`).send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });

  test('DELETE /api/users/:id - delete user', async () => {
    const res = await request(app).delete(`/api/users/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/users - missing fields returns 400', async () => {
    const res = await request(app).post('/api/users').send({ name: '' });
    expect(res.status).toBe(400);
  });
});
