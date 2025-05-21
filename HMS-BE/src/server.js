// eslint-disable-next-line no-console
import { connect_db } from '../src/config/mongodb.js'
import { env } from '../src/config/environment.js';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import dayjs from "dayjs";
dayjs.extend(customParseFormat);

import express from 'express'

const START_SERVER = () => {

  const app = express()

  // ham listCollections -> return promise
  app.get('/', async (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })

}

//IIFE: Invoke function
(async () => {
  try {
    await connect_db();
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()

