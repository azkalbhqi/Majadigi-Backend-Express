import * as service from './auth.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIK_REGEX = /^\d{16}$/;

export const register = async (req, res) => {
  try {
    const { nik, email, name, password } = req.body;

    if (!nik || !email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'NIK, email, nama, dan password harus diisi'
      });
    }

    if (!NIK_REGEX.test(nik)) {
      return res.status(400).json({
        success: false,
        message: 'NIK harus terdiri dari 16 digit angka'
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal terdiri dari 6 karakter'
      });
    }

    const user = await service.registerUser({
      nik,
      email,
      name,
      password
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: user
    });
  } catch (error) {
    if (error.message.includes('sudah terdaftar')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'NIK/Email dan password harus diisi'
      });
    }

    const authData = await service.loginUser({
      identifier,
      password
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: authData
    });
  } catch (error) {
    if (error.message.includes('salah')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
