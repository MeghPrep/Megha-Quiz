import authorities from "../model/authorities.js";

export const createAuthority = async (req, res) => {
  try {
    const { id, name, shortName, type, description } = req.body;

    const existingAuthority = await authorities.findOne({ id });

    if (existingAuthority) {
      return res.status(409).json({
        success: false,
        message: "Authority already exists!",
      });
    }

    const authority = await authorities.create({
      id,
      name,
      shortName,
      type,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Authority created successfully!",
      authority,
    });
  } catch (error) {
    console.error("Create Authority Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAuthorities = async (req, res) => {
  try {
    const authorityList = await authorities.find().sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      authorities: authorityList,
    });
  } catch (error) {
    console.error("Get Authorities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAuthorityById = async (req, res) => {
  try {
    const { id } = req.params;
    const authority = await authorities.findById(id);
    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority not found",
      });
    }

    return res.status(200).json({
      success: true,
      authority,
    });
  } catch (error) {
    console.error("Get Authority Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateAuthority = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, shortName, type, description } = req.body;

    const authority = await authorities.findByIdAndUpdate(
      id,
      {
        name,
        shortName,
        type,
        description,
      },
      { new: true, runValidators: true },
    );

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authority Updated successfully",
      authority,
    });
  } catch (error) {
    console.error("Update Authority Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const authority = await authorities.findByIdAndDelete(id);

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authority Deleted Successfully",
    });
  } catch (error) {
    console.error("Error Deleting Authority:", error);
    return res.status(500).json({
      success: true,
      message: "Server Error",
    });
  }
};
