import papers from "../model/papers.js";
// 🛠️ FIX 1: Aligned the model variable name to 'questions' to prevent 'ReferenceError: questions is not defined'
import questions from "../model/question.js";

export const createQuestion = async (req, res) => {
  try {
    const {
      paper,
      questionNumber,
      sectionTitle,
      passage,
      question,
      options,
      answerKey,
      solution,
      youtube,
      createdBy,
    } = req.body;

    const existingQuestion = await questions.findOne({
      paper,
      questionNumber,
    });

    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        message: "Question already exists!",
      });
    }

    const newQuestion = await questions.create({
      paper,
      questionNumber,
      sectionTitle,
      passage,
      question,
      options,
      answerKey,
      solution,
      youtube,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Question added successfully!",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error creating questions:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    // 🛠️ FIX 2: Intercept ?paperId=XYZ parameter from the frontend URL query string
    const { paperId } = req.query;
    let filter = {};

    if (paperId) {
      filter = { paper: paperId };
    }

    const questionList = await questions
      .find(filter) // 🔍 Only finds questions belonging to the clicked past paper
      .populate("paper")
      .sort({ questionNumber: 1 }); // Keeps questions ordered perfectly (Q1, Q2, Q3...)

    return res.status(200).json({
      success: true,
      questions: questionList,
    });
  } catch (error) {
    console.error("Error getting questions:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const questionItem = await questions.findById(id).populate("paper");
    if (!questionItem) {
      return res.status(404).json({
        success: false,
        message: "Question not found", // Fixed error message label
      });
    }

    return res.status(200).json({
      success: true,
      question: questionItem,
    });
  } catch (error) {
    console.error("Get Question Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paper,
      questionNumber,
      sectionTitle,
      passage,
      question,
      options,
      answerKey,
      solution,
      youtube,
      createdBy,
    } = req.body;

    const updatedQuestion = await questions.findByIdAndUpdate(
      id,
      {
        paper,
        questionNumber,
        sectionTitle,
        passage,
        question,
        options,
        answerKey,
        solution,
        youtube,
        createdBy,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Update Question Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const questionItem = await questions.findByIdAndDelete(id);

    if (!questionItem) {
      return res.status(404).json({
        success: false,
        message: "Question Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question Deleted Successfully",
    });
  } catch (error) {
    console.error("Error Deleting Question:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
