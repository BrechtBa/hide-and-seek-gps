import {useState, useEffect} from 'react'

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get} from "firebase/database";
import { getAuth } from "firebase/auth";

export const Status = {
  Unknown: "unknown",
  Waiting: "waiting",
  Active: "active",
  Finished: "finished"
}


function generateString(length) {
    let result             = "";
    const characters       = "abcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function getSeekerId() {
  let seekerId = window.localStorage.getItem("seekerId");

  if(seekerId === null){
    seekerId = generateString(16);
    window.localStorage.setItem("seekerId", seekerId);
  }
  return seekerId
}


const defaultSettings = {
  status: Status.Unknown,
  duration: 1800*1000,
  initialPingInterval: 3*60*1000,
  finalPingInterval: 1*60*1000,
  seekerInitialPingInterval: 10*60*1000,
  pingBlockInterval: 3*60*1000,
  remainingPingBlocks: 1,
  startDate: 0,
  endDate: 0,
  foundDate: 0,
  nextPingDate: 0,
  nextSeekerPingDate: 0
}

function makeFirebaseRepository(db, auth) {

  return {
    createNewGame: (successCallback) => {
      const gameId = generateString(8);
      const game = {
        settings: {
          ...defaultSettings,
          status: Status.Waiting,
        }
      }
      set(ref(db, `games/${gameId}`), game).then(
        successCallback(gameId)
      ).catch(() => {});
    },

    joinGame: (gameId, successCallback) => {
      const seekerId = getSeekerId();
      const seeker = {
        name: "seeker"
      };
      get(ref(db, `games/${gameId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          set(ref(db, `games/${gameId}/seekers/${seekerId}`), seeker).then(
            successCallback()
          ).catch(() => {});
        }
      });
    },

    checkGameExists: (gameId, successCallback) => {
      get(ref(db, `games/${gameId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          successCallback();
        }
      });
    },

    startGame: (gameId, successCallback) => {

      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          let settings = snapshot.val();
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + settings.duration);
          const nextPingDate = new Date(startDate.getTime() + 5);
          const nextSeekerPingDate = new Date(startDate.getTime() + 5);

          const newSettings = {
            ...settings,
            status: Status.Active,
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
            nextPingDate: nextPingDate.getTime(),
            nextSeekerPingDate: nextSeekerPingDate.getTime(),
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

    setFound: (gameId, successCallback) => {
      const now = new Date().getTime();
      set(ref(db, `games/${gameId}/settings/status`), Status.Finished).then(
        set(ref(db, `games/${gameId}/settings/foundDate`), now).then(
          successCallback()
        ).catch(() => {})
      ).catch(() => {});
    },

    endGame: (gameId, successCallback) => {
      set(ref(db, `games/${gameId}/settings/status`), Status.Finished).then(
        successCallback()
      ).catch(() => {});
    },

    clearGame: (gameId, successCallback) => {
      set(ref(db, `games/${gameId}`), null).then(
        successCallback()
      ).catch(() => {});
    },

    useGameSettings: (gameId) => {
      const [gameSettings, setGameSettings] = useState({status: Status.Unknown});

      useEffect(() => {
        onValue(ref(db, `games/${gameId}/settings`), (snapshot) => {
          const settings = snapshot.val() || defaultSettings;
          setGameSettings(settings)
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

    setSeekerInitialPingInterval: (gameId, value, successCallback) => {
      set(ref(db, `games/${gameId}/settings/seekerInitialPingInterval`), value).then(
        successCallback()
      ).catch(() => {});
    },

    setPingBlockInterval: (gameId, value, successCallback) => {
      set(ref(db, `games/${gameId}/settings/pingBlockInterval`), value).then(
        successCallback()
      ).catch(() => {});
    },

    setNextPingDate: (gameId) => {
      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          const settings = snapshot.val();
          if(settings.status === Status.Active) {
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
          else {
            const now = new Date().getTime();
            if(settings.nextPingDate <= now){
              set(ref(db, `games/${gameId}/settings/nextPingDate`), settings.nextPingDate + 30*1000)
            }
          }
        }
        else {
          console.log("Could not find settings");
        }
      }).catch((error) => {
        console.error(error);
      });
    },

    setNextSeekerPingDate: (gameId) => {
      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          const settings = snapshot.val();
          if(settings.status === Status.Active) {
            const now = new Date().getTime();
            const timeSinceStart = now - settings.startDate;
            let dt = 0;
            while(dt <= settings.duration){
              dt += settings.seekerInitialPingInterval;

              if(dt > timeSinceStart){
                set(ref(db, `games/${gameId}/settings/nextSeekerPingDate`), settings.startDate + dt)
                break;
              }
            }
          }
          else {
            const now = new Date().getTime();
            if(settings.nextSeekerPingDate <= now){
              set(ref(db, `games/${gameId}/settings/nextSeekerPingDate`), settings.nextSeekerPingDate + 30*1000)
            }
          }
        }
        else {
          console.log("Could not find settings");
        }
      }).catch((error) => {
        console.error(error);
      });
    },

    setPingBlock: (gameId) => {
      get(ref(db, `games/${gameId}/settings`)).then((snapshot) => {
        if (snapshot.exists()) {
          const settings = snapshot.val();
          if(settings.status === Status.Active) {
            if(settings.remainingPingBlocks > 0) {
              set(ref(db, `games/${gameId}/settings/remainingPingBlocks`), settings.remainingPingBlocks - 1);
              set(ref(db, `games/${gameId}/settings/nextPingDate`), settings.nextPingDate + settings.pingBlockInterval);
            }
            else{
              console.log("No more ping blocks available");
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
    },

    setSeekerLastLocation: (gameId, location, successCallback)  =>{
      const seekerId = getSeekerId();
      set(ref(db, `games/${gameId}/seekers/${seekerId}/lastLocation`), location).then(
        successCallback()
      ).catch(() => {});
    },

    useSeekers: (gameId) => {
      const [seekers, setSeekers] = useState([]);
      useEffect(() => {
        onValue(ref(db, `games/${gameId}/seekers`), (snapshot) => {
          const val = snapshot.val() || {};
          setSeekers(Object.keys(val).map((key) => val[key]));
        });
      }, [gameId]);
      return seekers;
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

  return makeFirebaseRepository(db, auth);
}