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
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/:city${currentCity}`,{
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchShops();
  }, [currentCity]);
}

export default useGetShopByCity;
