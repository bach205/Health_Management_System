import { adminAccountDefault } from '../utils/constants.js'
import { User } from '../models/UserModel.js'
import { securePassword } from '../utils/securePassword.js'
import { connect_db } from '../config/mongodb.js'

async function addUser() {
  try {
    await connect_db()
    const user = await User.findOne({ email: adminAccountDefault.email })
    if (user) {
      console.error('Admin already exists')
      return
    }
    const passHash = await securePassword(adminAccountDefault.password)
    adminAccountDefault.password = passHash
    const result = await User.create(adminAccountDefault)
    console.log(`User added with the following id: ${result}`)

  } catch (error) {
    console.error('Error adding user:', error)
  }
}

addUser()


