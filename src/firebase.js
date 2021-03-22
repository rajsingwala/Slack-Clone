import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyD7SF7xDhB4Z3e6FSrh3Bm-P_Z7M_hcOWM",
  authDomain: "notify-slack.firebaseapp.com",
  projectId: "notify-slack",
  storageBucket: "notify-slack.appspot.com",
  messagingSenderId: "736375886643",
  appId: "1:736375886643:web:2d1932159fa12fdeaa6446",
  measurementId: "G-LYLF267PNT",
};

firebase.initializeApp(config);
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;
