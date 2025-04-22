import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Chip, Select, MenuItem,
  FormControl, InputLabel, Container, Link, TablePagination, TableSortLabel
} from '@mui/material';
import {
  Add, Edit, CloudUpload,
  Search, CheckCircle
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import axios from 'axios';

// Footer Component
const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: (theme) =>
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      p: 3,
      mt: 4,
    }}
  >
    <Container maxWidth="sm">
      <Typography variant="body2" color="text.secondary" align="center">
        {"Jatin Saini "}
        <Link color="inherit" href="https://github.com/jatin904/School-Vaccination-Portal">
          School Vaccination Portal
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Container>
  </Box>
);

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [orderDirection, setOrderDirection] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const initialFormState = { 
    name: '', 
    studentId: '', 
    className: '', 
    dob: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchVaccines();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/students');
      setStudents(data);
    } catch (error) {
      showSnackbar('Error fetching students', 'error');
    }
  };

  const fetchVaccines = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/vaccines');
      setVaccines(data);
    } catch (error) {
      showSnackbar('Error fetching vaccines', 'error');
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase().trim());

  const filteredStudents = students.filter((student) => {
    const name = student.name?.toLowerCase() || '';
    const classname = student.classname?.toLowerCase() || '';
    const id = String(student.id || '').toLowerCase();
    const vaccinationNames = student.vaccinations
      ?.map(v => v.vaccineName?.toLowerCase())
      .join(' ') || '';
    return (
      name.includes(searchQuery) ||
      classname.includes(searchQuery) ||
      id.includes(searchQuery) ||
      vaccinationNames.includes(searchQuery)
    );
  });

  // --------- Sorting logic for Name column ---------
  function descendingComparator(a, b, orderBy) {
    if (!a[orderBy]) return 1;
    if (!b[orderBy]) return -1;
    if (b[orderBy].toLowerCase() < a[orderBy].toLowerCase()) return -1;
    if (b[orderBy].toLowerCase() > a[orderBy].toLowerCase()) return 1;
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleSortRequest = () => {
    const isAsc = orderBy === 'name' && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy('name');
  };

  // Apply sorting and then pagination
  const sortedStudents = stableSort(filteredStudents, getComparator(orderDirection, orderBy));
  const paginatedStudents = sortedStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        classname: formData.className,
        dob: formData.dob
      };

      if (selectedStudent) {
        await axios.put(`http://localhost:3001/api/students/${selectedStudent.id}`, payload);
        showSnackbar('Student updated successfully', 'success');
      } else {
        await axios.post('http://localhost:3001/api/students', payload);
        showSnackbar('Student added successfully', 'success');
      }
      fetchStudents();
      handleClose();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving student', 'error');
    }
  };



const handleBulkUpload = async (acceptedFiles) => {
  try {
    Papa.parse(acceptedFiles[0], {
      header: true,
      transform: (value, column) => {
        if (column === 'dob') {
          // Convert date to YYYY-MM-DD if possible
          const d = new Date(value);
          if (!isNaN(d)) {
            return d.toISOString().slice(0, 10);
          }
        }
        return value;
      },
      complete: async (results) => {
        const { data } = await axios.post(
          'http://localhost:3001/api/students/bulk',
          results.data
        );
        showSnackbar(`${data.created} students added, ${data.skipped} duplicates skipped`, 'success');
        fetchStudents();
      }
    });
  } catch (error) {
    showSnackbar('Error processing CSV file', 'error');
  }
};


  

  const handleVaccination = async (studentId, vaccinationDriveId) => {
    try {
      await axios.post(`http://localhost:3001/api/students/${studentId}/vaccinate`, {
        vaccination_drive_id: vaccinationDriveId
      });
      showSnackbar('Vaccination recorded successfully', 'success');
      await axios.put(`http://localhost:3001/api/students/vaccination_status_update/${studentId}`, {
        vaccination_status: 'Vaccinated'
      });
      fetchStudents();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error recording vaccination', 'error');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.csv',
    multiple: false,
    onDrop: handleBulkUpload
  });

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData(initialFormState);
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search students..."
          InputProps={{ startAdornment: <Search /> }}
          sx={{ flexGrow: 1 }}
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          size="medium"
          startIcon={<Add />}
          sx={{ minWidth: 160 }}
          onClick={() => setOpenDialog(true)}
        >
          Add Student
        </Button>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUpload />}
            sx={{ minWidth: 160 }}
          >
            Bulk Import
          </Button>
        </div>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? orderDirection : 'asc'}
                  onClick={handleSortRequest}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Vaccine Name</TableCell>
              <TableCell>Vaccination Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.classname}</TableCell>
                <TableCell>
                  {student.vaccinations.map((v) => (
                    <Chip
                      key={v.id}
                      label={`${v.vaccineName} (${new Date(v.date).toLocaleDateString()})`}
                      color="success"
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>{student.vaccination_status || 'Not Vaccinated'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setSelectedStudent(student);
                    setFormData({
                      name: student.name,
                      className: student.classname,
                      dob: student.dob ? new Date(student.dob).toLocaleDateString('en-CA') : ''
                    });
                    setOpenDialog(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <VaccinationDialog 
                    student={student}
                    vaccines={vaccines}
                    onVaccinate={handleVaccination}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Class"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStudent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
      <Footer />
    </Box>
  );
};

const VaccinationDialog = ({ student, onVaccinate }) => {
  const [open, setOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [vaccinationDrives, setVaccinationDrives] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/vaccines')
      .then(response => {
        setVaccinationDrives(response.data);
      })
      .catch(error => {
        console.error('Error fetching vaccination drives:', error);
      });
  }, []);

  const handleVaccineChange = (e) => {
    const selectedVaccineName = e.target.value;
    setSelectedVaccine(selectedVaccineName);
    const matchingDrive = vaccinationDrives.find(drive => drive.vaccine_name === selectedVaccineName);
    if (matchingDrive) {
      setSelectedDrive(matchingDrive.title);
    }
  };

  const handleDriveChange = (e) => {
    const selectedDriveTitle = e.target.value;
    setSelectedDrive(selectedDriveTitle);
    const matchingVaccine = vaccinationDrives.find(drive => drive.title === selectedDriveTitle);
    if (matchingVaccine) {
      setSelectedVaccine(matchingVaccine.vaccine_name);
    }
  };

  const handleSubmit = () => {
    if (!selectedVaccine || !selectedDrive) return;
    if (student.vaccinations.some(v => v.vaccineName === selectedVaccine)) {
      alert('Student already vaccinated with this vaccine');
      return;
    }
    const vaccinationDriveId = vaccinationDrives.find(drive => drive.title === selectedDrive)?.id;
    if (vaccinationDriveId) {
      onVaccinate(student.id, vaccinationDriveId);
      setOpen(false);
    } else {
      alert('Vaccination drive not found');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVaccine('');
    setSelectedDrive('');
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <CheckCircle color="success" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Record Vaccination</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Vaccine</InputLabel>
            <Select
              value={selectedVaccine}
              onChange={handleVaccineChange}
              required
            >
              {vaccinationDrives.map((drive) => (
                <MenuItem
                  key={drive.vaccine_name}
                  value={drive.vaccine_name}
                  disabled={student.vaccinations.some(v => v.vaccineName === drive.vaccine_name)}
                >
                  {drive.vaccine_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Vaccination Drive</InputLabel>
            <Select
              value={selectedDrive}
              onChange={handleDriveChange}
              required
            >
              {vaccinationDrives.map((drive) => (
                <MenuItem key={drive.title} value={drive.title}>
                  {drive.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success">
            Record Vaccination
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageStudents;
