const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications
router.get('/', authenticateToken, notificationsController.getNotifications);

// Mark notification as read
router.put('/:id/read', authenticateToken, notificationsController.markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateToken, notificationsController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationsController.deleteNotification);

module.exports = router; 