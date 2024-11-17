const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()

        console.log('Tensor shape:', tensor.shape);  
        
        const classes = ['Cancer', 'Non-cancer'];

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        console.log('Prediction scores:', score);

        const confidenceScore = Math.max(...score) * 100;
        console.log('Confidence Score:', confidenceScore);

        const classResult = tf.argMax(prediction, 1).dataSync()[0];
        const label = classes[classResult];
        
        let label_final = confidenceScore > 85 ? 'Cancer' : 'Non-cancer'

        let suggestion;

        if (label_final === 'Cancer') {
            suggestion = "Segera periksa ke dokter!"
        }

        if (label_final === 'Non-cancer') {
            suggestion = "Penyakit kanker tidak terdeteksi."
        }
        // console.log(`Predicted label: ${label}, Suggestion: ${suggestion}`);


        return { label_final, suggestion };
    } catch (error) {
        throw new InputError(`Terjadi kesalahan input: ${error.message}`)
    }
}

module.exports = predictClassification;
