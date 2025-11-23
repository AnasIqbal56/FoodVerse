import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setSocket } from '../redux/userSlice';
import { serverUrl } from '../App';

function useSocket() {
  const dispatch = useDispatch();
  const { userData, socket } = useSelector((state) => state.user);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Only initialize socket if user is logged in and socket doesn't exist
    if (!userData || socket || isInitializing.current) return;

    isInitializing.current = true;
    console.log('Initializing socket connection for user:', userData._id);

    // Create socket connection
    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[useSocket] Socket connected:', newSocket.id);
      console.log('[useSocket] Emitting identity for user:', userData._id);
      
      // Send identity to backend to associate socket with user
      newSocket.emit('identity', { userId: userData._id });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Store socket in Redux
    dispatch(setSocket(newSocket));
    isInitializing.current = false;

    // Cleanup on unmount
    return () => {
      if (newSocket && newSocket.connected) {
        console.log('Disconnecting socket');
        newSocket.disconnect();
      }
      dispatch(setSocket(null));
      isInitializing.current = false;
    };
  }, [userData?._id, dispatch]); // Only depend on user ID and dispatch
}

export default useSocket;
