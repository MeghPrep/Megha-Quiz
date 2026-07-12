import mongoose from "mongoose";

const recruitmentsSchema = new mongoose.Schema(
  {
    authority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authorities",
      required: true,
    },
    postName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    advertisementYear: {
      type: Number,
      required: true,
      min: 1900,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
);

const recruitments = mongoose.model("recruitments", recruitmentsSchema);

export default recruitments;
