const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { Unauthorized } = require('../errors');
const { wrongMailOrPassword, wrongEmail } = require('../constants/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: wrongEmail,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized(wrongMailOrPassword));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized(wrongMailOrPassword));
          }

          return user;
        });
    });
};

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
