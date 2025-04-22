import React from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Avatar,
  CssBaseline,
  Alert,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom'; // Import useNavigate



function Login() {
  const navigate = useNavigate(); // Initialize navigate
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  const [showReset, setShowReset] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === 'jatin@bits.com' && password === 'jatin') {
      setError(false);
      navigate('/Dashboard'); // Redirect to Dashboard page after successful login
    } else {
      setError(true);
    }
  };

  const handleShowReset = (e) => {
    e.preventDefault();
    setShowReset(true);
    setResetSent(false);
    setResetEmail('');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // backend code to rend mail is needed to be added
    setResetSent(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/vaccine.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for readability */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.60)',
          zIndex: 1,
          top: 0,
          left: 0,
        }}
      />
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs"
        sx={{ p: 0, position: 'relative', zIndex: 2 }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', boxShadow: 3 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            School Vaccination Portal
          </Typography>

          {/* Main Login Form */}
          {!showReset && (
            <>
              {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  Invalid credentials. Please try again.
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 1,
                    fontWeight: 600,
                    letterSpacing: 1,
                    py: 1.5,
                    background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)"
                  }}
                >
                  Login
                </Button>
                <Box textAlign="center" sx={{ mt: 1 }}>
                  <Link href="#"  onClick={handleShowReset} variant="body2">
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            </>
          )}

        
          {/* Password Reset Form */}
          {showReset && (
            <Box sx={{ mt: 2, width: '100%' }}>
              {!resetSent ? (
                <form onSubmit={handleResetPassword}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Reset Password
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="reset-email"
                    label="Enter your email address"
                    name="reset-email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      fontWeight: 600,
                      background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)"
                    }}
                  >
                    Send Reset Instructions
                  </Button>
                  <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link href="#" onClick={() => setShowReset(false)} variant="body2">
                      Back to Login
                    </Link>
                  </Box>
                </form>
              ) : (
                <>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Password reset instructions sent to your registered email.
                  </Alert>
                  <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link href="#" onClick={() => setShowReset(false)} variant="body2">
                      Back to Login
                    </Link>
                  </Box>
                </>
              )}
            </Box>
          )}


        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
