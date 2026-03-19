'use client';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const libraries = ['places'];

export default function MapView({ userLocation }) {
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (!isLoaded || !userLocation) return;

    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    const types = ['hospital', 'police', 'fire_station'];
    const results = [];

    types.forEach(type => {
      service.nearbySearch({
        location: userLocation,
        radius: 5000,
        type,
      }, (res, status) => {
        if (status === 'OK') {
          res.slice(0, 3).forEach(place => {
            results.push({
              id: place.place_id,
              name: place.name,
              type,
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              vicinity: place.vicinity,
            });
          });
          setPlaces([...results]);
        }
      });
    });
  }, [isLoaded, userLocation]);

  const getIcon = (type) => {
    if (type === 'hospital') return '🏥';
    if (type === 'police') return '🚔';
    return '🚒';
  };

  const getColor = (type) => {
    if (type === 'hospital') return '#22c55e';
    if (type === 'police') return '#3b82f6';
    return '#f97316';
  };

  if (!isLoaded) return (
    <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
      Loading map...
    </div>
  );

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', height: '300px', position: 'relative' }}>
      <GoogleMap
        zoom={14}
        center={userLocation || { lat: 12.9716, lng: 77.5946 }}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#302b63' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0c29' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
          />
        )}
        {places.map(place => (
          <Marker
            key={place.id}
            position={place.position}
            onClick={() => setSelected(place)}
            label={{ text: getIcon(place.type), fontSize: '20px' }}
          />
        ))}
        {selected && (
          <InfoWindow position={selected.position} onCloseClick={() => setSelected(null)}>
            <div style={{ color: '#000', padding: '4px' }}>
              <strong>{getIcon(selected.type)} {selected.name}</strong>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>{selected.vicinity}</p>
              <p style={{ fontSize: '11px', color: getColor(selected.type), fontWeight: 600 }}>
                {selected.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}