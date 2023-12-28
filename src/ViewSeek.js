import React, {useEffect} from 'react'
import { useParams, useNavigate } from "react-router-dom";

import { getRepository } from './repository/firebase.js';

import Button from '@mui/material/Button';

import Timer from './components/Timer.js';
import Time from './components/Time.js';
import MyMap from './components/Map.js';
import useNoSleep from './components/NoSleep.js';
import getLocation from './components/location.js';


function DisplayLocation(props) {
  const location = props.location;

  const displayTimestamp = (t) => {
    const d = new Date(t);
    return d.toLocaleString()
  }

  if(location === null){
    return (
      <div></div>
    );
  }
  else {
    return (
      <div>
        <div>{displayTimestamp(location.timestamp)}</div>
        <div>{location.latitude}, {location.longitude}</div>
      </div>
    );
  }

}


export default function ViewSeek() {
  useNoSleep();

  const params = useParams();
  const navigate= useNavigate();
  const gameId = params.gameId;

  const repository = getRepository();

  const gameSettings = repository.useGameSettings(gameId);
  const lastLocation = repository.useLastLocation(gameId);

  if(gameSettings.status === "unknown"){
    navigate("/")
  }

  const setLastLocation = () => {
    console.log("ping")
    getLocation((position) => {
      const { latitude, longitude } = position;
      const timestamp = new Date().getTime();

      repository.setSeekerLastLocation(gameId, {timestamp, latitude, longitude}, () => {});
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();

      if(gameSettings.status === "active"){
        if(now >= gameSettings.nextSeekerPingDate){
          repository.setNextSeekerPingDate(gameId);
          setLastLocation();
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, [gameId, gameSettings]);



  const isWaiting = () => {
    return gameSettings.status === "waiting"
  }
  const isActive = () => {
    return gameSettings.status === "active"
  }
  const isFinished = () => {
    return gameSettings.status === "finished"
  }

  const getLastLocationMarkers = (loc: {timestamp: number, latitude: number, longitude: number} | null) => {
    if(loc === null) {
      return [];
    }
    else{
      return [{name: "Hider", latitude: loc.latitude, longitude: loc.longitude}]
    }
  }

  return (
    <div>
      <h1>Seek</h1>
      <div className="Section">Game ID: {gameId}</div>

      {isWaiting() && (
        <div className="Section">
          Waiting
        </div>
      )}

      {isActive() && (
        <div style={{width: "100%"}}>
          <div className="Section">
            <div>Remaining time:</div>
            <Timer endDate={gameSettings.endDate}/>
          </div>

          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div>Time to next ping:</div>
            <Timer endDate={gameSettings.nextPingDate}/>
          </div>
        </div>
      )}

      {(isFinished()) && (
        <div>
          <div className="Section">
            Finished
          </div>

          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <Time time={gameSettings.foundDate - gameSettings.startDate}/>
          </div>

        </div>
      )}

      {(isActive() || isFinished()) && (
        <div>
          <div className="Section" style={{width: "100%", display: "flex", justifyContent: "center"}}>
            <MyMap markers={getLastLocationMarkers(lastLocation)} />
          </div>

          <div className="Section">
            Last known location:
            <DisplayLocation location={lastLocation} />
          </div>
        </div>
      )}

      <div className="Section">
        <div>
          <Button onClick={() => navigate("/")}>Leave</Button>
        </div>
      </div>

    </div>
  )

}