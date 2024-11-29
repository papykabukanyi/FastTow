import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

const TowTruckForm = () => {
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    location: null,
    radius: '',
    zipcode: '',
    pricePerMile: '',
    services: [{ service: '', price: '' }],
    crew: [{ name: '', contact: '' }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // Handle general input changes
  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value || '',
    }));
  };

  // Manage service fields
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...form.services];
    updatedServices[index][field] = value || '';
    setForm((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  const addServiceField = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { service: '', price: '' }],
    }));
  };

  const removeServiceField = (index) => {
    const updatedServices = [...form.services];
    updatedServices.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  // Manage crew member fields
  const handleCrewChange = (index, field, value) => {
    const updatedCrew = [...form.crew];
    updatedCrew[index][field] = value || '';
    setForm((prev) => ({
      ...prev,
      crew: updatedCrew,
    }));
  };

  const addCrewField = () => {
    setForm((prev) => ({
      ...prev,
      crew: [...prev.crew, { name: '', contact: '' }],
    }));
  };

  const removeCrewField = (index) => {
    const updatedCrew = [...form.crew];
    updatedCrew.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      crew: updatedCrew,
    }));
  };

  // Load address suggestions using OpenStreetMap
  const loadAddressSuggestions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: inputValue,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
      });
      return response.data.map((place) => ({
        value: place.display_name,
        label: place.display_name,
        coordinates: {
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
        },
      }));
    } catch (error) {
      console.error('Error fetching address suggestions:', error.message);
      return [];
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess('');

    // Validate service and crew fields
    if (
      form.services.some((service) => !service.service || !service.price) ||
      form.crew.some((member) => (!member.name && member.contact) || (member.name && !member.contact))
    ) {
      setSubmissionError('Please complete all service and crew fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/towTruck/register', form);
      setSubmissionSuccess(response.data.message || 'Tow truck registered successfully!');
      setForm({
        name: '',
        companyName: '',
        phone: '',
        address: '',
        location: null,
        radius: '',
        zipcode: '',
        pricePerMile: '',
        services: [{ service: '', price: '' }],
        crew: [{ name: '', contact: '' }],
      });
    } catch (err) {
      setSubmissionError(err.response?.data?.error || 'Failed to register tow truck.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      p={4}
      sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        Register Tow Truck
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit}>
        <TextField
          label="Tow Truck Name"
          fullWidth
          margin="normal"
          required
          value={form.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        <TextField
          label="Company Name"
          fullWidth
          margin="normal"
          required
          value={form.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
        />
        <TextField
          label="Phone"
          fullWidth
          margin="normal"
          required
          value={form.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Address
        </Typography>
        <AsyncSelect
          cacheOptions
          loadOptions={loadAddressSuggestions}
          defaultOptions={false}
          onChange={(selectedOption) => {
            handleInputChange('address', selectedOption?.value || '');
            handleInputChange('location', selectedOption?.coordinates || null);
          }}
          placeholder="Start typing an address..."
          isClearable
        />
        <TextField
          label="Radius (miles)"
          fullWidth
          margin="normal"
          required
          type="number"
          value={form.radius}
          onChange={(e) => handleInputChange('radius', e.target.value)}
        />
        <TextField
          label="ZIP Code"
          fullWidth
          margin="normal"
          required
          value={form.zipcode}
          onChange={(e) => handleInputChange('zipcode', e.target.value)}
        />
        <TextField
          label="Price Per Mile"
          fullWidth
          margin="normal"
          required
          type="number"
          value={form.pricePerMile}
          onChange={(e) => handleInputChange('pricePerMile', e.target.value)}
        />

        {/* Services Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Services Offered
        </Typography>
        {form.services.map((service, index) => (
          <Grid container spacing={2} key={index} alignItems="center">
            <Grid item xs={5}>
              <TextField
                label="Service Name"
                fullWidth
                required
                value={service.service}
                onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Price"
                fullWidth
                required
                type="number"
                value={service.price}
                onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              {index > 0 && (
                <IconButton
                  color="error"
                  onClick={() => removeServiceField(index)}
                >
                  <RemoveCircleIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
        <Button startIcon={<AddCircleIcon />} onClick={addServiceField} sx={{ mt: 2 }}>
          Add Service
        </Button>

        {/* Crew Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Crew Members (Optional)
        </Typography>
        {form.crew.map((member, index) => (
          <Grid container spacing={2} key={index} alignItems="center">
            <Grid item xs={6}>
              <TextField
                label="Crew Member Name"
                fullWidth
                value={member.name}
                onChange={(e) => handleCrewChange(index, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Info"
                fullWidth
                value={member.contact}
                onChange={(e) => handleCrewChange(index, 'contact', e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              {index > 0 && (
                <IconButton
                  color="error"
                  onClick={() => removeCrewField(index)}
                >
                  <RemoveCircleIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
        <Button startIcon={<AddCircleIcon />} onClick={addCrewField} sx={{ mt: 2 }}>
          Add Crew Member
        </Button>

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
          sx={{ mt: 4 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Register Tow Truck'}
        </Button>
      </form>
    </Box>
  );
};

export default TowTruckForm;
