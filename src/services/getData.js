const { Firestore } = require('@google-cloud/firestore');

async function getDataFirestore(id, data) {
    const db = new Firestore();

    const predictCollection = db.collection('predictions');
    const snapshot = await predictCollection.get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
    }

    const predictions = [];
    snapshot.forEach(doc => {
        predictions.push({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.id
            }
        });
    });

    return predictions;
}

module.exports = getDataFirestore;