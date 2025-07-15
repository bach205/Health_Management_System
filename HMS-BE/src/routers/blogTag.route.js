const express = require('express');
const blogTagController = require('../controllers/blogTag.controller');
const asyncHandler = require('../helper/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const blogTagRouter = express.Router();

blogTagRouter.get('/', asyncHandler(blogTagController.getAll));
blogTagRouter.get('/:id', asyncHandler(blogTagController.getById));
blogTagRouter.post('/', authenticate, authorize('admin', 'author'), asyncHandler(blogTagController.create));
blogTagRouter.put('/:id', authenticate, authorize('admin', 'author'), asyncHandler(blogTagController.update));
blogTagRouter.delete('/:id', authenticate, authorize('admin'), asyncHandler(blogTagController.delete));

module.exports = blogTagRouter; 