import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import useGetCurrentUser from './useGetCurrentUser';

function useGetMyShop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data))

      } catch (error) {
        console.log(error);
      }
    };

    fetchShop();
  }, []);
}

export default useGetCurrentUser;
