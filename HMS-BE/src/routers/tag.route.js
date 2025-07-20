const express = require('express');
const tagController = require('../controllers/tag.controller');
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get("/", asyncHandler(tagController.getAll));
router.post("/", authenticate, authorize("admin", "author"), asyncHandler(tagController.create));
router.put("/:id", authenticate, authorize("admin", "author"), asyncHandler(tagController.update));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(tagController.delete));

module.exports = router;
