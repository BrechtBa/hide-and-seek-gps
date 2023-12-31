import React, {useEffect} from 'react'
import { useParams, useNavigate, Navigate } from "react-router-dom";

import { getRepository, Status } from './repository/firebase.js';

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

      if(gameSettings.status === Status.Active){
        if(now >= gameSettings.nextSeekerPingDate){
          repository.setNextSeekerPingDate(gameId);
          setLastLocation();
        }
      }

      if(gameSettings.status === Status.Finished){
        if(now >= gameSettings.nextPingDate){
          repository.setNextSeekerPingDate(gameId);
          setLastLocation();
        }
      }

    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, [gameId, gameSettings]);



  const isWaiting = () => {
    return gameSettings.status === Status.Waiting;
  }
  const isActive = () => {
    return gameSettings.status === Status.Active;
  }
  const isFinished = () => {
    return gameSettings.status === Status.Finished;
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

          <div className="Section">
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

          <div className="Section">
            {gameSettings.foundDate !== 0 && (
              <Time time={gameSettings.foundDate - gameSettings.startDate}/>
            )}
          </div>

        </div>
      )}

      {(isActive() || isFinished()) && (
        <div>
          <div className="Section">
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

      {gameSettings.state === "unknown" && (
        <Navigate to="/" />
      )}
    </div>
  )

}