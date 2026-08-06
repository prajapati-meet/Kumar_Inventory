import React from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Chip, TablePagination, Typography, Box,
  Card, CardContent, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { Security, CheckCircle, Cancel } from '@mui/icons-material';

export default function LoginHistoryTable({ rows, totalPages, page, onPageChange }) {
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
              <Security sx={{ fontSize: 40, color: '#CBD5E1' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No login audit records found.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {rows.map((row, idx) => {
                const isAdmin = row.role === 'ADMIN';
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
                      {/* Top Bar: Username + Role + Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#111111">
                          #{page * 20 + idx + 1} {row.username}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            label={row.role || 'EMPLOYEE'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                              bgcolor: isAdmin ? '#FEE2E2' : '#E0F2FE',
                              color: isAdmin ? '#991B1B' : '#0369A1',
                              borderRadius: 1,
                            }}
                          />
                          <Chip
                            icon={isSuccess ? <CheckCircle style={{ fontSize: 13 }} /> : <Cancel style={{ fontSize: 13 }} />}
                            label={row.status || 'SUCCESS'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                              bgcolor: isSuccess ? '#DCFCE7' : '#FEE2E2',
                              color: isSuccess ? '#166534' : '#991B1B',
                              '& .MuiChip-icon': {
                                color: isSuccess ? '#166534 !important' : '#991B1B !important',
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Details row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          IP: {row.ipAddress || '127.0.0.1'}
                        </Typography>
                        <Typography variant="caption" fontWeight={500}>
                          {row.loginAt ? new Date(row.loginAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </Typography>
                      </Box>

                      {row.failureReason && (
                        <Typography variant="caption" color="error" fontWeight={500} sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                          Reason: {row.failureReason}
                        </Typography>
                      )}
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
                {['#', 'Username', 'Role', 'Status', 'IP Address', 'Failure Reason', 'Login Time'].map((h) => (
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
                      <Security sx={{ fontSize: 40, color: '#CBD5E1' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        No login audit records found.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const isAdmin = row.role === 'ADMIN';
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
                        {page * 20 + idx + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111111', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        {row.username}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <Chip
                          label={row.role || 'EMPLOYEE'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: isAdmin ? '#FEE2E2' : '#E0F2FE',
                            color: isAdmin ? '#991B1B' : '#0369A1',
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <Chip
                          icon={isSuccess ? <CheckCircle style={{ fontSize: 15 }} /> : <Cancel style={{ fontSize: 15 }} />}
                          label={row.status || 'SUCCESS'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: isSuccess ? '#DCFCE7' : '#FEE2E2',
                            color: isSuccess ? '#166534' : '#991B1B',
                            '& .MuiChip-icon': {
                              color: isSuccess ? '#166534 !important' : '#991B1B !important',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.04)', fontFamily: 'monospace' }}>
                        {row.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: row.failureReason ? '#E31837' : '#94A3B8', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        {row.failureReason || '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        {row.loginAt ? new Date(row.loginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
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
          count={totalPages * 20}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          sx={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            '& .MuiTablePagination-toolbar': { color: '#64748B', fontWeight: 600 },
          }}
        />
      )}
    </Paper>
  );
}
