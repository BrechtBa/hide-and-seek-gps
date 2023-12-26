import React, { useState, useEffect } from 'react'

export default function Timer(props) {
  const endDate = props.endDate;

  const [timeLeft, setTimeLeft] = useState(3600*1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      if( now < endDate ){
        setTimeLeft(endDate - now);
      }
      else {
        setTimeLeft(0)
      }
    }, 100);
    return () => clearInterval(timer);
  }, [endDate]);

  const formatTimeLeft = (timeLeft) => {
    const h = Math.floor(timeLeft / 1000 / 3600);
    const m = Math.floor((timeLeft - h * 1000 * 3600) / 1000 / 60);
    const s = Math.floor((timeLeft - h * 1000 * 3600 - m * 1000 * 60) / 1000);

    return `${h > 9 ? h : "0"+h}:${m > 9 ? m : "0"+m}:${s > 9 ? s : "0"+s}`
  }

  return (
    <div>
      {formatTimeLeft(timeLeft)}
    </div>
  );
}