const axios = require('axios');

const getUserLocation = async (query = 'Cairo') => {
    try {
        const apiKey = process.env.Google_Map_API;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
        
        console.log(`Fetching location data for: ${query}`);
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.status === 200 && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            console.log(`Location found: ${location.lat}, ${location.lng}`);
            return { lat: location.lat, lng: location.lng };
        } else {
            console.warn('Location not found, using fallback coordinates');
            return getCityCoordinates(query);
        }
    } catch (error) {
        console.error('Error getting user location:', error);
        return getCityCoordinates(query);
    }
};

const getNearbyFacilities = async (lat, lon, facilityType, radius = 5000) => {
    try {
        console.log(`Fetching ${facilityType} data for coordinates: ${lat}, ${lon}`);
        
        const apiKey = process.env.Google_Map_API;
        let placeType = facilityType === 'hospital' ? 'hospital' : 'pharmacy';
        
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${placeType}&key=${apiKey}`;
        
        const response = await axios.get(url, { timeout: 10000 });
        
        if (response.status === 200 && response.data.results) {
            const facilities = response.data.results.map(place => ({
                id: place.place_id,
                name: place.name,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                rating: place.rating || 0,
                address: place.vicinity,
                open_now: place.opening_hours?.open_now,
                photo_reference: place.photos?.[0]?.photo_reference,
                types: place.types
            }));
            
            console.log(`Found ${facilities.length} ${facilityType} facilities`);
            return facilities;
        } else {
            console.warn(`Error fetching ${facilityType} data: Status ${response.status}`);
            return getMockFacilities(facilityType, lat, lon);
        }
    } catch (error) {
        console.error(`Error getting nearby ${facilityType}:`, error);
        return getMockFacilities(facilityType, lat, lon);
    }
};

// Helper function to provide fallback coordinates for common cities
const getCityCoordinates = (query) => {
    const cities = {
        'cairo': { lat: 30.0444, lng: 31.2357 },
        'alexandria': { lat: 31.2001, lng: 29.9187 },
        'giza': { lat: 30.0131, lng: 31.2089 },
        'sharm el sheikh': { lat: 27.9158, lng: 34.3300 },
        'luxor': { lat: 25.6872, lng: 32.6396 },
        'aswan': { lat: 24.0889, lng: 32.8998 },
        'hurghada': { lat: 27.2579, lng: 33.8116 },
        'mansoura': { lat: 31.0409, lng: 31.3785 },
        'zagazig': { lat: 30.5833, lng: 31.5167 },
        'port said': { lat: 31.2652, lng: 32.3018 },
        'ismailia': { lat: 30.5965, lng: 32.2715 },
        'tanta': { lat: 30.7865, lng: 31.0004 },
        'new cairo': { lat: 30.0074, lng: 31.4913 },
        'heliopolis': { lat: 30.0910, lng: 31.3243 },
        'maadi': { lat: 29.9626, lng: 31.2497 },
        'nasr city': { lat: 30.0510, lng: 31.3656 },
        'default': { lat: 30.0444, lng: 31.2357 } // Cairo as default
    };
    
    // Convert query to lowercase for case-insensitive matching
    const normalizedQuery = query.toLowerCase();
    
    // Check if we have coordinates for this city
    for (const city in cities) {
        if (normalizedQuery.includes(city)) {
            console.log(`Using stored coordinates for ${city}`);
            return cities[city];
        }
    }
    
    // Return Cairo coordinates as fallback
    console.log('Using default coordinates (Cairo)');
    return cities.default;
};

// Generate mock facilities data
const getMockFacilities = (facilityType, lat, lon) => {
    console.log(`Generating mock ${facilityType} data`);
    
    const count = 8 + Math.floor(Math.random() * 7);
    const facilities = [];
    
    const hospitalNames = [
        'مستشفى القاهرة التخصصي', 'المستشفى الجامعي', 'مستشفى دار الفؤاد', 
        'مستشفى السلام الدولي', 'المستشفى العسكري', 'مستشفى النيل', 
        'مستشفى الشروق', 'مستشفى الأمل', 'مستشفى الرحمة', 'مستشفى المعادي التخصصي',
        'مستشفى عين شمس', 'مستشفى الهلال', 'مستشفى القصر العيني', 'مستشفى النزهة الدولي'
    ];
    
    const pharmacyNames = [
        'صيدلية العزبي', 'صيدلية مصر', 'صيدلية سيف', 'صيدلية الشفاء',
        'صيدلية النهدي', 'صيدلية الحياة', 'صيدلية رشدي', 'صيدلية البرج',
        'صيدلية الدواء', 'صيدلية المجد', 'صيدلية النور', 'صيدلية البركة', 
        'صيدلية الأمين', 'صيدلية المستقبل'
    ];
    
    const nameArray = facilityType === 'hospital' ? hospitalNames : pharmacyNames;
    
    for (let i = 0; i < count; i++) {
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lonOffset = (Math.random() - 0.5) * 0.05;
        
        facilities.push({
            id: `mock-${facilityType}-${i}`,
            name: nameArray[i % nameArray.length],
            lat: parseFloat(lat) + latOffset,
            lng: parseFloat(lon) + lonOffset,
            rating: 3.5 + Math.random() * 1.5,
            address: 'العنوان غير متوفر',
            open_now: Math.random() > 0.3,
            types: [facilityType]
        });
    }
    
    return facilities;
};

module.exports = {
    getUserLocation,
    getNearbyFacilities
};
