import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import InventoryGrid from '../components/InventoryGrid';

/**
 * Employee Dashboard — search bar + inventory data grid.
 * Employees can search and view, not upload.
 * Fully mobile responsive.
 */
export default function EmployeeDashboard() {
  return (
    <Layout>
      <Box sx={{ maxWidth: 1600, mx: 'auto', width: '100%' }}>
        <Typography
          variant="h5"
          fontWeight={800}
          mb={{ xs: 2, md: 3 }}
          color="primary"
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
        >
          Inventory Search
        </Typography>
        <InventoryGrid />
      </Box>
    </Layout>
  );
}
