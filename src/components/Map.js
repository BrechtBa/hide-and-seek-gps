import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, Circle} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import getLocation from './location.js';


export default function MyMap(props) {
  const marker = props.marker;
  const [myPosition, setMyPosition] = useState([51, 5]);

  console.log(marker)



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
    <div style={{width: "100%"}}>
      <MapContainer center={marker} zoom={13} scrollWheelZoom={false} style={{height: "500px"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={marker}>
          <Popup>
            Last known location
          </Popup>
        </Marker>

        <Circle center={myPosition} radius={20}>
          <Popup>
            My position
          </Popup>
        </Circle>

      </MapContainer>
    </div>
  )
}