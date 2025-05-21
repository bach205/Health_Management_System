import { StatusCodes } from 'http-status-codes'
import { User } from '../models/UserModel.js'
import { securePassword } from '../utils/securePassword.js'
import { compare } from 'bcrypt'

const register = async (req, res) => {
  try {
    const { phone, password } = req.body
    const existingUser = await User.findOne({ phone })
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'User already exists'
      })
    }
    const hashedPassword = await securePassword(password)
    const newUser = new User({
      phone : phone,
      password : hashedPassword,
      userType: 'user',
      activeStatus: true
    })
    await newUser.save()
    res.status(StatusCodes.CREATED).json({
      message: 'User created successfully',
      user: { phone: newUser.phone }
    }
    )
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message
    })
  }
}

const login = async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Phone and password are required'
      })
    }
    const existingUser = await User.findOne({
      $or: [{ email: phone }, { phone }]
    })
    if (!existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'User does not exist'
      })
    }
    const matched = await compare(password, existingUser.password)
    if (matched) {
      if (existingUser.activeStatus) {
        return res.status(StatusCodes.OK).json({
          message: 'Login successful',
          user: { phone: existingUser.phone }
        })
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'User is not active'
      })
    }
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid password'
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message
    })
  }
}

export const authController = {
  register,
  login
}