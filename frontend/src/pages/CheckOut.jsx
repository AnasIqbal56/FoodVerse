import React, { useEffect } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { IoLocationSharp } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLocation, setAddress } from "../redux/mapSlice";
import axios from 'axios';

function ReCenterMap({ location }) {
  if (location?.lat && location?.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);

  const onDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIKEY;
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      );
      console.log(result?.data?.results[0].address_line2);
      dispatch(setAddress(result?.data?.results[0].address_line2));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div
        className="absolute top-[20px] left-[20px] z-[10]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white p-6 rounded-2xl shadow-x1 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">CheckOut</h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className="text-[#ff4d2d]" /> Delivery Location
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter your delivery address"
              className="flex-1 border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={address}
              readOnly
            />

            <button className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center">
              <IoSearch size={17} />
            </button>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center">
              <TbCurrentLocation size={17} />
            </button>
          </div>

          {/* Map Display */}
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              {location?.lat && location?.lon ? (
                <MapContainer
                  center={[location.lat, location.lon]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <ReCenterMap location={location} />

                  <Marker
                    position={[location.lat, location.lon]}
                    draggable={true}
                    eventHandlers={{
                      dragend: onDragEnd,
                    }}
                  >
                    <Popup>Drag to change location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p className="text-gray-500 text-sm">
                  No location selected yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CheckOut;
