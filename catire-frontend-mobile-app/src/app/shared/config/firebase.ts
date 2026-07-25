import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

// Suppress Firebase AsyncStorage warning BEFORE getAuth
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('AsyncStorage')) return;
  originalWarn(...args);
};

const firebaseConfig = {
  apiKey: 'AIzaSyDwiGh8TgOyEY6mhjZgzhxCzlWhcW55o5k',
  authDomain: 'el-catire-hot-dog.firebaseapp.com',
  projectId: 'el-catire-hot-dog',
  storageBucket: 'el-catire-hot-dog.firebasestorage.app',
  messagingSenderId: '778480594998',
  appId: '1:778480594998:web:aec168d0ec62901818a897',
  measurementId: 'G-5HK8GT712W',
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export {
  auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
};

export default firebaseApp;
