import React, { useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import QRCode from "react-qr-code";

import { getRepository, Status } from './repository/firebase.js';
import Timer from './components/Timer.js';
import Time from './components/Time.js';
import MyMap from './components/Map.js';
import useNoSleep from './components/NoSleep.js';
import getLocation from './components/location.js';
import GameId from './components/GameId.js';


export default function ViewHide() {
  useNoSleep();

  const params = useParams();
  const navigate = useNavigate();

  const gameId = params.gameId;

  const repository = getRepository();

  const gameSettings = repository.useGameSettings(gameId);
  const seekers = repository.useSeekers(gameId);

  const setLastLocation = () => {
    console.log("ping")
    getLocation((position) => {
      const { latitude, longitude } = position;
      const timestamp = new Date().getTime();

      console.log("publishing last location: ", {timestamp, latitude, longitude})
      repository.setLastLocation(gameId, {timestamp, latitude, longitude}, () => {});
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();

      if(gameSettings.status === Status.Active){
        if(now >= gameSettings.nextPingDate){
          repository.setNextPingDate(gameId);
          setLastLocation();
        }

        if(now >= gameSettings.endDate){
          repository.endGame(gameId, () => {});
        }
      }

      if(gameSettings.status === "finished"){
        if(now >= gameSettings.nextPingDate){
          repository.setNextPingDate(gameId);
          setLastLocation();
        }
      }

    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, [gameId, gameSettings]);


  const startGame = () => {
    repository.startGame(gameId, () => {});
  }

  const setFound = () => {
    repository.setFound(gameId, () => {});
  }

  const clearGame = () => {
    repository.clearGame(gameId, () => {navigate("/")});
  }

  const pingBlock = () => {
    repository.setPingBlock(gameId, () => {});
  }


  const isWaiting = () => {
    return gameSettings.status === Status.Waiting;
  }
  const isActive = () => {
    return gameSettings.status === Status.Active;
  }
  const isFinished = () => {
    return gameSettings.status === Status.Finished;
  }
  const getSeekerMarkers = (seekers) => {
    let markers = [];
    seekers.forEach((s) => {
      if(s !== null && s.lastLocation !== undefined){
        markers.push({name: s.name, longitude: s.lastLocation.longitude, latitude: s.lastLocation.latitude});
      }
    });
    return markers;
  }

  return (
    <div>
      <h1>Hide</h1>
      <div className="Section">
        <GameId gameId={gameId}/>
      </div>

      {isWaiting() && (
        <div>
          <div className="Section">
            <h3>Scan to join</h3>
            <QRCode value={gameId} style={{maxWidth: "160px", width: "100%", height: "auto"}}/>
          </div>

          <div className="Section">
            <h3>Settings</h3>
            <div className="InputContainer">
              <TextField label="Duration (min)" value={gameSettings.duration/1000/60}
                         onChange={(e) => repository.setDuration(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="Initial Ping Interval (min)" value={gameSettings.initialPingInterval/1000/60}
                         onChange={(e) => repository.setInitialPingInterval(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="Final Ping Interval (min)" value={gameSettings.finalPingInterval/1000/60}
                         onChange={(e) => repository.setFinalPingInterval(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="Ping block Interval (min)" value={gameSettings.pingBlockInterval/1000/60}
                         onChange={(e) => repository.setPingBlockInterval(gameId, e.target.value*60*1000, () => {})} />
              <TextField label="Seeker Ping Interval (min)" value={gameSettings.seekerInitialPingInterval/1000/60}
                         onChange={(e) => repository.setSeekerInitialPingInterval(gameId, e.target.value*60*1000, () => {})} />
              <Button onClick={() => startGame()}>Start</Button>
              <Button onClick={() => clearGame()}>Back</Button>
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

          <div className="Section">
            <div>Time to next ping:</div>
            <Timer endDate={gameSettings.nextPingDate}/>
            <Button onClick={() => pingBlock()} disabled={gameSettings.remainingPingBlocks <= 0}>Delay next Ping</Button>
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
            <MyMap markers={getSeekerMarkers(seekers)} />
          </div>
        </div>
      )}

      {(isActive()) && (
        <div>
          <div className="Section">
            <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", gap: "1em"}}>
              <Button onClick={() => setFound()}>Found</Button>
            </div>
          </div>
        </div>
      )}

      {(isFinished()) && (
        <div>
          <div className="Section">
            <Button onClick={() => clearGame()}>Clear</Button>
          </div>
        </div>
      )}


    </div>
  )

}