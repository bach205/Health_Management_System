import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  console.log('createNew middleware called') // Debug

  const correctCondition = Joi.object({
    phone: Joi.string().required().min(10).max(11),
    password: Joi.string()
      .required()
      .min(6)
      .max(16)
      .trim(true)
      .strict()
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d)'), 'passwordPattern')
      .messages({
        'string.pattern.passwordPattern': 'Password must contain at least one uppercase letter and one number'
      }),
    rePassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'rePassword must match password'
      })
  }).with('password', 'rePassword')

  try {
    console.log('Request body:', req.body)
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    console.log('Validation error:', error)
    const errorMessage = error.details
      ? error.details.map((err) => err.message).join(', ')
      : error.message

    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: errorMessage
    })
  }
}

const checkLogin = async (req, res, next) => {
  const loginCondition = Joi.object({
    phone: Joi.string().required().min(10).max(11),
    password: Joi.string()
      .required()
      .min(6)
      .max(16)
      .trim(true)
      .strict()
  })

  try {
    console.log('Login request body:', req.body)
    await loginCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    console.log('Login validation error:', error)
    const errorMessage = error.details
      ? error.details.map((err) => err.message).join(', ')
      : error.message

    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: errorMessage
    })
  }
}

export const authValidation = {
  createNew,
  checkLogin
}