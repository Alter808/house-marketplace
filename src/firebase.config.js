// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBhM9eYfMaKeYDUiAyTHxFfu1ffctHU0wE',
  authDomain: 'house-marketplace-app-a275e.firebaseapp.com',
  projectId: 'house-marketplace-app-a275e',
  storageBucket: 'house-marketplace-app-a275e.appspot.com',
  messagingSenderId: '717737831609',
  appId: '1:717737831609:web:c19eb41bf6fb3c3686bf68'
}

// Initialize Firebase
initializeApp(firebaseConfig)
const db = getFirestore()

export { db }
