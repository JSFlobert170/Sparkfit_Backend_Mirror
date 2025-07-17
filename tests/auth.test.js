const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password123!',
      user_type: 'user',
      profile: {
        age: 25,
        weight: 70,
        height: 175,
        fitness_goal: 'WEIGHT_LOSS'
      }
    };

    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.body.status).toBe(201);
      expect(res.body.data).toHaveProperty('user_id');
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data.profile).toMatchObject({
        age: validUser.profile.age,
        weight: validUser.profile.weight
      });
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com'
        });

      expect(res.body.status).toBe(400);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('should return 409 for existing username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.body.status).toBe(409);
      expect(res.body.message).toBe('username already exists');
    });

    it('should return 409 for existing username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          email: 'different@test.com'
        });

      expect(res.body.status).toBe(409);
      expect(res.body.message).toBe('username already exists');
    });
  });

//   describe('POST /api/auth/login', () => {
//     const validUser = {
//       username: 'testuser',
//       email: 'test@test.com',
//       password: 'Password123!',
//       user_type: 'user'
//     };

//     beforeEach(async () => {
//       await request(app)
//         .post('/api/auth/register')
//         .send(validUser);
//     });

//     it('should login with valid credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: validUser.email,
//           password: validUser.password
//         });

//       expect(res.body.status).toBe(200);
//       expect(res.body).toHaveProperty('token');
      
//       const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
//       expect(decoded).toHaveProperty('id');
//       expect(decoded).toHaveProperty('email', validUser.email);
//     });

//     it('should return 404 for non-existent user', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@test.com',
//           password: validUser.password
//         });

//       expect(res.body.status).toBe(404);
//       expect(res.body.message).toBe('User is not found');
//     });

//     it('should return 401 for incorrect password', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: validUser.email,
//           password: 'WrongPassword123!'
//         });

//       expect(res.body.status).toBe(401);
//       expect(res.body.message).toBe('Incorrect password');
//     });

//     it('should return 400 for missing credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: validUser.email
//         });

//       expect(res.body.status).toBe(400);
//       expect(res.body.message).toBe('Missing email or password');
//     });
//   });

//   describe('POST /api/auth/logout', () => {
//     let authToken;
//     const validUser = {
//       username: 'testuser',
//       email: 'test@test.com',
//       password: 'Password123!',
//       user_type: 'user'
//     };

//     beforeEach(async () => {
//       await request(app)
//         .post('/api/auth/register')
//         .send(validUser);

//       const loginRes = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: validUser.email,
//           password: validUser.password
//         });

//     //   authToken = loginRes.body.token;
//     });

//     it('should successfully logout', async () => {
//       const res = await request(app)
//         .post('/api/auth/logout')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(res.body.status).toBe(200);
//       expect(res.body.message).toBe('Logout successful');
//     });

//     it('should return 401 for invalid token', async () => {
//       const res = await request(app)
//         .post('/api/auth/logout')
//         .set('Authorization', 'Bearer invalid-token');

//       expect(res.body.status).toBe(401);
//     });
//   });
}); 