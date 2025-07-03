const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

    return { accessToken, refreshToken };
}

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.log("JWT verification error:", error);
        throw error;
    }
}

const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        }
        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return newAccessToken;
    } catch (error) {
        console.log("Refresh token verification error:", error);
        throw error;
    }
}

module.exports = { generateToken, verifyToken, refreshAccessToken };