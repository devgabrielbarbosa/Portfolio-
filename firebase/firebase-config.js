import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,        // ✅ Importado corretamente
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9Idww1DvjC4JYOTaXZR-zDTUauhGrKsQ",
  authDomain: "portfolio-bd127.firebaseapp.com",
  projectId: "portfolio-bd127",
  storageBucket: "portfolio-bd127.firebasestorage.app",
  messagingSenderId: "833836237431",
  appId: "1:833836237431:web:8672e8562d1efe0c1afc72",
  measurementId: "G-GKVDEXCB5X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializando o Auth

// ✅ Exportando tudo corretamente, inclusive getDoc
export {
  db,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getFirestore,
  doc,
  getDocs,
  getDoc,
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged
};
