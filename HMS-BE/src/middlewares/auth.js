const { verifyToken } = require('../helper/jwt');

const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        //console.log("authHeader: ", authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided',
                error: 'AUTH_REQUIRED'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        // console.log(error)

        // Xử lý lỗi token expired cụ thể
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token has expired. Please login again.',
                error: 'TOKEN_EXPIRED',
                expiredAt: error.expiredAt
            });
        }

        // Xử lý các lỗi JWT khác
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token format',
                error: 'INVALID_TOKEN'
            });
        }

        return res.status(401).json({
            message: 'Invalid token',
            error: 'AUTH_FAILED'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};