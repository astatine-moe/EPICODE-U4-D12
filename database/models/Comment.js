const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    blog: {
        ref: "BlogPost",
        type: mongoose.Schema.Types.ObjectId,
    },
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
schema.methods = {};

schema.pre("save", function (next) {
    //whenever the document is updated, change updatedAt to current date
    this.updatedAt = Date.now();

    next();
});

module.exports = mongoose.model("Comment", schema);
