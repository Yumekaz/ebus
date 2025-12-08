import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let app;
let database;
let messaging;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    
    if ('serviceWorker' in navigator) {
      messaging = getMessaging(app);
    }
  }
  return { app, database, messaging };
};

export const subscribeToBusLocation = (busId, callback) => {
  const { database } = initializeFirebase();
  const busRef = ref(database, `buses/${busId}/location`);
  
  onValue(busRef, (snapshot) => {
    const data = snapshot.val();
    if (data && callback) {
      callback(data);
    }
  });
  
  return () => off(busRef);
};

export const subscribeToBusStatus = (busId, callback) => {
  const { database } = initializeFirebase();
  const statusRef = ref(database, `buses/${busId}/status`);
  
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data && callback) {
      callback(data);
    }
  });
  
  return () => off(statusRef);
};

export const subscribeToShiftOccupancy = (shiftId, callback) => {
  const { database } = initializeFirebase();
  const occupancyRef = ref(database, `shifts/${shiftId}/occupancy`);
  
  onValue(occupancyRef, (snapshot) => {
    const data = snapshot.val();
    if (data && callback) {
      callback(data);
    }
  });
  
  return () => off(occupancyRef);
};

export const requestNotificationPermission = async () => {
  try {
    const { messaging } = initializeFirebase();
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    const { messaging } = initializeFirebase();
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
};