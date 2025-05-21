import { connect } from 'mongoose'
import { env } from '../config/environment.js'

const dbConnectionString = env.MONGODB_URI

export const connect_db = async () => {
  connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('Database Connected')
    })
    .catch((e) => {
      console.log('Database Connection Error')
    })
}
