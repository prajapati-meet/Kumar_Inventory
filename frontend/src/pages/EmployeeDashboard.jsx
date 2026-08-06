import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import InventoryGrid from '../components/InventoryGrid';

/**
 * Employee Dashboard — search bar + inventory data grid.
 * Employees can only search and view, not upload.
 */
export default function EmployeeDashboard() {
  return (
    <Layout>
      <Box sx={{ maxWidth: 1600, mx: 'auto', width: '100%' }}>
        <Typography
          variant="h5"
          fontWeight={800}
          mb={3}
          color="primary"
        >
          Inventory Search
        </Typography>
        <InventoryGrid />
      </Box>
    </Layout>
  );
}
