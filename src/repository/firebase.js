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
          duration: 3600*1000
        },
        state: {
          status: "waiting"
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
      console.log(newSeekerRef);

      set(newSeekerRef, seeker).then(
        successCallback(gameId)
      ).catch(() => {});
    },

    startGame: (gameId, successCallback) => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 3600*1000);
      const nextPingDate = new Date(startDate.getTime() + 10*1000);

      const state = {
        status: "active",
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        nextPingDate: nextPingDate.getTime()
      }

      set(ref(db, `games/${gameId}/state`), state).then(
        successCallback()
      ).catch(() => {});
    },

    endGame: (gameId, successCallback) => {
      set(ref(db, `games/${gameId}/state/status`), "finished").then(
        successCallback()
      ).catch(() => {});
    },

    useGameState: (gameId) => {
      const [gameState, setGameState] = useState({status: "unknown"});

      useEffect(() => {
        onValue(ref(db, `games/${gameId}/state`), (snapshot) => {
          const state = snapshot.val() || {
            status: "unknown",
            startDate: 0,
            endDate: 0,
            nextPingDate: 0
          }
          setGameState(state);
        });
      }, [gameId]);
      return gameState;
    },

    setNextPingDate: (gameId) => {
      const dt = 10*1000
      get(ref(db, `games/${gameId}/state`)).then((snapshot) => {
        if (snapshot.exists()) {
          const state = snapshot.val();
          const now = new Date().getTime();
          for(var i=0 ; i < 1000; i++){
            if(state.startDate + i*dt > now){
              set(ref(db, `games/${gameId}/state/nextPingDate`), state.startDate + i*dt)
              break;
            }
          }
        } else {
          console.log("Could not find last state");
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