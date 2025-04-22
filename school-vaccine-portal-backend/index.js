// backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
const dashboardRoutes = require('./routes/dashboard');
const studentsRoutes = require('./routes/students');
const vaccinesRoutes = require('./routes/vaccines');
const vaccinationDrivesRoutes = require('./routes/vaccinationDrives');
const reportRoutes = require('./routes/report');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/vaccines', vaccinesRoutes);
app.use('/api/vaccination-drives', vaccinationDrivesRoutes);
app.use('/api/report',reportRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
