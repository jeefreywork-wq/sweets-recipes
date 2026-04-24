import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLnyJ4ulguDrqO3q4F_KhkmcBSE4wj86Q",
  authDomain: "sweets-recipes-e0133.firebaseapp.com",
  projectId: "sweets-recipes-e0133",
  storageBucket: "sweets-recipes-e0133.firebasestorage.app",
  messagingSenderId: "323494114329",
  appId: "1:323494114329:web:d797a5bb4c59808927e688",
  measurementId: "G-97PSTGY148"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
