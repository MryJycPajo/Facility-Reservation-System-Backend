const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', async (req, res) => {
  try {

    console.log("LOGIN ROUTE HIT");
    console.log("REQUEST BODY:", req.body);
    
    const { user_name, password } = req.body;

    const user_name_clean = user_name.trim();
    const password_clean = password.trim();

    const [rows] = await db.query(
      'SELECT * FROM users WHERE TRIM(user_name) = ?',
      [user_name_clean]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rows[0];

    if (user.password.trim() !== password_clean) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.user_id,
        name: user.user_fullname,
        user_name: user.user_name,
        user_type: user.user_type
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;