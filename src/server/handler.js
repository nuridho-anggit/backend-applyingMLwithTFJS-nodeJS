const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const InputError = require('../exceptions/InputError');

const MAX_FILE_SIZE = 1000000; // 1MB

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    
    // Memeriksa ukuran file gambar
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
        // Melakukan prediksi
        const { label_final, suggestion } = await predictClassification(model, image);
        
        // Membuat ID dan data prediksi
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            "id": id,
            "result": label_final,
            "suggestion": suggestion,
            "createdAt": createdAt
        };

        // Menyimpan data ke database Firestore
        await storeData(id, data);

        // Mengembalikan response sukses
        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data
        });
        response.code(201);
        return response;

    } catch (error) {
        // Jika terjadi kesalahan saat melakukan prediksi (seperti format gambar yang salah)
        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        });
        response.code(400);
        return response;
    }
}

module.exports = postPredictHandler;
