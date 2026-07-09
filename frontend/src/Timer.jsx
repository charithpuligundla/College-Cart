import React, { useEffect, useRef } from 'react';
import { add, css, elapsedTime, flipClock, theme } from 'flipclock';

const CountdownTimer = ({seconds}) => {
  const clockRef = useRef(null); // React ref for the div

  useEffect(() => {
    if (clockRef.current) {
        clockRef.current.innerHTML = '';
      flipClock({
        parent: clockRef.current,
        face: elapsedTime({
          from: add(new Date(), { seconds: seconds }), // countdown from 10 seconds
          to: new Date()
        }),
        theme: theme({
          dividers: ':',
          css: css({
            fontSize: '3rem'
          })
        })
      });
    }
  }, []); // run only once after component mounts

  return (
      <div ref={clockRef}></div>
  );
};

export default CountdownTimer;
