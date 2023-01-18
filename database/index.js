const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

let isConnected = false;

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        return true;
    } catch (e) {
        isConnected = false;
        return false;
    }
};

const hasEstablishedConnection = () => {
    return isConnected;
};

const getMongoose = () => {
    return mongoose;
};

const schemas = {
    BlogPost: require("./models/BlogPost"),
    Author: require("./models/Author"),
    Comment: require("./models/Comment"),
};

module.exports = {
    connect,
    getMongoose,
    hasEstablishedConnection,
    schemas,
};
