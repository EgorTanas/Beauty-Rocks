const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		default: ""
	},

	email: {
		type: String,
		require: true,
    unique: true
	},

	password: {
    type: String,
    default: null
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  googleId: {
    type: String,
    default: null
  },

  avatar: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, {
  timestamps: true



});

module.exports = mongoose.model("User", userSchema);