const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  city: { type: String },
  landMark: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("City", citySchema);
