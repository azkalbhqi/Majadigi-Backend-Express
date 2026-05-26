import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Define mock functions so they can be controlled in tests
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: {
          findUnique: mockFindUnique,
          findFirst: mockFindFirst,
          create: mockCreate,
          update: mockUpdate,
        }
      };
    })
  };
});

jest.unstable_mockModule('../../src/config/prisma.js', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: mockFindUnique,
        findFirst: mockFindFirst,
        create: mockCreate,
        update: mockUpdate,
      }
    }
  };
});

// Dynamic imports after mock registrations
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const authUtils = await import('../../src/features/auth/auth.utils.js');

describe('Auth Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cryptographic & Token Utilities', () => {
    test('should hash and verify passwords using scrypt', () => {
      const password = 'mysecurepassword123';
      const hash = authUtils.hashPassword(password);
      expect(hash).toContain(':');
      expect(authUtils.verifyPassword(password, hash)).toBe(true);
      expect(authUtils.verifyPassword('wrongpassword', hash)).toBe(false);
    });

    test('should verify MD5 fallback passwords', () => {
      const md5Hash = '482c811da5d5b4bc6d497ffa98491e38';
      expect(authUtils.verifyPassword('password123', md5Hash)).toBe(true);
      expect(authUtils.verifyPassword('wrongpassword', md5Hash)).toBe(false);
    });

    test('should sign and verify JWT tokens', () => {
      const payload = { userId: '1234567890', role: 'PATIENT' };
      const token = authUtils.generateToken(payload);
      expect(token.split('.').length).toBe(3);

      const verified = authUtils.verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified.userId).toBe('1234567890');
      expect(verified.role).toBe('PATIENT');
    });

    test('should return null for invalid tokens', () => {
      expect(authUtils.verifyToken('invalid.token.here')).toBeNull();
    });
  });

  describe('Auth Routes (POST /auth/register, POST /auth/login, PATCH /auth/profile)', () => {
    test('POST /auth/register - success', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: '3201011234567890',
        name: 'Ahmad Dani',
        email: 'dani@example.com',
        role: 'PATIENT',
        imageUrl: null,
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          nik: '3201011234567890',
          email: 'dani@example.com',
          name: 'Ahmad Dani',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('dani@example.com');
    });

    test('POST /auth/register - already registered NIK', async () => {
      mockFindUnique.mockResolvedValue({ id: '3201011234567890' });

      const res = await request(app)
        .post('/auth/register')
        .send({
          nik: '3201011234567890',
          email: 'dani@example.com',
          name: 'Ahmad Dani',
          password: 'password123',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('POST /auth/login - success with email', async () => {
      const hashedPassword = authUtils.hashPassword('password123');
      mockFindFirst.mockResolvedValue({
        id: '3201011234567890',
        name: 'Ahmad Dani',
        email: 'dani@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        imageUrl: null,
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          identifier: 'dani@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /auth/login - failure', async () => {
      mockFindFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({
          identifier: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('PATCH /auth/profile - success', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockUpdate.mockResolvedValue({
        id: '3201011234567890',
        name: 'Ahmad Dani Updated',
        email: 'newdani@example.com',
        role: 'PATIENT',
        imageUrl: 'http://image.png',
      });

      const res = await request(app)
        .patch('/auth/profile')
        .send({
          userId: '3201011234567890',
          name: 'Ahmad Dani Updated',
          email: 'newdani@example.com',
          imageUrl: 'http://image.png',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Ahmad Dani Updated');
    });
  });
});
