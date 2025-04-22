const express = require('express');
const router = express.Router();
const pool = require('../db');


// Validate yyyy-mm-dd date format
function isValidDate(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

/// Combined student vaccination report with filtering support
router.get('/stdsvlvd', async (req, res) => {
    try {
      const { student_name, vaccine_name, classname, drive_date } = req.query;
  
      let query = `
        SELECT 
          std.name,
          std.vaccination_status,
          std.classname AS student_class,
          std.dob,
          vd.title,
          vd.drive_date,
          vd.vaccine_name,
          vd.no_of_vaccine,
          vd.classname AS vaccine_class
        FROM students std
        LEFT JOIN student_vaccine_link svl 
          ON std.id = svl.student_id
        LEFT JOIN vaccination_drives vd 
          ON vd.id = svl.vaccination_drive_id
        WHERE 1=1
      `;
  
      const values = [];
      let index = 1;
  
      if (student_name) {
        query += ` AND std.name ILIKE $${index++}`;
        values.push(`%${student_name}%`);
      }
  
      if (vaccine_name) {
        query += ` AND vd.vaccine_name ILIKE $${index++}`;
        values.push(`%${vaccine_name}%`);
      }
  
      if (classname) {
        query += ` AND std.classname ILIKE $${index++}`;
        values.push(`%${classname}%`);
      }
  
      if (drive_date) {
        query += ` AND vd.drive_date = $${index++}`;
        values.push(drive_date);
      }
  
      const { rows } = await pool.query(query, values);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching vaccination report:', err);
      res.status(500).json({ error: 'Failed to fetch vaccination data' });
    }
  });
  
  
// Vaccination drives listing
router.get('/vd', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        title,
        drive_date,
        vaccine_name,
        no_of_vaccine,
        classname AS vaccine_class
      FROM vaccination_drives
      ORDER BY drive_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vaccination drives:', err);
    res.status(500).json({ error: 'Failed to fetch vaccination drives' });
  }
});

// Students listing with vaccination status
router.get('/std', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        name,
        vaccination_status,
        classname AS student_class,
        dob
      FROM students
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch student list' });
  }
});

module.exports = router;
