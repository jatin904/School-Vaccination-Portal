const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper: Validate yyyy-mm-dd date format
function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// Get all students with vaccinations
/* 
router.get('/', async (req, res) => {
  try {
    const studentRes = await pool.query('SELECT * FROM students');
    const vaccinationRes = await pool.query(
      `SELECT

	VD.title,vd.drive_date,vd.vaccine_name,vd.no_of_vaccine,vd.classname,
	STD.*
FROM
	STUDENT_VACCINE_LINK SVL
	JOIN VACCINATION_DRIVES VD ON SVL.VACCINATION_DRIVE_ID = VD.ID
	JOIN STUDENTS STD ON STD.ID = SVL.STUDENT_ID`
    );

    const vaccinationsMap = {};
    vaccinationRes.rows.forEach(v => {
      if (!vaccinationsMap[v.student_id]) vaccinationsMap[v.student_id] = [];
      vaccinationsMap[v.student_id].push({
        id: v.id,
        vaccineId: v.id,
        vaccineName: v.name,
        date: v.date
      });
    });

    const students = studentRes.rows.map(student => ({
      ...student,
      vaccinations: vaccinationsMap[student.id] || []
    }));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch students');
  }
}); */


router.get('/', async (req, res) => {
  try {
    // Get all students
    const studentRes = await pool.query('SELECT * FROM students');

    // Get all vaccination records linked to students
    const vaccinationRes = await pool.query(`
      SELECT
        svl.student_id,
        vd.id AS drive_id,
        vd.title,
        vd.vaccine_name,
        vd.drive_date
      FROM
        student_vaccine_link svl
      JOIN vaccination_drives vd ON svl.vaccination_drive_id = vd.id
    `);

    // Map vaccinations to student_id
    const vaccinationsMap = {};
    vaccinationRes.rows.forEach(v => {
      if (!vaccinationsMap[v.student_id]) vaccinationsMap[v.student_id] = [];
      vaccinationsMap[v.student_id].push({
        driveId: v.drive_id,
        title: v.title,
        vaccineName: v.vaccine_name,
        date: v.drive_date 
      });
    });

    // Attach vaccinations to student objects
    const students = studentRes.rows.map(student => ({
      ...student,
      vaccinations: vaccinationsMap[student.id] || []
    }));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch students with vaccination details');
  }
});


// Add a student
router.post('/', async (req, res) => {
  const { name, classname, dob } = req.body;

  if (!dob || !isValidDate(dob)) {
    return res.status(400).json({ error: 'Invalid date format. Use yyyy-mm-dd' });
  }

  try {
    await pool.query(
      'INSERT INTO students (name, classname, dob) VALUES ($1, $2, $3)',
      [name, classname, dob]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add student');
  }
});

// Update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, classname, dob } = req.body;

  if (!dob || !isValidDate(dob)) {
    return res.status(400).json({ error: 'Invalid date format. Use yyyy-mm-dd' });
  }

  try {
    await pool.query(
      'UPDATE students SET name=$1, classname=$2, dob=$3 WHERE id=$4',
      [name, classname, dob, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update student');
  }
});

// Bulk import students
router.post('/bulk', async (req, res) => {
  const students = req.body;
  let created = 0, skipped = 0;

  for (let s of students) {
    if (!s.dob || !isValidDate(s.dob)) {
      skipped++;
      continue;
    }
    try {
      // Duplicate check by name + dob + classname
      const existing = await pool.query(
        'SELECT * FROM students WHERE name = $1  AND classname = $2 AND dob = $3',
        [s.name, s.classname, s.dob]
      );
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }
      await pool.query(
        'INSERT INTO students (name, classname, dob) VALUES ($1, $2, $3)',
        [s.name, s.classname, s.dob]
      );
      created++;
    } catch (err) {
      console.error(err);
      skipped++;
    }
  }

  res.json({ created, skipped });
});

// Vaccinate student
router.post('/:id/vaccinate', async (req, res) => {
  const studentId = req.params.id;
  const { vaccination_drive_id } = req.body;

  if (!vaccination_drive_id) {
    return res.status(400).json({ error: 'Vaccination drive ID is required' });
  }   

  try {
    const exists = await pool.query(
      'SELECT * FROM student_vaccine_link WHERE student_id = $1 AND vaccination_drive_id = $2',
      [studentId, vaccination_drive_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Student already vaccinated in this drive' });
    }

    await pool.query(
      'INSERT INTO student_vaccine_link (student_id, vaccination_drive_id) VALUES ($1, $2)',
      [studentId, vaccination_drive_id]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error recording vaccination');
  }
});

// PUT /vaccination_status_update/:id
// Update vaccination status
router.put('/vaccination_status_update/:id', async (req, res) => {
  const { id } = req.params;
  const { vaccination_status } = req.body;

  if (!vaccination_status) {
    return res.status(400).json({ error: 'vaccinated_status is required' });
  }

  try {
    await pool.query(
      'UPDATE students SET vaccination_status = $1 WHERE id = $2',
      [vaccination_status, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating vaccination status:', err);
    res.status(500).send('Failed to update vaccination status');
  }
});




module.exports = router;
