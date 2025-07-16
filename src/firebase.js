// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHStoxiwZFtn3DUVTsAli2xkBHbSZXBes",
  authDomain: "krishisat-webapp-9ef4a.firebaseapp.com",
  projectId: "krishisat-webapp-9ef4a",
  storageBucket: "krishisat-webapp-9ef4a.firebasestorage.app",
  messagingSenderId: "1808926404",
  appId: "1:1808926404:web:9a3334f7fe385aa723eb91",
  measurementId: "G-8LZDPF9T66"
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analytics;
if (typeof window !== "undefined") {
  // Only initialize analytics in browser environments
  analytics = getAnalytics(app);
}

// Export the app and analytics
export { app, analytics };