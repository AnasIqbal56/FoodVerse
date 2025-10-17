import React from 'react';
import { useSelector } from 'react-redux';
import UserDashboard from '../components/UserDashboard.jsx';
import DeliveryBoy from '../components/DeliveryBoy.jsx';
import OwnerDashboard from '../components/OwnerDashboard.jsx';

function Home() {
  const userData = useSelector(state => state.state?.user?.userData);

  if (!userData) {
    return <div>Loading...</div>; // Prevent crash before userData is available
  }

  return (
    <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6]'>
      {userData.role === 'user' && <UserDashboard />}
      {userData.role === 'deliveryBoy' && <DeliveryBoy />}
      {userData.role === 'owner' && <OwnerDashboard />}
    </div>
  );
}

export default Home;
