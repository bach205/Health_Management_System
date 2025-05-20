import { env } from '~/config/environment'
import { ServerApiVersion, MongoClient } from 'mongodb'

let testingDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  testingDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}


export const GET_DB = () => {
  if (!testingDatabaseInstance) {
    throw new Error('Database not connected')
  }
  return testingDatabaseInstance
}
