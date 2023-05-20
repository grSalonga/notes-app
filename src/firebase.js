// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore, collection } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ3KXe3s5-Tg5gp6ewoQyHHxxYe7mSP58",
  authDomain: "notes-react-fdf7e.firebaseapp.com",
  projectId: "notes-react-fdf7e",
  storageBucket: "notes-react-fdf7e.appspot.com",
  messagingSenderId: "274765736476",
  appId: "1:274765736476:web:824042c6a4e1232966cdd9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export const notesCollection = collection(db, "notes")
