const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header (Format: "Bearer <token>")
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No Token, Access Denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach the user payload to the request object
        next(); // Proceed to the protected route handler
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }
        return res.status(401).json({ message: 'Invalid Token, Access Denied' });
    }
};

module.exports = authMiddleware;
