import React, { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Collapse,
  Snackbar,
  Alert,
  Paper,
  MenuItem,
  Select,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import moment from 'moment';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('map');
  const [emergencies, setEmergencies] = useState([]);
  const [towTrucks, setTowTrucks] = useState([]);
  const [expandedEmergency, setExpandedEmergency] = useState(null);
  const [expandedTowTruck, setExpandedTowTruck] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]); // Default to NYC
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [communicationLog, setCommunicationLog] = useState([]);

  const emergencyIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
  });

  const towTruckIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32],
  });

  useEffect(() => {
    fetchDashboardData();
    restoreExpandedDetails();
  }, [activeView]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      const { emergencies, towTrucks } = response.data;

      setEmergencies(emergencies || []);
      setTowTrucks(towTrucks || []);

      const markers = [
        ...emergencies.map((e) => ({
          position: [e.location.latitude, e.location.longitude],
          popup: `Emergency: ${e.name}`,
          icon: emergencyIcon,
        })),
        ...towTrucks.map((t) => ({
          position: [t.location.latitude, t.location.longitude],
          popup: `Tow Truck: ${t.companyName}`,
          icon: towTruckIcon,
        })),
      ];

      setMapMarkers(markers);
      if (emergencies.length > 0) {
        const lastEmergency = emergencies[emergencies.length - 1];
        setMapCenter([lastEmergency.location.latitude, lastEmergency.location.longitude]);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching data:', error.response || error);
      setErrorMessage('Failed to load dashboard data. Please try again later.');
    }
  };

  const toggleRowExpansion = (record, type) => {
    if (type === 'emergency') {
      setExpandedEmergency((prev) => (prev === record.id ? null : record.id));
      setSelectedRecord(record);
    } else {
      setExpandedTowTruck((prev) => (prev === record.id ? null : record.id));
      setSelectedRecord(record);
    }
    setNote(record.notes || '');
    setStatus(record.status || '');
    setCommunicationLog(record.communications || []);
  };

  const restoreExpandedDetails = () => {
    if (activeView === 'emergencies') {
      setSelectedRecord(
        emergencies.find((e) => e.id === expandedEmergency) || null
      );
    } else if (activeView === 'towTrucks') {
      setSelectedRecord(
        towTrucks.find((t) => t.id === expandedTowTruck) || null
      );
    } else {
      setSelectedRecord(null);
    }
  };

  const saveNoteAndStatus = async () => {
    try {
      await axios.post(`http://localhost:5000/api/${activeView}/update`, {
        id: selectedRecord.id,
        note,
        status,
      });
      setErrorMessage('');
      fetchDashboardData();
    } catch (error) {
      console.error('[Dashboard] Error saving note and status:', error.response || error);
      setErrorMessage('Failed to save note and status. Please try again.');
    }
  };

  const sendMessage = async () => {
    try {
      await axios.post(`http://localhost:5000/api/${activeView}/message`, {
        id: selectedRecord.id,
        message,
      });
      setCommunicationLog((prev) => [...prev, { message, timestamp: new Date().toISOString() }]);
      setMessage('');
      setErrorMessage('');
    } catch (error) {
      console.error('[Dashboard] Error sending message:', error.response || error);
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  const renderDetails = (record, type) => {
    if (!record) return null;

    return (
      <Box sx={{ display: 'flex', mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              {type === 'emergency' ? 'Emergency Details' : 'Tow Truck Details'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {Object.entries(record).map(([key, value]) => (
              <Typography key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </Typography>
            ))}
          </Paper>
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
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={saveNoteAndStatus}
          >
            Save
          </Button>
          <TextField
            label="Send Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 1 }}
            onClick={sendMessage}
          >
            Send
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Notes and Communication</Typography>
          <Box>
            {communicationLog.map((log, index) => (
              <Typography key={index}>
                <strong>{moment(log.timestamp).fromNow()}:</strong> {log.message}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240 },
        }}
      >
        <Toolbar>
          <Typography variant="h6">TowLink⚡</Typography>
        </Toolbar>
        <List>
          <ListItemButton onClick={() => setActiveView('emergencies')}>
            <ListItemText primary="Emergency📞" />
          </ListItemButton>
          <ListItemButton onClick={() => setActiveView('towTrucks')}>
            <ListItemText primary="Tow Truck🔌" />
          </ListItemButton>
          <ListItemButton onClick={() => setActiveView('map')}>
            <ListItemText primary="Map🔥" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
        {activeView === 'map' && (
          <Box sx={{ flex: 1 }}>
            <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mapMarkers.map((marker, index) => (
                <Marker key={index} position={marker.position} icon={marker.icon}>
                  <Popup>{marker.popup}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        )}
        {(activeView === 'emergencies' || activeView === 'towTrucks') && (
          <>
            <TextField
              label="Search"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <DataGrid
              rows={(activeView === 'emergencies' ? emergencies : towTrucks).map((item) => ({
                id: item.id,
                ...(activeView === 'emergencies'
                  ? {
                      name: item.name,
                      phone: item.phone,
                      paymentStatus: item.paymentStatus,
                      created: moment(item.createdAt).fromNow(),
                    }
                  : {
                      companyName: item.companyName,
                      crewMember: item.crew?.[0]?.name || 'N/A',
                      phone: item.phone,
                      radius: item.radius,
                      location: `${item.location.latitude}, ${item.location.longitude}`,
                    }),
              }))}
              columns={[
                ...(activeView === 'emergencies'
                  ? [
                      { field: 'id', headerName: 'Emergency ID', width: 200 },
                      { field: 'name', headerName: 'Name', width: 150 },
                      { field: 'phone', headerName: 'Phone', width: 150 },
                      { field: 'paymentStatus', headerName: 'Payment Status', width: 150 },
                      { field: 'created', headerName: 'Created', width: 150 },
                    ]
                  : [
                      { field: 'id', headerName: 'Tow Truck ID', width: 200 },
                      { field: 'companyName', headerName: 'Company Name', width: 200 },
                      { field: 'crewMember', headerName: 'Crew Member', width: 150 },
                      { field: 'phone', headerName: 'Phone Number', width: 150 },
                      { field: 'radius', headerName: 'Radius', width: 100 },
                      { field: 'location', headerName: 'Location', width: 200 },
                    ]),
              ]}
              autoHeight
              pageSize={5}
              disableSelectionOnClick
              onRowClick={(params) => {
                const record =
                  activeView === 'emergencies'
                    ? emergencies.find((e) => e.id === params.row.id)
                    : towTrucks.find((t) => t.id === params.row.id);
                toggleRowExpansion(record, activeView === 'emergencies' ? 'emergency' : 'towTruck');
              }}
            />
            {renderDetails(
              activeView === 'emergencies'
                ? emergencies.find((e) => e.id === expandedEmergency)
                : towTrucks.find((t) => t.id === expandedTowTruck),
              activeView === 'emergencies' ? 'emergency' : 'towTruck'
            )}
          </>
        )}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
        >
          <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Dashboard;
