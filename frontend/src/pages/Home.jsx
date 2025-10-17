import React from 'react';
import { useSelector } from 'react-redux';
import UserDashboard from '../components/UserDashboard.jsx';
import DeliveryBoy from '../components/DeliveryBoy.jsx';
import OwnerDashboard from '../components/OwnerDashboard.jsx';

function Home() {
  const userData = useSelector(state => state.user.userData);

  console.log('Home userData:', userData); // <--- debug

  if (!userData) {
    return <div>Loading...</div>;
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
