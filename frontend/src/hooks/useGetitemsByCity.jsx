import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setItemsInMyCity, setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function useGetItemsByCity() {
  const dispatch = useDispatch();
  const {currentCity} = useSelector(state => state.user)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`,{
          withCredentials: true,
        });
        dispatch(setItemsInMyCity(result.data));
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchItems();
  }, [currentCity]);
}

export default useGetItemsByCity;
