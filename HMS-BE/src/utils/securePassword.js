import { hash } from 'bcrypt'

const securePassword = async (password) => {
  try {
    const hashedPassword = await hash(password, 10) // Tăng salt rounds lên 10
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error
  }
}

export { securePassword }