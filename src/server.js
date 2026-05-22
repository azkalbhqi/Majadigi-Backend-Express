import app from './app.js';
import prisma from './config/prisma.js';


const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Tes koneksi database
    await prisma.$connect();
    console.log('✔ Database connected successfully');

    // 2. Jalankan server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
        Majadigi Server is running on port ${PORT}
        Port: ${PORT}
        URL: http://localhost:${PORT}
        Network URL: http://0.0.0.0:${PORT}
      `);
    });
  } catch (error) {
    console.error('✖ Failed to start server:');
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();