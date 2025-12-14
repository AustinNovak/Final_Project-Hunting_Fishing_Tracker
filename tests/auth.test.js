// tests/auth.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db } = require('../database/setup');

let token;

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
});

describe('Auth API', () => {
  test('POST /api/auth/register - register user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Auth User',
        email: 'auth@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', 'auth@example.com');
  });

  test('POST /api/auth/login - login success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'auth@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'auth@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout - success', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/auth/logout - no token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});
