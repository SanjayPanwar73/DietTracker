const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);// Replace with your JWT secret
    req.userId = decoded._id; // Attach userId to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authenticate;
