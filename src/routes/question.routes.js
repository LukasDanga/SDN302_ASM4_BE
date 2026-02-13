const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question.controller");
const { verifyUser, verifyAdmin , verifyAuthor} = require("../middleware/authenticate");

router.get("/questions", questionController.getAllQuestions);
router.post("/questions",verifyUser, questionController.createQuestion);
router.put("/questions/:id", verifyUser,verifyAuthor,questionController.updateQuestion);
router.get("/questions/:id", questionController.viewDetailQuestions);
router.delete("/questions/:id",verifyUser,verifyAuthor, questionController.deleteQuestion);

module.exports = router;
