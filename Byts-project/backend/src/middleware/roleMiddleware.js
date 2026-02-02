const requireRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
};

module.exports = { requireRoles };

