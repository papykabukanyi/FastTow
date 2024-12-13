import React from 'react';
import { Box, Drawer, Toolbar, Typography, List, ListItemButton, ListItemText } from '@mui/material';

const Sidebar = ({ setActiveView }) => {
  return (
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
  );
};

export default Sidebar;
