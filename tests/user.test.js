// tests/user.test.js
const request = require('supertest');
const fs = require('fs');
const { TEST_DB_PATH } = require('./setupTestDB');
const app = require('../server');
const { db, User } = require('../database/setup');

let adminToken;
let userToken;
let userId;

beforeAll(async () => {
  await db.sync({ force: true });

  // Create admin
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: await require('bcryptjs').hash('adminpw', 10),
    role: 'admin'
  });

  // Login admin
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'adminpw' });

  adminToken = adminLogin.body.token;

  // Register user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email: 'user@test.com', password: 'userpw' });

  userId = userRes.body.id;

  // Login user
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'userpw' });

  userToken = userLogin.body.token;
});

afterAll(async () => {
  await db.close();
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
});

describe('Users API', () => {
  test('Admin can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('User cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  test('User can view self', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
  });

  test('User cannot delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
