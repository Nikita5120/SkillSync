const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email
        `;
        const values = [name, email, hashedPassword];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async findById(id) {
        const query = 'SELECT id, name, email FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = User; 
