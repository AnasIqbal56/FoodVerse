import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';
import { serverUrl } from '../App';
import { setMyOrders } from '../redux/userSlice';

function useGetMyOrders() {
  const dispatch = useDispatch();
  const {userData} = useSelector(state=>state.user);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data));
        console.log(result.data)

      } catch (error) {
        console.log(error.message);
      }
    };

    fetchOrders();
  }, [userData]);


}

export default useGetMyOrders;
