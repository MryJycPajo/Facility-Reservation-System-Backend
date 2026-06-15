const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT user_id, user_fullname, user_name, user_type 
       FROM users 
       WHERE user_name = ? AND password = ?`,
      [user_name, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = rows[0];

    return res.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.user_fullname,
        role: user.user_type
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ IMPORTANT: outside route
module.exports = router;