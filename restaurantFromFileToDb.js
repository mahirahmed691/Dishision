const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK - replace with your Firebase admin credentials
const serviceAccount = require('./google-service.json'); // Update with your service account key

const firebaseAdminConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dishdecid-default-rtdb.firebaseio.com" // Your Firestore or Realtime Database URL
};

admin.initializeApp(firebaseAdminConfig);

const firestoreDB = admin.firestore();
const restaurantsCollection = firestoreDB.collection('restaurant');

// Check if the file path is provided as a command-line argument
if (process.argv.length < 3) {
  console.log("Please provide a file path as a command-line argument.");
  process.exit(1);
}

const filePath = process.argv[2];

// Function to sanitize the restaurant name to avoid invalid characters in Firestore document path
const sanitizeDocumentPath = name => name.replace(/[/\\.#$[\]]/g, '_');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    process.exit(1);
  }

  // Parse the data from the file (Assuming the file contains JSON)
  let fileData;
  try {
    fileData = JSON.parse(data);
  } catch (parseError) {
    console.error("Error parsing file data:", parseError);
    process.exit(1);
  }

  let newEntriesCount = 0;
  // Function to check if the document already exists in Firestore
  const checkAndAddRestaurant = async restaurant => {
    const restaurantSnapshot = await restaurantsCollection.doc(restaurant.restaurantName).get();
    if (!restaurantSnapshot.exists) {
      // Add the restaurant as a document in the Firestore 'restaurants' collection
      await restaurantsCollection.doc(restaurant.restaurantName).set(restaurant);
      console.log(`Document ${restaurant.restaurantName} added to Firestore.`);
      newEntriesCount++;
    } else {
      console.log(`Document ${restaurant.restaurantName} already exists. Skipped.`);
    }
  };

  // Check and add each restaurant
  const newFileData = [];
  fileData.forEach(restaurant => {
    const sanitizedRestaurantName = sanitizeDocumentPath(restaurant.restaurantName);
    checkAndAddRestaurant({ ...restaurant, restaurantName: sanitizedRestaurantName });
    // Collect entries that were not duplicates for updating the file
    const restaurantSnapshot = restaurantsCollection.doc(sanitizedRestaurantName).get();
    if (!restaurantSnapshot.exists) {
      newFileData.push(restaurant);
    }
  });

  // Update the file with non-duplicate entries
  fs.writeFile(filePath, JSON.stringify(newFileData, null, 2), err => {
    if (err) {
      console.error("Error writing to the file:", err);
      process.exit(1);
    }
    console.log(`File updated without duplicates. ${newEntriesCount} new entries added.`);
  });
});
