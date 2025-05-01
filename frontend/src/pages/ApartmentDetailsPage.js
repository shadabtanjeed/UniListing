import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Paper,
    Divider,
    Container,
    Grid,
    Card,
    CardContent,
    Chip,
    Tabs,
    Tab,
} from '@mui/material';
import AppNavbar from '../components/Navbar';
import ProtectedFeature from '../components/ProtectedFeature';
import { API_BASE_URL } from '../config/api-config';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BathroomIcon from '@mui/icons-material/Bathroom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ElevatorIcon from '@mui/icons-material/Elevator';
import PowerIcon from '@mui/icons-material/Power';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SecurityIcon from '@mui/icons-material/Security';
import BalconyIcon from '@mui/icons-material/Balcony';
import WeekendIcon from '@mui/icons-material/Weekend';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';


// Styles
import '../styles/ApartmentDetails.css';

// Lazy loaded components
const ApartmentLocationMap = React.lazy(() => import('../components/ApartmentLocationMap'));

// Image Carousel Component
const ImageCarousel = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getImageUrl = (image) => {
        try {
            const base64String = btoa(
                new Uint8Array(image.data.data)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            return `data:${image.contentType};base64,${base64String}`;
        } catch (err) {
            console.error('Error processing image:', err);
            return 'https://via.placeholder.com/800x500?text=No+Image+Available';
        }
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (!images || images.length === 0) {
        return (
            <Box className="image-carousel-container">
                <img
                    src="https://via.placeholder.com/800x500?text=No+Image+Available"
                    alt="No Image Available"
                    className="apartment-detail-image"
                />
            </Box>
        );
    }

    return (
        <Box className="image-carousel-container">
            <Box className="image-slide">
                <img
                    src={getImageUrl(images[currentImageIndex])}
                    alt={`Apartment View ${currentImageIndex + 1}`}
                    className="apartment-detail-image"
                />
                <Box className="gradient-overlay left"></Box>
                <Box className="gradient-overlay right"></Box>
            </Box>

            <Box className="carousel-controls">
                <Button
                    className="carousel-button prev"
                    onClick={handlePrevious}
                    disabled={images.length <= 1}
                >
                    <ChevronLeftIcon />
                </Button>
                <Typography className="image-indicator">
                    {currentImageIndex + 1} / {images.length}
                </Typography>
                <Button
                    className="carousel-button next"
                    onClick={handleNext}
                    disabled={images.length <= 1}
                >
                    <ChevronRightIcon />
                </Button>
            </Box>
        </Box>
    );
};

// Contact Info Component (sticky)
const ContactInfoCard = ({ apartment }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [savedPostId, setSavedPostId] = useState(null);

    // Update the checkIfSaved function in the ContactInfoCard component
    useEffect(() => {
        // Inside ContactInfoCard component, update the checkIfSaved function:

        const checkIfSaved = async () => {

            const apartmentIdToCheck = apartment.apartment_id || apartment._id;
            console.log("Checking if apartment is saved with ID:", apartmentIdToCheck);

            // First check if user is logged in to avoid unnecessary API calls
            try {
                const sessionResponse = await fetch(`${API_BASE_URL}/auth/session`, {
                    method: 'GET',
                    credentials: 'include',
                });

                // Only proceed if user is logged in
                if (sessionResponse.ok) {
                    const response = await fetch(`${API_BASE_URL}/api/saved-posts/check/apartment/${apartmentIdToCheck}`, {
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setIsSaved(data.isSaved);
                    } else {
                        setIsSaved(false);
                    }
                } else {
                    // Not logged in, so apartment is definitely not saved
                    setIsSaved(false);
                }
            } catch (error) {
                console.error('Error checking saved status:', error);
                setIsSaved(false);
            }
        };

        checkIfSaved();
    }, [apartment._id, apartment.apartment_id]); // Add apartment.apartment_id to dependencies

    // Update the handleSaveToggle function in the ContactInfoCard component

    const handleSaveToggle = async () => {
        try {
            if (isSaved) {
                // Unsave the apartment
                const response = await fetch(`${API_BASE_URL}/api/saved-posts/unsave/${savedPostId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    setIsSaved(false);
                    setSavedPostId(null);
                    alert('Apartment unsaved successfully!'); // Added success alert
                }
            } else {
                // Save the apartment
                const response = await fetch(`${API_BASE_URL}/api/saved-posts/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    // Update this in handleSaveToggle function
                    body: JSON.stringify({
                        type: 'apartment',
                        apartment_id: apartment.apartment_id || apartment._id // Try to use apartment_id if available
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsSaved(true);
                    setSavedPostId(data.postId);
                    alert('Apartment saved successfully!'); // Added success alert
                }
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
            alert('Failed to save/unsave apartment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSendMessage = async () => {
        try {
            // Check if posted_by exists and is a valid username
            if (!apartment.posted_by) {
                throw new Error('Cannot send message: Apartment poster information is missing');
            }

            console.log("Sending message to user:", apartment.posted_by);

            const image = apartment.images[0];
            console.log("Image selected:", image ? "Yes" : "No");

            let imageData = null;
            if (image) {
                console.log("Processing image data...");
                try {
                    imageData = {
                        data: btoa(
                            new Uint8Array(image.data.data).reduce(
                                (data, byte) => data + String.fromCharCode(byte),
                                ''
                            )
                        ),
                        contentType: image.contentType,
                        fileName: image.name,
                    };
                    console.log("Image data processed successfully");
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                }
            }

            console.log("Sending request to:", `${API_BASE_URL}/api/messages/send`);
            console.log("Request payload:", {
                receiver: apartment.posted_by, // Make sure this is the username
                text: `I am interested in the apartment: ${apartment.title}`,
                imageIncluded: !!imageData
            });

            const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    receiver: apartment.posted_by, // Ensure this is the username, not display name
                    text: `I am interested in the apartment: ${apartment.title}`,
                    conversationId: null,
                    image: imageData,
                }),
            });

            console.log("Response status:", response.status);
            const responseData = await response.json();
            console.log("Response data:", responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to send message');
            }

            alert('Message sent successfully!');

            // Add a small delay to ensure the backend has time to process the message
            setTimeout(() => {
                navigate('/messages', { state: { forceRefresh: true } });
            }, 500);
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error.message}`);
        }
    };

    return (
        <Card className="contact-card">
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarTodayIcon color="primary" />
                    <Typography variant="body2">
                        Listed on {formatDate(apartment.listing_date)}
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon color="primary" />
                    <Typography>{apartment.contact_info.name}</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="primary" />
                    <Typography>{apartment.contact_info.phone}</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <EmailIcon color="primary" />
                    <Typography>{apartment.contact_info.email}</Typography>
                </Box>

                <ProtectedFeature
                    onAuthSuccess={handleSendMessage}
                >
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<MessageIcon />}
                        sx={{
                            backgroundColor: "#2d4f8f",
                            '&:hover': {
                                backgroundColor: "#1e3a6a"
                            }
                        }}
                    >
                        Send Message
                    </Button>
                </ProtectedFeature>

                <ProtectedFeature
                    onAuthSuccess={handleSaveToggle}
                >
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        sx={{
                            mt: 2,
                            borderColor: "#2d4f8f",
                            color: "#2d4f8f",
                            '&:hover': {
                                borderColor: "#1e3a6a",
                                backgroundColor: "#f0f3f9"
                            }
                        }}
                    >
                        {isSaved ? 'Unsave Apartment' : 'Save Apartment'}
                    </Button>
                </ProtectedFeature>
            </CardContent>
        </Card>
    );
};

// Main Feature Icons Components
const FeatureIcons = ({ apartment }) => {
    return (
        <Box className="feature-icons">
            <Box className="feature">
                <BedIcon color="primary" />
                <Box>
                    <Typography variant="h6">{apartment.bedrooms.total}</Typography>
                    <Typography variant="body2">Total Beds</Typography>
                </Box>
            </Box>

            <Box className="feature">
                <MeetingRoomIcon color="primary" />
                <Box>
                    <Typography variant="h6">{apartment.bedrooms.available}</Typography>
                    <Typography variant="body2">Available</Typography>
                </Box>
            </Box>

            <Box className="feature">
                <BathroomIcon color="primary" />
                <Box>
                    <Typography variant="h6">{apartment.bathrooms.total}</Typography>
                    <Typography variant="body2">Bathrooms</Typography>
                </Box>
            </Box>

            <Box className="feature">
                <SquareFootIcon color="primary" />
                <Box>
                    <Typography variant="h6">{apartment.optional_details.size || 'N/A'}</Typography>
                    <Typography variant="body2">Sq. Ft.</Typography>
                </Box>
            </Box>
        </Box>
    );
};

// Tab Content Components
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`apartment-tabpanel-${index}`}
            aria-labelledby={`apartment-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

// Overview Section
const Overview = ({ apartment }) => {
    const splitDescription = (description) => {
        if (!description) return ['No description provided for this property.'];
        return description.split('.').filter((sentence) => sentence.trim() !== '').map((sentence) => sentence.trim() + '.');
    };

    return (
        <Box id="overview-section" className="detail-section">
            <Box className="section-header">
                <DescriptionIcon color="primary" />
                <Typography variant="h6">Overview</Typography>
            </Box>
            <Box sx={{ mt: 2, lineHeight: 1.8 }}>
                {splitDescription(apartment.optional_details.more_details).map((sentence, index) => (
                    <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                        {sentence}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

// Amenities Section
const Amenities = ({ apartment }) => {
    const amenities = apartment.amenities;
    const amenitiesList = [
        { name: "Gas Supply", value: amenities.gas, icon: <LocalGasStationIcon /> },
        { name: "Elevator", value: amenities.lift, icon: <ElevatorIcon /> },
        { name: "Generator", value: amenities.generator, icon: <PowerIcon /> },
        { name: "Parking", value: amenities.parking, icon: <DirectionsCarIcon /> },
        { name: "Security", value: amenities.security, icon: <SecurityIcon /> },
        { name: "Balcony", value: apartment.optional_details.balcony, icon: <BalconyIcon /> },
        { name: "Furnished", value: apartment.optional_details.furnished, icon: <WeekendIcon /> },
        { name: "Utility Bills Included", value: apartment.utility_bill_included, icon: <PowerIcon /> }
    ];

    return (
        <Box id="amenities-section" className="detail-section">
            <Box className="section-header">
                <WeekendIcon color="primary" />
                <Typography variant="h6">Amenities</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {amenitiesList.map((amenity, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box className={`amenity-item ${amenity.value ? 'available' : 'not-available'}`}>
                            {amenity.icon}
                            <Typography variant="body2">{amenity.name}</Typography>
                            <Box className="amenity-status">
                                {amenity.value ? '✓' : '✗'}
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// Additional Details Section
const AdditionalDetails = ({ apartment }) => {
    return (
        <Box id="details-section" className="detail-section">
            <Box className="section-header">
                <LocationCityIcon color="primary" />
                <Typography variant="h6">Additional Details</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Paper className="details-paper" elevation={0}>
                        <Typography variant="subtitle1">Rental Information</Typography>
                        <Divider sx={{ my: 1 }} />

                        <Box className="detail-item">
                            <Typography variant="body2">Rent Type:</Typography>
                            <Chip
                                label={apartment.rent_type.full_apartment ? "Full Apartment" : "Partial Rental"}
                                color={apartment.rent_type.full_apartment ? "primary" : "secondary"}
                                size="small"
                            />
                        </Box>

                        {!apartment.rent_type.full_apartment && (
                            <Box className="detail-item">
                                <Typography variant="body2">Rooms Available:</Typography>
                                <Typography>{apartment.bedrooms.available}</Typography>
                            </Box>
                        )}

                        <Box className="detail-item">
                            <Typography variant="body2">Negotiable:</Typography>
                            <Typography>{apartment.rent.negotiable ? "Yes" : "No"}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="details-paper" elevation={0}>
                        <Typography variant="subtitle1">Tenant Preferences</Typography>
                        <Divider sx={{ my: 1 }} />

                        <Box className="detail-item">
                            <Typography variant="body2">Preferred Tenants:</Typography>
                            <Typography>{apartment.tenancy_preferences.preferred_tenants || "Not specified"}</Typography>
                        </Box>

                        <Box className="detail-item">
                            <Typography variant="body2">Preferred Departments:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {apartment.tenancy_preferences.preferred_dept &&
                                    apartment.tenancy_preferences.preferred_dept.length > 0 ? (
                                    apartment.tenancy_preferences.preferred_dept.map((dept, idx) => (
                                        <Chip key={idx} label={dept} size="small" variant="outlined" />
                                    ))
                                ) : (
                                    <Typography>Any</Typography>
                                )}
                            </Box>
                        </Box>

                        <Box className="detail-item">
                            <Typography variant="body2">Preferred Semesters:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {apartment.tenancy_preferences.preferred_semester &&
                                    apartment.tenancy_preferences.preferred_semester.length > 0 ? (
                                    apartment.tenancy_preferences.preferred_semester.map((sem, idx) => (
                                        <Chip key={idx} label={sem} size="small" variant="outlined" />
                                    ))
                                ) : (
                                    <Typography>Any</Typography>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="details-paper" elevation={0}>
                        <Typography variant="subtitle1">Room Information</Typography>
                        <Divider sx={{ my: 1 }} />

                        <Box className="detail-item">
                            <Typography variant="body2">Total Bedrooms:</Typography>
                            <Typography>{apartment.bedrooms.total}</Typography>
                        </Box>

                        <Box className="detail-item">
                            <Typography variant="body2">Available Bedrooms:</Typography>
                            <Typography>{apartment.bedrooms.available}</Typography>
                        </Box>

                        <Box className="detail-item">
                            <Typography variant="body2">Total Bathrooms:</Typography>
                            <Typography>{apartment.bathrooms.total}</Typography>
                        </Box>

                        <Box className="detail-item">
                            <Typography variant="body2">Common Bathrooms:</Typography>
                            <Typography>{apartment.bathrooms.common}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="details-paper" elevation={0}>
                        <Typography variant="subtitle1">Current Tenants</Typography>
                        <Divider sx={{ my: 1 }} />

                        <Box className="detail-item">
                            <Typography variant="body2">Number of Current Tenants:</Typography>
                            <Typography>{apartment.current_tenants.total}</Typography>
                        </Box>

                        {apartment.current_tenants.details && apartment.current_tenants.details.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Tenant Details:</Typography>
                                {apartment.current_tenants.details.map((tenant, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <SchoolIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {tenant.department}, {tenant.semester} Semester
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// Location Section
const Location = ({ apartment }) => {
    // Extract coordinates from the apartment data
    const position = apartment.location.geolocation ?
        [apartment.location.geolocation.latitude, apartment.location.geolocation.longitude] :
        [23.7937, 90.4066]; // Default to some Dhaka coordinates if not available

    return (
        <Box id="location-section" className="detail-section">
            <Box className="section-header">
                <LocationOnIcon color="primary" />
                <Typography variant="h6">Location</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
                {/* Address information */}
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Area:</strong> {apartment.location.area}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Address:</strong> {apartment.location.address}
                </Typography>

                {/* Map container */}
                <Box
                    sx={{
                        height: '400px',
                        width: '100%',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                >
                    <React.Suspense fallback={
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    }>
                        <ApartmentLocationMap position={position} address={apartment.location.address} />
                    </React.Suspense>
                </Box>
            </Box>
        </Box>
    );
};

// Main Component
const ApartmentDetailsPage = () => {
    const { apartmentId } = useParams();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const overviewRef = useRef(null);
    const amenitiesRef = useRef(null);
    const detailsRef = useRef(null);
    const locationRef = useRef(null);

    useEffect(() => {
        const fetchApartmentDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setApartment(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch apartment details');
                console.error('Error fetching apartment details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApartmentDetails();
    }, [apartmentId]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);

        // Scroll to the appropriate section
        switch (newValue) {
            case 0:
                overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 1:
                amenitiesRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 2:
                detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 3:
                locationRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            default:
                break;
        }
    };

    if (loading) {
        return (
            <>
                <AppNavbar />
                <Box className="content apartment-details-content" display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress style={{ color: '#2d4f8f' }} />
                </Box>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AppNavbar />
                <Box className="content apartment-details-content">
                    <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
                        {error}
                    </Alert>
                </Box>
            </>
        );
    }

    if (!apartment) {
        return (
            <>
                <AppNavbar />
                <Box className="content apartment-details-content">
                    <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                        Apartment not found
                    </Alert>
                </Box>
            </>
        );
    }

    return (
        <>
            <AppNavbar />
            <Box className="content apartment-details-content">
                <Container maxWidth="lg">
                    {/* Image Carousel */}
                    <Box mb={4}>
                        <ImageCarousel images={apartment.images} />
                    </Box>

                    {/* Main Content Grid */}
                    <Grid container spacing={4}>
                        {/* Left Content - Apartment Details */}
                        <Grid item xs={12} md={8}>
                            {/* Title and Main Info Section */}
                            <Box className="apartment-title-section" mb={4}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    {apartment.title}
                                </Typography>

                                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="subtitle1">
                                        {apartment.location.address}
                                    </Typography>
                                </Box>

                                <Box className="pricing-info" mb={3}>
                                    <Typography variant="h5" component="p">
                                        {apartment.rent.amount.toLocaleString()} BDT
                                        {apartment.rent.negotiable && (
                                            <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                                                (Negotiable)
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>

                                <FeatureIcons apartment={apartment} />
                            </Box>

                            {/* Navigation Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="apartment details tabs"
                                >
                                    <Tab label="Overview" />
                                    <Tab label="Amenities" />
                                    <Tab label="Additional Details" />
                                    <Tab label="Location" />
                                </Tabs>
                            </Box>

                            {/* Details Sections */}
                            <Box ref={overviewRef}>
                                <Overview apartment={apartment} />
                            </Box>

                            <Box ref={amenitiesRef}>
                                <Amenities apartment={apartment} />
                            </Box>

                            <Box ref={detailsRef}>
                                <AdditionalDetails apartment={apartment} />
                            </Box>

                            <Box ref={locationRef}>
                                <Location apartment={apartment} />
                            </Box>
                        </Grid>

                        {/* Right Content - Contact Info (Sticky) */}
                        <Grid item xs={12} md={4}>
                            <Box className="sticky-contact-container">
                                <ContactInfoCard apartment={apartment} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default ApartmentDetailsPage;