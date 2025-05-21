import express from 'express'
import { authValidation } from '../validations/authValidation.js'
import { authController } from '../controllers/authController.js'

const Router = express.Router()

// Định nghĩa route /login
Router.post('/login', authValidation.checkLogin, authController.login)

// Định nghĩa route /register
// Router.post('/register', authValidation.createNew)
//Debug
// Router.post('/register', (req, res, next) => {
//   console.log('Register route hit') // Debug
//   authValidation.createNew(req, res, next)
// })
//Final
Router.post('/register', authValidation.createNew, authController.register)

export const authRoutes = Router