
/* eslint-env serviceworker */
/* eslint-disable no-undef */
/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAKMY1rOC_MHVBOBoaj3foIDZSRLg59cOs",
authDomain: "e-bus-system-89c11.firebaseapp.com",
projectId: "e-bus-system-89c11",
storageBucket: "e-bus-system-89c11.firebasestorage.app",
messagingSenderId: "692861212326",
appId: "1:692861212326:web:6bba32c8e1079284b90667"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'ebus-notification',
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
