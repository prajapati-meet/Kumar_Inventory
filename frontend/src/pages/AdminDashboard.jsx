import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Stack, Chip
} from '@mui/material';
import {
  Inventory2Rounded, CloudUpload, People, AccessTime, History, Security, CheckCircle
} from '@mui/icons-material';

import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import UploadDialog from '../components/UploadDialog';
import UploadHistoryTable from '../components/UploadHistoryTable';
import LoginHistoryTable from '../components/LoginHistoryTable';
import { getDashboardStats, getUploadHistory, getLoginHistory } from '../api/endpoints';

/**
 * Admin Dashboard — shows modern KPI stats, upload history, and login audit log.
 * Mobile responsive layout with fluid typography and card views for tables.
 */
export default function AdminDashboard() {
  const [stats, setStats]                 = useState(null);
  const [uploadHistory, setUploadHistory] = useState({ content: [], totalPages: 0 });
  const [loginHistory, setLoginHistory]   = useState({ content: [], totalPages: 0 });
  const [uploadPage, setUploadPage]       = useState(0);
  const [loginPage, setLoginPage]         = useState(0);
  const [loading, setLoading]             = useState(true);
  const [uploadOpen, setUploadOpen]       = useState(false);

  const fetchAll = async () => {
    try {
      const [statsRes, uploadRes, loginRes] = await Promise.all([
        getDashboardStats(),
        getUploadHistory(uploadPage, 10),
        getLoginHistory(loginPage, 20),
      ]);
      setStats(statsRes.data);
      setUploadHistory(uploadRes.data);
      setLoginHistory(loginRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [uploadPage, loginPage]);

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    fetchAll();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
        <CircularProgress size={48} sx={{ color: '#E31837' }} />
      </Box>
    );
  }

  const statCards = [
    {
      label: 'Total Records', value: stats?.totalRecords ?? 0,
      icon: <Inventory2Rounded />, color: '#E31837', // Hero Red
    },
    {
      label: 'Employees', value: stats?.totalEmployees ?? 0,
      icon: <People />, color: '#111111', // Black
    },
    {
      label: 'Total Uploads', value: stats?.totalUploads ?? 0,
      icon: <CloudUpload />, color: '#0284C7', // Blue Accent
    },
    {
      label: 'Last Upload Records', value: stats?.lastUploadRecordCount ?? 0,
      icon: <AccessTime />, color: '#059669', // Emerald Green
      sub: stats?.lastUploadedBy ? `by ${stats.lastUploadedBy}` : 'No upload yet',
    },
  ];

  return (
    <Layout onUploadClick={() => setUploadOpen(true)}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%', py: { xs: 0, sm: 1 } }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2.5, md: 4 }, gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#111111" sx={{ letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              System Administration Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mt={0.5} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Monitor inventory catalogue metrics, data synchronization history, and security access logs.
            </Typography>
          </Box>

          {stats?.lastUploadTime && (
            <Chip
              icon={<CheckCircle style={{ fontSize: 16, color: '#166534' }} />}
              label={`Last sync: ${new Date(stats.lastUploadTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`}
              sx={{
                bgcolor: '#DCFCE7',
                color: '#166534',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', md: '0.8rem' },
                py: { xs: 1.5, md: 2.2 },
                px: 1,
                borderRadius: 2.5,
                border: '1px solid #BBF7D0',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)'
              }}
            />
          )}
        </Box>

        {/* KPI Statistics Cards */}
        <StatsCards cards={statCards} />

        {/* Upload History Section */}
        <Box mt={{ xs: 3.5, md: 6 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(227, 24, 55, 0.1)', color: '#E31837', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <History fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#111111" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Data Synchronization & Upload History
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Record of all Excel spreadsheet imports and catalogue updates.
              </Typography>
            </Box>
          </Stack>

          <UploadHistoryTable
            rows={uploadHistory.content || []}
            totalPages={uploadHistory.totalPages || 0}
            page={uploadPage}
            onPageChange={setUploadPage}
          />
        </Box>

        {/* Login Security Audit Log */}
        <Box mt={{ xs: 3.5, md: 6 }} mb={4}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(17, 17, 17, 0.1)', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Security fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#111111" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Security Access & Login Audit
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Real-time tracking of administrator and employee authentication events.
              </Typography>
            </Box>
          </Stack>

          <LoginHistoryTable
            rows={loginHistory.content || []}
            totalPages={loginHistory.totalPages || 0}
            page={loginPage}
            onPageChange={setLoginPage}
          />
        </Box>
      </Box>

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Layout>
  );
}
