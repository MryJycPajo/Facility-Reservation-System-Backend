const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET ALL FACILITIES
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM facilities");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD FACILITY
router.post('/', async (req, res) => {
  try {
    const { fac_name, fac_cost, fac_status } = req.body;

    const sql = `
      INSERT INTO facilities (fac_name, fac_cost, fac_status)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      fac_name,
      fac_cost,
      fac_status || 'Available'
    ]);

    res.json({
      success: true,
      id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET SINGLE FACILITY
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM facilities WHERE fac_id = ?",
      [req.params.id]
    );

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE FACILITY
router.put('/:id', async (req, res) => {
  try {
    const { fac_name, fac_cost, fac_status } = req.body;

    await db.query(
      `UPDATE facilities 
       SET fac_name=?, fac_cost=?, fac_status=? 
       WHERE fac_id=?`,
      [fac_name, fac_cost, fac_status, req.params.id]
    );

    res.json({ success: true, message: "Updated" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE FACILITY
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      "DELETE FROM facilities WHERE fac_id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;