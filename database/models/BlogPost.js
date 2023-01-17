const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    readTime: {
        value: Number,
        unit: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
    },
    category: {
        required: true,
        type: String,
    },
    content: {
        type: String,
        required: true,
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

module.exports = mongoose.model("BlogPost", schema);
