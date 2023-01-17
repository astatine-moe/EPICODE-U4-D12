const mongoose = require("mongoose");

const { validateEmail } = require("../../util");

const schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "First name is required",
    },
    surname: {
        type: String,
        trim: true,
        required: "Surname is required",
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: "Email is required",
        validate: [validateEmail, "Please use a valid email address"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please use a valid email address",
        ],
    },
    dob: {
        type: Date,
        required: "DoB is required",
    },
    avatar: {
        type: String,
    },
});
schema.methods = {};

schema.pre("save", function (next) {
    //change avatar on creation
    this.avatar =
        `https://ui-avatars.com/api/` +
        encodeURIComponent(`${this.name} ${this.surname}`);

    next();
});

module.exports = mongoose.model("Author", schema);
