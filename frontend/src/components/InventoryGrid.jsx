import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, TextField, InputAdornment, IconButton,
  Tooltip, Button, ButtonGroup, Typography, Chip,
  CircularProgress, Alert, FormControlLabel, Switch,
  Card, CardContent, CardActionArea, Stack, Pagination,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  Search, Clear, Download, Print, OpenInNew, TableRows, Restore
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { searchInventory, exportInventory } from '../api/endpoints';
import RowDetailDialog from './RowDetailDialog';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../auth/AuthContext';

// ── Formatter ─────────────────────────────────────────────────────────
function fmt(val, numeric) {
  if (val === null || val === undefined) return '—';
  if (numeric && val !== '') {
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val;
}

/**
 * Highlights occurrences of `keyword` within a string (case-insensitive).
 */
function Highlight({ text, keyword }) {
  if (!keyword || !text) return <span>{text ?? '—'}</span>;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: 'rgba(227, 24, 55, 0.2)', color: '#B00018', borderRadius: 2, padding: '0 2px', fontWeight: 'bold' }}>{part}</mark>
          : part
      )}
    </span>
  );
}

/**
 * Mobile card component for a single inventory row
 */
function MobileInventoryCard({ row, keyword, onClick }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(227, 24, 55, 0.3)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 0 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Top row: Model chip + DMS code */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={row.model || '—'}
              size="small"
              sx={{ backgroundColor: '#E31837', color: '#fff', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
            {row.dmsCode && (
              <Chip
                label={`DMS: ${row.dmsCode}`}
                size="small"
                sx={{ backgroundColor: '#111', color: '#fff', fontWeight: 600, fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>

          {/* Model Description */}
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5, lineHeight: 1.3 }}>
            <Highlight text={row.modelDescription} keyword={keyword} />
          </Typography>

          {/* Key price fields */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box sx={{ backgroundColor: '#F8F9FA', borderRadius: 1.5, p: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ex-Showroom
              </Typography>
              <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontSize: '0.8rem' }}>
                ₹{fmt(row.exShowroomPrice, true)}
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: '#F0F7FF', borderRadius: 1.5, p: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                On-Road Price
              </Typography>
              <Typography variant="body2" fontWeight={800} color="primary.main" sx={{ fontSize: '0.8rem' }}>
                ₹{fmt(row.onRoadPrice, true)}
              </Typography>
            </Box>
          </Box>

          {/* Date if available */}
          {row.date && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.65rem' }}>
              Date: {row.date}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function InventoryGrid() {
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);
  const [uniqueModels, setUniqueModels] = useState(false);

  const [rows, setRows]             = useState([]);
  const [totalElements, setTotal]   = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel]   = useState([{ field: 'modelDescription', sort: 'asc' }]);
  
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [exporting, setExporting]   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const sortBy = sortModel.length > 0 ? sortModel[0].field : 'modelDescription';
    const sortDir = sortModel.length > 0 ? sortModel[0].sort : 'asc';
    
    try {
      const res = await searchInventory({
        keyword: debouncedKeyword,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sortBy: sortBy,
        sortDir: sortDir,
        uniqueModels: isAdmin ? uniqueModels : false,
      });
      const edits = JSON.parse(localStorage.getItem('view_edits') || '{}');
      const deletions = JSON.parse(localStorage.getItem('view_deletions') || '[]');
      
      const activeContent = res.data.content
        .filter((item) => !deletions.includes(item.id))
        .map((item) => (edits[item.id] ? { ...item, ...edits[item.id] } : item));

      setRows(activeContent);
      setTotal(Math.max(0, res.data.totalElements - deletions.length));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, paginationModel.page, paginationModel.pageSize, sortModel, uniqueModels, isAdmin]);

  const handleResetView = () => {
    localStorage.removeItem('view_edits');
    localStorage.removeItem('view_deletions');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('img_')) localStorage.removeItem(key);
    });
    fetchData();
  };

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedKeyword, uniqueModels]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportInventory(debouncedKeyword);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyRow = (row) => {
    const text = Object.entries(row).map(([k, v]) => `${k}: ${v ?? ''}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handlePrint = () => {
    window.print();
  };

  const baseColumns = [
    { field: 'model', headerName: 'Model', minWidth: 100 },
    { field: 'dmsCode', headerName: 'DMS Code', minWidth: 130 },
    { 
      field: 'modelDescription', 
      headerName: 'Model Description', 
      minWidth: 300, flex: 1,
      renderCell: (params) => <Highlight text={params.value} keyword={debouncedKeyword} />
    },
    { field: 'basicPrice', headerName: 'Basic Price (₹)', type: 'number', minWidth: 130, valueFormatter: (val) => fmt(val, true) },
    { field: 'sgst', headerName: 'SGST @ 9%', type: 'number', minWidth: 110, valueFormatter: (val) => fmt(val, true) },
    { field: 'cgst', headerName: 'CGST @ 9%', type: 'number', minWidth: 110, valueFormatter: (val) => fmt(val, true) },
    { field: 'exShowroomPrice', headerName: 'Ex-Showroom (₹)', type: 'number', minWidth: 140, valueFormatter: (val) => fmt(val, true) },
    { field: 'rtoCharges', headerName: 'RTO Charges', type: 'number', minWidth: 120, valueFormatter: (val) => fmt(val, true) },
    { field: 'smartCardRc', headerName: 'Smart Card RC', type: 'number', minWidth: 130, valueFormatter: (val) => fmt(val, true) },
    { field: 'postSalesHandlingCharges', headerName: 'Post Sales Handling', type: 'number', minWidth: 160, valueFormatter: (val) => fmt(val, true) },
    { field: 'insuranceVehicle', headerName: 'Insurance (1+5)', type: 'number', minWidth: 140, valueFormatter: (val) => fmt(val, true) },
    { field: 'accessories', headerName: 'Accessories', type: 'number', minWidth: 120, valueFormatter: (val) => fmt(val, true) },
    { field: 'onRoadPrice', headerName: 'On Road Price (₹)', type: 'number', minWidth: 150, valueFormatter: (val) => fmt(val, true),
      renderCell: (params) => <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>{fmt(params.value, true)}</Box>
    },
    { field: 'basicInsurance', headerName: 'Basic Insurance', type: 'number', minWidth: 130, valueFormatter: (val) => fmt(val, true) },
    { field: 'difference', headerName: 'Difference', type: 'number', minWidth: 110, valueFormatter: (val) => fmt(val, true) },
    { field: 'vmc', headerName: 'VMC', type: 'number', minWidth: 90, valueFormatter: (val) => fmt(val, true) },
    { field: 'date', headerName: 'Date', minWidth: 110 },
    { field: 'shortCode', headerName: 'Short Code', minWidth: 110 },
    { field: 'modelName', headerName: 'Model Name', minWidth: 160 },
  ];

  const columns = baseColumns.map(col => ({
    ...col,
    filterable: col.field === 'model' ? isAdmin : false,
    disableColumnMenu: col.field === 'model' ? !isAdmin : true,
  }));

  // Calculate total pages for mobile pagination
  const totalPages = Math.ceil(totalElements / paginationModel.pageSize);

  return (
    <Box>
      {/* ── Search bar & action buttons ───────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        gap: { xs: 1.5, md: 2 },
        mb: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
      }}>
        <TextField
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={isMobile ? "Search models…" : "Search by Model Description, Model, Model Name…"}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 }, width: { xs: '100%', sm: 'auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: keyword && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setKeyword('')}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
          {isAdmin && (
            <FormControlLabel
              control={<Switch checked={uniqueModels} onChange={(e) => setUniqueModels(e.target.checked)} color="primary" />}
              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Unique Models</Typography>}
            />
          )}
          <ButtonGroup variant="outlined" size={isMobile ? "small" : "medium"} sx={{ '& .MuiButton-root': { borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' } }}>
            <Tooltip title="Export all results to Excel">
              <Button
                startIcon={exporting ? <CircularProgress size={14} /> : <Download />}
                onClick={handleExport}
                disabled={exporting || rows.length === 0}
              >
                {!isMobile && 'Export'}
              </Button>
            </Tooltip>
            <Tooltip title="Print this table">
              <Button startIcon={<Print />} onClick={handlePrint} disabled={rows.length === 0}>
                {!isMobile && 'Print'}
              </Button>
            </Tooltip>
            <Tooltip title="Reset view customizations (edits, deletions, images)">
              <Button startIcon={<Restore />} onClick={handleResetView}>
                {!isMobile && 'Reset View'}
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Box>

      {/* ── Results summary ───────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {loading && rows.length === 0 ? (
          <CircularProgress size={16} />
        ) : (
          <Chip
            label={`${totalElements.toLocaleString()} result${totalElements !== 1 ? 's' : ''}`}
            size="small"
            color={totalElements > 0 ? 'primary' : 'default'}
            icon={<TableRows sx={{ fontSize: '14px !important' }} />}
            sx={{ fontWeight: 600 }}
          />
        )}
        {debouncedKeyword && (
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            for "{debouncedKeyword}"
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Data Display: Cards on Mobile, DataGrid on Desktop ─────── */}
      {isMobile ? (
        /* ── MOBILE: Card List ───────────────────────────────────────── */
        <Box>
          {loading && rows.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#E31837' }} />
            </Box>
          ) : rows.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <Typography color="text.secondary" fontWeight={500}>No results found</Typography>
            </Paper>
          ) : (
            <>
              <Stack spacing={1.5}>
                {rows.map((row) => (
                  <MobileInventoryCard
                    key={row.id}
                    row={row}
                    keyword={debouncedKeyword}
                    onClick={() => setSelectedRow(row)}
                  />
                ))}
              </Stack>

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={paginationModel.page + 1}
                    onChange={(_, page) => setPaginationModel((prev) => ({ ...prev, page: page - 1 }))}
                    color="primary"
                    size="small"
                    siblingCount={0}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        /* ── DESKTOP: DataGrid Table (unchanged) ─────────────────────── */
        <Paper
          sx={{
            width: '100%',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={totalElements}
            loading={loading}
            pageSizeOptions={[25, 50, 100]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            disableColumnSorting
            onRowClick={(params) => setSelectedRow(params.row)}
            disableRowSelectionOnClick
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
            }
            sx={{
              height: 'calc(100vh - 300px)',
              minHeight: 400,
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#111111 !important',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                position: 'sticky',
                top: 0,
                zIndex: 3,
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#111111 !important',
                color: '#FFFFFF !important',
              },
              '& .MuiDataGrid-columnHeadersInner': {
                backgroundColor: '#111111 !important',
              },
              '& .MuiDataGrid-columnHeaderRow': {
                backgroundColor: '#111111 !important',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 700,
              },
              '& .MuiDataGrid-iconSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
                color: '#FFFFFF !important',
              },
              '& .MuiDataGrid-sortIcon': {
                color: '#FFFFFF !important',
              },
              '& .MuiDataGrid-menuIcon': {
                color: '#FFFFFF !important',
              },
              '& .MuiDataGrid-filterIcon': {
                color: '#FFFFFF !important',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                fontSize: '0.85rem',
              },
              '& .even-row': {
                backgroundColor: '#FFFFFF',
              },
              '& .odd-row': {
                backgroundColor: '#F9FAFB',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(227, 24, 55, 0.04)',
                cursor: 'pointer',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(0,0,0,0.06)',
              }
            }}
          />
        </Paper>
      )}

      {/* ── Row Detail Dialog ─────────────────────────────────────────── */}
      <RowDetailDialog
        row={selectedRow}
        keyword={debouncedKeyword}
        onClose={() => setSelectedRow(null)}
        onCopy={() => handleCopyRow(selectedRow)}
        onUpdateRow={(updatedRow) => {
          const edits = JSON.parse(localStorage.getItem('view_edits') || '{}');
          edits[updatedRow.id] = updatedRow;
          localStorage.setItem('view_edits', JSON.stringify(edits));
          
          setRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
          setSelectedRow(updatedRow);
        }}
        onDeleteRow={(id) => {
          const deletions = JSON.parse(localStorage.getItem('view_deletions') || '[]');
          if (!deletions.includes(id)) {
            deletions.push(id);
            localStorage.setItem('view_deletions', JSON.stringify(deletions));
          }
          
          setRows((prev) => prev.filter((r) => r.id !== id));
          setTotal((prev) => Math.max(0, prev - 1));
          setSelectedRow(null);
        }}
      />
    </Box>
  );
}
