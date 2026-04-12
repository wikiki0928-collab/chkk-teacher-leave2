import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBlvOMNqmp-qCezgoDwgDXibMlatpk6OlU",
  authDomain: "chkk-teacher-leave.firebaseapp.com",
  projectId: "chkk-teacher-leave",
  storageBucket: "chkk-teacher-leave.firebasestorage.app",
  messagingSenderId: "640382547615",
  appId: "1:640382547615:web:c0de6ab92ae41ffed0d4aa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'chkk-teacher-leave'; // Default or based on logic
