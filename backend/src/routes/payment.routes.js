const express = require('express');
const router = express.Router();
const db = require('../config/db');

// SAVE PAYMENT
router.post('/', async (req, res) => {
  try {

    const {
      reservation_id,
      official_receipt_number,
      amount_paid,
      payment_date,
      collector_name
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO payments
      (
        res_id,
        or_number,
        amount_paid,
        payment_date,
        collector_name
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      reservation_id,
      official_receipt_number,
      amount_paid,
      payment_date,
      collector_name
    ]);

    res.json({
      success: true,
      payment_id: result.insertId
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

module.exports = router;