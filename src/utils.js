export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const {
          coords: {
            latitude: lat,
            longitude: lng
          }
        } = position;
        resolve({ lat, lng });
      }, function() {
        reject('Something went wrong');
      });
    } else {
      reject('Geolocation not supported');
    }
  });
}

