import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, List, ListItem, ListItemText, Collapse } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import haversine from 'haversine-distance'; // Install this dependency for accurate distance calculations.

const MapView = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [towTrucks, setTowTrucks] = useState([]);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]); // Default to NYC.
  const [mapMarkers, setMapMarkers] = useState([]);
  const [matchingTrucks, setMatchingTrucks] = useState([]);
  const [expandedTruck, setExpandedTruck] = useState(null); // Track expanded truck details.

  const emergencyIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
  });

  const towTruckIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32],
  });

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
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
          radius: t.radius,
        })),
      ];

      setMapMarkers(markers);

      if (emergencies.length > 0) {
        const lastEmergency = emergencies[emergencies.length - 1];
        setMapCenter([lastEmergency.location.latitude, lastEmergency.location.longitude]);
      }

      calculateMatches(emergencies, towTrucks);
    } catch (error) {
      console.error('[MapView] Error fetching map data:', error.response || error);
    }
  };

  const calculateMatches = (emergencies, towTrucks) => {
    const lastEmergency = emergencies[emergencies.length - 1];
    if (!lastEmergency) return;

    const matches = towTrucks
      .map((truck) => {
        const distanceMiles = haversine(lastEmergency.location, truck.location) / 1609.34; // Convert meters to miles.
        if (distanceMiles <= truck.radius) {
          const totalCost = distanceMiles * truck.pricePerMile;
          return {
            truck,
            distanceMiles: distanceMiles.toFixed(2),
            totalCost: totalCost.toFixed(2),
          };
        }
        return null;
      })
      .filter(Boolean) // Remove null entries for trucks out of range.
      .sort((a, b) => a.totalCost - b.totalCost); // Sort by total cost (best price first).

    setMatchingTrucks(matches);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Grid container spacing={2} sx={{ width: '40%' }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, maxHeight: '90vh', overflowY: 'auto' }}>
            <Typography variant="h6">Matching Tow Trucks</Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {matchingTrucks.map(({ truck, distanceMiles, totalCost }, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    sx={{ bgcolor: expandedTruck === index ? '#e0ffe0' : '#ffffff', mb: 1, borderRadius: 1 }}
                    onClick={() => setExpandedTruck(expandedTruck === index ? null : index)}
                  >
                    <ListItemText
                      primary={`${truck.companyName}`}
                      secondary={`Distance: ${distanceMiles} miles | Cost: $${totalCost}`}
                    />
                  </ListItem>
                  <Collapse in={expandedTruck === index} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body1">
                        <strong>Company:</strong> {truck.companyName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Phone:</strong> {truck.phone}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Services:</strong>{' '}
                        {truck.services.map((service) => service.service).join(', ')}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Price Per Mile:</strong> ${truck.pricePerMile}
                      </Typography>
                      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                        Send Request
                      </Button>
                    </Box>
                  </Collapse>
                </React.Fragment>
              ))}
              {matchingTrucks.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'red', mt: 2 }}>
                  No matching tow trucks found within range.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ flex: 1 }}>
        <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapMarkers.map((marker, index) => (
            <React.Fragment key={index}>
              <Marker position={marker.position} icon={marker.icon}>
                <Popup>{marker.popup}</Popup>
              </Marker>
              {marker.radius && (
                <Circle
                  center={marker.position}
                  radius={marker.radius * 1609.34} // Convert miles to meters.
                  color="green"
                  fillOpacity={0.2}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapView;
