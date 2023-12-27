import React, { useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import QRCode from "react-qr-code";

import { getRepository } from './repository/firebase.js';
import Timer from './components/Timer.js';
import Time from './components/Time.js';
import useNoSleep from './components/NoSleep.js';


export default function ViewHide() {
  useNoSleep();

  const params = useParams();
  const navigate = useNavigate();

  const gameId = params.gameId;

  const repository = getRepository();

  const gameSettings = repository.useGameSettings(gameId);

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

      if(gameSettings.status === "active"){
        if(now >= gameSettings.nextPingDate){
          repository.setNextPingDate(gameId);
          setLastLocation();
        }

        if(now >= gameSettings.endDate){
          repository.endGame(gameId, () => {});
        }
      }

    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, [gameId, gameSettings]);


  const startGame = () => {
    repository.startGame(gameId, () => {})
  }

  const endGame = () => {
    repository.endGame(gameId, () => {})
  }

  const clearGame = () => {
    repository.clearGame(gameId, () => {navigate("/")})
  }

  const isWaiting = () => {
    return gameSettings.status === "waiting"
  }
  const isActive = () => {
    return gameSettings.status === "active"
  }
  const isFinished = () => {
    return gameSettings.status === "finished"
  }

  return (
    <div>
      <h1>Hide</h1>
      <div className="Section">
        Game Id: {gameId}
      </div>

      {isWaiting() && (
        <div>
          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h3>Scan to join</h3>
            <QRCode value={gameId} />
          </div>

          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h3>Settings</h3>
            <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", gap: "1em"}}>
              <TextField label="Duration (min)" value={gameSettings.duration/1000/60}
                         onChange={(e) => repository.setDuration(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="InitialPingInterval (min)" value={gameSettings.initialPingInterval/1000/60}
                                     onChange={(e) => repository.setInitialPingInterval(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="FinalPingInterval (min)" value={gameSettings.finalPingInterval/1000/60}
                                                 onChange={(e) => repository.setFinalPingInterval(gameId, e.target.value*60*1000, () => {})} />
              <Button onClick={() => startGame()}>Start</Button>
              <Button onClick={() => navigate("/")}>Back</Button>
            </div>
          </div>
        </div>
      )}

      {isActive() && (
        <div>
          <div className="Section">
            <div>Remaining time:</div>
            <Timer endDate={gameSettings.endDate}/>
          </div>

          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div>Time to next ping:</div>
            <Timer endDate={gameSettings.nextPingDate}/>
          </div>

          <div className="Section" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", gap: "1em"}}>
              <Button onClick={() => endGame()}>Found</Button>
            </div>
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

            <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", gap: "1em"}}>
              <Button onClick={() => clearGame()}>Clear</Button>
            </div>

          </div>

        </div>
      )}

    </div>
  )

}