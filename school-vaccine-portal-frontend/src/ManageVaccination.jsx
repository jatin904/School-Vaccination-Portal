import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Container,
  Link,
  Snackbar,
  createTheme,
  ThemeProvider
} from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';

const classOptions = ['Grade 5', 'Grade 6', 'Grade 7'];

// Footer Component
const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: (theme) =>
        theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
      p: 3,
      mt: 4,
    }}
  >
    <Container maxWidth="sm">
      <Typography variant="body2" color="text.secondary" align="center">
        {'Jatin Saini '}
        <Link color="inherit" href="https://github.com/jatin904/School-Vaccination-Portal">
          School Vaccination Portal
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Container>
  </Box>
);

const ManageVaccination = () => {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({
    title: '',
    vaccine_name: '',
    drive_date: '',
    no_of_vaccine: '',
    classname: '',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const today = dayjs();
  const navigate = useNavigate();

  // Load drives from API
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/vaccination-drives') 
      .then((response) => {
        setDrives(response.data);
      })
      .catch((error) => {
        console.error('Error fetching drives:', error);
        setSnackbar({ open: true, message: 'Failed to load drives.' });
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateDate = (date) => {
    const selected = dayjs(date);
    return selected.isAfter(today.add(15, 'day'));
  };

  const isConflict = (date) => {
    return drives.some((d, i) => i !== editIndex && d.drive_date === date);
  };

  const handleSubmit = () => {
    if (!validateDate(form.drive_date)) {
      alert('Drive must be scheduled at least 15 days in advance.');
      return;
    }

    if (isConflict(form.drive_date)) {
      alert('Another drive is already scheduled on this date.');
      return;
    }

    if (editIndex !== null) {
      // Update drive
      axios
        .put(`http://localhost:3001/api/vaccination-drives/${drives[editIndex].id}`, form)
        .then(() => {
          const updated = [...drives];
          updated[editIndex] = form;
          setDrives(updated);
          setEditIndex(null);
          setSnackbar({ open: true, message: 'Drive updated successfully!' });
        })
        .catch((error) => {
          console.error('Error updating drive:', error);
          setSnackbar({ open: true, message: 'Failed to update drive.' });
        });
    } else {

      // Create new drive

// Create new drive
axios
  .post('http://localhost:3001/api/vaccination-drives', form)
  .then((response) => {
    setDrives([...drives, response.data]);
    setSnackbar({ open: true, message: 'Drive created successfully!' });
  })
  .catch((error) => {
    console.error('Error creating drive:', error);

    // Check if the error is from backend validation
    if (error.response && error.response.data && error.response.data.error) {
      setSnackbar({ open: true, message: error.response.data.error });
    } else {
      setSnackbar({ open: true, message: 'Failed to create drive.' });
    }
  });

    }

    setForm({
      title: '',
      vaccine_name: '',
      drive_date: '',
      no_of_vaccine: '',
      classname: '',
    });
  };

/*   const handleEdit = (index) => {
    setForm(drives[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }; */
  const handleEdit = (index) => {
    const selectedDrive = drives[index];
    const formattedDate = dayjs(selectedDrive.drive_date).format('YYYY-MM-DD');
  
    setForm({
      ...selectedDrive,
      drive_date: formattedDate,
    });
  
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  

  const isPastDrive = (date) => {
    return dayjs(date).isBefore(today, 'day');
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate('/Dashboard')}
      >
        Return to Dashboard
      </Button>

      <Typography variant="h5" gutterBottom>
        Manage Vaccination Drives
      </Typography>

      <Box component={Paper} p={3} mb={4}>
        <Typography variant="h6" gutterBottom>
          {editIndex !== null ? 'Edit Drive' : 'Create Drive'}
        </Typography>

        <TextField
          label="Drive Title"
          name="title"
          fullWidth
          margin="normal"
          value={form.title}
          onChange={handleChange}
        />
        <TextField
          label="Vaccine Name"
          name="vaccine_name"
          fullWidth
          margin="normal"
          value={form.vaccine_name}
          onChange={handleChange}
        />
        <TextField
          label="Drive Date"
          name="drive_date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={form.drive_date}
          onChange={handleChange}
        />
        <TextField
          label="No. of Vaccines"
          name="no_of_vaccine"
          type="number"
          fullWidth
          margin="normal"
          value={form.no_of_vaccine}
          onChange={handleChange}
        />
        <TextField
          //select
          label="Applicable Class"
          name="classname"
          fullWidth
          margin="normal"
          value={form.classname}
          onChange={handleChange}
        >
{/*           {classOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))} */}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
  <Button variant="contained" color="primary" onClick={handleSubmit}>
    {editIndex !== null ? 'Update Drive' : 'Create Drive'}
  </Button>
  <Button variant="outlined" color="error" onClick={() => window.location.reload()}>
    Cancel
  </Button>
</Box>

      </Box>

      <Typography variant="h6">Upcoming Drives</Typography>
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Vaccine</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Doses</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drives.map((drive, index) => (
            <TableRow key={index}>
              <TableCell>{drive.title}</TableCell>
              <TableCell>{drive.vaccine_name}</TableCell>
              <TableCell>{dayjs(drive.drive_date).format('YYYY-MM-DD')}</TableCell>
              <TableCell>{drive.no_of_vaccine}</TableCell>
              <TableCell>{drive.classname}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isPastDrive(drive.drive_date)}
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
      <Footer />
    </Box>
  );
};

export default ManageVaccination;
