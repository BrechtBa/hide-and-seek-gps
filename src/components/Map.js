import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, Circle} from "react-leaflet"
import { ScaleControl } from 'react-leaflet/ScaleControl'
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import MyLocationIcon from '@mui/icons-material/MyLocation';

import getLocation from './location.js';


export default function MyMap(props) {
  const markers = props.markers;
  const [map, setMap] = useState(null);
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

  const flyToMyPosition = () => {
    if(map !== null){
      map.flyTo(myPosition);
    }
  }

  return (
    <div style={{width: "95%"}}>
      <MapContainer center={myPosition} zoom={13} scrollWheelZoom={false} style={{height: "400px"}} ref={setMap}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        <ScaleControl></ScaleControl>
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control leaflet-bar">
            <button onClick={() => flyToMyPosition()} style={{padding: "0.25rem", display: "inline-flex", border: "none", cursor: "pointer"}}>
              <MyLocationIcon />
            </button>
          </div>
        </div>

        <Circle center={myPosition} radius={10}>
          <Popup>
            My position
          </Popup>
        </Circle>

        {markers.map((marker, key) => (
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