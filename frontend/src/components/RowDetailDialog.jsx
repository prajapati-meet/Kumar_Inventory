import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, Button, Box, Typography, Divider, Grid, Chip,
  IconButton, Tooltip, Stack, Avatar, TextField, InputAdornment, Alert,
  Checkbox, FormControlLabel
} from '@mui/material';
import {
  Close, ContentCopy, Edit, DeleteOutlined, AddPhotoAlternate,
  DirectionsCar, ListAlt, Calculate, Save, Cancel, Warning, Delete, Refresh
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../auth/AuthContext';
import { getVehicleImage, uploadVehicleImage, deleteVehicleImage } from '../api/endpoints';

const CALC_FIELDS = [
  { id: 'exShowroomPrice',          label: 'Ex-Showroom Price',                    editable: false, toggleable: false },
  { id: 'rtoCharges',               label: 'RTO Registration Charges',             editable: true,  toggleable: false },
  { id: 'smartCardRc',              label: 'Smart Card RC Fee',                    editable: false, toggleable: false },
  { id: 'postSalesHandlingCharges', label: 'Post Sales Handling Charges',          editable: false, toggleable: false },
  { id: 'accessories',              label: 'Accessories Package',                  editable: false, toggleable: false },
  { id: 'basicInsurance',           label: 'Basic Insurance',                      editable: true,  toggleable: true },
  { id: 'insuranceVehicle',         label: 'Insurance - Vehicle (1+5)',            editable: true,  toggleable: true },
  { id: 'vmc',                      label: 'Vehicle Maintenance Contract (VMC)',   editable: false, toggleable: true },
];

function fmtVal(val, numeric) {
  if (val === null || val === undefined || val === '') return '0.00';
  if (numeric) {
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(val);
}

function getSpecItems(tab, row) {
  switch (tab) {
    case 'OVERVIEW & CODES':
      return [
        { label: 'Vehicle Model Code', value: row.model || '—' },
        { label: 'DMS Inventory Code', value: row.dmsCode || '—' },
        { label: 'Model Description', value: row.modelDescription || '—' },
        { label: 'Effective Pricing Date', value: row.date || '—' },
      ];
    case 'PRICING & TAXES':
      return [
        { label: 'Basic Price (Excluding Tax)', value: `₹${fmtVal(row.basicPrice, true)}` },
        { label: 'State Goods & Services Tax (SGST @ 9%)', value: `₹${fmtVal(row.sgst, true)}` },
        { label: 'Central Goods & Services Tax (CGST @ 9%)', value: `₹${fmtVal(row.cgst, true)}` },
        { label: 'Total GST Applicable (18%)', value: `₹${fmtVal((Number(row.sgst||0) + Number(row.cgst||0)), true)}` },
        { label: 'Ex-Showroom Price (Including GST)', value: `₹${fmtVal(row.exShowroomPrice, true)}` },
      ];
    case 'REGISTRATION & HANDLING':
      return [
        { label: 'RTO Registration Charges', value: `₹${fmtVal(row.rtoCharges, true)}` },
        { label: 'Smart Card RC Fee', value: `₹${fmtVal(row.smartCardRc, true)}` },
        { label: 'Post Sales Handling Charges', value: `₹${fmtVal(row.postSalesHandlingCharges, true)}` },
      ];
    case 'INSURANCE & EXTRAS':
      return [
        { label: 'Comprehensive Insurance (1 Year Own Damage + 5 Years Third Party)', value: `₹${fmtVal(row.insuranceVehicle, true)}` },
        { label: 'Basic Insurance Coverage', value: `₹${fmtVal(row.basicInsurance, true)}` },
        { label: 'Mandatory Accessories Package', value: `₹${fmtVal(row.accessories, true)}` },
        { label: 'Vehicle Maintenance Contract (VMC)', value: `₹${fmtVal(row.vmc, true)}` },
        { label: 'Price Difference / Adjustment', value: `₹${fmtVal(row.difference, true)}` },
      ];
    default:
      return [];
  }
}

/**
 * Premium Large Vehicle Details Card with Interactive Calculator & Tabbed Specs
 */
export default function RowDetailDialog({ row, keyword, onClose, onCopy, onUpdateRow, onDeleteRow }) {
  const { isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [customImg, setCustomImg] = useState(null);
  const [specTab, setSpecTab] = useState('OVERVIEW & CODES');
  const [calcValues, setCalcValues] = useState({});
  const [toggles, setToggles] = useState({
    basicInsurance: true,
    insuranceVehicle: true,
    vmc: true,
  });
  const fileInputRef = useRef(null);
  const rtoCalculatedRef = useRef(null); // tracks which row.id had RTO auto-calculated

  useEffect(() => {
    if (row) {
      setIsEditing(false);
      setConfirmDelete(false);
      setEditForm({ ...row });
      setSpecTab('OVERVIEW & CODES');

      // Auto-calculate RTO using formula (only once per vehicle)
      const basicPrice = parseFloat(row.basicPrice) || 0;
      const autoRto = Math.ceil(((basicPrice * 6) / 100) + 500);
      const isNewVehicle = rtoCalculatedRef.current !== row.id;

      // Initialize calculator with defaults from table
      setCalcValues((prev) => ({
        exShowroomPrice:          row.exShowroomPrice || 0,
        rtoCharges:               isNewVehicle ? autoRto : (prev.rtoCharges ?? autoRto),
        smartCardRc:              row.smartCardRc || 0,
        postSalesHandlingCharges: row.postSalesHandlingCharges || 0,
        insuranceVehicle:         isNewVehicle ? (row.insuranceVehicle || 0) : (prev.insuranceVehicle ?? (row.insuranceVehicle || 0)),
        accessories:              row.accessories || 0,
        basicInsurance:           isNewVehicle ? (row.basicInsurance || 0) : (prev.basicInsurance ?? (row.basicInsurance || 0)),
        vmc:                      row.vmc || 0,
      }));

      // Mark this vehicle as having had its RTO calculated
      if (isNewVehicle) {
        rtoCalculatedRef.current = row.id;
      }

      // Reset toggles for new vehicle
      setToggles({ basicInsurance: true, insuranceVehicle: true, vmc: true });

      // Fetch persistent image from database using vehicle name/model key
      setCustomImg(null); // Clear previous image while loading
      const vehicleKey = (row.modelName || row.model || '').trim().toLowerCase();
      if (vehicleKey) {
        getVehicleImage(vehicleKey)
          .then((res) => {
            if (res.data && res.data.imageData) {
              setCustomImg(res.data.imageData);
            }
          })
          .catch((err) => {
            console.error('Failed to load vehicle image from database:', err);
          });
      }
    }
  }, [row]);

  if (!row) return null;

  const vehicleName = row.modelDescription || row.model || 'Vehicle';

  // Calculate live Total On-Road Price respecting checkbox toggles
  const calcTotal = (
    (parseFloat(calcValues.exShowroomPrice) || 0) +
    (parseFloat(calcValues.rtoCharges) || 0) +
    (parseFloat(calcValues.smartCardRc) || 0) +
    (parseFloat(calcValues.postSalesHandlingCharges) || 0) +
    (parseFloat(calcValues.accessories) || 0) +
    (toggles.basicInsurance   ? (parseFloat(calcValues.basicInsurance) || 0) : 0) +
    (toggles.insuranceVehicle ? (parseFloat(calcValues.insuranceVehicle) || 0) : 0) +
    (toggles.vmc              ? (parseFloat(calcValues.vmc) || 0) : 0)
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const vehicleKey = (row.modelName || row.model || '').trim().toLowerCase();
        if (vehicleKey) {
          uploadVehicleImage(vehicleKey, base64)
            .then(() => {
              setCustomImg(base64);
              enqueueSnackbar('Vehicle photo uploaded and saved successfully!', { variant: 'success' });
            })
            .catch((err) => {
              console.error('Failed to upload vehicle image to database:', err);
              enqueueSnackbar('Failed to upload vehicle image to database.', { variant: 'error' });
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    const vehicleKey = (row.modelName || row.model || '').trim().toLowerCase();
    if (vehicleKey) {
      deleteVehicleImage(vehicleKey)
        .then(() => {
          setCustomImg(null);
          enqueueSnackbar('Vehicle photo deleted successfully!', { variant: 'info' });
        })
        .catch((err) => {
          console.error('Failed to delete vehicle image:', err);
          enqueueSnackbar('Failed to delete vehicle image.', { variant: 'error' });
        });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    if (onUpdateRow) {
      onUpdateRow(editForm);
      enqueueSnackbar('Vehicle details updated in your current view!', { variant: 'success' });
    }
    setIsEditing(false);
  };

  const handleResetCalculator = () => {
    // Recalculate RTO from formula on reset
    const basicPrice = parseFloat(row.basicPrice) || 0;
    const autoRto = Math.ceil(((basicPrice * 6) / 100) + 500);

    setCalcValues({
      exShowroomPrice:          row.exShowroomPrice || 0,
      rtoCharges:               autoRto,
      smartCardRc:              row.smartCardRc || 0,
      postSalesHandlingCharges: row.postSalesHandlingCharges || 0,
      insuranceVehicle:         row.insuranceVehicle || 0,
      accessories:              row.accessories || 0,
      basicInsurance:           row.basicInsurance || 0,
      vmc:                      row.vmc || 0,
    });
    // Reset all toggles to checked
    setToggles({ basicInsurance: true, insuranceVehicle: true, vmc: true });
    enqueueSnackbar('Calculator reset to default table values', { variant: 'info' });
  };

  const handleSaveCalculatorToView = () => {
    if (onUpdateRow) {
      onUpdateRow({ ...row, ...calcValues, onRoadPrice: calcTotal, _toggles: toggles });
      enqueueSnackbar('Calculated pricing saved to your current view!', { variant: 'success' });
    }
  };

  return (
    <Dialog
      open={!!row}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, backgroundColor: '#111111', color: '#FFFFFF' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <DirectionsCar sx={{ color: '#E31837', fontSize: 24 }} />
          <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Vehicle Information Portfolio
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#FFFFFF', '&:hover': { color: '#E31837', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 3, md: 5 } }}>
        {/* View-specific Delete Confirmation Alert */}
        {confirmDelete && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(237, 108, 2, 0.3)', backgroundColor: '#FFF4E5', p: 2.5 }}
          >
            <Typography variant="subtitle1" fontWeight={800} gutterBottom color="warning.dark">
              Remove this vehicle from your current view?
            </Typography>
            <Typography variant="body2" mb={2} color="text.primary">
              This action will hide <strong>{row.modelDescription}</strong> from your search results and current table view. It will <strong>not</strong> modify or delete the record from the database.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="contained" 
                color="error" 
                size="small" 
                startIcon={<Delete />} 
                onClick={() => {
                  if (onDeleteRow) onDeleteRow(row.id);
                  onClose();
                  enqueueSnackbar('Vehicle removed from view (database unchanged)', { variant: 'info' });
                }}
                sx={{ fontWeight: 700, px: 2 }}
              >
                Confirm Remove from View
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small" 
                onClick={() => setConfirmDelete(false)}
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
            </Stack>
          </Alert>
        )}

        {/* ── Hero Product Section ───────────────────────────────────── */}
        <Grid container spacing={5} mb={6}>
          {/* Left: Image Box */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                width: '100%',
                height: 360,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #F8F9FA 0%, #E2E8F0 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.02)',
              }}
            >
              {customImg ? (
                <>
                  <img src={customImg} alt={vehicleName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isAdmin && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<AddPhotoAlternate />}
                        size="small"
                        sx={{ backgroundColor: 'rgba(17,17,17,0.85)', color: '#fff', '&:hover': { backgroundColor: '#111' }, backdropFilter: 'blur(4px)' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ backgroundColor: 'rgba(227,24,55,0.85)', '&:hover': { backgroundColor: '#B00018' }, backdropFilter: 'blur(4px)' }}
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <DirectionsCar sx={{ fontSize: 100, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="h5" fontWeight={800} color="#94A3B8" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                    {vehicleName}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" sx={{ mt: 1 }}>
                    No photo uploaded in view
                  </Typography>
                  {isAdmin && (
                    <Button
                      variant="contained"
                      startIcon={<AddPhotoAlternate />}
                      size="small"
                      sx={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#111111', color: '#fff', '&:hover': { backgroundColor: '#333' }, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Right: Key Details / Edit Header */}
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {isEditing ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary" gutterBottom>
                  Edit Vehicle Details (View Only)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Model Description"
                      name="modelDescription"
                      value={editForm.modelDescription || ''}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Model"
                      name="model"
                      value={editForm.model || ''}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="DMS Code"
                      name="dmsCode"
                      value={editForm.dmsCode || ''}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Ex-Showroom Price (₹)"
                      name="exShowroomPrice"
                      type="number"
                      value={editForm.exShowroomPrice || ''}
                      onChange={handleFormChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={row.model} size="small" sx={{ backgroundColor: '#E31837', color: '#fff', fontWeight: 700 }} />
                  {row.dmsCode && <Chip label={`DMS: ${row.dmsCode}`} size="small" sx={{ backgroundColor: '#111111', color: '#fff', fontWeight: 700 }} />}
                  <Chip label="Active" size="small" color="success" sx={{ fontWeight: 700 }} />
                </Box>

                <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-1px', mb: 1, lineHeight: 1.1 }}>
                  {row.modelDescription}
                </Typography>

                <Typography variant="h6" color="text.secondary" fontWeight={500} mb={3}>
                  Standard Variant Details
                </Typography>

                <Box sx={{ p: 2.5, backgroundColor: '#F8F9FA', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', display: 'inline-block', alignSelf: 'flex-start' }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    Ex-Showroom Price
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={900}>
                    ₹{fmtVal(row.exShowroomPrice, true)}
                  </Typography>
                </Box>
              </>
            )}

            {/* Admin Controls */}
            {isAdmin && !isEditing && (
              <Stack direction="row" spacing={2} mt={4}>
                <Button 
                  variant="outlined" 
                  startIcon={<Edit />} 
                  color="primary" 
                  onClick={() => { setIsEditing(true); setConfirmDelete(false); }}
                  sx={{ fontWeight: 700 }}
                >
                  Edit Details
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DeleteOutlined />} 
                  color="error" 
                  onClick={() => { setConfirmDelete(true); setIsEditing(false); }}
                  sx={{ fontWeight: 700 }}
                >
                  Delete from View
                </Button>
              </Stack>
            )}

            {isEditing && (
              <Stack direction="row" spacing={2} mt={3}>
                <Button 
                  variant="contained" 
                  startIcon={<Save />} 
                  onClick={handleSaveEdit}
                  sx={{ backgroundColor: '#E31837', '&:hover': { backgroundColor: '#B00018' }, fontWeight: 700 }}
                >
                  Save to View
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Cancel />} 
                  color="inherit" 
                  onClick={() => { setIsEditing(false); setEditForm({ ...row }); }}
                  sx={{ fontWeight: 600 }}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ mb: 5, borderColor: 'rgba(0,0,0,0.08)' }} />

        {/* ── Interactive Pricing & Payment Calculator (Screenshot 1 Style) ── */}
        <Box mb={3} display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'rgba(17, 17, 17, 0.1)', color: '#111111' }}>
            <Calculate />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={900}>
              Pricing & Payment Calculator
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Default values taken from table. Editable by all users to calculate custom estimates.
            </Typography>
          </Box>
        </Box>

        {/* Total Estimated Price Banner */}
        <Box sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)', color: '#fff', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1.5 }}>
              TOTAL ESTIMATED ON-ROAD PRICE
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
              ₹{calcTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="Live Interactive Sum" sx={{ bgcolor: 'rgba(227,24,55,0.2)', color: '#FF4D6D', fontWeight: 700, border: '1px solid rgba(227,24,55,0.4)' }} />
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Refresh />}
              onClick={handleResetCalculator}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }, fontWeight: 600 }}
            >
              Reset Defaults
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Save />}
              onClick={handleSaveCalculatorToView}
              sx={{ bgcolor: '#E31837', '&:hover': { bgcolor: '#B00018' }, fontWeight: 700 }}
            >
              Save to View
            </Button>
          </Stack>
        </Box>

        {/* Grid of Input Boxes styled like Screenshot 1 */}
        <Grid container spacing={3} mb={6}>
          {CALC_FIELDS.map((field) => {
            const isEditable = field.editable;
            const isToggleable = field.toggleable;
            const isToggled = isToggleable ? toggles[field.id] : true;

            return (
              <Grid item xs={12} sm={6} md={4} key={field.id}>
                <Box sx={{
                  p: 2,
                  border: `1px solid ${isEditable ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 2,
                  bgcolor: isEditable ? '#FFFFFF' : '#F8F9FA',
                  transition: 'all 0.2s',
                  opacity: isToggleable && !isToggled ? 0.5 : 1,
                  ...(isEditable && {
                    '&:focus-within': { borderColor: '#E31837', boxShadow: '0 0 0 3px rgba(227,24,55,0.1)' },
                  }),
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {field.label}
                    </Typography>
                    {isToggleable && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={isToggled}
                            onChange={(e) => setToggles((prev) => ({ ...prev, [field.id]: e.target.checked }))}
                            sx={{
                              color: '#94A3B8',
                              '&.Mui-checked': { color: '#E31837' },
                              p: 0,
                            }}
                          />
                        }
                        label={
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: 0.3 }}>
                            {isToggled ? 'Included' : 'Excluded'}
                          </Typography>
                        }
                        sx={{ m: 0, mr: -0.5 }}
                      />
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    type="number"
                    value={calcValues[field.id] !== undefined ? calcValues[field.id] : ''}
                    onChange={(e) => {
                      if (!isEditable) return;
                      const val = e.target.value;
                      setCalcValues((prev) => ({ ...prev, [field.id]: val }));
                    }}
                    InputProps={{
                      disableUnderline: true,
                      readOnly: !isEditable,
                      startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontWeight: 800, color: isEditable ? '#111' : '#94A3B8', fontSize: '1.1rem' } }}>₹</InputAdornment>,
                      sx: {
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: isEditable ? '#111' : '#64748B',
                        cursor: isEditable ? 'text' : 'default',
                      },
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ mb: 5, borderColor: 'rgba(0,0,0,0.08)' }} />

        {/* ── Tabbed Specifications Section (Screenshot 2 Style) ───────── */}
        <Box mb={3} display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'rgba(227, 24, 55, 0.1)', color: '#E31837' }}>
            <ListAlt />
          </Avatar>
          <Typography variant="h5" fontWeight={900}>
            Specifications
          </Typography>
        </Box>

        {/* Category Tabs styled like Screenshot 2 */}
        <Stack direction="row" spacing={1.5} mb={4} flexWrap="wrap" useFlexGap>
          {['OVERVIEW & CODES', 'PRICING & TAXES', 'REGISTRATION & HANDLING', 'INSURANCE & EXTRAS'].map((tabName) => {
            const isSelected = specTab === tabName;
            return (
              <Button
                key={tabName}
                onClick={() => setSpecTab(tabName)}
                sx={{
                  borderRadius: 0,
                  px: 3,
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  border: '2px solid #111111',
                  backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#111111',
                  '&:hover': {
                    backgroundColor: isSelected ? '#000000' : '#F4F6F8',
                  },
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tabName}
              </Button>
            );
          })}
        </Stack>

        {/* Specification Items with bullet format */}
        <Box sx={{ pl: 1, minHeight: 180 }}>
          {getSpecItems(specTab, row).map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <Box sx={{ width: 6, height: 6, bgcolor: '#111111', mt: 0.8, mr: 2, flexShrink: 0 }} />
              <Typography variant="body1" color="text.primary" fontWeight={700}>
                {item.label}: <span style={{ fontWeight: 500, color: '#475569', marginLeft: 6 }}>{item.value}</span>
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Box sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#F4F6F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          💡 Any edits, calculator modifications, or image uploads apply to your active view session only.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Copy all data">
            <Button startIcon={<ContentCopy />} onClick={onCopy} sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Copy Data
            </Button>
          </Tooltip>
          <Button onClick={onClose} variant="contained" sx={{ backgroundColor: '#111111', color: '#fff', '&:hover': { backgroundColor: '#333' }, fontWeight: 700, px: 4 }}>
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
