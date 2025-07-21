    const express = require('express');
    const blogController = require('../controllers/blog.controller');
    const asyncHandler = require('../helper/asyncHandler');
    const { authenticate, authorize } = require('../middlewares/auth');

    const blogRouter = express.Router();

    blogRouter.get('/', asyncHandler(blogController.getAll));
    blogRouter.get('/:id', asyncHandler(blogController.getById));
    blogRouter.post('/', authenticate, authorize('admin', 'author'), asyncHandler(blogController.create));
    blogRouter.put('/:id', authenticate, authorize('admin', 'author'), asyncHandler(blogController.update));
    blogRouter.delete('/:id', authenticate, authorize('admin'), asyncHandler(blogController.delete));

    module.exports = blogRouter; 