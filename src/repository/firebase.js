import {useState, useEffect} from 'react'

import { initializeApp } from "firebase/app";
//import { getMessaging } from "firebase/messaging";
import { getDatabase, ref, onValue, set, push, get} from "firebase/database";
import { getAuth } from "firebase/auth";


function generateString(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function makeFirebaseRepository(db, auth) {

  return {
    createNewGame: (successCallback) => {
      const gameId = generateString(8);
      const game = {
        settings: {
          status: "waiting",
          duration: 3600*1000,
          initialPingInterval: 5*60*1000,
          finalPingInterval: 2*60*1000,
          startDate: 0,
          endDate: 0,
          foundDate: 0,
          nextPingDate: 0
        }
      }
      set(ref(db, `games/${gameId}`), game).then(
        successCallback(gameId)
      ).catch(() => {});
    },

    joinGame: (gameId, successCallback) => {
      const seeker = {
        lastLocation: "test"
      }
      const newSeekerRef = push(ref(db, `games/${gameId}/seekers`));

      set(newSeekerRef, seeker).then(
        successCallback(gameId)
      ).catch(() => {});
    },

    startGame: (gameId, successCallback) => {

      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          let settings = snapshot.val();
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + settings.duration);
          const nextPingDate = startDate;
          const newSettings = {
            ...settings,
            status: "active",
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
            nextPingDate: nextPingDate.getTime()
          }

          set(ref(db, `games/${gameId}/settings`), newSettings).then(
            successCallback()
          ).catch(() => {});
        }
        else {
          console.log("Could not find game settings");
        }
      });
    },

    endGame: (gameId, successCallback) => {
      const now = new Date().getTime();
      set(ref(db, `games/${gameId}/settings/status`), "finished").then(
        set(ref(db, `games/${gameId}/settings/foundDate`), now).then(
          successCallback()
        ).catch(() => {})
      ).catch(() => {});
    },

    clearGame: (gameId, successCallback) => {
      set(ref(db, `games/${gameId}`), null).then(
        successCallback()
      ).catch(() => {});
    },

    useGameSettings: (gameId) => {
      const [gameSettings, setGameSettings] = useState({status: "unknown"});

      useEffect(() => {
        onValue(ref(db, `games/${gameId}/settings`), (snapshot) => {
          const settings = snapshot.val() || {
            status: "unknown",
            duration: 3600*1000,
            initialPingInterval: 5*60*1000,
            finalPingInterval: 2*60*1000,
            startDate: 0,
            endDate: 0,
            foundDate: 0,
            nextPingDate: 0
          }
          setGameSettings(settings);
        });
      }, [gameId]);
      return gameSettings;
    },

    setDuration: (gameId, duration, successCallback) => {
      set(ref(db, `games/${gameId}/settings/duration`), duration).then(
        successCallback()
      ).catch(() => {});
    },

    setInitialPingInterval: (gameId, value, successCallback) => {
      set(ref(db, `games/${gameId}/settings/initialPingInterval`), value).then(
        successCallback()
      ).catch(() => {});
    },

    setFinalPingInterval: (gameId, value, successCallback) => {
      set(ref(db, `games/${gameId}/settings/finalPingInterval`), value).then(
        successCallback()
      ).catch(() => {});
    },

    setNextPingDate: (gameId) => {

      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          const settings = snapshot.val();
          if(settings.status === "active") {
            const now = new Date().getTime();
            const timeSinceStart = now - settings.startDate;
            let dt = 0;
            while(dt <= settings.duration){
              if(dt < 0.8 * settings.duration) {
                dt += settings.initialPingInterval;
              }
              else {
                dt += settings.finalPingInterval;
              }

              if(dt > timeSinceStart){
                set(ref(db, `games/${gameId}/settings/nextPingDate`), settings.startDate + dt)
                break;
              }
            }
          }
          else{
            console.log("Game is not active");
          }
        }
        else {
          console.log("Could not find settings");
        }
      }).catch((error) => {
        console.error(error);
      });

    },

    setLastLocation: (gameId, location, successCallback) => {
      set(ref(db, `games/${gameId}/lastLocation`), location).then(
        successCallback()
      ).catch(() => {});
    },

    useLastLocation: (gameId) => {
      const [location, setLocation] = useState(null);
      useEffect(() => {
        onValue(ref(db, `games/${gameId}/lastLocation`), (snapshot) => {
          const location = snapshot.val() || null
          setLocation(location);
        });
      }, [gameId]);
      return location;
    }
  }
}


export const getRepository = () => {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC7XWtcCpHeGRKAmoF2cALqFGSjWo3ObeY",
    authDomain: "hide-and-seek-gps.firebaseapp.com",
    databaseURL: "https://hide-and-seek-gps-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hide-and-seek-gps",
    storageBucket: "hide-and-seek-gps.appspot.com",
    messagingSenderId: "231706686638",
    appId: "1:231706686638:web:890ba7a6d3239ae13e293f"
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);
//  const messaging = getMessaging(app);

  return makeFirebaseRepository(db, auth);
}