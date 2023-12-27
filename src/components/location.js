export default function getLocation(successCallback){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        successCallback({latitude, longitude});

      },
      (error) => {
        console.error("Error get user location: ", error);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser");
  }
}