const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {

    const [rows] = await db.query(`
SELECT
  p.payment_id,
  r.res_id,
  r.control_number,
  r.res_fullname,
  r.res_facility,
  DATE_FORMAT(r.date_of_use, '%Y-%m-%d') AS date_of_use,
  p.amount_paid,
  p.collector_name,
  'Completed' AS display_status
FROM reservations r
INNER JOIN payments p
  ON p.res_id = r.res_id
WHERE LOWER(r.status) = 'completed'
ORDER BY p.created_at DESC
`);

console.log("HISTORY ROWS:", rows);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

module.exports = router;