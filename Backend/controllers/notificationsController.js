const db = require('../config/database');
const logger = require('../utils/logger');

// Get all notifications for the authenticated user
exports.getNotifications = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Create notification (internal use)
exports.createNotification = async (userId, type, message) => {
  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, type, message) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, type, message]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
}; 