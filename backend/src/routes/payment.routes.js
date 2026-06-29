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
  collector_name,
  selected_addons
} = req.body;

    const [result] = await db.query(`
INSERT INTO payments
(
  res_id,
  or_number,
  amount_paid,
  payment_date,
  collector_name,
  selected_addons
)
VALUES (?, ?, ?, ?, ?, ?)
    `,[
  reservation_id,
  official_receipt_number,
  amount_paid,
  payment_date,
  collector_name,
  selected_addons
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


router.get('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(`
 SELECT
    p.payment_id,
    p.or_number,
    p.amount_paid,
    p.payment_date,
    p.collector_name,
    p.selected_addons,

    r.res_id,
    r.res_fullname,
    r.res_facility

FROM payments p

LEFT JOIN reservations r
ON r.res_id = p.res_id

WHERE p.payment_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
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

module.exports = router;