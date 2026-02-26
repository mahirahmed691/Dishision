const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../google-service.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dishdecid-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
const collectionRef = db.collection('restaurant');
const outputPath = path.resolve(__dirname, "data", "collectionData.json");

const data = [];

collectionRef.get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      data.push(doc.data());
    });

    // Write data to a file (JSON, CSV, etc.)
    // For example, write to a JSON file
    const fs = require('fs');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Error getting documents', err);
  });
