const { firebaseConfig } = require('./config.js');
const firebase = require('firebase/app');
require('firebase/firestore');

const firestore = firebase.initializeApp(firebaseConfig).firestore();

module.exports = {
  firestore
};