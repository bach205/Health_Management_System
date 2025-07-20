const FormData = require("form-data");
const axios = require("axios");
const RAG_SERVER_URL = process.env.RAG_SERVER_URL || "http://localhost:8000"; // chỉnh lại nếu cần

class DocumentsService {
    async getAllDocuments() {
        const { data } = await axios.get(`${RAG_SERVER_URL}/documents`);
        return data;
    }
    async getDocumentById(id) {
        return await axios.get(`${RAG_SERVER_URL}/documents/file/${id}`, {
            responseType: 'stream'
        });
    }
    async createDocument(file, user_id) {
        console.log(file)
        const form = new FormData();
        form.append("file", file.buffer, file.originalname);
        form.append("user_id", user_id);
        const response = await axios.post(`${RAG_SERVER_URL}/documents/file/upload`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        return response.data;
    }
    async deleteDocument(id) {
        const { data } = await axios.delete(`${RAG_SERVER_URL}/documents/file/${id}`);
        return data;
    }
}

module.exports = new DocumentsService(); 