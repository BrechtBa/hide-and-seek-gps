export default function GameId(props){
  const gameId = props.gameId;

  const shareGameId = () => {
    let value = gameId;
    if (window.location) {
      value = window.location.href.replace("/hide", "/seek")
    }

    if(navigator.share) {
      navigator.share(value);
    }
    else if(navigator.clipboard) {
      navigator.clipboard.writeText(value);
    }
    else(
      console.log("not supported")
    )
  };

  return (
    <button style={{color: "#1976d2", cursor: "pointer", border: "none", background: "none", padding: 0, font: "inherit"}} onClick={() => shareGameId()}>
      Game ID: {gameId}
    </button>
  )
}