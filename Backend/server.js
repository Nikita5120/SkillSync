console.log('server.js starting...');

try {
  require('dotenv').config();
  const logger = require('./utils/logger');
  const express = require('express');
  const cors = require('cors');
  const morgan = require('morgan');
  const db = require('./config/database');

  // Import routes
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const skillsRoutes = require('./routes/skills');
  const notificationsRoutes = require('./routes/notifications');

  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }));
  app.use(express.json());
  app.use(morgan('dev'));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/notifications', notificationsRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

  // Initialize database and start server
  const PORT = process.env.PORT || 5000;

  // Error handling for uncaught exceptions
  process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
  });

  // Error handling for unhandled promise rejections
  process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      process.exit(1);
  });

  console.log('Starting server.js...');

  async function startServer() {
    try {
      await db.initialize();
      const server = app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
          logger.info('Process terminated');
        });
      });
    } catch (error) {
      console.error('Startup error:', error);
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();

} catch (err) {
  console.error('Fatal error at startup:', err);
}

// This code initializes the server and listens on a specified port, defaulting to 5000 if not provided.
// It also loads environment variables from a .env file.