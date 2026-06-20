// ==============================
// TICKETONE — Firebase Config
// ==============================

const firebaseConfig = {
  apiKey: "AIzaSyCsOkw0_kUSzSJZcQKBAjv2w7-qNTsjn5g",
  authDomain: "ticketone-24122.firebaseapp.com",
  projectId: "ticketone-24122",
  storageBucket: "ticketone-24122.firebasestorage.app",
  messagingSenderId: "641198928701",
  appId: "1:641198928701:web:c113febf7c055181b68b54"
};

// Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db   = firebase.firestore();
const auth = firebase.auth();

// Storage is OPTIONAL (not available on the Spark plan for some projects).
// We try to initialize it but never let it break the rest of the app.
let storage = null;
try {
  if (typeof firebase.storage === 'function') {
    storage = firebase.storage();
  }
} catch (_) {
  storage = null;
}

// Enable Firestore offline persistence (best-effort)
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
