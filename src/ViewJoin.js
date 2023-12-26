import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { getRepository } from './repository/firebase.js'



export default function ViewJoin() {
  const navigate = useNavigate();
  const repository = getRepository();

  const [gameId, setGameId] = useState("");

  const joinGame = () => {
    repository.joinGame(gameId, () => {
      navigate(`/${gameId}/seek`);
    })
  }

  return (
    <div>
      <TextField label="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)}/>
      <Button onClick={() => joinGame()}>Join</Button>
    </div>
  )

}