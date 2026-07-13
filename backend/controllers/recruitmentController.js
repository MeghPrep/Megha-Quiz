import recruitments from "../model/recruitments.js";
import authorities from "../model/authorities.js";

export const createRecruitment = async (req, res) => {
  try {
    const { authority, postName, department, advertisementYear, description } =
      req.body;

    const existingRecruitment = await recruitments.findOne({
      authority,
      postName,
      advertisementYear,
    });

    if (existingRecruitment) {
      return res.status(409).json({
        success: false,
        message: "Recruitment already exists!",
      });
    }

    const recruitment = await recruitments.create({
      authority,
      postName,
      department,
      advertisementYear,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Recruitment created successfully!",
      recruitment,
    });
  } catch (error) {
    console.error("Error Creating Recruitment:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getRecruitments = async (req, res) => {
  try {
    const { authorityId } = req.query; // Intercepts ?authorityId=gad from the URL query string
    let filter = {};

    if (authorityId) {
      // 1. Look up the authority document using its string slug field (e.g., id: "gad")
      const authorityObj = await authorities.findOne({
        id: authorityId.toLowerCase(),
      });

      if (authorityObj) {
        // 2. Map the filter using the primary MongoDB ObjectId found
        filter = { authority: authorityObj._id };
      } else {
        // If an invalid authority identifier string is passed, return empty right away
        return res.status(200).json({
          success: true,
          recruitment: [],
        });
      }
    }

    // 3. Query your recruitments using the dynamic filter condition
    const recruitmentList = await recruitments
      .find(filter)
      .populate("authority")
      .sort({ advertisementYear: -1 });

    return res.status(200).json({
      success: true,
      recruitment: recruitmentList,
    });
  } catch (error) {
    console.error("Get Recruitment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getRecruitmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruitment = await recruitments.findById(id).populate("authority");
    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    return res.status(200).json({
      success: true,
      recruitment,
    });
  } catch (error) {
    console.error("Get Recruitment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateRecruitment = async (req, res) => {
  try {
    const { id } = req.params;
    const { authority, postName, department, advertisementYear, description } =
      req.body;

    const recruitment = await recruitments.findByIdAndUpdate(
      id,
      {
        authority,
        postName,
        department,
        advertisementYear,
        description,
      },
      { new: true, runValidators: true },
    );

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruitment Updated successfully",
      recruitment,
    });
  } catch (error) {
    console.error("Update Recruitment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteRecruitment = async (req, res) => {
  try {
    const { id } = req.params;

    const recruitment = await recruitments.findByIdAndDelete(id);

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruitment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Recruitment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
