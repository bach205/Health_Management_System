const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");

const checkUserStatus = () => {

    return async (req, res, next) => {
        try {
            console.log(req)
            const userId = req.user.id;

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new BadRequestError("User not found");
            }

            // Check if user is active
            if (!user.is_active) {
                throw new BadRequestError("Account is deactivated");
            }

            // Add user to request for later use
            req.userData = user;
            next();
        } catch (error) {
            return res.status(error.status || 400).json({
                success: false,
                message: error.message
            });
        }
    };
};

module.exports = checkUserStatus; 