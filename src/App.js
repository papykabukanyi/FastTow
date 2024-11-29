import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import EmergencyForm from './components/EmergencyForm';
import ConfirmationPage from './components/ConfirmationPage';
import Dashboard from './components/Dashboard';
import TowTruckForm from './components/TowTruckForm';

const stripePromise = loadStripe('pk_test_51QOqX2HDm0dA4vQ9I5wt01UfQb6TLqXZusUhsRuo7ef8N5xcK5dMZS875X1gFRmDegDFYUmFMjAA4xp6qzVb3H5D00UfATpdnB'); // Replace with your Stripe publishable key

const App = () => (
  <Router>
    <Elements stripe={stripePromise}>
      <Routes>
        {/* Original Routes */}
        <Route path="/" element={<EmergencyForm />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />

        {/* New Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tow-truck/register" element={<TowTruckForm />} />
      </Routes>
    </Elements>
  </Router>
);

export default App;
