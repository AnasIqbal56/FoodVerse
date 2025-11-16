import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function useGetCurrentUser() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Skip if userData is already loaded or if we've already fetched
    if (userData) {
      hasFetched.current = false; // Reset for logout scenarios
      return;
    }
    
    // Check if user has explicitly logged out
    const hasLoggedOut = localStorage.getItem('hasLoggedOut');
    if (hasLoggedOut === 'true') {
      return; // Don't auto-fetch after logout
    }
    
    if (hasFetched.current) return;

    hasFetched.current = true;

    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        if (result.data) {
          dispatch(setUserData(result.data));
        }
      } catch (error) {
        console.log('Failed to fetch current user:', error);
        hasFetched.current = false; // Allow retry on error
      }
    };

    fetchUser();
  }, [userData, dispatch]);
}

export default useGetCurrentUser;
