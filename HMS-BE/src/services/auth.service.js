const { BadRequestError } = require("../core/error.response");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

class AuthService {
    static register(body) {
        const { error } = registerSchema.validate(body);
        if (error) {
            throw new BadRequestError(error.details.map((d) => d.message));
        }
        return body;
    }

    static async login({ email, password }) {
        const user = await prisma.user.findMany();
        console.log(user);
        return user;
    }
}

module.exports = AuthService;
