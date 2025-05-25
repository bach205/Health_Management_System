const { BadRequestError } = require("../core/error.response");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const {generateToken, verifyToken} = require("../helper/jwt");

class AuthService {
    async register(userData){
        //Validate input
        const { error } = registerSchema.validate(userData);
        if (error) throw new BadRequestError(error.details[0].message);

        //Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        })
        if (existingUser) throw new BadRequestError("User already exists");

        //Hash password
        const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_SALT));

        //Creat new user
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                sso_provider: 'local'
            }
        })

        const tokens = generateToken(user);

        return{
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
                ...tokens
        }
    }

    async login({email, password}){
        //Validate input
        const { error } = loginSchema.validate({email, password});
        if (error) throw new BadRequestError(error.details[0].message);

        //Find user
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) throw new BadRequestError("Invalid credentials");

        //Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new BadRequestError("Invalid credentials");

        //Check if user is active
        if (!user.is_active) throw new BadRequestError("User is not active");

        const tokens = generateToken(user);

        return{
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        }
    }

}

module.exports = new AuthService()
