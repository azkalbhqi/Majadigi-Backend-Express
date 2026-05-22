import prisma from '../../config/prisma.js';
import { hashPassword, verifyPassword, generateToken } from './auth.utils.js';

/**
 * Registers a new user with NIK as the primary ID.
 */
export const registerUser = async ({ nik, email, name, password }) => {
  // Check if NIK already registered
  const existingByNik = await prisma.user.findUnique({
    where: { id: nik }
  });
  if (existingByNik) {
    throw new Error('NIK sudah terdaftar');
  }

  // Check if email already registered
  const existingByEmail = await prisma.user.findUnique({
    where: { email }
  });
  if (existingByEmail) {
    throw new Error('Email sudah terdaftar');
  }

  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      id: nik, // NIK is the id
      name,
      email,
      password: hashedPassword,
      role: 'PATIENT'
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Logs in a user using NIK (id) or Email.
 */
export const loginUser = async ({ identifier, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: identifier },
        { email: identifier }
      ]
    }
  });

  if (!user) {
    throw new Error('NIK/Email atau password salah');
  }

  const isPasswordValid = verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('NIK/Email atau password salah');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};
