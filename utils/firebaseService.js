const FirebaseAdmin = require('firebase-admin')
const firebaseConfig = require('../config/firebaseConfig')

const serviceAccount = require('../utils/festa-bash-firebase-adminsdk-pp6dn-1899be22f6.json')

FirebaseAdmin.initializeApp({
             credential : FirebaseAdmin.credential.cert(serviceAccount),
             databaseURL : firebaseConfig.databaseURL
})

module.exports = FirebaseAdmin