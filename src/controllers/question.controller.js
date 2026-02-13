const Question = require("../models/Question");

exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().populate({
      path : "Author",
      select : "username",
    });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      return next(err);
    }
    const question = await Question.create({
      ...req.body,
      Author: req.user._id,
    });
    const populated = await Question.findById(question._id).populate({
      path: "Author",
      select: "username",
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.viewDetailQuestions = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate({
      path: "Author",
      select: "username",
    });
    if (!question) {
      const err = new Error("Question not found");
      err.status = 404;
      return next(err);
    }
    res.json(question);
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!question) {
      const err = new Error("Question not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Question updated", question });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      const err = new Error("Question not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Question deleted", question });
  } catch (error) {
    next(error);
  }
};
