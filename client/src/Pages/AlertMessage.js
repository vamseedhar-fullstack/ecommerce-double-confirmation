import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert'; // Renamed from Alert to MuiAlert

export default function AlertMessage({ open, severity, message, handleClose }) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <MuiAlert onClose={handleClose} severity={severity}> {/* Changed from Alert to MuiAlert */}
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
