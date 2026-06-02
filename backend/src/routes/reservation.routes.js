const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET ALL RESERVATIONS
router.get('/', async (req, res) => {
  try {

    const sql = `
      SELECT *
      FROM reservations
      ORDER BY timestamp DESC
    `;

    const [results] = await db.query(sql);

    res.json(results);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET SINGLE RESERVATION
router.get('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM reservations WHERE res_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// CREATE RESERVATION
router.post('/', async (req, res) => {

  try {

    const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

const datePrefix = `${year}${month}${day}`;

    const {
      res_fullname,
      contact,
      res_facility,
      purpose,
      date_of_use,
      start_time,
      end_time
    } = req.body;

    const sql = `
      INSERT INTO reservations
      (
        res_fullname,
        contact,
        res_facility,
        purpose,
        date_of_use,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      res_fullname,
      contact,
      res_facility,
      purpose,
      date_of_use,
      start_time,
      end_time
    ]);

   const controlNumber = `${datePrefix}-${String(result.insertId).padStart(4, '0')}`;

    await db.query(
      `UPDATE reservations
       SET control_number = ?
       WHERE res_id = ?`,
      [controlNumber, result.insertId]
    );

    res.json({
      success: true,
      res_id: result.insertId,
      control_number: controlNumber
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM reservations WHERE res_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Reservation deleted'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

    const sql = `
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
    `;

    await db.query(sql, [
      res_fullname,
      contact,
      res_facility,
      purpose,
      date_of_use,
      start_time,
      end_time,
      status,
      id
    ]);

    res.json({
      success: true,
      message: 'Reservation updated'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'Pending') AS pending,
        SUM(status = 'Approved') AS approved,
        SUM(status = 'Rejected') AS rejected
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

module.exports = router;