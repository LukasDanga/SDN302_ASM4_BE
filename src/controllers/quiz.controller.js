const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// Normalize correctAnswerIndex to a number; if a string matches an option, return its index
const normalizeCorrectIndex = (q) => {
  const idx = q?.correctAnswerIndex;
  if (typeof idx === "number") return idx;
  if (typeof idx === "string") {
    const asNumber = Number(idx);
    if (!Number.isNaN(asNumber)) return asNumber;
    if (Array.isArray(q?.options)) {
      const pos = q.options.findIndex((opt) => opt === idx);
      if (pos >= 0) return pos;
    }
  }
  return idx;
};

exports.getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};
exports.viewDetailQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate({
      path: "questions",
      populate: {
        path: "Author",
        select: "username",
      },
    });
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      const err = new Error("Quiz not found");
      err.status = 404;
      return next(err);
    }

    res.json({ message: " Quiz updated", quiz });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const deleteQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleteQuiz) {
      const err = new Error("Quiz not found");
      err.status = 404;
      return next(err);
    }
    const quizInfo = {
      id: deleteQuiz.id,
    };
    res.json({ message: "Quiz deleted", quizInfo });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionsByKeyword = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: "questions",
      match: { keywords: "capital" },
    });

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// exports.getQuestionsByKeyword = async (req, res) => {
//   const quiz = await Quiz.findById(req.params.quizId).populate({
//     path: "questions",
//     match: {
//       text: { $regex: "capital", $options: "i" }
//     }
//   });

//   res.json(quiz);
// };

exports.addQuestionToQuiz = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      return next(err);
    }
    const question = await Question.create({
      ...req.body,
      correctAnswerIndex: normalizeCorrectIndex(req.body),
      Author: req.user._id,
    });

    const quiz = await Quiz.findById(req.params.quizId);
    quiz.questions.push(question._id);
    await quiz.save();

    const questionInfo = await Question.findById(question._id).populate({
      path: "Author",
      select: "username",
    });
    res.status(201).json({ quiz, questionInfo });
  } catch (error) {
    next(error);
  }
};

exports.addManyQuestionsToQuiz = async (req, res, next) => {
  try {
    const payload = (req.body || []).map((q) => ({
      ...q,
      correctAnswerIndex: normalizeCorrectIndex(q),
      Author: req.user._id,
    }));

    const questions = await Question.insertMany(payload);

    const quiz = await Quiz.findById(req.params.quizId);
    questions.forEach((q) => quiz.questions.push(q._id));
    await quiz.save();

    res.status(201).json(questions);
  } catch (error) {
    next(error);
  }
};
