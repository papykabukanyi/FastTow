import React from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { parseJSON, formatArray, formatDate } from '../utils/helpers';

const DetailView = ({
  record,
  type,
  note,
  setNote,
  status,
  setStatus,
  message,
  setMessage,
  saveNote,
  updateStatus,
  sendMessage,
}) => {
  if (!record) return null;

  const renderDetails = () => {
    if (type === 'emergency') {
      const servicesNeeded = parseJSON(record.serviceNeeded);
      return (
        <>
          <Typography variant="h6">Emergency Details</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography>
            <strong>Name:</strong> {record.name || 'N/A'}
          </Typography>
          <Typography>
            <strong>Email:</strong> {record.email || 'N/A'}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {record.phone || 'N/A'}
          </Typography>
          <Typography>
            <strong>Location:</strong>{' '}
            {record.location
              ? `Latitude: ${record.location.latitude}, Longitude: ${record.location.longitude}`
              : 'N/A'}
          </Typography>
          <Typography>
            <strong>Billing Address:</strong>{' '}
            {record.billingAddress
              ? `${record.billingAddress.line1}, ${record.billingAddress.city}, ${record.billingAddress.state}, ${record.billingAddress.zip}, ${record.billingAddress.country}`
              : 'N/A'}
          </Typography>
          <Typography>
            <strong>Services Needed:</strong>{' '}
            {Array.isArray(servicesNeeded) && servicesNeeded.length > 0
              ? servicesNeeded.join(', ')
              : 'N/A'}
          </Typography>
          <Typography>
            <strong>Payment Status:</strong> {record.paymentStatus || 'N/A'}
          </Typography>
          <Typography>
            <strong>Status:</strong> {record.status || 'N/A'}
          </Typography>
          <Typography>
            <strong>Created At:</strong> {formatDate(record.createdAt)}
          </Typography>
          <Typography>
            <strong>Updated At:</strong> {formatDate(record.updatedAt)}
          </Typography>
        </>
      );
    } else if (type === 'towTruck') {
      const services = parseJSON(record.services);
      const crew = parseJSON(record.crew);
      return (
        <>
          <Typography variant="h6">Tow Truck Details</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography>
            <strong>Company Name:</strong> {record.companyName || 'N/A'}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {record.phone || 'N/A'}
          </Typography>
          <Typography>
            <strong>Address:</strong> {record.address || 'N/A'}
          </Typography>
          <Typography>
            <strong>Location:</strong>{' '}
            {record.location
              ? `Latitude: ${record.location.latitude}, Longitude: ${record.location.longitude}`
              : 'N/A'}
          </Typography>
          <Typography>
            <strong>Radius:</strong> {record.radius || 'N/A'}
          </Typography>
          <Typography>
            <strong>ZIP Code:</strong> {record.zipcode || 'N/A'}
          </Typography>
          <Typography>
            <strong>Price Per Mile:</strong> {record.pricePerMile || 'N/A'}
          </Typography>
          <Typography>
            <strong>Gas Price Per Gallon:</strong>{' '}
            {record.gasPricePerGallon || 'N/A'}
          </Typography>
          <Typography>
            <strong>Services Offered:</strong>{' '}
            {services.length > 0 ? formatArray(services, 'service', 'price') : 'N/A'}
          </Typography>
          <Typography>
            <strong>Crew:</strong>{' '}
            {crew.length > 0 ? formatArray(crew, 'name', 'contact') : 'N/A'}
          </Typography>
          <Typography>
            <strong>Status:</strong> {record.status || 'N/A'}
          </Typography>
          <Typography>
            <strong>Created At:</strong> {formatDate(record.createdAt)}
          </Typography>
          <Typography>
            <strong>Updated At:</strong> {formatDate(record.updatedAt)}
          </Typography>
        </>
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', mt: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 2 }}>{renderDetails()}</Paper>
      </Box>
      <Box sx={{ width: 300, ml: 2 }}>
        <TextField
          label="Notes"
          multiline
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={saveNote}>
          Send Note
        </Button>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        >
          {type === 'emergency' ? (
            <>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </>
          ) : (
            <>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
            </>
          )}
        </Select>
        <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={updateStatus}>
          Update Status
        </Button>
        <TextField
          label="Send Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
        <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={sendMessage}>
          Send Message
        </Button>
      </Box>
    </Box>
  );
};

export default DetailView;
