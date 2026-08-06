import React from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Chip, TablePagination, Typography, Box
} from '@mui/material';
import { CheckCircle, Error, CloudUpload } from '@mui/icons-material';

export default function UploadHistoryTable({ rows, totalPages, page, onPageChange }) {
  return (
    <Paper
      elevation={0}
      sx={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ background: '#111111' }}>
              {['#', 'File Name', 'Sheet', 'Records', 'Uploaded By', 'Status', 'Date & Time'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: 0.5,
                    borderBottom: 'none',
                    py: 1.8,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <CloudUpload sx={{ fontSize: 40, color: '#CBD5E1' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      No upload history recorded yet.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const isSuccess = row.status === 'SUCCESS';
                return (
                  <TableRow
                    key={row.id || idx}
                    sx={{
                      background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                      transition: 'background 0.15s ease',
                      '&:hover': { background: 'rgba(227, 24, 55, 0.04)' },
                    }}
                  >
                    <TableCell sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {page * 10 + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111111', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {row.fileName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {row.sheetName || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#E31837', fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {row.recordsImported !== undefined ? row.recordsImported.toLocaleString() : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {row.uploadedBy || 'admin'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <Chip
                        icon={isSuccess ? <CheckCircle style={{ fontSize: 16 }} /> : <Error style={{ fontSize: 16 }} />}
                        label={row.status || 'SUCCESS'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 24,
                          bgcolor: isSuccess ? '#DCFCE7' : '#FEE2E2',
                          color: isSuccess ? '#166534' : '#991B1B',
                          '& .MuiChip-icon': {
                            color: isSuccess ? '#166534 !important' : '#991B1B !important',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {row.uploadedAt ? new Date(row.uploadedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <TablePagination
          component="div"
          count={totalPages * 10}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
          sx={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            '& .MuiTablePagination-toolbar': { color: '#64748B', fontWeight: 600 },
          }}
        />
      )}
    </Paper>
  );
}
