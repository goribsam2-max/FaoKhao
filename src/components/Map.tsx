import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationData, CATEGORIES } from '../types';
import { Utensils, Heart, Church, Navigation, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  locations: LocationData[];
  onMarkerClick: (location: LocationData) => void;
  onMapClick: (lat: number, lng: number) => void;
  center?: [number, number];
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const createCustomIcon = (category: string, isExpired: boolean) => {
  const getIconColor = () => {
    if (isExpired) return 'expired';
    return category;
  };

  const getIconSvg = () => {
    if (category === 'free_khana') return '<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M6 2v2"></path>';
    if (category === 'tran') return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>';
    return '<path d="M22 10v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10"></path><path d="m2 10 10-7 10 7"></path><path d="M9 22V12h6v10"></path>';
  };

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-pin ${getIconColor()}">
            <div class="inner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                ${getIconSvg()}
              </svg>
            </div>
            <div class="pin-tip"></div>
          </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

export default function Map({ locations, onMarkerClick, onMapClick, center = [23.8103, 90.4125] }: MapProps) {
  const isExpired = (timestamp: number) => {
    const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > TWENTY_FOUR_HOURS_IN_MS;
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={onMapClick} />
        {center && <ChangeView center={center} />}
        
        {locations.map((loc) => {
          const expired = isExpired(loc.createdAt);
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(loc.category, expired)}
              eventHandlers={{
                click: () => onMarkerClick(loc),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
