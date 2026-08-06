import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Chip, Avatar, Tooltip, IconButton,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  CloudUpload, Logout, Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Top navigation bar — shows user info, role chip, and action buttons.
 * Mobile responsive with icon-only upload button and menu toggle.
 */
export default function Navbar({ onUploadClick, onMenuClick }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 4 }, gap: { xs: 1, sm: 2 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: { xs: 0.5, md: 2 }, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {/* Upload button — admin only */}
        {isAdmin && onUploadClick && (
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={onUploadClick}
            size="small"
            sx={{
              background: '#E31837',
              color: '#fff',
              '&:hover': { background: '#B00018' },
              minWidth: isMobile ? 36 : 'auto',
              px: isMobile ? 1 : 2,
              '& .MuiButton-startIcon': { mr: isMobile ? 0 : 1 },
            }}
          >
            {!isMobile && 'Upload Excel'}
          </Button>
        )}

        {/* User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 0.5 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" lineHeight={1.2}>
              {user?.fullName || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              background: '#111111',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
          </Avatar>
          <Tooltip title="Sign Out">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: '#E31837', backgroundColor: 'rgba(227, 24, 55, 0.08)' } }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
