import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, TextField, Button, CircularProgress } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Layout } from '../components';
import { locationService } from '../services/api';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 30.0444, lng: 31.2357 }); // Cairo default
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await locationService.getHospitals();
        
        if (response.success) {
          setHospitals(response.hospitals || []);
          setUserLocation(response.userLocation);
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
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
        setUserLocation(response.userLocation);
      }
    } catch (error) {
      console.error('Failed to search locations:', error);
    } finally {
      setLoading(false);
    }
  };

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
                قائمة المستشفيات
              </Typography>
              
              {hospitals.length > 0 ? (
                <List>
                  {hospitals.map((hospital, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LocalHospitalIcon sx={{ color: '#117A65' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={hospital.tags?.name || "مستشفى غير معروف"} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لم يتم العثور على مستشفيات في هذه المنطقة
                </Typography>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2, height: 500, width: { xs: '100%', md: '70%' } }}>
              <MapContainer 
                center={[userLocation.lat, userLocation.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>موقعك الحالي</Popup>
                </Marker>
                
                {hospitals.map((hospital, index) => (
                  hospital.lat && hospital.lon && (
                    <Marker 
                      key={index} 
                      position={[hospital.lat, hospital.lon]} 
                      icon={hospitalIcon}
                    >
                      <Popup>{hospital.tags?.name || "مستشفى غير معروف"}</Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default Hospitals;
