import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { use } from 'react';
import { setCurrentCity,setCurrentAddress,setCurrentState } from '../redux/userSlice';


function useGetCity() {
  const dispatch = useDispatch();

  const {userData}=useSelector(state=>state.user)
  const apiKey=import.meta.env.VITE_GEOAPIKEY;
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position)=>{
        const latitude=position.coords.latitude
        const longitude=position.coords.longitude
        const result=await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)
        dispatch(setCurrentCity(result?.data?.results[0].city))
        dispatch(setCurrentState(result?.data?.results[0].state))
        dispatch(setCurrentAddress(result?.data?.results[0].address_line2 || result?.data?.results[0].address_line1))
        console.log(result.data);
        

    })
  }, [userData]);


}

export default useGetCity;
