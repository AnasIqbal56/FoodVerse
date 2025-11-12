import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function DeliveryBoyTracking({ deliveryBoyLocation, customerLocation }) {
  if (
    !deliveryBoyLocation?.lat ||
    !deliveryBoyLocation?.lon ||
    !customerLocation?.lat ||
    !customerLocation?.lon
  ) {
    return <p>No location data available</p>;
  }

  const deliveryBoyLat = deliveryBoyLocation.lat;
  const deliveryBoyLon = deliveryBoyLocation.lon;
  const customerLat = customerLocation.lat;
  const customerLon = customerLocation.lon;

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];


  const center = [deliveryBoyLat, deliveryBoyLon];

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "12px" }}>
      <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>
        <Marker position={[customerLat, customerLon]} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>
        <Polyline positions={path} color="blue" weight={4}/>
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
