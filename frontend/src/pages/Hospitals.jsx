import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, TextField, Button, CircularProgress, Chip, Rating, Card, CardContent } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
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

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
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
  }, []);  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        console.log('Fetching hospitals from API...');
        const response = await locationService.getHospitals();
        console.log('Hospitals API response:', response);
        
        if (response.success) {
          const hospitalsData = response.hospitals || [];
          console.log('Hospitals data received:', hospitalsData);
          setHospitals(hospitalsData);
          if (response.userLocation) {
            console.log('User location from API:', response.userLocation);
            setUserLocation(response.userLocation);
          }
        } else {
          console.error('API returned success: false');
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        // Add mock data if API fails
        console.log('Adding mock hospital data for testing...');
        const mockHospitals = [
          {
            id: 'mock-1',
            name: 'مستشفى القاهرة التخصصي',
            lat: 30.0544,
            lng: 31.2357,
            rating: 4.2,
            address: 'القاهرة الجديدة',
            open_now: true
          },
          {
            id: 'mock-2', 
            name: 'المستشفى الجامعي',
            lat: 30.0344,
            lng: 31.2457,
            rating: 3.8,
            address: 'وسط البلد',
            open_now: true
          },
          {
            id: 'mock-3',
            name: 'مستشفى دار الفؤاد',
            lat: 30.0644,
            lng: 31.2257,
            rating: 4.5,
            address: 'المعادي',
            open_now: false
          }
        ];
        setHospitals(mockHospitals);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await locationService.getHospitals(searchQuery);
      
      if (response.success) {
        setHospitals(response.hospitals || []);
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

  const handleMarkerClick = (hospital) => {
    setSelectedHospital(hospital);
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
      <Layout title="مستشفيات قريبة">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  return (
    <Layout title="مستشفيات قريبة">
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h5" align="center" color="primary" sx={{ mb: 1 }}>
            أقرب مستشفيات ليك
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            يمكنك البحث عن أقرب المستشفيات إلى موقعك الحالي
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
              color="primary"
              onClick={handleSearch}
              disabled={loading}
            >
              بحث
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Paper elevation={3} sx={{ p: 2, mb: { xs: 2, md: 0 }, mr: { md: 2 }, width: { xs: '100%', md: '30%' } }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#117A65' }}>
                قائمة المستشفيات ({hospitals.length})
              </Typography>
              
              {hospitals.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {hospitals.map((hospital, index) => {
                    const distance = calculateDistance(
                      userLocation.lat, userLocation.lng,
                      hospital.lat, hospital.lng
                    );
                    
                    return (
                      <Card key={hospital.id || index} sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedHospital(hospital);
                          if (map) {
                            map.panTo({ lat: hospital.lat, lng: hospital.lng });
                            map.setZoom(16);
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <LocalHospitalIcon sx={{ color: '#117A65', mr: 1, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {hospital.name || "مستشفى غير معروف"}
                              </Typography>
                              {hospital.rating > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Rating value={hospital.rating} readOnly size="small" />
                                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    ({hospital.rating.toFixed(1)})
                                  </Typography>
                                </Box>
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                <LocationOnIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {distance} كم
                              </Typography>
                              {hospital.address && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {hospital.address}
                                </Typography>
                              )}
                              {hospital.open_now !== undefined && (
                                <Chip 
                                  label={hospital.open_now ? "مفتوح الآن" : "مغلق الآن"}
                                  size="small"
                                  color={hospital.open_now ? "success" : "error"}
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
                  لم يتم العثور على مستشفيات في هذه المنطقة
                </Typography>
              )}
            </Paper>            <Paper elevation={3} sx={{ p: 1, height: 500, width: { xs: '100%', md: '70%' } }}>
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
                {/* Debug info */}
                {console.log('Rendering map with hospitals:', hospitals)}
                {console.log('User location:', userLocation)}
                
                {/* User location marker */}
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  title="موقعك الحالي"
                />{/* Hospital markers */}
                {hospitals.map((hospital, index) => {
                  console.log(`Rendering hospital marker ${index}:`, hospital);
                  return (
                    hospital.lat && hospital.lng && (
                      <Marker
                        key={hospital.id || index}
                        position={{ lat: parseFloat(hospital.lat), lng: parseFloat(hospital.lng) }}
                        onClick={() => handleMarkerClick(hospital)}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                          scaledSize: new window.google.maps.Size(35, 35),
                        }}
                        title={hospital.name || "مستشفى غير معروف"}
                      />
                    )
                  );
                })}{/* Info Window for selected hospital */}
                {selectedHospital && (
                  <InfoWindow
                    position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }}
                    onCloseClick={() => setSelectedHospital(null)}
                  >
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
                        {selectedHospital.name || "مستشفى غير معروف"}
                      </h3>
                      
                      {selectedHospital.rating > 0 && (
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
                            ({selectedHospital.rating.toFixed(1)})
                          </span>
                          <span style={{ color: '#ffa500' }}>
                            {'★'.repeat(Math.round(selectedHospital.rating))}
                            {'☆'.repeat(5 - Math.round(selectedHospital.rating))}
                          </span>
                        </div>
                      )}
                      
                      {selectedHospital.address && (
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '13px', 
                          color: '#666'
                        }}>
                          {selectedHospital.address}
                        </p>
                      )}
                      
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '12px', 
                        color: '#666'
                      }}>
                        المسافة: {calculateDistance(
                          userLocation.lat, userLocation.lng,
                          selectedHospital.lat, selectedHospital.lng
                        )} كم
                      </p>
                      
                      {selectedHospital.open_now !== undefined && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: selectedHospital.open_now ? '#4caf50' : '#f44336',
                          color: 'white'
                        }}>
                          {selectedHospital.open_now ? "مفتوح الآن" : "مغلق الآن"}
                        </span>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </Paper>
          </Box>
        )}      </Box>
    </Layout>
  );
};

export default Hospitals;
