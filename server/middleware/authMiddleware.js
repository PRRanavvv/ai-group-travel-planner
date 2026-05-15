const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        // 🔥 FIX: normalize user object
        req.user = {
            _id: decoded.id
        };

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;