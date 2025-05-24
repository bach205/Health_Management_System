import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user; // Gắn thông tin user vào req để dùng tiếp
        next();
    });
}