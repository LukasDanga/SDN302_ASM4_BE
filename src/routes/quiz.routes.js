const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const questionController = require("../controllers/question.controller");
const { verifyUser, verifyAdmin } = require("../middleware/authenticate");

router.get("/quizzes", quizController.getAllQuizzes);
router.post("/quizzes", verifyUser, verifyAdmin, quizController.createQuiz);
router.put("/quizzes/:id", verifyUser, verifyAdmin, quizController.updateQuiz);
router.get("/quizzes/:id", quizController.viewDetailQuiz);
router.delete("/quizzes/:id", verifyUser, verifyAdmin, quizController.deleteQuiz);

router.get("/quizzes/:quizId/populate", quizController.getQuestionsByKeyword);
router.post("/quizzes/:quizId/question", verifyUser, verifyAdmin, quizController.addQuestionToQuiz);
router.post("/quizzes/:quizId/questions", verifyUser, verifyAdmin, quizController.addManyQuestionsToQuiz);

module.exports = router;
