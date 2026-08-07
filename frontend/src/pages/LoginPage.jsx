import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
  Chip
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, Person
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import heroLogo from '../assets/hero.png';

/**
 * Login page with clean, light enterprise design.
 * Features official logo and premium layout.
 */
export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F6F8', // Light background
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '50vh',
          top: 0,
          left: 0,
          background: 'linear-gradient(135deg, #E31837 0%, #B00018 100%)', // Hero red gradient header
          clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 100%)',
          zIndex: 0,
        }
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          borderRadius: 3,
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <img src={heroLogo} alt="Logo" style={{ height: 48, width: 'auto' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary" gutterBottom>
              KUMAR PRICING
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Sign in to your enterprise account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              autoFocus
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              sx={{ mb: 4 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: '#E31837',
                color: '#fff',
                fontSize: '1rem',
                '&:hover': {
                  background: '#B00018',
                  boxShadow: '0 8px 20px rgba(227,24,55,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
