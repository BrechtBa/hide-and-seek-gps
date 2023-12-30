import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';

export default function GameId(props){
  const gameId = props.gameId;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const shareGameId = () => {
    let value = gameId;
    if (window.location) {
      const parts = window.location.href.split("/");
      parts[parts.length -1] = "seek";
      value = parts.join("/")
    }
    console.log(navigator)
    if(navigator.share) {
      navigator.share({url: value});
    }
    else if(navigator.clipboard) {
      setSnackbarMessage("Copied to clipboard");
      setSnackbarOpen(true);
      navigator.clipboard.writeText(value);
    }
    else {
      setSnackbarMessage("Not supported on your device");
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  }

  return (
    <div>
      <button style={{color: "#1976d2", cursor: "pointer", border: "none", background: "none", padding: 0, font: "inherit"}} onClick={() => shareGameId()}>
        Game ID: {gameId}
      </button>
      <Snackbar open={snackbarOpen} autoHideDuration={1000} onClose={handleClose} message={snackbarMessage} />
    </div>
  )
}