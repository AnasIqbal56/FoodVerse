import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setShopsInMyCity } from '../redux/userSlice';
import { serverUrl } from '../App';

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    // ✅ Guard: Wait until city is available
    if (!currentCity) return;

    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          { withCredentials: true }
        );

        // ✅ Clean data and remove duplicates
        const data = result.data.shops || result.data;
        const uniqueShops = [];

        data.forEach((shop) => {
          if (!uniqueShops.some((s) => s._id === shop._id)) {
            uniqueShops.push(shop);
          }
        });

        dispatch(setShopsInMyCity(uniqueShops));
        console.log("Unique shops:", uniqueShops);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      }
    };

    fetchShops();
  }, [currentCity, dispatch]);
}

export default useGetShopByCity;
