import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setShopsInMyCity, setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function useGetShopByCity() {
  const dispatch = useDispatch();
  const {currentCity} = useSelector(state => state.user)

  useEffect(() => {
    const fetchShops = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {
        withCredentials: true,
      });

      //  remove duplicate shops (if backend sends same shop multiple times)
      const data = result.data.shops || result.data;
      const uniqueShops = [];

      data.forEach(shop => {
        if (!uniqueShops.some(s => s._id === shop._id)) {
          uniqueShops.push(shop);
        }
      });

      dispatch(setShopsInMyCity(uniqueShops));
      console.log("Unique shops:", uniqueShops);
    } catch (error) {
      console.log(error);
    }
  };

    // const fetchShops = async () => {
    //   try {
    //     const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`,{
    //       withCredentials: true,
    //     });
    //     dispatch(setShopsInMyCity(result.data.shops || []));
    //     console.log("Fetched Shops:", result.data.shops);
    //     console.log("Fetched Items:", result.data.items);

    //     //dispatch(setShopsInMyCity(result.data));
    //     console.log(result.data);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    fetchShops();
  }, [currentCity]);
}

export default useGetShopByCity;
