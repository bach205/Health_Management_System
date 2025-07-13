const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const DocumentsController = require("../controllers/documents.controller");
const multer = require("multer");
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        // Ép lại encoding đúng nếu bị lỗi Unicode
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // Làm sạch tên file (nếu muốn)
        const safeName = originalName.replace(/\s+/g, '_');
        file.originalname = safeName;
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", DocumentsController.getAllDocuments);
router.get("/:id", DocumentsController.getDocumentById);
router.post("/", upload.single("file"), DocumentsController.createDocument);
router.delete("/:id", DocumentsController.deleteDocument);

module.exports = router; 