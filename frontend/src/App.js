import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Existing page imports
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ApartmentPage from './pages/ApartmentsPage';
import ApartmentDetailsPage from './pages/ApartmentDetailsPage';
import MessagesPage from './pages/MessagesPage';
import AddApartmentPage from './pages/AddApartmentPage';
import Signup from './pages/signup';
import AddItemPage from './pages/AddItemPage';

// New page imports
import HomePage from './pages/HomePage';

// Import global styles
import './styles/global.css';

// Create theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
  palette: {
    primary: {
      main: '#2d4f8f',
    },
    secondary: {
      main: '#ff9800',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
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
          <Route path="/add-apartments" element={
            <ProtectedRoute>
              <AddApartmentPage />
            </ProtectedRoute>
          } />
          <Route path="/add-item" element={
            <ProtectedRoute>
              <AddItemPage />
            </ProtectedRoute>
          } />
          <Route path="/apartment/:apartmentId" element={
            <ProtectedRoute>
              <ApartmentDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />

          {/* New public routes for the landing page navigation */}
          <Route path="/apartments" element={<div>Apartments Page (Coming Soon)</div>} />
          <Route path="/marketplace" element={<div>Marketplace Page (Coming Soon)</div>} />
          <Route path="/signup" element={<div>Signup Page (Coming Soon)</div>} />
          <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
          <Route path="/contact" element={<div>Contact Page (Coming Soon)</div>} />

          {/* Fallback route */}
          <Route path="*" element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;