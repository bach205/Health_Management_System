const express = require('express');
const { authenticate } = require('../middlewares/auth');
const UserController = require('../controllers/user.controller');
const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get('/search-staff', UserController.searchStaff);

module.exports = userRouter; 