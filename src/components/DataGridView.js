import React, { useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import moment from 'moment';
import { formatObject, parseJSON } from '../utils/helpers'; // Ensure helper functions are imported

const DataGridView = ({ rows, columns, activeView, onRowClick, searchTerm }) => {
  const gridRef = useRef();

  // Scroll to the top of the grid when a new record is clicked
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [rows]);

  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formattedRows = filteredRows.map((item) => {
    const parsedServicesNeeded =
      activeView === 'emergencies' && item.servicesNeeded
        ? parseJSON(item.servicesNeeded).join(', ') // Parse servicesNeeded JSON
        : 'N/A';

    const parsedCrew =
      activeView === 'towTrucks' && item.crew
        ? parseJSON(item.crew).map((member) => member.name).join(', ') // Parse crew JSON
        : 'N/A';

    return {
      id: item.id,
      ...(activeView === 'emergencies'
        ? {
            name: item.name,
            phone: item.phone,
            servicesNeeded: parsedServicesNeeded, // Parsed services
            location: formatObject(item.location),
            paymentStatus: item.paymentStatus,
            created: moment(item.createdAt).fromNow(),
          }
        : {
            companyName: item.companyName,
            crewMember: parsedCrew, // Parsed crew members
            phone: item.phone,
            radius: item.radius,
            location: formatObject(item.location),
          }),
    };
  });

  return (
    <div
      ref={gridRef}
      style={{
        height: 400,
        overflowY: 'auto', // Enable scroll in this container only
      }}
    >
      <DataGrid
        rows={formattedRows}
        columns={columns}
        autoHeight
        pageSize={5}
        disableSelectionOnClick
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default DataGridView;
