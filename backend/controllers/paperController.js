import papers from "../model/papers.js";

export const createPaper = async (req, res) => {
  try {
    const {
      recruitment,
      paperTitle,
      examDate,
      timeAllowed,
      totalMarks,
      totalQuestions,
      negativeMarking,
      instructions,
      pdf,
      youtube,
      examCode,
    } = req.body;

    const existingPaper = await papers.findOne({
      recruitment,
      paperTitle,
      examDate,
    });

    if (existingPaper) {
      return res.status(409).json({
        success: false,
        message: "Paper already exists!",
      });
    }

    const paper = await papers.create({
      recruitment,
      paperTitle,
      examDate,
      timeAllowed,
      totalMarks,
      totalQuestions,
      negativeMarking,
      instructions,
      pdf,
      youtube,
      examCode,
    });
    return res.status(201).json({
      success: true,
      message: "Paper created successfully",
      paper,
    });
  } catch (error) {
    console.error("Error Creating Paper:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getPapers = async (req, res) => {
  try {
    const paperList = await papers.find().populate("recruitment").sort({
      examDate: -1,
    });

    return res.status(200).json({
      success: true,
      papers: paperList,
    });
  } catch (error) {
    console.error("Get Paper Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getPaperById = async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await papers.findById(id).populate("recruitment");
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error("Get Paper Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recruitment,
      paperTitle,
      examDate,
      timeAllowed,
      totalMarks,
      totalQuestions,
      negativeMarking,
      instructions,
      pdf,
      youtube,
      examCode,
    } = req.body;

    const paper = await papers.findByIdAndUpdate(
      id,
      {
        recruitment,
        paperTitle,
        examDate,
        timeAllowed,
        totalMarks,
        totalQuestions,
        negativeMarking,
        instructions,
        pdf,
        youtube,
        examCode,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paper Updated Successfully",
      paper,
    });
  } catch (error) {
    console.error("Paper Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await papers.findByIdAndDelete(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Paper Deleted Successfully",
    });
  } catch (error) {
    console.error("Error Deleting Paper:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
