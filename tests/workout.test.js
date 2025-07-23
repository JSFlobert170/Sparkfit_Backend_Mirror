const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Workout Routes', () => {
  let userToken;
  let adminToken;
  let testUserId;
  let testWorkoutId;
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    try {
      // Nettoyer la base de données avant les tests
      await prisma.$transaction([
        prisma.Workout_Detail.deleteMany(),
        prisma.Workout.deleteMany(),
        prisma.Exercise.deleteMany(),
        prisma.Profile.deleteMany(),
        prisma.User.deleteMany(),
      ]);

      // Créer les données de test dans une transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Créer un utilisateur de test
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = await prisma.User.create({
          data: {
            username: 'testuser_workout',
            email: 'test_workout@test.com',
            password: hashedPassword,
            user_type: 'user',
          },
        });
        console.log('Created test user with ID:', user.user_id);

        // Créer un admin de test
        const admin = await prisma.User.create({
          data: {
            username: 'testadmin_workout',
            email: 'admin_workout@test.com',
            password: hashedPassword,
            user_type: 'admin',
          },
        });

        // Créer un workout de test
        const workout = await prisma.Workout.create({
          data: {
            user_id: user.user_id,
            name: 'Initial Test Workout',
            date: new Date(),
            duration: 60,
            calories_burned: 300,
          },
        });
        console.log('Created test workout with ID:', workout.workout_id);

        return { user, admin, workout };
      });

      // Stocker les résultats
      testUser = result.user;
      testAdmin = result.admin;
      testUserId = testUser.user_id;
      testWorkoutId = result.workout.workout_id;

      // Générer les tokens avec le même format que le contrôleur de login
      userToken = jwt.sign(
        {
          id: testUser.user_id,
          admin: false,
          email: testUser.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '365d' }
      );
      adminToken = jwt.sign(
        {
          id: testAdmin.user_id,
          admin: true,
          email: testAdmin.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '365d' }
      );

      console.log('Generated user token with ID:', testUser.user_id);
      console.log('Generated admin token with ID:', testAdmin.user_id);
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Nettoyer la base de données
      await prisma.$transaction([
        prisma.Workout_Detail.deleteMany(),
        prisma.Workout.deleteMany(),
        prisma.Exercise.deleteMany(),
        prisma.Profile.deleteMany(),
        prisma.User.deleteMany(),
      ]);
      await prisma.$disconnect();
    } catch (error) {
      console.error('Cleanup error:', error);
      throw error;
    }
  });

  describe('POST /api/workouts', () => {
    const workoutData = {
      name: 'Test Workout',
      date: new Date().toISOString(),
      duration: 60,
      calories_burned: 300,
      details: [
        {
          sets: 3,
          reps: 12,
          weight: 50,
          exercise: {
            name: 'Push-ups',
            description: 'Basic push-ups',
            goal_type: 'STRENGTH',
          },
        },
      ],
    };

    test('should create a new workout', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(workoutData);

      console.log('Create workout response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty('workout_id');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .send(workoutData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workouts', () => {
    test('should get all workouts as admin', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    test('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Only admin can access');
    });
  });

  describe('GET /api/workouts/userWorkouts', () => {
    test('should get user workouts', async () => {
      const response = await request(app)
        .get('/api/workouts/userWorkouts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/workouts/:id', () => {
    test('should get workout by id', async () => {
      console.log('Getting workout with ID:', testWorkoutId);
      const response = await request(app)
        .get(`/api/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${userToken}`);

      console.log('Get workout response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('workout_id', testWorkoutId);
    });

    test('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .get('/api/workouts/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workout not found');
    });
  });

  describe('PUT /api/workouts/:id', () => {
    const updateData = {
      name: 'Updated Workout',
      duration: 45,
      calories_burned: 250,
    };

    test('should update workout', async () => {
      console.log('Updating workout with ID:', testWorkoutId);
      const response = await request(app)
        .put(`/api/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      console.log('Update workout response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });

    test('should fail for non-existent workout', async () => {
      const response = await request(app)
        .put('/api/workouts/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    test('should delete workout', async () => {
      console.log('Deleting workout with ID:', testWorkoutId);
      const response = await request(app)
        .delete(`/api/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    test('should fail for non-existent workout', async () => {
      const response = await request(app)
        .delete('/api/workouts/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });
});
