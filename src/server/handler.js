const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const getDataFirestore = require('../services/getData');
const InputError = require('../exceptions/InputError');

const MAX_FILE_SIZE = 1000000; // 1MB

async function postPredictHandler(request, h) {
    const { image } = request.payload;

    if (Buffer.byteLength(image, 'base64') > MAX_FILE_SIZE) {
        const response = h.response({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000'
        });
        response.code(413);
        return response;
    }

    const { model } = request.server.app;

    try {

        const { label_final, suggestion } = await predictClassification(model, image);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            "id": id,
            "result": label_final,
            "suggestion": suggestion,
            "createdAt": createdAt
        };

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data
        });
        response.code(201);
        return response;

    } catch (error) {

        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        });
        response.code(400);
        return response;
    }
}

async function getHistoriesHandler(request, h) {
    try {
        const predictions = await getDataFirestore();
        
        const response = h.response({
            status: 'success',
            data: predictions
        });
        response.code(200);
        return response;
        
    } catch (error) {
        console.error('Error fetching prediction histories:', error);

        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam mengambil riwayat prediksi'
        });
        response.code(500);
        return response;
    }
}

module.exports = {postPredictHandler, getHistoriesHandler};
