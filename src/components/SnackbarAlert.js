import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarAlert = ({ errorMessage, setErrorMessage }) => (
  <Snackbar
    open={!!errorMessage}
    autoHideDuration={6000}
    onClose={() => setErrorMessage('')}
  >
    <Alert severity="error">{errorMessage}</Alert>
  </Snackbar>
);

export default SnackbarAlert;
