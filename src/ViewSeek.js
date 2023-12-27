import React from 'react'
import { useParams, useNavigate } from "react-router-dom";

import { getRepository } from './repository/firebase.js';

import Button from '@mui/material/Button';

import Timer from './components/Timer.js';
import Time from './components/Time.js';
import MyMap from './components/Map.js';
import useNoSleep from './components/NoSleep.js';


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
      <div style={{display: "flex", flexDirection: "row", justifyContent: "center", gap: "1em"}}>
        <div>{displayTimestamp(location.timestamp)}</div>
        <div>{location.latitude}</div>
        <div>{location.longitude}</div>
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

//  useEffect(() => {
//    if(gameSettings.status === "unknown"){
//      navigate("/")
//    }
//  }, [navigate, gameSettings])

  const isWaiting = () => {
    return gameSettings.status === "waiting"
  }
  const isActive = () => {
    console.log(gameSettings)
    return gameSettings.status === "active"
  }
  const isFinished = () => {
    return gameSettings.status === "finished"
  }

  const getCoordinates = (loc: {timestamp: number, latitude: number, longitude: number} | null) => {
    if(loc === null) {
      return [0, 0];
    }
    else{
      return [loc.latitude, loc.longitude]
    }
  }

  return (
    <div>
      <h1>Seek</h1>
      <div className="Section">Game Id: {gameId}</div>

      {isWaiting() && (
        <div className="Section">
          Waiting
        </div>
      )}

      {isActive() && (
        <div style={{width: "100%"}}>
          <div className="Section">
            <Timer endDate={gameSettings.endDate}/>
          </div>

          <div className="Section" style={{width: "100%"}}>
            <MyMap marker={getCoordinates(lastLocation)} />
          </div>

          <div className="Section">
            <DisplayLocation location={lastLocation} />
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


      <div className="Section">
        <div>
          <Button onClick={() => navigate("/")}>Leave</Button>
        </div>
      </div>

    </div>
  )

}