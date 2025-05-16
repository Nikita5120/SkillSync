const db = require('../config/database');
const logger = require('../utils/logger');

// Get all skills for the authenticated user
exports.getUserSkills = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, us.proficiency_level 
       FROM skills s 
       JOIN user_skills us ON s.id = us.skill_id 
       WHERE us.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Error fetching skills' });
  }
};

// Add a new skill
exports.addSkill = async (req, res) => {
  const { name, proficiency } = req.body;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Check if skill already exists
    let skillResult = await client.query(
      'SELECT id FROM skills WHERE name = $1',
      [name]
    );

    let skillId;
    if (skillResult.rows.length === 0) {
      // Create new skill
      skillResult = await client.query(
        'INSERT INTO skills (name) VALUES ($1) RETURNING id',
        [name]
      );
      skillId = skillResult.rows[0].id;
    } else {
      skillId = skillResult.rows[0].id;
    }

    // Add user-skill relationship
    await client.query(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, skill_id) 
       DO UPDATE SET proficiency_level = $3`,
      [req.user.id, skillId, proficiency]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: skillId,
      name,
      proficiency_level: proficiency,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error adding skill:', error);
    res.status(500).json({ message: 'Error adding skill' });
  } finally {
    client.release();
  }
};

// Update a skill
exports.updateSkill = async (req, res) => {
  const { id } = req.params;
  const { proficiency } = req.body;

  try {
    const result = await db.query(
      `UPDATE user_skills 
       SET proficiency_level = $1 
       WHERE user_id = $2 AND skill_id = $3 
       RETURNING *`,
      [proficiency, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating skill:', error);
    res.status(500).json({ message: 'Error updating skill' });
  }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2 RETURNING *',
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    logger.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Error deleting skill' });
  }
};

// Search skills
exports.searchSkills = async (req, res) => {
  const { query } = req.query;

  try {
    const result = await db.query(
      `SELECT DISTINCT s.* 
       FROM skills s 
       LEFT JOIN user_skills us ON s.id = us.skill_id 
       WHERE s.name ILIKE $1 
       ORDER BY s.name`,
      [`%${query}%`]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error searching skills:', error);
    res.status(500).json({ message: 'Error searching skills' });
  }
}; 