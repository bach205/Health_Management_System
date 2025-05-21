import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { authValidation } from '../validations/authValidation.js'

const Router = express.Router()

// Định nghĩa route /login
Router.post('/login', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Log in successfully!'
  })
})

// Định nghĩa route /register
// Router.post('/register', authValidation.createNew)
//Debug
Router.post('/register', (req, res, next) => {
  console.log('Register route hit') // Debug
  authValidation.createNew(req, res, next)
})

export const authRoutes = Router