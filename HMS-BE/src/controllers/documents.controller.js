const DocumentsService = require("../services/documents.service");

class DocumentsController {
    async getAllDocuments(req, res) {
        const result = await DocumentsService.getAllDocuments();
        res.json(result);
    }
    async getDocumentById(req, res) {
        try {
            const response = await DocumentsService.getDocumentById(req.params.id);
            const contentType = response.headers['content-type'] || response.headers['Content-Type'];
            if (contentType && contentType.includes('application/json')) {
                // Nếu là JSON (ví dụ: lỗi, not found)
                let data = '';
                response.data.on('data', chunk => { data += chunk; });
                response.data.on('end', () => {
                    try {
                        res.status(response.status).json(JSON.parse(data));
                    } catch (e) {
                        res.status(500).json({ message: 'Lỗi parse JSON từ rag_server' });
                    }
                });
            } else {
                // Nếu là file (pdf, docx, octet-stream...)
                Object.entries(response.headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
                response.data.pipe(res);
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: error.message || "Lỗi lấy file tài liệu" });
        }
    }
    async createDocument(req, res) {
        try {
            const result = await DocumentsService.createDocument(req.file, req.body.user_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message || "Lỗi upload tài liệu" });
        }
    }
    async deleteDocument(req, res) {
        const result = await DocumentsService.deleteDocument(req.params.id);
        res.json(result);
    }
}

module.exports = new DocumentsController(); 