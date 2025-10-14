// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "foodverse-5dd16.firebaseapp.com",
  projectId: "foodverse-5dd16",
  storageBucket: "foodverse-5dd16.firebasestorage.app",
  messagingSenderId: "187811204813",
  appId: "1:187811204813:web:ad29c6cc5c7106bdcf2384"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {app,auth}