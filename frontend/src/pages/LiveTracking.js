import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { subscribeToBusLocation } from '../services/firebaseService';
import { FaArrowLeft, FaBus } from 'react-icons/fa';
import Map from '../components/Map/Map';
import '../styles/Tracking.css';

const defaultCenter = {
  lat: 28.7041,
  lng: 77.1025
};

const LiveTracking = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveBuses();
  }, []);

  const loadActiveBuses = async () => {
    try {
      const response = await dashboardService.getActiveBuses();
      const activeBuses = response.data.data || [];

      setBuses(activeBuses.map(bus => ({
        id: bus.id,
        busNumber: bus.bus_number,
        driverName: bus.driver_name,
        routeName: bus.route_name,
        shiftType: bus.shift_type,
        latitude: parseFloat(bus.latitude) || defaultCenter.lat,
        longitude: parseFloat(bus.longitude) || defaultCenter.lng,
        lastUpdate: bus.last_update
      })));

      if (activeBuses.length > 0 && activeBuses[0].latitude && activeBuses[0].longitude) {
        setCenter({
          lat: parseFloat(activeBuses[0].latitude),
          lng: parseFloat(activeBuses[0].longitude)
        });
      }

      setLoading(false);

      activeBuses.forEach(bus => {
        subscribeToBusLocation(bus.id, (locationData) => {
          setBuses(prevBuses =>
            prevBuses.map(b =>
              b.id === bus.id
                ? {
                  ...b,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  lastUpdate: new Date().toISOString()
                }
                : b
            )
          );
        });
      });

    } catch (error) {
      console.error('Error loading active buses:', error);
      setLoading(false);
    }
  };

  const handleMarkerClick = (markerOrBus) => {
    // If it comes from the map marker click, it might be the marker object (from Map.js) or bus object
    // Map.js passes 'marker' which has { id, ... }
    // Bus list passes 'bus' which has { id, ... }
    const busId = markerOrBus.id;
    const bus = buses.find(b => b.id === busId);

    if (bus) {
      setSelectedBus(bus);
      setCenter({ lat: bus.latitude, lng: bus.longitude });
    }
  };

  // Transform buses data for the Map component
  const mapMarkers = buses.map(bus => ({
    id: bus.id,
    lat: bus.latitude,
    lng: bus.longitude,
    title: bus.busNumber,
    description: (
      <div>
        <p><strong>Driver:</strong> {bus.driverName || 'N/A'}</p>
        <p><strong>Route:</strong> {bus.routeName || 'N/A'}</p>
        <p><strong>Shift:</strong> {bus.shiftType || 'N/A'}</p>
        <p><strong>Last Update:</strong> {
          bus.lastUpdate
            ? new Date(bus.lastUpdate).toLocaleTimeString()
            : 'N/A'
        }</p>
      </div>
    )
  }));

  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>Live Bus Tracking</h1>
        <div className="bus-count">
          <FaBus /> {buses.length} Active {buses.length === 1 ? 'Bus' : 'Buses'}
        </div>
      </div>

      <div className="tracking-content">
        <div className="map-container">
          <Map
            center={center}
            zoom={13}
            markers={mapMarkers}
            onMarkerClick={handleMarkerClick}
            selectedMarker={selectedBus ? { id: selectedBus.id } : null} // Map.js expects marker object or compatible
          />
        </div>

        <div className="bus-list">
          <h3>Active Buses</h3>
          {buses.length === 0 ? (
            <div className="no-buses">
              <p>No active buses at the moment</p>
            </div>
          ) : (
            <div className="bus-items">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className={`bus-item ${selectedBus?.id === bus.id ? 'active' : ''}`}
                  onClick={() => handleMarkerClick(bus)}
                >
                  <div className="bus-item-header">
                    <h4>{bus.busNumber}</h4>
                    <span className={`badge badge-${bus.shiftType === 'morning' ? 'success' : bus.shiftType === 'afternoon' ? 'warning' : 'info'}`}>
                      {bus.shiftType}
                    </span>
                  </div>
                  <p><strong>Driver:</strong> {bus.driverName || 'N/A'}</p>
                  <p><strong>Route:</strong> {bus.routeName || 'N/A'}</p>
                  <p className="last-update">
                    Updated: {bus.lastUpdate
                      ? new Date(bus.lastUpdate).toLocaleTimeString()
                      : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;