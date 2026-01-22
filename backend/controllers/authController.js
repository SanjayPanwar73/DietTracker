const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tokenBlacklist = new Set(); // In-memory blacklist for invalidated tokens

// Sign-up function
const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please log in.",
        success: false,
      });
    }

    // Hash the password before saving the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Sign-up successful! New user created.",
      success: true,
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    
    console.log("Entered password:", password);
    console.log("User from DB:", user);
    console.log("Stored hashed password:", user?.password);

    // Compare the entered password with the stored hashed password
    // Compare the entered password with the stored hashed password
if (!user.password) {
  return res.status(500).json({
    message: "User password missing in database. Please re-register."
  });
}

const isPassEqual = await bcrypt.compare(password, user.password);


    // Generate a JWT token that expires in 6 hours
    const token = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      message: "Successfully logged in",
      token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Logout function
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      tokenBlacklist.add(token); // Add token to blacklist
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



module.exports = { signUp, login, logout };
