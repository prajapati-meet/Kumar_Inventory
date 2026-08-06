import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider
} from '@mui/material';
import { Dashboard, Search } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import heroLogo from '../assets/hero.png';

const drawerWidth = 260;

export default function Sidebar({ mobileOpen, onDrawerToggle }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [];
  if (isAdmin) {
    navItems.push({ text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' });
  }
  navItems.push({ text: 'Search', icon: <Search />, path: '/search' });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      {/* Logo Area */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src={heroLogo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        <Box>
          <Typography variant="h6" fontWeight={800} color="primary" lineHeight={1}>
            KUMAR
          </Typography>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 1 }}>
            PRICING
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
      
      {/* Navigation List */}
      <List sx={{ px: 2, pt: 3 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (onDrawerToggle) onDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(227, 24, 55, 0.08)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(227, 24, 55, 0.12)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: '1px solid rgba(0,0,0,0.06)',
            backgroundColor: '#FFFFFF'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
