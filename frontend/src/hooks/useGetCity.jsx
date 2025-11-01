import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  setCurrentCity,
  setCurrentAddress,
  setCurrentState,
} from "../redux/userSlice";
import { setLocation, setAddress } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (!userData) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        dispatch(setLocation({ lat: latitude, lon: longitude }));

        try {
          const { data } = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );

          const locationData = data.results[0];

          dispatch(setCurrentCity(locationData.city || locationData.county));
          dispatch(setCurrentState(locationData.state));
          dispatch(
            setCurrentAddress(
              locationData.address_line2 || locationData.address_line1
            )
          );
          dispatch(setAddress(locationData.address_line2));
        } catch (error) {
          console.error("Failed to fetch city:", error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, [userData, dispatch, apiKey]);

  return null;
}

export default useGetCity;
