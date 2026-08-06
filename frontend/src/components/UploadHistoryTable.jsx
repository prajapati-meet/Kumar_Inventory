import React from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Chip, TablePagination, Typography, Box,
  Card, CardContent, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { CheckCircle, Error, CloudUpload } from '@mui/icons-material';

export default function UploadHistoryTable({ rows, totalPages, page, onPageChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      {isMobile ? (
        /* ── MOBILE: Card List ───────────────────────────────────────── */
        <Box sx={{ p: 2 }}>
          {rows.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={4}>
              <CloudUpload sx={{ fontSize: 40, color: '#CBD5E1' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No upload history recorded yet.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {rows.map((row, idx) => {
                const isSuccess = row.status === 'SUCCESS';
                return (
                  <Card
                    key={row.id || idx}
                    elevation={0}
                    sx={{
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 2,
                      bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* File Name & Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#111111" sx={{ wordBreak: 'break-all', lineHeight: 1.3 }}>
                          #{page * 10 + idx + 1} {row.fileName}
                        </Typography>
                        <Chip
                          icon={isSuccess ? <CheckCircle style={{ fontSize: 13 }} /> : <Error style={{ fontSize: 13 }} />}
                          label={row.status || 'SUCCESS'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            bgcolor: isSuccess ? '#DCFCE7' : '#FEE2E2',
                            color: isSuccess ? '#166534' : '#991B1B',
                            flexShrink: 0,
                            '& .MuiChip-icon': {
                              color: isSuccess ? '#166534 !important' : '#991B1B !important',
                            },
                          }}
                        />
                      </Box>

                      {/* Info grid */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, my: 1, fontSize: '0.75rem' }}>
                        <Box sx={{ bgcolor: '#F8F9FA', p: 1, borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>Sheet</Typography>
                          <Typography variant="body2" fontWeight={600} color="#475569" sx={{ fontSize: '0.75rem' }}>{row.sheetName || '—'}</Typography>
                        </Box>
                        <Box sx={{ bgcolor: '#FEF2F2', p: 1, borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>Records</Typography>
                          <Typography variant="body2" fontWeight={800} color="#E31837" sx={{ fontSize: '0.75rem' }}>{row.recordsImported !== undefined ? row.recordsImported.toLocaleString() : '—'}</Typography>
                        </Box>
                      </Box>

                      {/* Footer: User + Date */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748B', mt: 1 }}>
                        <Typography variant="caption" fontWeight={600}>By: {row.uploadedBy || 'admin'}</Typography>
                        <Typography variant="caption">
                          {row.uploadedAt ? new Date(row.uploadedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      ) : (
        /* ── DESKTOP: Table (unchanged) ────────────────────────────── */
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
      )}

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
