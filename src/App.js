import React, { useEffect, useState, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import socketClient from "socket.io-client";
import { getCurrentLocation } from './utils';
const {
  REACT_APP_GOOGLE_API_KEY: GOOGLE_API_KEY
} = process.env;

function App() {
  const socket = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const driverId = Math.random().toString(36).substring(7);
  const destination = [41.731914, 44.785093];
  const [isReady, setIsReady] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    socket.current = socketClient('https://beta.wenu.io', {
      reconnect: true,
      transports: ["websocket", "polling"]
    });

    socket.current.on('connect', () => {
      socket.current.emit('driver-join', { id: driverId });
    });

    socket.current.on('driver-location-status', async (data) => {
      const location = await getCurrentLocation();
      setCurrentLocation(currentLocation => ({ ...location }));
      setInfo({ ...data })
    });

    const delay = 2 * 1000;
    const fn = setInterval(update, delay);

    async function setup() {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setIsReady(true);
    }
    setup();

    return () => {
      clearInterval(fn);
    }
  }, []);

  function update() {
    setCurrentLocation(currentLocation => {
      socket.current.emit('driver-location-update', {
        id: driverId,
        origin: Object.values(currentLocation),
        destination
      });
      return currentLocation;
    });
  }

  if (!currentLocation) {
    return <p>Loading...</p>
  }

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <GoogleMapReact
        isMyLocationEnabled={true}
        bootstrapURLKeys={{ key: GOOGLE_API_KEY }}
        defaultCenter={{
          ...currentLocation
        }}
        defaultZoom={15}>
        <img
          lat={currentLocation.lat}
          lng={currentLocation.lng}
          width="24px"
          alt=""
          src="https://cdn1.iconfinder.com/data/icons/ios-11-glyphs/30/car-512.png" />
        <img
          lat={destination[0]}
          lng={destination[1]}
          width="24px"
          alt=""
          src="https://www.flaticon.com/svg/static/icons/svg/242/242452.svg" />
      </GoogleMapReact>
      <div style={{
        width: '100%',
        height: '60px',
        textAlign: 'center',
        padding: '20px',
        fontSize: '20px'
      }}>
        <span>{info && info.duration.text}</span>
      </div>
    </div>
  );
}

export default App;
