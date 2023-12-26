import React, { useState, useEffect } from 'react'
import Time from "./Time.js"

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

  return (
    <div>
      <Time time={timeLeft}/>
    </div>
  );
}