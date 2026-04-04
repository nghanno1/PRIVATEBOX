// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// ⚠️ HƯỚNG DẪN: Thay thế các giá trị dưới đây bằng config Firebase của bạn
// Lấy từ Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyBcayuhAqLf-KsXMofW33BiIMPTCpUyMos",
  authDomain: "privatebox-test.firebaseapp.com",
  databaseURL: "https://privatebox-test-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "privatebox-test",
  storageBucket: "privatebox-test.firebasestorage.app",
  messagingSenderId: "999138476888",
  appId: "1:999138476888:web:524360fe705c4f3521db2d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
