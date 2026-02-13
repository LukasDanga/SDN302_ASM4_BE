const jwt = require("jsonwebtoken");
const Question = require("../models/Question");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const tokenBlacklist = new Set();

const verifyUser = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const bearerToken = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    const token =
      bearerToken || req.headers["x-access-token"] || req.body?.token;

    if (!token) {
      const err = new Error("Authentication required");
      err.status = 401;
      return next(err);
    }

    if (tokenBlacklist.has(token)) {
      const err = new Error("Token has been logged out");
      err.status = 401;
      return next(err);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      const err = new Error("Invalid token");
      err.status = 401;
      return next(err);
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      const err = new Error("Invalid user");
      err.status = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.admin === true) return next();

  const err = new Error("Admin permission required");
  err.status = 403;
  next(err);
};

const verifyAuthor = async (req, res, next) => {
  try {
    const { id: questionId } = req.params;

    if (!questionId) {
      const err = new Error("Question ID is required");
      err.status = 400;
      return next(err);
    }

    const question = await Question.findById(questionId).select("Author");
    if (!question) {
      const err = new Error("Question not found");
      err.status = 404;
      return next(err);
    }

    const authorId = question.Author.toString();
    const userId = req.user?._id.toString();

    if (authorId === userId) return next();

    const err = new Error("You are not allowed to modify this question");
    err.status = 403;
    next(err);
  } catch (err) {
    next(err);
  }
};

const invalidateToken = (token) => {
  if (token) tokenBlacklist.add(token);
};

module.exports = {
  verifyUser,
  verifyAdmin,
  verifyAuthor,
  invalidateToken,
};
