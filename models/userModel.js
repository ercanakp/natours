const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'You must enter your username']
        // minLength: [3, 'The name must be at least 3 characters.'],
        // maxLength: [30, 'The name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please specify a valid email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please specify a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        min: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            // This only works for CREATE and SAVE. Not UPDATE
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // Only run this function if password is actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // passwordConfirm field is only needed during input to make the user sure of typed password. We won't never save it to database.
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});


userSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

        // console.log(this.changedPasswordAfter, JWTTimestamp);

        return JWTTimestamp < changedTimestamp;
    }

    return false;

};

userSchema.methods.createPasswordResetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({
        resetToken
    }, {
        passwordResetToken: this.passwordResetToken
    });

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;

};

const User = mongoose.model('User', userSchema);

module.exports = User;