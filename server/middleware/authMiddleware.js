const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    // Get token from cookie
    if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Grant access to specific admin positions
const authorizeAdminPosition = (...positions) => {
    return (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only admin users can access this route'
            });
        }

        if (!positions.includes(req.user.adminInfo.position)) {
            return res.status(403).json({
                message: `Admin position ${req.user.adminInfo.position} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
    authorizeAdminPosition
};
