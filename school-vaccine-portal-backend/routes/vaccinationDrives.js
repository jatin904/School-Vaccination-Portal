// backend/routes/vaccinationDrives.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// GET all drives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vaccination_drives ORDER BY drive_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drives' });
  }
});


// POST a new drive
router.post('/', async (req, res) => {
  const { title, vaccine_name, drive_date, no_of_vaccine, classname } = req.body;

  try {
    // Check if drive_date already exists
    const checkResult = await pool.query(
      'SELECT 1 FROM vaccination_drives WHERE drive_date = $1',
      [drive_date]
    );

    if (checkResult.rowCount > 0) {
      // Drive date already exists
      return res.status(400).json({ error: 'Vaccination drive date already exists, please choose a new date!' });
    }

    // Insert new drive
    const result = await pool.query(
      `INSERT INTO vaccination_drives (title, vaccine_name, drive_date, no_of_vaccine, classname)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, vaccine_name, drive_date, no_of_vaccine, classname]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create drive' });
  }
});


// PUT to update a drive
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, vaccine_name, drive_date, no_of_vaccine, classname } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vaccination_drives
       SET title = $1, vaccine_name = $2, drive_date = $3, no_of_vaccine = $4, classname = $5
       WHERE id = $6 RETURNING *`,
      [title, vaccine_name, drive_date, no_of_vaccine, classname, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update drive' });
  }
});

module.exports = router;
