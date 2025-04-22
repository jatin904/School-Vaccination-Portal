import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, TableSortLabel, TablePagination,
  Button, Grid, Box, Container, Typography, Link
} from '@mui/material';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import html2pdf from 'html2pdf.js';


// Footer Component

const Footer = () => (
  <Box
    component="footer"
    sx={{
      position: "fixed",
      left: 0,
      bottom: 0,
      width: "100%",
      backgroundColor: (theme) =>
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      p: 3,
      zIndex: 1300,
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


// Main Report Component
// Handles data fetching, filtering, sorting, exporting, and rendering the report table

const Report = () => {
  // State for fetched data and UI controls
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    student_name: '',
    vaccine_name: '',
    classname: '',
    drive_date: ''
  });
  const [orderBy, setOrderBy] = useState('name'); // Column to sort by
  const [order, setOrder] = useState('asc');      // Sort direction
  const [page, setPage] = useState(0);            // Current table page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  // format date strings
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '';
  };

  const navigate = useNavigate();

  // Fetch data from API whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/report/stdsvlvd', {
          params: {
            student_name: filters.student_name,
            vaccine_name: filters.vaccine_name,
            classname: filters.classname,
            drive_date: filters.drive_date,
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, [filters]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter data based on filter state
  const filteredData = data.filter(item => {
    return (!filters.student_name || item.name?.toLowerCase().includes(filters.student_name.toLowerCase())) &&
           (!filters.vaccine_name || item.vaccine_name?.toLowerCase().includes(filters.vaccine_name.toLowerCase())) &&
           (!filters.classname || item.student_class?.toLowerCase().includes(filters.classname.toLowerCase())) &&
           (!filters.drive_date || formatDate(item.drive_date) === filters.drive_date);
  });

  // Handle sorting logic for table columns
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort filtered data based on selected column and order
  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[orderBy];
    const valB = b[orderBy];
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // Export filtered data to Excel file
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaccination Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'Vaccination_Report.xlsx');
  };

  // Reference for the report DOM element (for PDF export)
  const reportRef = useRef();

  // Export visible report section to PDF
  const exportToPDF = () => {
    const element = reportRef.current;
    const options = {
      margin:       0.5,
      filename:     'Vaccination_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  };


  // Render UI
 
  return (
    <Box sx={{ p: 3, paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Button to return to Dashboard */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate('/Dashboard')}
      >
        Return to Dashboard
      </Button>

      <Paper sx={{ padding: 2 }}>
        <div ref={reportRef}>
          {/* Report Title */}
          <Typography variant="h4" gutterBottom>
            Student Vaccination Report
          </Typography>

          {/* Filter Inputs */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="student_name"
                label="Student Name"
                variant="outlined"
                value={filters.student_name}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="vaccine_name"
                label="Vaccine Name"
                variant="outlined"
                value={filters.vaccine_name}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="classname"
                label="Class"
                variant="outlined"
                value={filters.classname}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="drive_date"
                label="Drive Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={filters.drive_date}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>

          {/* Export Buttons */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item>
              <CSVLink data={filteredData} filename="Vaccination_Report.csv" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">Download CSV</Button>
              </CSVLink>
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" onClick={exportToExcel}>Download Excel</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="error" onClick={exportToPDF}>Download PDF</Button>
            </Grid>
          </Grid>

          {/* Data Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {['name', 'student_class', 'vaccination_status', 'vaccine_name', 'drive_date'].map((col) => (
                    <TableCell key={col}>
                      <TableSortLabel
                        active={orderBy === col}
                        direction={orderBy === col ? order : 'asc'}
                        onClick={() => handleSort(col)}
                      >
                        {col.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.student_class}</TableCell>
                    <TableCell>{row.vaccination_status}</TableCell>
                    <TableCell>{row.vaccine_name}</TableCell>
                    <TableCell>{formatDate(row.drive_date)}</TableCell>
                  </TableRow>
                ))}
                {/* Show message if no records found */}
                {sortedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No matching records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={sortedData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </div>
      </Paper>

      {/* Fixed Footer */}
      <Footer />
    </Box>
  );
};

export default Report;
