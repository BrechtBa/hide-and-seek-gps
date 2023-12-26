import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';

import { getRepository } from './repository/firebase.js'


export default function ViewHome() {
  const navigate = useNavigate();
  const repository = getRepository();

  const createNewGame = () => {
    repository.createNewGame((gameId: string) => {
      console.log("created new game")
      navigate(`/${gameId}/hide`);
    });
  }

  const joinGame = () => {
     navigate(`/join`);
  }


  return (
    <div>
      <h1>Hide and Seek</h1>
      <Button onClick={() => createNewGame()}>New Game</Button>
      <Button onClick={() => joinGame()}>Join Game</Button>
    </div>
  )
}