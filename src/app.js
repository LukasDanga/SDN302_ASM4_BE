const express = require("express");
const cors = require("cors");

const quizRoutes = require("./routes/quiz.routes");
const questionRoutes = require("./routes/question.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
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
