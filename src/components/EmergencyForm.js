import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const EmergencyForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: null,
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    serviceNeeded: [''],
  });
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Load services dynamically from the backend
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/services');
        setServiceOptions(data || []);
      } catch (error) {
        console.error('Error loading services:', error);
        setServiceOptions(['Tire Change', 'Jump Start', 'Towing', 'Fuel Delivery', 'Lockout Service']);
      }
    };
    loadServices();
  }, []);

  const captureLocation = () => {
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({ ...prev, location: { latitude, longitude } }));
        setIsLoadingLocation(false);
      },
      () => {
        alert('Failed to capture location. Please enable location services.');
        setIsLoadingLocation(false);
      }
    );
  };

  const handleServiceChange = (index, value) => {
    const updatedServices = [...form.serviceNeeded];
    updatedServices[index] = value || '';
    setForm((prev) => ({ ...prev, serviceNeeded: updatedServices }));
  };

  const addServiceField = () => {
    setForm((prev) => ({ ...prev, serviceNeeded: [...prev.serviceNeeded, ''] }));
  };

  const removeServiceField = (index) => {
    const updatedServices = [...form.serviceNeeded];
    updatedServices.splice(index, 1);
    setForm((prev) => ({ ...prev, serviceNeeded: updatedServices }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess('');

    if (!stripe || !elements) {
      alert('Stripe is not loaded yet. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: form.name,
          email: form.email,
          address: {
            line1: form.billingAddress.line1,
            city: form.billingAddress.city,
            state: form.billingAddress.state,
            postal_code: form.billingAddress.zip,
            country: form.billingAddress.country,
          },
        },
      });

      if (error) {
        throw new Error(`Payment method creation failed: ${error.message}`);
      }

      const response = await axios.post('http://localhost:5000/api/emergency', {
        ...form,
        paymentMethodId: paymentMethod.id,
      });

      const { emergencyId, paymentStatus } = response.data;

      if (paymentStatus === 'on_hold') {
        setSubmissionSuccess('Payment on hold. Emergency response is on the way.');
      }

      navigate(`/confirmation?id=${encodeURIComponent(emergencyId)}`);
    } catch (err) {
      setSubmissionError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Card elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" gutterBottom>
            Emergency Request
          </Typography>

          <Typography variant="h6" gutterBottom>
            Card Information
          </Typography>
          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <CardElement />
          </Box>

          <Typography variant="h6" gutterBottom>
            Current Location
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={captureLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? <CircularProgress size={24} /> : 'Capture Location'}
          </Button>
          {form.location && (
            <Typography sx={{ mt: 2 }}>
              Captured Coordinates: Latitude {form.location.latitude}, Longitude{' '}
              {form.location.longitude}
            </Typography>
          )}

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <TextField
            label="Phone"
            type="tel"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />

          <Typography variant="h6" sx={{ mt: 3 }}>
            Services Needed
          </Typography>
          {form.serviceNeeded.map((service, index) => (
            <Grid container spacing={2} alignItems="center" key={index}>
              <Grid item xs={10}>
                <FormControl fullWidth required>
                  <InputLabel>Service Needed</InputLabel>
                  <Select
                    value={service}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                  >
                    {serviceOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                {index > 0 && (
                  <IconButton color="error" onClick={() => removeServiceField(index)}>
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddCircleIcon />} onClick={addServiceField} sx={{ mt: 2 }}>
            Add Additional Service
          </Button>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Billing Address
          </Typography>
          <TextField
            label="Address Line 1"
            fullWidth
            margin="normal"
            value={form.billingAddress.line1}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, line1: e.target.value },
              }))
            }
            required
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={form.billingAddress.city}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, city: e.target.value },
              }))
            }
            required
          />
          <TextField
            label="State"
            fullWidth
            margin="normal"
            value={form.billingAddress.state}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, state: e.target.value },
              }))
            }
            required
          />
          <TextField
            label="ZIP/Postal Code"
            fullWidth
            margin="normal"
            value={form.billingAddress.zip}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, zip: e.target.value },
              }))
            }
            required
          />
          <TextField
            label="Country"
            fullWidth
            margin="normal"
            value={form.billingAddress.country}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, country: e.target.value },
              }))
            }
            required
          />

          {submissionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submissionError}
            </Alert>
          )}

          {submissionSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {submissionSuccess}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default EmergencyForm;
