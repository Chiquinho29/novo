'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type ApproximateLocation = {
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  source: 'Regional code' | 'Country code' | 'IP'
}

const markerIcon = L.divIcon({
  className: 'approximate-marker',
  html: '<span aria-hidden="true">●</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 32],
})

function RecenterMap({ location }: { location: ApproximateLocation }) {
  const map = useMap()
  useEffect(() => {
    map.setView([location.latitude, location.longitude], 10)
  }, [location, map])
  return null
}

export default function ApproximateLocationMap({ location }: { location: ApproximateLocation | null }) {
  if (!location) {
    return <div className="map-unavailable" role="status">Location unavailable</div>
  }

  return <div className="location-map" aria-label={`Approximate map of ${location.city}, ${location.state}`}>
    <MapContainer center={[location.latitude, location.longitude]} zoom={10} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RecenterMap location={location} />
      <Marker position={[location.latitude, location.longitude]} icon={markerIcon}>
        <Popup><strong>{location.city}, {location.state}</strong><br />Approximate coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Popup>
      </Marker>
    </MapContainer>
  </div>
}
