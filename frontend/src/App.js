import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Page imports
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ApartmentPage from './pages/ApartmentsPage';
import ApartmentDetailsPage from './pages/ApartmentDetailsPage';
import MessagesPage from './pages/MessagesPage';
import AddApartmentPage from './pages/AddApartmentPage';
import Signup from './pages/signup';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ItemPage from './pages/ItemsPage';
import HomePage from './pages/HomePage';
import SavedPostsPage from './pages/SavedPostsPage';
import OTPVerification from './components/OTPVerification';
import AuthRedirect from './components/AuthRedirect';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';


import MyPostsPage from './pages/MyPostsPage';
import EditApartmentPage from './pages/EditApartmentPage'
import EditItemPage from './pages/EditItemPage'

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
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppNavbar />
          {/* Add padding to account for fixed navbar */}
          {/* <Box sx={{ paddingTop: '64px' }}> */}
          <Box sx={{}}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/view-apartments" element={<ApartmentPage />} />
              <Route path="/view-marketplace" element={<ItemPage />} />
              <Route path="/apartment/:apartmentId" element={<ApartmentDetailsPage />} />
              <Route path="/item/get_item/:itemId" element={<ItemDetailsPage />} />

              {/* Auth routes - redirect if already logged in */}
              <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
              <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
              <Route path="/verify-otp" element={<OTPVerification />} />

              {/* Protected routes - require login */}
              <Route path="/welcome" element={
                <ProtectedRoute>
                  <WelcomePage />
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
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/saved-posts" element={
                <ProtectedRoute>
                  <SavedPostsPage />
                </ProtectedRoute>
              } />
              <Route path="/my_posts" element={
                <ProtectedRoute>
                  <MyPostsPage />
                </ProtectedRoute>
              } />
              <Route path="/edit-apartment/:apartmentId" element={
                <ProtectedRoute>
                  <EditApartmentPage />
                </ProtectedRoute>
              } />
              <Route path="/edit-item/:itemId" element={
                <ProtectedRoute>
                  <EditItemPage />
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;