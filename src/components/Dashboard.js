import React, { useEffect, useState } from 'react';
import { Box, TextField } from '@mui/material';
import Sidebar from './Sidebar';
import DataGridView from './DataGridView';
import DetailView from './DetailView';
import SnackbarAlert from './SnackbarAlert';
import MapView from './MapView';
import axios from 'axios';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('emergencies');
  const [emergencies, setEmergencies] = useState([]);
  const [towTrucks, setTowTrucks] = useState([]);
  const [expandedEmergency, setExpandedEmergency] = useState(null);
  const [expandedTowTruck, setExpandedTowTruck] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [communicationLog, setCommunicationLog] = useState([]);

  useEffect(() => {
    if (activeView !== 'map') {
      fetchDashboardData();
    }
  }, [activeView]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      const { emergencies, towTrucks } = response.data;
      setEmergencies(emergencies || []);
      setTowTrucks(towTrucks || []);
    } catch (error) {
      console.error('[Dashboard] Error fetching data:', error.response || error);
      setErrorMessage('Failed to load dashboard data. Please try again later.');
    }
  };

  const toggleRowExpansion = (record, type) => {
    if (type === 'emergency') {
      setExpandedEmergency((prev) => (prev === record.id ? null : record.id));
    } else {
      setExpandedTowTruck((prev) => (prev === record.id ? null : record.id));
    }
    setSelectedRecord(record);
    setNote(record.notes || '');
    setStatus(record.status || '');
    setCommunicationLog(record.messages || []);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar setActiveView={setActiveView} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
        {activeView === 'map' && <MapView />}
        {(activeView === 'emergencies' || activeView === 'towTrucks') && (
          <>
            <TextField
              label="Search"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <DataGridView
              rows={activeView === 'emergencies' ? emergencies : towTrucks}
              columns={[
                ...(activeView === 'emergencies'
                  ? [
                      { field: 'id', headerName: 'Emergency ID', width: 200 },
                      { field: 'name', headerName: 'Name', width: 150 },
                      { field: 'phone', headerName: 'Phone', width: 150 },
                      { field: 'location', headerName: 'Location', width: 200 },
                      { field: 'paymentStatus', headerName: 'Payment Status', width: 150 },
                      { field: 'created', headerName: 'Created', width: 150 },
                    ]
                  : [
                      { field: 'id', headerName: 'Tow Truck ID', width: 200 },
                      { field: 'companyName', headerName: 'Company Name', width: 200 },
                      { field: 'crewMember', headerName: 'Crew Member', width: 150 },
                      { field: 'phone', headerName: 'Phone Number', width: 150 },
                      { field: 'radius', headerName: 'Radius (km)', width: 150 },
                      { field: 'location', headerName: 'Location', width: 200 },
                    ]),
              ]}
              activeView={activeView}
              searchTerm={searchTerm}
              onRowClick={(params) => {
                const record =
                  activeView === 'emergencies'
                    ? emergencies.find((e) => e.id === params.row.id)
                    : towTrucks.find((t) => t.id === params.row.id);
                toggleRowExpansion(record, activeView === 'emergencies' ? 'emergency' : 'towTruck');
              }}
            />
            <DetailView
              record={
                activeView === 'emergencies'
                  ? emergencies.find((e) => e.id === expandedEmergency)
                  : towTrucks.find((t) => t.id === expandedTowTruck)
              }
              type={activeView === 'emergencies' ? 'emergency' : 'towTruck'}
              note={note}
              setNote={setNote}
              status={status}
              setStatus={setStatus}
              message={message}
              setMessage={setMessage}
              communicationLog={communicationLog}
              saveNote={fetchDashboardData}
              updateStatus={fetchDashboardData}
              sendMessage={fetchDashboardData}
            />
          </>
        )}
        <SnackbarAlert errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
      </Box>
    </Box>
  );
};

export default Dashboard;
