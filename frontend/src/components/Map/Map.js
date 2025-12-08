import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

// Fix for default marker icon issues with webpack/react-leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map center changes
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const Map = ({ center, zoom = 13, markers = [], onMarkerClick, selectedMarker }) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
            <ChangeView center={center} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={[marker.lat, marker.lng]}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(marker),
                    }}
                >
                    {/* If this marker is selected, show popup immediately. 
              Note: popup visibility is usually controlled by Leaflet, 
              but we can force it open if needed. For now, basic popup integration. */}
                    <Popup>
                        <div className="popup-content">
                            <strong>{marker.title}</strong>
                            {marker.description && <div>{marker.description}</div>}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
