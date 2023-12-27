import { useEffect } from 'react';


import NoSleep from 'nosleep.js';


export default function useNoSleep() {
  useEffect(() => {
    let isEnableNoSleep = false;
    const noSleep = new NoSleep();
    document.addEventListener(
      `click`,
      function enableNoSleep() {
        document.removeEventListener(`click`, enableNoSleep, false);
        noSleep.enable();
        isEnableNoSleep = true;
        //alert(`click and enable noSleep`);
      },
      false
    );
    return () => {
      if (isEnableNoSleep) {
        noSleep.disable();
      }
    };
  }, []);
}