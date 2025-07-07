const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const DocumentsController = require("../controllers/documents.controller");
const multer = require("multer");
const upload = multer();

const router = express.Router();

// router.use(authenticate);
// router.use(authorize(["admin"]));

router.get("/", DocumentsController.getAllDocuments);
router.get("/:id", DocumentsController.getDocumentById);
router.post("/", upload.single("file"), DocumentsController.createDocument);
router.delete("/:id", DocumentsController.deleteDocument);

module.exports = router; 