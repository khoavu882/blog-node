const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const moment = require("moment");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxlength: 50,
  },
  lastName: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 6,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", (next) => {
  const user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
      user.password = hash;
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = (plainPassword, callback) => {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generaToken = (callback) => {
  const user = this;
  const token = jwt.sign(user._id.toHexString(), "secret");
  const oneHour = moment().add(1, "hour").valueOf();

  user.tokenExp = oneHour;
  user.token = token;
  user.save((err, user) => {
    if (err) return callback(err);
    callback(null, user);
  });
};

userSchema.statics.findByToken = (token, callback) => {
  const user = this;
  jwt.verify(token, "secret", (err, decode) => {
    user.findOne({ _id: decode, token: token }, (err, user) => {
      if (err) return callback(err);
      callback(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
