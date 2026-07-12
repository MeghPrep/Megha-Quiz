import papers from "../model/papers.js";
import question from "../model/question.js";

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
    const questionList = await questions.find().populate("paper").sort({
      questionNumber: 1,
    });

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
    const question = await questions.findById(id).populate("paper");
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
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
    const question = await questions.findByIdAndDelete(id);

    if (!question) {
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
