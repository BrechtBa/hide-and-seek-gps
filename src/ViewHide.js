import React, { useEffect } from 'react'
import { useParams } from "react-router-dom";

import Button from '@mui/material/Button';

import { getRepository } from './repository/firebase.js';
import Timer from './components/Timer.js';


export default function ViewHide() {
  const params = useParams();
  const gameId = params.gameId;

  const repository = getRepository();

  const gameState = repository.useGameState(gameId);

  const setLastLocation = () => {
    console.log("ping")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = new Date().getTime();

          console.log("publishing last location: ", {timestamp, latitude, longitude})
          repository.setLastLocation(
            gameId,
            {timestamp, latitude, longitude},
            () => {}
          )
        },
        (error) => {
          console.error("Error get user location: ", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();

      if(gameState.status === "active" && now >= gameState.nextPingDate){
        repository.setNextPingDate(gameId);
        setLastLocation();
      }

      if(now >= gameState.endDate){
        repository.endGame(gameId, () => {});
      }

    }, 1000);
    return () => clearTimeout(timer);
  }, [gameId, gameState]);


  const startGame = () => {
    repository.startGame(gameId, () => {})
  }

  const isWaiting = () => {
    return gameState.status === "waiting"
  }
  const isActive = () => {
    return gameState.status === "active"
  }
  const isFinished = () => {
    return gameState.status === "finished"
  }

  return (
    <div>
      <h1>Hide</h1>
      <div>Game Id: {gameId}</div>

      {isWaiting() && (
        <div>
          <Button onClick={() => startGame()}>Start</Button>
        </div>
      )}

      {(isActive() || isFinished()) && (
        <div>
          <Timer endDate={gameState.endDate}/>
        </div>
      )}

      {isActive() && (
        <div>
          <Timer endDate={gameState.nextPingDate}/>
        </div>
      )}

      {(isFinished()) && (
        <div>
          Finished
        </div>
      )}

    </div>
  )

}