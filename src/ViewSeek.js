import React from 'react'
import { useParams } from "react-router-dom";

import { getRepository } from './repository/firebase.js';
import Timer from './components/Timer.js';
import MyMap from './components/Map.js';


export default function ViewSeek() {
  const params = useParams();
  const gameId = params.gameId;

  const repository = getRepository();

  const gameState = repository.useGameState(gameId);
  const lastLocation = repository.useLastLocation(gameId);


  const isWaiting = () => {
    return gameState.status === "waiting"
  }
  const isActive = () => {
    console.log(gameState)
    return gameState.status === "active"
  }
  const isFinished = () => {
    return gameState.status === "finished"
  }

  const displayCoordinates = (loc: {timestamp: number, latitude: number, longitude: number} | null) => {
    if( loc === null ) {
      return ""
    }
    return loc.timestamp + ": "+ loc.longitude + ", " + loc.latitude
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
      <div>Game Id: {gameId}</div>

      {isWaiting() && (
        <div>
          Waiting
        </div>
      )}

      {isActive() && (
        <div style={{width: "100%"}}>
          <div>
            <Timer endDate={gameState.endDate}/>
          </div>

          <div style={{width: "100%"}}>
            <MyMap marker={getCoordinates(lastLocation)} />
          </div>

          <div>{displayCoordinates(lastLocation)}</div>
        </div>
      )}
    </div>
  )

}