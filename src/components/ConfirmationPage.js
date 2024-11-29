import React from 'react';
import { useLocation } from 'react-router-dom';

const ConfirmationPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const emergencyId = query.get('id');

  return (
    <div className="container mt-4">
      <h1>Thank You!</h1>
      <p>Your emergency is on the way.</p>
      <a href={`/status?id=${emergencyId}`} className="btn btn-link">
        Click here to see the status
      </a>
    </div>
  );
};

export default ConfirmationPage;
