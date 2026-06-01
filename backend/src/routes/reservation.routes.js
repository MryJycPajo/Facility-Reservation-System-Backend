const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET ALL RESERVATIONS
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        r.reservation_id,
        r.control_number,
        u.user_fullname,
        f.fac_name,
        r.reservation_date,
        r.start_time,
        r.end_time,
        r.purpose,
        r.status,
        r.conflict_check,
        r.created_at
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN facilities f ON r.facility_id = f.fac_id
      ORDER BY r.created_at DESC
    `;

    const [results] = await db.query(sql);
    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// CREATE RESERVATION
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      facility_id,
      reservation_date,
      start_time,
      end_time,
      purpose
    } = req.body;

    // basic validation
    if (!user_id || !facility_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id or facility_id"
      });
    }

    const sql = `
      INSERT INTO reservations
      (user_id, facility_id, reservation_date, start_time, end_time, purpose)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      facility_id,
      reservation_date,
      start_time,
      end_time,
      purpose
    ]);

    // generate control number
    const controlNumber = `RES-${new Date().getFullYear()}-${String(result.insertId).padStart(4, '0')}`;

    await db.query(
      `UPDATE reservations SET control_number=? WHERE reservation_id=?`,
      [controlNumber, result.insertId]
    );

    res.json({
      success: true,
      reservation_id: result.insertId,
      control_number: controlNumber
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;