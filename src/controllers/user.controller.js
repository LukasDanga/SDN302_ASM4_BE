const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { invalidateToken } = require("../middleware/authenticate");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const normalizedUsername = (username || "").trim().toLowerCase();

    if (!normalizedUsername || !password) {
      const err = new Error("Username and password are required");
      err.status = 400;
      return next(err);
    }

    const exists = await User.findOne({ username: normalizedUsername });
    if (exists) {
      const err = new Error("Username already exists");
      err.status = 409;
      return next(err);
    }

    const user = new User({ username: normalizedUsername, password, admin: false });
    await user.save();

    const userInfo = { _id: user._id, username: user.username, admin: user.admin };

    res.status(201).json(userInfo);
  } catch (error) {
    if (error?.code === 11000) {
      const err = new Error("Username already exists");
      err.status = 409;
      return next(err);
    }
    error.status = 400;
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const normalizedUsername = (username || "").trim().toLowerCase();

    if (!normalizedUsername || !password) {
      const err = new Error("Username and password are required");
      err.status = 400;
      return next(err);
    }

    const exists = await User.findOne({ username: normalizedUsername });
    if (exists) {
      const err = new Error("Username already exists");
      err.status = 409;
      return next(err);
    }

    const user = await User.create({ username: normalizedUsername, password, admin: false });
    const userInfo = { _id: user._id, username: user.username, admin: user.admin };

    return res.status(201).json({ message: "Signup successful", user: userInfo });
  } catch (error) {
    if (error?.code === 11000) {
      const err = new Error("Username already exists");
      err.status = 409;
      return next(err);
    }
    error.status = 400;
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = (username || "").trim().toLowerCase();

    if (!normalizedUsername || !password) {
      const err = new Error("Username and password are required");
      err.status = 400;
      return next(err);
    }

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      const err = new Error("Username or password incorrect");
      err.status = 401;
      return next(err);
    }

    if (user.password !== password) {
      const err = new Error("Username or password incorrect");
      err.status = 401;
      return next(err);
    }

    const token = jwt.sign({ _id: user._id, admin: user.admin }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const userInfo = {
      _id: user._id,
      username: user.username,
      admin: user.admin,
    };

    return res.json({ message: "Login successful", token, user: userInfo });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const bearerToken = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    const token = bearerToken || req.headers["x-access-token"] || req.body?.token;

    if (!token) {
      const err = new Error("Token is required to logout");
      err.status = 400;
      return next(err);
    }

    invalidateToken(token);
    return res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

exports.viewDetailUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body || {};
    const update = { ...rest };

    if (password) {
      update.password = password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
