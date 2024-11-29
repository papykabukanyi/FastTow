import React, { useState } from 'react';
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
} from '@mui/material';

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
      country: 'US', // Default to US (ISO Code)
    },
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const captureLocation = () => {
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm({ ...form, location: { latitude, longitude } });
        setIsLoadingLocation(false);
      },
      (error) => {
        alert('Failed to capture location. Please enable location services.');
        setIsLoadingLocation(false);
      }
    );
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

      const { emergencyId } = response.data;

      // Redirect to confirmation page
      setSubmissionSuccess('Emergency created successfully.');
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
              Captured Coordinates: Latitude {form.location.latitude}, Longitude {form.location.longitude}
            </Typography>
          )}

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label="Phone"
            type="tel"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Typography variant="h6" gutterBottom>
            Billing Address
          </Typography>
          <TextField
            label="Address Line 1"
            fullWidth
            margin="normal"
            value={form.billingAddress.line1}
            onChange={(e) =>
              setForm({ ...form, billingAddress: { ...form.billingAddress, line1: e.target.value } })
            }
            required
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={form.billingAddress.city}
            onChange={(e) =>
              setForm({ ...form, billingAddress: { ...form.billingAddress, city: e.target.value } })
            }
            required
          />
          <TextField
            label="State"
            fullWidth
            margin="normal"
            value={form.billingAddress.state}
            onChange={(e) =>
              setForm({ ...form, billingAddress: { ...form.billingAddress, state: e.target.value } })
            }
            required
          />
          <TextField
            label="ZIP/Postal Code"
            fullWidth
            margin="normal"
            value={form.billingAddress.zip}
            onChange={(e) =>
              setForm({ ...form, billingAddress: { ...form.billingAddress, zip: e.target.value } })
            }
            required
          />
          <TextField
            label="Country"
            fullWidth
            margin="normal"
            value={form.billingAddress.country}
            onChange={(e) =>
              setForm({ ...form, billingAddress: { ...form.billingAddress, country: e.target.value } })
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
