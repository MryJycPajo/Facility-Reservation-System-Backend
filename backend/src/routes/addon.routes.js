const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ===============================
// GET ALL ADDONS
// ===============================
router.get('/', async (req, res) => {
  try {
   const [rows] = await db.query(`
  SELECT addon_id, addon_name, description, addon_rate, status, created_at
  FROM facility_addons
  WHERE LOWER(status) = 'active'
`);

    res.json(rows);
  } catch (err) {
    console.error('GET ADDONS ERROR:', err);
    res.status(500).json({
      message: 'Error fetching addons'
    });
  }
});

// ===============================
// GET SINGLE ADDON
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM facility_addons WHERE addon_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Addon not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('GET ADDON ERROR:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// ===============================
// CREATE ADDON
// ===============================
router.post('/', async (req, res) => {
  try {

    const {
      addon_name,
      description,
      addon_rate,
      status
    } = req.body;

   if (!addon_name || addon_rate === undefined) {
  return res.status(400).json({
    message: 'Missing required fields'
  });
}

   const [result] = await db.query(`
  INSERT INTO facility_addons
  (
    addon_name,
    description,
    addon_rate,
    status
  )
  VALUES (?, ?, ?, ?, ?)
`, [
  addon_name,
  description || '',
  addon_rate,
  'piece',
  status || 'active'
]);

    res.json({
      success: true,
      addon_id: result.insertId,
      message: 'Addon created successfully'
    });

  } catch (err) {
    console.error('CREATE ADDON ERROR:', err);

    res.status(500).json({
      message: err.message
    });
  }
});

// ===============================
// UPDATE ADDON
// ===============================
router.put('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      addon_name,
      description,
      addon_rate,
      status
    } = req.body;

    await db.query(`
      UPDATE facility_addons
      SET
        addon_name = ?,
        description = ?,
        addon_rate = ?,
        status = ?
      WHERE addon_id = ?
    `, [
      addon_name,
      description || '',
      addon_rate,
      status,
      id
    ]);

    res.json({
      success: true,
      message: 'Addon updated successfully'
    });

  } catch (err) {
    console.error('UPDATE ADDON ERROR:', err);

    res.status(500).json({
      message: err.message
    });
  }
});

// ===============================
// DELETE ADDON
// ===============================
router.delete('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    await db.query(
      `DELETE FROM facility_addons WHERE addon_id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Addon deleted successfully'
    });

  } catch (err) {
    console.error('DELETE ADDON ERROR:', err);

    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;