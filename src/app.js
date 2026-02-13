const express = require("express");
const cors = require("cors");

const quizRoutes = require("./routes/quiz.routes");
const questionRoutes = require("./routes/question.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Explicit CORS allowlist for deployed FE and local dev
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN,
  "https://sdn302asm4done-g8gn0nkw5-lukasdangas-projects.vercel.app/",
  "http://localhost:3000",
].filter(Boolean);

const originSetting = allowedOrigins.length > 0 ? allowedOrigins : "*";

const corsOptions = {
  origin: originSetting,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", quizRoutes);
app.use("/api", questionRoutes);
app.use("/api", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
