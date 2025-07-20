const express = require('express');
const blogCategoryController = require('../controllers/blogCategory.controller');
const asyncHandler = require('../helper/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const blogCategoryRouter = express.Router();

blogCategoryRouter.get('/', asyncHandler(blogCategoryController.getAll));
blogCategoryRouter.get('/all/nopageination', asyncHandler(blogCategoryController.getAllNoPaging));
blogCategoryRouter.get('/:id', asyncHandler(blogCategoryController.getById));
blogCategoryRouter.post('/', authenticate, authorize('admin', 'author'), asyncHandler(blogCategoryController.create));
blogCategoryRouter.put('/:id', authenticate, authorize('admin', 'author'), asyncHandler(blogCategoryController.update));
blogCategoryRouter.delete('/:id', authenticate, authorize('admin'), asyncHandler(blogCategoryController.delete));

module.exports = blogCategoryRouter; 