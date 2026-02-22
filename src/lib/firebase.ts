import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8Wru6pZ36_f2AsanulcMzemGhvBcg6CM",
  authDomain: "faokhao.firebaseapp.com",
  projectId: "faokhao",
  storageBucket: "faokhao.firebasestorage.app",
  messagingSenderId: "116404548387",
  appId: "1:116404548387:web:bb9234cdcd3298121f5296"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
