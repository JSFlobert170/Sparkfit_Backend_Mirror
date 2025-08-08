const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const saltRounds = 10;
const { userMetrics } = require('../metrics');

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
}

exports.register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    user_type,
    phone,
    profile_picture,
    profile,
  } = req.body;

  if (!username || !password || (!email && !phone)) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required fields',
    });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUserByEmail) {
        return res.status(409).json({
          status: 409,
          message: 'email already exists',
          data: email,
        });
      }
    }

    const existingUserName = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUserName) {
      return res.status(409).json({
        status: 409,
        message: 'username already exists',
      });
    }

    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: phone },
      });

      if (existingUserByPhone) {
        return res.status(409).json({
          status: 409,
          message: 'phone number already exists',
          data: phone,
        });
      }
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        password: await hashPassword(password),
        phone: phone || null,
        user_type: user_type || 'user',
        profile_picture: profile_picture || null,
        profile: {
          create: profile || {},
        },
      },
      include: {
        profile: true,
      },
    });

    // Retirer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = newUser;

    // Métriques d'inscription
    userMetrics.registrationCount.inc();

    return res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      data: userWithoutPassword,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Error during registration',
    });
  }
};
