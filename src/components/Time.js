
export default function Time(props) {

  const time = props.time;

  const formatTimeLeft = (timeLeft) => {
    const h = Math.floor(timeLeft / 1000 / 3600);
    const m = Math.floor((timeLeft - h * 1000 * 3600) / 1000 / 60);
    const s = Math.floor((timeLeft - h * 1000 * 3600 - m * 1000 * 60) / 1000);

    return `${h > 9 ? h : "0"+h}:${m > 9 ? m : "0"+m}:${s > 9 ? s : "0"+s}`
  }

  return (
    <div>
      {formatTimeLeft(time)}
    </div>
  );

}