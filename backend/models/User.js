const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Kullanıcının eklediği arkadaş isimleri (basit MVP)
  friends: {
    type: [String],
    default: [],
  },
  // Canlı oda oturum durumu (kullanıcı bazlı)
  liveSession: {
    status: {
      type: String,
      enum: ["idle", "running", "paused"],
      default: "idle",
    },
    elapsedMs: {
      type: Number,
      default: 0,
    },
    runningSince: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  // Kullanıcının son ürettiği plan (dashboard'a geri dönmek için)
  currentPlan: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

module.exports = mongoose.model("User", UserSchema);