import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, TextField, Button, CircularProgress } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
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

const pharmacyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 30.0444, lng: 31.2357 }); // Cairo default
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        const response = await locationService.getPharmacies();
        
        if (response.success) {
          setPharmacies(response.pharmacies || []);
          setUserLocation(response.userLocation);
        }
      } catch (error) {
        console.error('Failed to fetch pharmacies:', error);
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
        setUserLocation(response.userLocation);
      }
    } catch (error) {
      console.error('Failed to search locations:', error);
    } finally {
      setLoading(false);
    }
  };

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
                قائمة الصيدليات
              </Typography>
              
              {pharmacies.length > 0 ? (
                <List>
                  {pharmacies.map((pharmacy, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <MedicationIcon sx={{ color: '#8E44AD' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={pharmacy.tags?.name || "صيدلية غير معروفة"} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لم يتم العثور على صيدليات في هذه المنطقة
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
                
                {pharmacies.map((pharmacy, index) => (
                  pharmacy.lat && pharmacy.lon && (
                    <Marker 
                      key={index} 
                      position={[pharmacy.lat, pharmacy.lon]} 
                      icon={pharmacyIcon}
                    >
                      <Popup>{pharmacy.tags?.name || "صيدلية غير معروفة"}</Popup>
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

export default Pharmacies;
