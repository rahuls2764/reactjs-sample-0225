// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvK6UvcMIPM8RPQQtAH1YK7MMuRDcodOo",
  authDomain: "task-board-cb07f.firebaseapp.com",
  projectId: "task-board-cb07f",
  storageBucket: "task-board-cb07f.firebasestorage.app",
  messagingSenderId: "722777017044",
  appId: "1:722777017044:web:edc3de2295876040cec941",
  measurementId: "G-984HXK0YT8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
