import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBCii5yOSEcmE1JhVbk0jOzwSqnWeNPDAQ",
    authDomain: "chat-app-31ca7.firebaseapp.com",
    projectId: "chat-app-31ca7",
    storageBucket: "chat-app-31ca7.firebasestorage.app",
    messagingSenderId: "1084895323995",
    appId: "1:1084895323995:web:22c88d98772fbf49601c7e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
