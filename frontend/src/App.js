import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ApartmentPage from './pages/ApartmentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        } />
        <Route path="/view-apartments" element={
          <ProtectedRoute>
            <ApartmentPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;