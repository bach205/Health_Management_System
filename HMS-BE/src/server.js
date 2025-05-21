import express from 'express'
import { authRoutes } from './routes/authRoutes.js'
import { connect_db } from './config/mongodb.js'
import { env } from './config/environment.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import dayjs from 'dayjs'

dayjs.extend(customParseFormat)

// eslint-disable-next-line no-console
const START_SERVER = () => {
  const app = express()

  // Middleware để parse JSON (đặt trước các route)
  app.use(express.json())

  // Route gốc
  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  // Sử dụng router auth
  app.use('/auth', authRoutes)

  // Debug
  app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.path}`)
    next()
  })

  // Khởi động server
  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
};

// IIFE để khởi động server sau khi kết nối database
(async () => {
  try {
    await connect_db()
    START_SERVER()
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1) // Thoát với mã lỗi nếu kết nối thất bại
  }
})()