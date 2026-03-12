const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// In-memory blacklist for invalidated tokens.
// NOTE: This resets if the server restarts. For production, use Redis.
const tokenBlacklist = new Set(); 

// --- 1. Sign-up Function ---
const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please log in.",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // 🔹 Generate JWT token immediately after signup
    const token = jwt.sign(
      { email: newUser.email, _id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(201).json({
      message: "Sign-up successful!",
      success: true,
      token,
      email: newUser.email,
      name: newUser.name
    });

  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

// --- 2. Login Function ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    const errorMsg = "Invalid email or password";

    // If user not found
    if (!user) {
      return res.status(401).json({ message: errorMsg });
    }

    // Defensive check: ensure password exists in DB
    if (!user.password) {
       return res.status(500).json({ message: "User data corrupted. Please reset password." });
    }

    // Compare the entered password with the stored hashed password
    const isPassEqual = await bcrypt.compare(password, user.password);

    // --- CRITICAL FIX: Check the result of the comparison ---
    if (!isPassEqual) {
      return res.status(401).json({ message: errorMsg });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      message: "Successfully logged in",
      success: true,
      token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- 3. Logout Function ---
const logout = async (req, res) => {
  try {
    // Get token from header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        tokenBlacklist.add(token); // Add to blacklist
    }

    res.status(200).json({
      message: "Successfully logged out",
      success: true,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// --- 4. Middleware to Protect Routes (Check Blacklist) ---
// Use this function in your routes file for any protected route
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is in blacklist
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ 
            message: "Unauthorized: Token invalidated (User logged out)" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { signUp, login, logout, checkAuth };