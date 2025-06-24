import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, TextField, Button, CircularProgress, Chip, Rating, Card, CardContent } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Layout } from '../components';
import { locationService } from '../services/api';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357
};

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          console.log('User location obtained:', userPos);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Keep default location (Cairo)
        }
      );
    }
  }, []);
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        console.log('Fetching pharmacies from API...');
        const response = await locationService.getPharmacies();
        console.log('Pharmacies API response:', response);
        
        if (response.success) {
          const pharmaciesData = response.pharmacies || [];
          console.log('Pharmacies data received:', pharmaciesData);
          setPharmacies(pharmaciesData);
          if (response.userLocation) {
            console.log('User location from API:', response.userLocation);
            setUserLocation(response.userLocation);
          }
        } else {
          console.error('API returned success: false');
        }
      } catch (error) {
        console.error('Failed to fetch pharmacies:', error);
        // Add mock data if API fails
        console.log('Adding mock pharmacy data for testing...');
        const mockPharmacies = [
          {
            id: 'mock-1',
            name: 'صيدلية العزبي',
            lat: 30.0484,
            lng: 31.2397,
            rating: 4.1,
            address: 'مدينة نصر',
            open_now: true
          },
          {
            id: 'mock-2', 
            name: 'صيدلية مصر',
            lat: 30.0384,
            lng: 31.2497,
            rating: 3.9,
            address: 'وسط البلد',
            open_now: true
          },
          {
            id: 'mock-3',
            name: 'صيدلية سيف',
            lat: 30.0584,
            lng: 31.2297,
            rating: 4.3,
            address: 'المعادي',
            open_now: false
          }
        ];
        setPharmacies(mockPharmacies);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await locationService.getPharmacies(searchQuery);
      
      if (response.success) {
        setPharmacies(response.pharmacies || []);
        if (response.userLocation) {
          setUserLocation(response.userLocation);
        }
      }
    } catch (error) {
      console.error('Failed to search locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  if (!isLoaded) {
    return (
      <Layout title="صيدليات قريبة">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  return (
    <Layout title="صيدليات قريبة">
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h5" align="center" color="secondary" sx={{ mb: 1 }}>
            أقرب صيدليات ليك
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            يمكنك البحث عن أقرب الصيدليات إلى موقعك الحالي
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="ابحث عن منطقة"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثال: المعادي، القاهرة"
              sx={{ ml: 1 }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSearch}
              disabled={loading}
            >
              بحث
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Paper elevation={3} sx={{ p: 2, mb: { xs: 2, md: 0 }, mr: { md: 2 }, width: { xs: '100%', md: '30%' } }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#8E44AD' }}>
                قائمة الصيدليات ({pharmacies.length})
              </Typography>
              
              {pharmacies.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {pharmacies.map((pharmacy, index) => {
                    const distance = calculateDistance(
                      userLocation.lat, userLocation.lng,
                      pharmacy.lat, pharmacy.lng
                    );
                    
                    return (
                      <Card key={pharmacy.id || index} sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          if (map) {
                            map.panTo({ lat: pharmacy.lat, lng: pharmacy.lng });
                            map.setZoom(16);
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <MedicationIcon sx={{ color: '#8E44AD', mr: 1, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {pharmacy.name || "صيدلية غير معروفة"}
                              </Typography>
                              {pharmacy.rating > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Rating value={pharmacy.rating} readOnly size="small" />
                                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    ({pharmacy.rating.toFixed(1)})
                                  </Typography>
                                </Box>
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                <LocationOnIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {distance} كم
                              </Typography>
                              {pharmacy.address && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {pharmacy.address}
                                </Typography>
                              )}
                              {pharmacy.open_now !== undefined && (
                                <Chip 
                                  label={pharmacy.open_now ? "مفتوح الآن" : "مغلق الآن"}
                                  size="small"
                                  color={pharmacy.open_now ? "success" : "error"}
                                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لم يتم العثور على صيدليات في هذه المنطقة
                </Typography>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 1, height: 500, width: { xs: '100%', md: '70%' } }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                {/* User location marker */}
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  title="موقعك الحالي"
                />                {/* Pharmacy markers */}
                {pharmacies.map((pharmacy, index) => {
                  console.log(`Rendering pharmacy marker ${index}:`, pharmacy);
                  return (
                    pharmacy.lat && pharmacy.lng && (
                      <Marker
                        key={pharmacy.id || index}
                        position={{ lat: parseFloat(pharmacy.lat), lng: parseFloat(pharmacy.lng) }}
                        onClick={() => handleMarkerClick(pharmacy)}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                          scaledSize: new window.google.maps.Size(35, 35),
                        }}
                        title={pharmacy.name || "صيدلية غير معروفة"}
                      />
                    )
                  );
                })}

                {/* Info Window for selected pharmacy */}
                {selectedPharmacy && (
                  <InfoWindow
                    position={{ lat: selectedPharmacy.lat, lng: selectedPharmacy.lng }}
                    onCloseClick={() => setSelectedPharmacy(null)}                  >
                    <div style={{ 
                      padding: '10px', 
                      minWidth: '200px', 
                      maxWidth: '300px',
                      fontFamily: 'Roboto, Arial, sans-serif',
                      direction: 'rtl',
                      textAlign: 'right'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        {selectedPharmacy.name || "صيدلية غير معروفة"}
                      </h3>
                      
                      {selectedPharmacy.rating > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '8px',
                          direction: 'ltr',
                          justifyContent: 'flex-end'
                        }}>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            marginLeft: '5px'
                          }}>
                            ({selectedPharmacy.rating.toFixed(1)})
                          </span>
                          <span style={{ color: '#ffa500' }}>
                            {'★'.repeat(Math.round(selectedPharmacy.rating))}
                            {'☆'.repeat(5 - Math.round(selectedPharmacy.rating))}
                          </span>
                        </div>
                      )}
                      
                      {selectedPharmacy.address && (
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '13px', 
                          color: '#666'
                        }}>
                          {selectedPharmacy.address}
                        </p>
                      )}
                      
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '12px', 
                        color: '#666'
                      }}>
                        المسافة: {calculateDistance(
                          userLocation.lat, userLocation.lng,
                          selectedPharmacy.lat, selectedPharmacy.lng
                        )} كم
                      </p>
                      
                      {selectedPharmacy.open_now !== undefined && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: selectedPharmacy.open_now ? '#4caf50' : '#f44336',
                          color: 'white'
                        }}>
                          {selectedPharmacy.open_now ? "مفتوح الآن" : "مغلق الآن"}
                        </span>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </Paper>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default Pharmacies;
