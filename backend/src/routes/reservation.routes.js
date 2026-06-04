const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ===============================
// 🔧 DATE NORMALIZER (IMPORTANT FIX)
// ===============================
function normalizeDate(dateStr) {
  if (!dateStr) return null;

  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const d = new Date(dateStr);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// ===============================
// GET ALL RESERVATIONS
// ===============================
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(`
  SELECT
    res_id,
    timestamp,
    res_fullname,
    contact,
    res_facility,
    purpose,
    DATE_FORMAT(date_of_use, '%Y-%m-%d') AS date_of_use,
    start_time,
    end_time,
    status,
    control_number
  FROM reservations
  ORDER BY timestamp DESC
`);

    res.json(results);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get('/dashboard/pending-count', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM reservations
      WHERE LOWER(TRIM(status)) = 'pending'
    `);

    res.json({
      count: rows[0].count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ count: 0 });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'Pending') AS pending,
        SUM(status = 'Approved for Payment') AS approvedforpayment,
        SUM(status = 'Confirmed') AS confirmed
      FROM reservations
    `);

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get('/recent-confirmed', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM reservations
      WHERE LOWER(status) = 'confirmed'
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reservations WHERE res_id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.post('/', async (req, res) => {
  try {

    const today = new Date();
    const datePrefix =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const {
      res_fullname,
      contact,
      res_facility,
      purpose,
      date_of_use,
      start_time,
      end_time
    } = req.body;

    const safeDate = normalizeDate(date_of_use);

    // CONFLICT CHECK
    const [conflicts] = await db.query(`
      SELECT *
      FROM reservations
      WHERE res_facility = ?
      AND date_of_use = ?
      AND status != 'cancelled'
      AND NOT (end_time <= ? OR start_time >= ?)
    `, [
      res_facility,
      safeDate,
      end_time,
      start_time
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: "Time slot already taken"
      });
    }

    // INSERT
    const [result] = await db.query(`
      INSERT INTO reservations
      (res_fullname, contact, res_facility, purpose, date_of_use, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      res_fullname,
      contact,
      res_facility,
      purpose,
      safeDate,
      start_time,
      end_time
    ]);

    // CONTROL NUMBER
    const controlNumber =
      `${datePrefix}-${String(result.insertId).padStart(4, '0')}`;

    await db.query(
      `UPDATE reservations SET control_number = ? WHERE res_id = ?`,
      [controlNumber, result.insertId]
    );

    res.json({
      success: true,
      res_id: result.insertId,
      control_number: controlNumber
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ===============================
// UPDATE RESERVATION (FIXED)
// ===============================
router.put('/:id', async (req, res) => {
  try {

    const {
      res_fullname,
      contact,
      res_facility,
      purpose,
      date_of_use,
      start_time,
      end_time,
      status
    } = req.body;

    const safeDate = normalizeDate(date_of_use);

    await db.query(`
      UPDATE reservations
      SET res_fullname = ?,
          contact = ?,
          res_facility = ?,
          purpose = ?,
          date_of_use = ?,
          start_time = ?,
          end_time = ?,
          status = ?
      WHERE res_id = ?
    `, [
      res_fullname,
      contact,
      res_facility,
      purpose,
      safeDate,
      start_time,
      end_time,
      status || 'pending',
      req.params.id
    ]);

    res.json({
      success: true,
      message: 'Reservation updated'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ===============================
// DELETE
// ===============================
router.delete('/:id', async (req, res) => {
  try {

    await db.query(
      'DELETE FROM reservations WHERE res_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Reservation deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;