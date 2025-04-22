  // backend/routes/dashboard.js
  const express = require('express');
  const router = express.Router();
  const pool = require('../db');

  // GET /api/dashboard/summary
  router.get('/summary', async (req, res) => {
    try {
      const totalStudentsResult = await pool.query('SELECT COUNT(*) FROM students');
      const vaccinatedResult = await pool.query("SELECT COUNT(*) FROM students WHERE vaccination_status = 'Vaccinated'");
      
      const upcomingDrivesResult = await pool.query(`
        SELECT id, title,  TO_CHAR(drive_date, 'YYYY-MM-DD') AS drive_date
        FROM vaccination_drives
        WHERE drive_date >= CURRENT_DATE AND drive_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY drive_date ASC
      `);

      const total = parseInt(totalStudentsResult.rows[0].count);
      const vaccinated = parseInt(vaccinatedResult.rows[0].count);
      const rate = total > 0 ? Math.round((vaccinated / total) * 100) : 0;

      res.json({
        totalStudents: total,
        vaccinatedStudents: vaccinated,
        vaccinationRate: rate,
        upcomingDrives: upcomingDrivesResult.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  module.exports = router;
