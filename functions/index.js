// The Cloud Functions for Firebase SDK to create Cloud Functions
// and set up triggers.
const functions = require('firebase-functions');
const {harvest} = require('./harvester');

const networks = ['astar', 'shiden', 'shibuya'];

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.gasNow = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const network = req.query.network;

  if (!network) {
    return res.json({error: 'network required in query string'});
  }

  const doc = await admin
      .firestore()
      .collection('gasfee')
      .doc(network)
      .get();

  if (!doc.exists) {
    return res.json({error: `No data found for ${network} network`});
  }

  res.json({
    code: 200,
    data: doc.data(),
  });
});

exports.harvestFunction = functions
    .pubsub
    .schedule('every 1 minutes')
    .onRun((context) => {
      networks.forEach((network) => {
        harvest(network, (err, result) => {
          if (err) {
            console.log(err);
            return;
          }
          admin
              .firestore()
              .collection('gasfee')
              .doc(network)
              .set(result)
              .then(console.log)
              .catch(console.error);
        });
      });
    });
