const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Friend", friendSchema);
