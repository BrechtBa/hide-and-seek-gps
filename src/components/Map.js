import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, Circle} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import getLocation from './location.js';


export default function MyMap(props) {
  const markers = props.markers;
  const [myPosition, setMyPosition] = useState([51, 5]);

  useEffect(() => {
    const timer = setInterval(() => {
      getLocation((loc) => {
        setMyPosition([loc.latitude, loc.longitude])
      });
    }, 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, []);


  return (
    <div style={{width: "95%"}}>
      <MapContainer center={myPosition} zoom={13} scrollWheelZoom={false} style={{height: "400px"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle center={myPosition} radius={20}>
          <Popup>
            My position
          </Popup>
        </Circle>

        { markers.map((marker, key) => (
          <Marker key={key} position={[marker.latitude, marker.longitude]}>
            <Popup>
              {marker.name}
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  )
}