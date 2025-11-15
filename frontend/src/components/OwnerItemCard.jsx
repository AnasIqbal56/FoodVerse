import React from 'react';
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';
import { serverUrl } from '../App';

function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const result = await axios.delete(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true })

      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };
  // resolve image URL similar to dashboard
  const resolveImage = (img) => {
    if (!img) return null;
    if (/^(https?:)?\/\//.test(img) || img.startsWith('data:') || img.startsWith('blob:')) return img;
    if (img.startsWith('/')) return `${serverUrl}${img}`;
    if (img.includes('/uploads/') || img.startsWith('uploads/')) return img.startsWith('/') ? `${serverUrl}${img}` : `${serverUrl}/${img}`;
    if (!img.includes('/')) return `${serverUrl}/uploads/${img}`;
    return `${serverUrl}/${img}`;
  };

  const itemImage = data?.image ? resolveImage(data.image) : null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border 
    w-full max-w-2xl flex items-center h-44" style={{ borderColor: '#C1121F20' }}>
      <div className="w-36 flex-shrink-0 bg-gray-50 h-full">
        <img src={itemImage || data.image} alt={data.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#3E2723' }}>{data.name}</h2>
          <p><span className="font-medium text-gray-700">Category:</span> {data.category}</p>
          <p><span className="font-medium text-gray-700">Food Type:</span> {data.foodType}</p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="font-bold" style={{ color: '#C1121F' }}>Price: {data.price}</div>

          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-full cursor-pointer"
              onClick={() => navigate(`/edit-item/${data._id}`)}
              style={{ color: '#C1121F' }}
            >
              <FaPen size={16} />
            </div>

            <div
              className="p-2 rounded-full cursor-pointer"
              onClick={handleDelete}
              style={{ color: '#C1121F' }}
            >
              <FaTrashAlt size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default OwnerItemCard;
