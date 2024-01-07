export default function getLocation(successCallback){
  if (navigator.geolocation) {
    const timeoutVal = 10 * 1000 * 1000; // set a timeout value for the query
    navigator.geolocation.getCurrentPosition(
      // what to do if query succeeds
      (position) => {
        const { latitude, longitude } = position.coords;
        successCallback({latitude, longitude});
      },
      (error) => {
        // what to do if query fails:
         const errors = {
           1: 'Permission denied',
           2: 'Position unavailable',
           3: 'Request timeout'
         };

         console.log("Error: " + errors[error.code]); // print the error
      },
      // these 3 parameters are very important, especially the first one
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    );
  }
  else {
    console.log("Geolocation is not supported by this browser");
  }
}