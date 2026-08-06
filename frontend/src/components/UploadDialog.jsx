import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, LinearProgress,
  Alert, Chip, IconButton
} from '@mui/material';
import { Close, CloudUpload, CheckCircle, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { uploadExcel } from '../api/endpoints';

/**
 * Drag-and-drop Excel upload dialog.
 * Shows upload progress, success/error states.
 */
export default function UploadDialog({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [sheetName, setSheetName] = useState('19-05-26');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f && f.name.endsWith('.xlsx')) {
      setFile(f);
      setStatus(null);
      setErrorMsg('');
    } else {
      setErrorMsg('Only .xlsx files are accepted.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      const res = await uploadExcel(file, sheetName, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setProgress(pct);
      });
      setResult(res.data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (status === 'success') onSuccess();
    else onClose();
    // Reset
    setFile(null);
    setProgress(0);
    setStatus(null);
    setResult(null);
    setErrorMsg('');
    setSheetName('19-05-26');
  };

  return (
    <Dialog
      open={open}
      onClose={status === 'uploading' ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59,130,246,0.2)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload sx={{ color: 'primary.main' }} />
          <Typography fontWeight={700}>Upload Excel File</Typography>
        </Box>
        {status !== 'uploading' && (
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Sheet name field */}
        <TextField
          fullWidth
          label="Sheet Name"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          helperText="Exact name of the Excel sheet to import"
          sx={{ mb: 2 }}
          disabled={status === 'uploading'}
        />

        {/* Drop zone */}
        {status !== 'success' && (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? '#3B82F6' : 'rgba(148,163,184,0.3)'}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isDragActive ? 'rgba(59,130,246,0.08)' : 'rgba(15,23,42,0.4)',
              '&:hover': {
                borderColor: '#3B82F6',
                background: 'rgba(59,130,246,0.05)',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 1 }} />
            {file ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                <InsertDriveFile sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  {file.name}
                </Typography>
                <Chip label={`${(file.size / 1024).toFixed(1)} KB`} size="small" />
              </Box>
            ) : (
              <>
                <Typography color="text.secondary" mb={0.5}>
                  {isDragActive ? 'Drop the file here...' : 'Drag & drop an Excel file here'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  or click to browse — .xlsx files only, max 50 MB
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Progress */}
        {status === 'uploading' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Uploading and importing... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 8 }} />
          </Box>
        )}

        {/* Success state */}
        {status === 'success' && result && (
          <Box sx={{ mt: 2, p: 2, background: 'rgba(16,185,129,0.08)', borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <Typography color="success.main" fontWeight={700}>Import Successful!</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              📊 Records imported: <strong>{result.recordsImported}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📄 File: <strong>{result.fileName}</strong> → Sheet: <strong>{result.sheetName}</strong>
            </Typography>
          </Box>
        )}

        {/* Error */}
        {(status === 'error' || errorMsg) && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={status === 'uploading'}>
          {status === 'success' ? 'Done' : 'Cancel'}
        </Button>
        {status !== 'success' && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || status === 'uploading'}
            startIcon={<CloudUpload />}
          >
            {status === 'uploading' ? 'Importing...' : 'Upload & Import'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
