import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { getRepository } from './repository/firebase.js'
import {QrScanner} from '@yudiel/react-qr-scanner';


export default function ViewJoin() {
  const navigate = useNavigate();
  const repository = getRepository();

  const [gameId, setGameId] = useState("");

  const joinGame = (gameId) => {
    repository.joinGame(gameId, () => {
      navigate(`/${gameId}/seek`);
    });
  }

  const handleQRResult = (qrGameId) => {
    joinGame(qrGameId);
  }

  return (
    <div>
      <h1>Join</h1>
      <div className="Section">
        <h3>Scan to join</h3>
        <div style={{width: "400px"}}>
          <QrScanner onDecode={handleQRResult}  onError={(error) => console.log(error?.message)} />
        </div>
      </div>

      <div className="Section">


        <div className="InputContainer">
          <h3>Enter game ID manually</h3>
          <TextField label="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)}/>
          <Button onClick={() => joinGame(gameId)}>Join</Button>
          <Button onClick={() => navigate("/")}>Back</Button>
        </div>
      </div>

    </div>
  )

}